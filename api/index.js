const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const { format } = require('date-fns');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Admin Initialization
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT.trim() !== '') {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
  } else {
    serviceAccount = require('./firebase-serviceAccount.json');
  }
} catch (error) {
  console.error("Error parsing FIREBASE_SERVICE_ACCOUNT env var, falling back to local file...", error.message);
  try {
    serviceAccount = require('./firebase-serviceAccount.json');
  } catch (err) {
    console.error("Failed to load local service account file.", err.message);
  }
}

let firebaseError = null;
let db = null;
try {
  initializeApp({
    credential: cert(serviceAccount)
  });
  db = getFirestore();
  console.log('Connected to Firebase Firestore successfully!');
} catch (error) {
  firebaseError = error.message;
  console.error('CRITICAL: Failed to initialize Firebase Admin SDK:', error.message);
}

// Middleware to check if Firebase is initialized
app.use('/api', (req, res, next) => {
  if (firebaseError && req.path !== '/') {
    return res.status(500).json({ error: 'Backend Initialization Error', details: firebaseError });
  }
  next();
});

// --- Helper Functions ---
const generateId = (prefix) => `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;

// --- API Routes ---

// Health check
app.get('/api', (req, res) => {
  res.send('Kingswood Connect API is running with Firebase on Vercel!');
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT;
  res.json({
    hasEnvVar: !!envKey,
    envVarLength: envKey ? envKey.length : 0,
    envVarStart: envKey ? envKey.substring(0, 15) : null,
    firebaseError: firebaseError ? firebaseError.toString() : null,
    dbInitialized: !!db
  });
});

// 1. Register a new student
app.post('/api/students', async (req, res) => {
  try {
    const { name, email: reqEmail, grade, contact, password: reqPassword, enrolledClasses } = req.body;
    const studentId = generateId('KWS');
    const qrCodeUrl = await qrcode.toDataURL(studentId);

    // Create Firebase Auth User
    const email = (reqEmail && reqEmail.includes('@')) 
      ? reqEmail.trim().toLowerCase() 
      : `${studentId.toLowerCase()}@kingswood.edu`;
      
    let password = (reqPassword && reqPassword.trim() !== '') 
      ? reqPassword.trim() 
      : contact.replace(/\s+/g, ''); // Fallback to contact without spaces

    if (password.length < 6) {
      password = password.padEnd(6, '0'); // Firebase Auth requires at least 6 characters
    }
    
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: name,
    });

    const uid = userRecord.uid;
    await getAuth().setCustomUserClaims(uid, { role: 'student' });

    // Store in users collection
    await db.collection('users').doc(uid).set({
      uid,
      email,
      name,
      role: 'student',
      studentId,
      createdAt: new Date().toISOString()
    });

    // Store in students collection
    const studentData = {
      studentId, name, grade, contact, qrCodeUrl,
      enrolledClasses: enrolledClasses || [], // Array of classIds
      createdAt: new Date().toISOString()
    };
    await db.collection('students').doc(studentId).set(studentData);
    
    // Auto-mark attendance for today for enrolled classes
    const today = format(new Date(), 'yyyy-MM-dd');
    const timeIn = new Date().toISOString();
    if (enrolledClasses && enrolledClasses.length > 0) {
      for (const classId of enrolledClasses) {
        const classDoc = await db.collection('classes').doc(classId).get();
        const className = classDoc.exists ? classDoc.data().name : 'Unknown Class';
        
        await db.collection('attendance').add({
          studentId, 
          studentName: name, 
          classId,
          className,
          date: today, 
          timeIn, 
          status: 'Present'
        });
      }
    }
    
    res.status(201).json({ ...studentData, email, password });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// 2. Get all students
app.get('/api/students', async (req, res) => {
  try {
    let students = [];
    const snapshot = await db.collection('students').get();
    snapshot.forEach(doc => students.push(doc.data()));
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// 2.5 Update a student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, grade, contact, enrolledClasses } = req.body;

    const studentRef = db.collection('students').doc(id);
    const doc = await studentRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await studentRef.update({
      name,
      grade,
      contact,
      enrolledClasses: enrolledClasses || [],
      updatedAt: new Date().toISOString()
    });

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// 3. Scan QR code and mark attendance
async function processAttendanceScan(studentId, classId) {
  if (!studentId) throw new Error('Student ID is required');
  if (!classId) {
    const err = new Error('Class ID is required');
    err.status = 400;
    throw err;
  }

  const currentMonth = format(new Date(), 'yyyy-MM');
  const today = format(new Date(), 'yyyy-MM-dd');

  // Verify Class
  const classDoc = await db.collection('classes').doc(classId).get();
  if (!classDoc.exists) {
    const err = new Error('Class not found');
    err.status = 404;
    throw err;
  }
  const classData = classDoc.data();

  // Verify Student
  const studentDoc = await db.collection('students').doc(studentId).get();
  if (!studentDoc.exists) {
    const error = new Error('Student not found');
    error.status = 404;
    throw error;
  }
  const student = studentDoc.data();

  // Check Enrollment
  if (!student.enrolledClasses || !student.enrolledClasses.includes(classId)) {
    const error = new Error(`Student is not enrolled in ${classData.name}`);
    error.status = 403;
    error.studentName = student.name;
    throw error;
  }

  // Check Payments for this specific class
  const paymentQuery = await db.collection('payments')
    .where('studentId', '==', studentId)
    .where('classId', '==', classId)
    .where('month', '==', currentMonth).get();
  
  const todayDate = new Date();
  const dayOfMonth = todayDate.getDate();
  
  let paymentStatus = { outstanding: false, message: 'Fees up to date' };
  if (paymentQuery.empty) {
    if (dayOfMonth >= 15) {
      paymentStatus = { outstanding: true, message: `Fees pending for ${classData.name} (${currentMonth})` };
    } else {
      // Grace period until 15th
      paymentStatus = { outstanding: false, message: `Grace Period: Fees pending for ${currentMonth}` };
    }
  }

  // Check Attendance for this specific class
  const attendanceQuery = await db.collection('attendance')
    .where('studentId', '==', studentId)
    .where('classId', '==', classId)
    .where('date', '==', today).get();
  
  if (!attendanceQuery.empty) {
    const error = new Error('Attendance already marked for this class today');
    error.status = 400;
    error.studentName = student.name;
    throw error;
  }

  // Mark Attendance
  const timeIn = new Date().toISOString();
  await db.collection('attendance').add({
    studentId, 
    studentName: student.name, 
    classId,
    className: classData.name,
    date: today, 
    timeIn, 
    status: 'Present'
  });

  return { message: `Attendance marked for ${classData.name}`, student: student.name, timeIn, paymentAlert: paymentStatus };
}

// 3. Scan QR code and mark attendance (Direct from Admin Laptop)
app.post('/api/attendance/scan', async (req, res) => {
  try {
    const { studentId, classId } = req.body;
    const result = await processAttendanceScan(studentId, classId);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Scan error:', error);
    if (error.status === 400 || error.status === 403) {
      return res.status(error.status).json({ message: error.message, student: error.studentName });
    }
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Failed to process scan' });
  }
});

// Mobile Scanner bridge - marks attendance AND updates the session document so the admin laptop sees it
app.post('/api/mobile-scan', async (req, res) => {
  try {
    const { sessionId, studentId } = req.body;
    if (!sessionId || !studentId) {
      return res.status(400).json({ error: 'Missing sessionId or studentId' });
    }
    
    // First, fetch the session to know WHICH class they are scanning for
    const sessionDoc = await db.collection('scan_sessions').doc(sessionId).get();
    if (!sessionDoc.exists || !sessionDoc.data().classId) {
      return res.status(400).json({ error: 'Invalid scan session or missing class selection' });
    }
    const classId = sessionDoc.data().classId;

    // Try to actually mark the attendance in the database!
    let scanResultData = null;
    let scanError = null;
    try {
      scanResultData = await processAttendanceScan(studentId, classId);
    } catch (err) {
      scanError = err.message || 'Error processing scan';
    }

    // Then, update the scan session document so the laptop UI (if open) updates
    await db.collection('scan_sessions').doc(sessionId).set({
      studentId: studentId,
      scannedAt: new Date().toISOString(),
      result: scanResultData,
      error: scanError
    }, { merge: true });

    res.status(200).json({ success: true, result: scanResultData, error: scanError });
  } catch (error) {
    console.error('Mobile scan bridge error:', error);
    res.status(500).json({ error: 'Failed to update scan session' });
  }
});

// 4. Record a Payment
app.post('/api/payments', async (req, res) => {
  try {
    const { studentId, classId, amount, month } = req.body; // month format: 'yyyy-MM'
    
    if (!studentId || !classId || !amount || !month) {
      return res.status(400).json({ error: 'Missing required payment fields (studentId, classId, amount, month)' });
    }

    // Verify Class
    const classDoc = await db.collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      return res.status(404).json({ error: 'Class not found' });
    }
    const className = classDoc.data().name;

    const receiptNo = generateId('REC');
    const paymentData = { 
      studentId, 
      classId,
      className,
      amount: parseFloat(amount), 
      month, 
      datePaid: new Date().toISOString(), 
      receiptNo 
    };

    await db.collection('payments').add(paymentData);
    
    // MOCK SMS NOTIFICATION HERE
    console.log(`[SMS NOTIFICATION] Receipt ${receiptNo}: Received Rs.${amount} for student ${studentId} for ${className} (${month}).`);

    res.status(201).json({ message: 'Payment recorded', paymentData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// Dashboard Metrics (Real Firebase logic)
app.get('/api/attendance/dashboard', async (req, res) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { classId } = req.query;
    
    const studentsSnapshot = await db.collection('students').get();
    let totalStudents = 0;
    
    if (classId && classId !== 'all') {
      studentsSnapshot.forEach(doc => {
        const student = doc.data();
        if (student.enrolledClasses && student.enrolledClasses.includes(classId)) {
          totalStudents++;
        }
      });
    } else {
      totalStudents = studentsSnapshot.size;
    }
    
    const attendanceSnapshot = await db.collection('attendance').where('date', '==', today).where('status', '==', 'Present').get();
    let presentToday = 0;
    let recentScans = [];
    
    attendanceSnapshot.forEach(doc => {
      const scan = doc.data();
      if (!classId || classId === 'all' || scan.classId === classId) {
        presentToday++;
        recentScans.push({ _id: doc.id, ...scan });
      }
    });

    recentScans.sort((a, b) => new Date(b.timeIn) - new Date(a.timeIn));
    recentScans = recentScans.slice(0, 10).map(scan => ({
      _id: scan._id,
      student: { name: scan.studentName, grade: scan.className || scan.grade },
      timeIn: scan.timeIn,
      status: scan.status,
      className: scan.className
    }));

    res.json({
      totalStudents,
      presentToday,
      absentToday: totalStudents - presentToday,
      recentScans
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// 4.1 Attendance Reports
app.get('/api/attendance/reports', async (req, res) => {
  try {
    const { classId, month } = req.query; // month format: 'yyyy-MM'
    if (!classId || !month) return res.status(400).json({ error: 'Missing classId or month' });
    
    // 1. Get all students enrolled in this class
    const studentsSnapshot = await db.collection('students').get();
    const enrolledStudents = [];
    studentsSnapshot.forEach(doc => {
      const student = doc.data();
      if (student.enrolledClasses && student.enrolledClasses.includes(classId)) {
        enrolledStudents.push(student);
      }
    });

    // 2. Get attendance records for this class in this month
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;
    
    const attendanceSnapshot = await db.collection('attendance')
      .where('classId', '==', classId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .get();
      
    const attendanceData = [];
    attendanceSnapshot.forEach(doc => attendanceData.push(doc.data()));

    // 3. Calculate total distinct class days
    const classDates = new Set(attendanceData.map(a => a.date));
    const totalClassDays = classDates.size;

    // 4. Format report
    const report = enrolledStudents.map(student => {
      const studentAttendance = attendanceData.filter(a => a.studentId === student.studentId);
      const daysPresent = studentAttendance.length;
      const percentage = totalClassDays > 0 ? Math.round((daysPresent / totalClassDays) * 100) : 0;
      
      return {
        studentId: student.studentId,
        studentName: student.name,
        contact: student.contact,
        daysPresent,
        totalClassDays,
        percentage
      };
    });

    res.json(report);
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({ error: 'Failed to generate attendance report' });
  }
});

// 4.5 Class Payment Reports
app.get('/api/finance/reports', async (req, res) => {
  try {
    const { classId, month } = req.query;
    if (!classId || !month) return res.status(400).json({ error: 'Missing classId or month' });
    
    // Get all students enrolled in this class
    const studentsSnapshot = await db.collection('students').where('enrolledClasses', 'array-contains', classId).get();
    let students = [];
    studentsSnapshot.forEach(doc => students.push(doc.data()));
    
    // Get all payments for this class & month
    const paymentsSnapshot = await db.collection('payments')
      .where('classId', '==', classId)
      .where('month', '==', month).get();
      
    let paidStudentIds = new Set();
    paymentsSnapshot.forEach(doc => paidStudentIds.add(doc.data().studentId));
    
    let paidStudents = [];
    let unpaidStudents = [];
    
    students.forEach(s => {
      if (paidStudentIds.has(s.studentId)) {
        paidStudents.push(s);
      } else {
        unpaidStudents.push(s);
      }
    });
    
    res.json({ unpaidStudents, paidStudents });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// 5. Teachers
app.get('/api/teachers', async (req, res) => {
  try {
    let teachers = [];
    const snapshot = await db.collection('teachers').get();
    snapshot.forEach(doc => teachers.push(doc.data()));
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

app.post('/api/teachers', async (req, res) => {
  try {
    const { name, subject, contact, commissionRate } = req.body;
    const teacherId = generateId('TCH');
    const teacherData = { teacherId, name, subject, contact, commissionRate: parseFloat(commissionRate) || 0, createdAt: new Date().toISOString() };
    await db.collection('teachers').doc(teacherId).set(teacherData);
    res.status(201).json(teacherData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add teacher' });
  }
});

app.put('/api/teachers/:id', async (req, res) => {
  try {
    const { name, subject, contact, commissionRate, email, password } = req.body;
    const teacherId = req.params.id;
    
    // Update auth and users collection if linked
    const usersSnapshot = await db.collection('users').where('linkedId', '==', teacherId).get();
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const uid = userDoc.id;
      
      const authUpdates = {};
      if (email) authUpdates.email = email;
      if (password) authUpdates.password = password;
      if (name) authUpdates.displayName = name;
      
      if (Object.keys(authUpdates).length > 0) {
         await getAuth().updateUser(uid, authUpdates);
      }
      
      if (email || name) {
         await db.collection('users').doc(uid).update({
           ...(email && { email }),
           ...(name && { name })
         });
      }
    } else if (email && password) {
      // Create user if they don't exist (for old teachers)
      const userRecord = await getAuth().createUser({
        email,
        password,
        displayName: name,
      });
      const uid = userRecord.uid;
      await getAuth().setCustomUserClaims(uid, { role: 'teacher' });
      await db.collection('users').doc(uid).set({
        uid,
        email,
        name,
        role: 'teacher',
        linkedId: teacherId,
        createdAt: new Date().toISOString()
      });
    }

    const updateData = { 
      name, 
      subject, 
      contact, 
      commissionRate: parseFloat(commissionRate) || 0,
      updatedAt: new Date().toISOString() 
    };
    await db.collection('teachers').doc(teacherId).update(updateData);
    res.json({ teacherId, ...updateData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to update teacher' });
  }
});
// Get all teachers with commission calculations
app.get('/api/teachers/commission', async (req, res) => {
  try {
    const snapshot = await db.collection('teachers').get();
    const teachers = [];
    
    for (const doc of snapshot.docs) {
      const teacher = doc.data();
      const teacherId = teacher.teacherId;
      
      // Fetch classes for this teacher
      const classSnap = await db.collection('classes').where('teacherId', '==', teacherId).get();
      let totalStudents = 0;
      let expectedIncome = 0;

      for (const classDoc of classSnap.docs) {
        const classData = classDoc.data();
        const classFee = classData.fee || 0;
        
        // Count students enrolled in this class
        const studentSnap = await db.collection('students')
          .where('enrolledClasses', 'array-contains', classDoc.id).get();
        
        totalStudents += studentSnap.size;
        expectedIncome += studentSnap.size * classFee * (teacher.commissionRate || 0.5);
      }

      teachers.push({
        ...teacher,
        students: totalStudents,
        expectedIncome
      });
    }

    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers commission:', error);
    res.status(500).json({ error: 'Failed to fetch teachers commission' });
  }
});
// 6. Classes
app.get('/api/classes', async (req, res) => {
  try {
    let classes = [];
    const snapshot = await db.collection('classes').get();
    snapshot.forEach(doc => classes.push(doc.data()));
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

app.post('/api/classes', async (req, res) => {
  try {
    const { name, grade, teacherId, fee, schedule } = req.body;
    const classId = generateId('CLS');
    
    // Fetch teacher details to store name along with ID for easy display
    let teacherName = 'Unknown';
    if (teacherId) {
      const teacherDoc = await db.collection('teachers').doc(teacherId).get();
      if (teacherDoc.exists) teacherName = teacherDoc.data().name;
    }

    const classData = { 
      classId, 
      name, 
      grade: grade || 'General', 
      teacherId, 
      teacherName, 
      fee: parseFloat(fee) || 0, 
      schedule: schedule || '', 
      createdAt: new Date().toISOString() 
    };
    await db.collection('classes').doc(classId).set(classData);
    res.status(201).json(classData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add class' });
  }
});

app.put('/api/classes/:id', async (req, res) => {
  try {
    const { name, grade, teacherId, fee, schedule } = req.body;
    const classId = req.params.id;
    
    let teacherName = 'Unknown';
    if (teacherId) {
      const teacherDoc = await db.collection('teachers').doc(teacherId).get();
      if (teacherDoc.exists) teacherName = teacherDoc.data().name;
    }

    const classData = { 
      name, 
      grade: grade || 'General', 
      teacherId, 
      teacherName, 
      fee: parseFloat(fee) || 0, 
      schedule: schedule || '', 
      updatedAt: new Date().toISOString() 
    };
    await db.collection('classes').doc(classId).update(classData);
    res.json({ classId, ...classData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update class' });
  }
});

// 7. Firebase Auth Registration (Signup)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    let studentId = null;
    
    // Create user in Firebase Auth
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: name,
    });

    const uid = userRecord.uid;

    // Set custom claims (optional, but good practice)
    await getAuth().setCustomUserClaims(uid, { role });

    // Auto-generate student record if they are a student
    if (role === 'student') {
      studentId = generateId('KWS');
      const qrCodeUrl = await qrcode.toDataURL(studentId);
      
      const studentData = {
        studentId, 
        name, 
        grade: 'Pending', 
        contact: email, 
        qrCodeUrl,
        createdAt: new Date().toISOString()
      };
      
      await db.collection('students').doc(studentId).set(studentData);
    } else if (role === 'teacher') {
      const teacherId = generateId('TCH');
      const teacherData = {
        teacherId,
        name,
        subject: req.body.subject || 'General',
        contact: email,
        commissionRate: req.body.commissionRate ? parseFloat(req.body.commissionRate) : 50,
        createdAt: new Date().toISOString()
      };
      await db.collection('teachers').doc(teacherId).set(teacherData);
      // We can reuse studentId variable just to store it in userData
      studentId = teacherId; 
    }

    // Store user metadata in Firestore
    const userData = {
      uid,
      email,
      name,
      role, // 'admin' or 'student'
      createdAt: new Date().toISOString()
    };

    if (role === 'student' || role === 'teacher') {
      userData.linkedId = studentId; // Link to auto-generated KWS-XXXXX or TCH-XXXXX
    }

    await db.collection('users').doc(uid).set(userData);

    res.status(201).json({ message: 'User created successfully', user: userData });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message || 'Failed to sign up' });
  }
});

// 8. Get Current User Role (called after client login)
app.get('/api/auth/me/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    
    let userData = userDoc.data();
    
    // Fetch additional student details (like grade and qrCodeUrl)
    if (userData.role === 'student' && userData.studentId) {
      const studentDoc = await db.collection('students').doc(userData.studentId).get();
      if (studentDoc.exists) {
        userData = { ...userData, ...studentDoc.data() };
      }
    }
    
    res.json(userData);
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// 8.5. Get Student Payment Status (For Admin Finance page)
app.get('/api/student/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { month } = req.query; // expected format: YYYY-MM
    
    if (!month) {
      return res.status(400).json({ error: 'Month parameter is required' });
    }

    const studentDoc = await db.collection('students').doc(id).get();
    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const student = studentDoc.data();
    const enrolledClasses = student.enrolledClasses || [];
    
    const classesStatus = [];
    
    for (const classId of enrolledClasses) {
      const classDoc = await db.collection('classes').doc(classId).get();
      if (!classDoc.exists) continue;
      
      const classData = classDoc.data();
      
      // Check if paid for this month
      const paymentQuery = await db.collection('payments')
        .where('studentId', '==', id)
        .where('classId', '==', classId)
        .where('month', '==', month).get();
        
      classesStatus.push({
        classId: classData.classId,
        name: classData.name,
        teacherName: classData.teacherName,
        fee: classData.fee,
        isPaid: !paymentQuery.empty
      });
    }
    
    res.json(classesStatus);
  } catch (error) {
    console.error('Fetch student status error:', error);
    res.status(500).json({ error: 'Failed to fetch student status' });
  }
});

// 9. Student Dashboard Data
app.get('/api/student/:id/dashboard', async (req, res) => {
  try {
    const { id } = req.params;
    const currentMonth = format(new Date(), 'yyyy-MM');
    
    // Fetch Student
    const studentDoc = await db.collection('students').doc(id).get();
    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const student = studentDoc.data();
    const enrolledClasses = student.enrolledClasses || [];

    // Fetch Attendance
    const attendanceSnapshot = await db.collection('attendance').where('studentId', '==', id).get();
    let attendance = [];
    attendanceSnapshot.forEach(doc => attendance.push(doc.data()));
    attendance.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Fetch Payments
    const paymentsSnapshot = await db.collection('payments').where('studentId', '==', id).get();
    let payments = [];
    paymentsSnapshot.forEach(doc => payments.push(doc.data()));
    payments.sort((a, b) => new Date(b.datePaid) - new Date(a.datePaid));

    // Calculate Classes Status
    const classesStatus = [];
    for (const classId of enrolledClasses) {
      const classDoc = await db.collection('classes').doc(classId).get();
      if (!classDoc.exists) continue;
      const classData = classDoc.data();
      
      const isPaidThisMonth = payments.some(p => p.classId === classId && p.month === currentMonth);
      const attendanceThisMonth = attendance.filter(a => a.classId === classId && a.date.startsWith(currentMonth)).length;

      classesStatus.push({
        classId: classData.classId,
        name: classData.name,
        teacherName: classData.teacherName,
        fee: classData.fee,
        isPaidThisMonth,
        attendanceThisMonth
      });
    }

    res.json({ attendance, payments, classesStatus });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// --- Phase 1: Exams & Progress ---
app.post('/api/exams', async (req, res) => {
  try {
    const { classId, title, date, marks } = req.body;
    // marks is an array: [{ studentId, mark }]
    const examId = generateId('EXM');
    
    const examData = {
      examId,
      classId,
      title,
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    
    await db.collection('exams').doc(examId).set(examData);
    
    const batch = db.batch();
    for (const m of marks) {
      if (m.studentId) {
        const markRef = db.collection('examMarks').doc();
        batch.set(markRef, {
          examId,
          classId,
          title: examData.title,
          date: examData.date,
          studentId: m.studentId,
          mark: Number(m.mark)
        });
      }
    }
    await batch.commit();

    res.status(201).json({ message: 'Exam marks saved', examId });
  } catch (error) {
    console.error('Save exam error:', error);
    res.status(500).json({ error: 'Failed to save exam' });
  }
});

app.get('/api/exams/class/:id', async (req, res) => {
  try {
    const classId = req.params.id;
    const examsSnapshot = await db.collection('exams').where('classId', '==', classId).get();
    let exams = [];
    examsSnapshot.forEach(doc => exams.push(doc.data()));
    exams.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch class exams' });
  }
});

app.get('/api/exams/student/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const marksSnapshot = await db.collection('examMarks').where('studentId', '==', studentId).get();
    let marks = [];
    marksSnapshot.forEach(doc => marks.push(doc.data()));
    marks.sort((a, b) => new Date(a.date) - new Date(b.date)); // chronological
    res.json(marks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student marks' });
  }
});

app.get('/api/teacher/:id/dashboard', async (req, res) => {
  try {
    const teacherId = req.params.id;
    const teacherDoc = await db.collection('teachers').doc(teacherId).get();
    
    if (!teacherDoc.exists) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    
    const teacherData = teacherDoc.data();
    const classSnap = await db.collection('classes').where('teacherId', '==', teacherId).get();
    
    let totalStudents = 0;
    let expectedIncome = 0;
    let classes = [];

    for (const classDoc of classSnap.docs) {
      const cls = classDoc.data();
      const studentSnap = await db.collection('students').where('enrolledClasses', 'array-contains', classDoc.id).get();
      const studentCount = studentSnap.size;
      const classIncome = studentCount * cls.fee * teacherData.commissionRate;
      
      totalStudents += studentCount;
      expectedIncome += classIncome;
      
      classes.push({
        ...cls,
        classId: classDoc.id,
        studentsCount: studentCount,
        expectedIncome: classIncome
      });
    }

    res.json({
      teacher: teacherData,
      totalStudents,
      expectedIncome,
      classes
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({ error: 'Failed to load teacher dashboard' });
  }
});

// Export the Express API for Vercel Serverless Function
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running locally on port ${PORT}`);
  });
}

module.exports = app;
