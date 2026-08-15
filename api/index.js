const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const { format, subMonths, subDays } = require('date-fns');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Helper to determine feeBasis ('weekly' vs 'monthly') and default fee amount based on grade
function getStudentFeeDefaults(grade, reqFeeType, reqDefaultFee) {
  let feeBasis = reqFeeType;
  let fee = reqDefaultFee;

  if (!feeBasis) {
    const g = String(grade || '').toLowerCase();
    if (g.includes('12') || g.includes('13') || g.includes('a/l') || g.includes('al')) {
      feeBasis = 'monthly';
    } else {
      feeBasis = 'weekly';
    }
  }

  if (typeof fee !== 'number') {
    fee = feeBasis === 'monthly' ? 3500 : 250;
  }

  return { feeBasis, defaultFee: fee };
}

// Helper to normalize teacher commission rate (e.g. 50 -> 0.5, 0.5 -> 0.5)
function getNormalizedCommissionRate(rawRate) {
  if (typeof rawRate !== 'number' || isNaN(rawRate)) return 0.5;
  return rawRate > 1 ? rawRate / 100 : rawRate;
}

// Helper to calculate a student's monthly class fee taking into account class fee, custom student fee, feeType (weekly vs monthly), and cardType
function calculateStudentMonthlyFee(student, classData) {
  const gradeStr = String(classData?.grade || student?.grade || '').toLowerCase();
  const isAL = gradeStr.includes('12') || gradeStr.includes('13') || gradeStr.includes('a/l') || gradeStr.includes('al');
  const feeType = classData?.feeType || student?.feeType || (isAL ? 'monthly' : 'weekly');

  let baseFee = 0;
  if (typeof student?.defaultFee === 'number' && student.defaultFee > 0) {
    baseFee = student.defaultFee;
  } else if (typeof classData?.fee === 'number' && classData.fee > 0) {
    baseFee = classData.fee;
  } else {
    const defaults = getStudentFeeDefaults(student?.grade || classData?.grade, feeType);
    baseFee = defaults.defaultFee;
  }

  // Grade 1 to 11 are collected weekly on attendance day (4 sessions per month)
  let monthlyFee = feeType === 'weekly' ? baseFee * 4 : baseFee;

  if (student?.cardType === 'free') {
    return 0;
  } else if (student?.cardType === 'half') {
    return monthlyFee / 2;
  }
  
  return monthlyFee;
}

// 1. Register a new student
app.post('/api/students', async (req, res) => {
  try {
    const { name, email: reqEmail, grade, contact, password: reqPassword, enrolledClasses, cardType, feeType: reqFeeType, defaultFee: reqDefaultFee } = req.body;
    const studentId = generateId('KWS');
    const qrCodeUrl = await qrcode.toDataURL(studentId);

    const { feeBasis, defaultFee } = getStudentFeeDefaults(grade, reqFeeType, reqDefaultFee);

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
      studentId, name, grade, contact, qrCodeUrl, email,
      cardType: cardType || 'normal', // 'normal' (full pay), 'half' (50%), 'free' (100% free)
      feeType: feeBasis, // 'weekly' (Grade 6-11) or 'monthly' (Grade 12-13 A/L)
      defaultFee,
      enrolledClasses: enrolledClasses || [], // Array of classIds
      createdAt: new Date().toISOString()
    };
    await db.collection('students').doc(studentId).set(studentData);
    
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
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.email) {
        data.email = `${data.studentId.toLowerCase()}@kingswood.edu`;
      }
      if (!data.cardType) {
        data.cardType = 'normal';
      }
      const defaults = getStudentFeeDefaults(data.grade, data.feeType, data.defaultFee);
      data.feeType = data.feeType || defaults.feeBasis;
      data.defaultFee = typeof data.defaultFee === 'number' ? data.defaultFee : defaults.defaultFee;
      students.push(data);
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// 2.5 Update a student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, grade, contact, enrolledClasses, cardType, feeType, defaultFee } = req.body;

    const studentRef = db.collection('students').doc(id);
    const doc = await studentRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const updateData = {
      name,
      grade,
      contact,
      enrolledClasses: enrolledClasses || [],
      updatedAt: new Date().toISOString()
    };
    
    if (cardType) updateData.cardType = cardType;
    if (feeType) updateData.feeType = feeType;
    if (typeof defaultFee === 'number') updateData.defaultFee = defaultFee;

    await studentRef.update(updateData);

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// 2.5.5 Delete a student (Move to Trash)
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const studentRef = db.collection('students').doc(id);
    const doc = await studentRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentData = doc.data();
    const trashId = `TRASH-STUDENT-${Date.now()}`;

    await db.collection('trash').doc(trashId).set({
      trashId,
      type: 'Student',
      originalId: id,
      title: studentData.name || 'Unnamed Student',
      subtitle: `ID: ${id} • Grade: ${studentData.grade || 'N/A'} • Contact: ${studentData.contact || 'N/A'}`,
      itemData: { ...studentData, studentId: id },
      deletedAt: new Date().toISOString()
    });

    await studentRef.delete();
    res.json({ message: 'Student moved to Trash Bin' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// 2.6 Allow Teachers (Sir / Lecturers) to grant/update student card type
app.post('/api/teacher/update-card-type', async (req, res) => {
  try {
    const { studentId, cardType, teacherName } = req.body;
    if (!studentId || !cardType) {
      return res.status(400).json({ error: 'studentId and cardType are required' });
    }

    const studentRef = db.collection('students').doc(studentId);
    const doc = await studentRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const grantedBy = teacherName || 'Teacher';
    const updateData = {
      cardType, // 'free', 'half', 'normal'
      cardGrantedBy: cardType !== 'normal' ? grantedBy : null,
      cardGrantedAt: cardType !== 'normal' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    };

    await studentRef.update(updateData);

    res.json({
      success: true,
      message: `Card type updated to ${cardType.toUpperCase()} by ${grantedBy}`,
      cardType,
      cardGrantedBy: updateData.cardGrantedBy
    });
  } catch (error) {
    console.error('Error updating card type:', error);
    res.status(500).json({ error: 'Failed to update student card type' });
  }
});

// 2.6 Update student email & sync with Firebase Auth + Firestore
app.put('/api/student/email', async (req, res) => {
  try {
    const { uid, studentId, newEmail } = req.body;
    if (!uid || !newEmail || !newEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const formattedEmail = newEmail.trim().toLowerCase();

    // 1. Update Firebase Auth user
    await getAuth().updateUser(uid, {
      email: formattedEmail,
      emailVerified: false
    });

    // 2. Update Firestore users collection
    await db.collection('users').doc(uid).update({
      email: formattedEmail,
      isDefaultEmail: false,
      updatedAt: new Date().toISOString()
    });

    // 3. Update Firestore students collection if studentId is provided
    if (studentId) {
      await db.collection('students').doc(studentId).update({
        email: formattedEmail,
        isDefaultEmail: false,
        updatedAt: new Date().toISOString()
      });
    }

    res.json({ message: 'Email updated successfully', email: formattedEmail });
  } catch (error) {
    console.error('Error updating student email:', error);
    res.status(500).json({ error: error.message || 'Failed to update student email' });
  }
});

// 2.7 Sync email verified status in Firestore
app.put('/api/student/email-verified', async (req, res) => {
  try {
    const { uid, studentId } = req.body;
    if (!uid) return res.status(400).json({ error: 'UID is required' });

    await db.collection('users').doc(uid).update({
      emailVerified: true,
      updatedAt: new Date().toISOString()
    });

    if (studentId) {
      await db.collection('students').doc(studentId).update({
        emailVerified: true,
        updatedAt: new Date().toISOString()
      });
    }

    res.json({ message: 'Verification status synced successfully' });
  } catch (error) {
    console.error('Error syncing email verification:', error);
    res.status(500).json({ error: 'Failed to sync verification status' });
  }
});

// 2.8 Auto-Cleanup Inactive Enrollments (No Attendance AND No Payment for 2+ months / 60 days)
async function cleanupInactiveEnrollments() {
  try {
    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');
    const prevMonth = format(subMonths(now, 1), 'yyyy-MM');
    const cutoffDate = format(subDays(now, 60), 'yyyy-MM-dd'); // 60 days ago

    // 1. Fetch attendance records from last 60 days (Single field query - no index required!)
    const activeAttendanceKeys = new Set();
    const attendanceSnap = await db.collection('attendance')
      .where('date', '>=', cutoffDate)
      .get();

    attendanceSnap.forEach(doc => {
      const data = doc.data();
      if (data.studentId && data.classId) {
        activeAttendanceKeys.add(`${data.studentId}_${data.classId}`);
      }
    });

    // 2. Fetch payment records for currentMonth & prevMonth (Single field queries - no index required!)
    const activePaymentKeys = new Set();
    
    const pSnap1 = await db.collection('payments').where('month', '==', currentMonth).get();
    pSnap1.forEach(doc => {
      const data = doc.data();
      if (data.studentId && data.classId) {
        activePaymentKeys.add(`${data.studentId}_${data.classId}`);
      }
    });

    const pSnap2 = await db.collection('payments').where('month', '==', prevMonth).get();
    pSnap2.forEach(doc => {
      const data = doc.data();
      if (data.studentId && data.classId) {
        activePaymentKeys.add(`${data.studentId}_${data.classId}`);
      }
    });

    // 3. Scan all students in memory
    const studentsSnapshot = await db.collection('students').get();
    let updatedStudentsCount = 0;
    let removedEnrollmentsCount = 0;

    for (const studentDoc of studentsSnapshot.docs) {
      const student = studentDoc.data();
      const studentId = studentDoc.id;
      const enrolledClasses = student.enrolledClasses || [];

      if (!enrolledClasses || enrolledClasses.length === 0) continue;

      // Grace period: Skip new students registered in the last 60 days
      if (student.createdAt) {
        const createdDate = new Date(student.createdAt);
        const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation < 60) {
          continue;
        }
      }

      let activeEnrolledClasses = [...enrolledClasses];
      let hasChanges = false;

      for (const classId of enrolledClasses) {
        const key = `${studentId}_${classId}`;
        const hasAttendance = activeAttendanceKeys.has(key);
        const hasPayment = activePaymentKeys.has(key);

        // If NO attendance in 60 days AND NO payment in last 2 months -> Un-enroll!
        if (!hasAttendance && !hasPayment) {
          activeEnrolledClasses = activeEnrolledClasses.filter(c => c !== classId);
          hasChanges = true;
          removedEnrollmentsCount++;
        }
      }

      if (hasChanges) {
        await db.collection('students').doc(studentId).update({
          enrolledClasses: activeEnrolledClasses,
          updatedAt: new Date().toISOString()
        });
        updatedStudentsCount++;
      }
    }

    return { updatedStudentsCount, removedEnrollmentsCount };
  } catch (error) {
    console.error('Error in cleanupInactiveEnrollments:', error);
    throw error;
  }
}

app.post('/api/students/cleanup-inactive', async (req, res) => {
  try {
    const result = await cleanupInactiveEnrollments();
    res.json({ 
      success: true, 
      message: `Cleaned up ${result.removedEnrollmentsCount} inactive class enrollment(s) across ${result.updatedStudentsCount} student(s).`,
      ...result 
    });
  } catch (error) {
    console.error('Failed to cleanup inactive students:', error);
    res.status(500).json({ error: error.message || 'Failed to cleanup inactive students' });
  }
});

// 3. Scan QR code and mark attendance
async function processAttendanceScan(studentId, classId, paidToday = false, amountPaid = null) {
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

  const cardType = student.cardType || 'normal'; // 'normal', 'half', 'free'
  const gradeStr = String(classData.grade || student.grade || '').toLowerCase();
  const isAL = gradeStr.includes('12') || gradeStr.includes('13') || gradeStr.includes('a/l') || gradeStr.includes('al');
  
  // Use class feeType & grade first (Grade 1-11 = weekly session fee, Grade 12-13 = monthly fee)
  const feeType = classData.feeType || (isAL ? 'monthly' : 'weekly');
  
  const defaultFee = typeof classData.fee === 'number' && classData.fee > 0
    ? classData.fee
    : (typeof student.defaultFee === 'number' && student.defaultFee > 0 ? student.defaultFee : (feeType === 'monthly' ? 3500 : 250));

  let feeAmount = defaultFee;
  if (cardType === 'free') feeAmount = 0;
  else if (cardType === 'half') feeAmount = defaultFee / 2;

  // Check Payments for this specific class for monthly check
  const paymentQuery = await db.collection('payments')
    .where('studentId', '==', studentId)
    .where('classId', '==', classId)
    .where('month', '==', currentMonth).get();
  
  let monthlyPaid = !paymentQuery.empty || cardType === 'free';
  let feeStatus = 'Unpaid';
  let feePaid = 0;

  if (cardType === 'free') {
    feeStatus = 'Free Card';
    feePaid = 0;
    monthlyPaid = true;
  } else if (feeType === 'monthly') {
    if (monthlyPaid || paidToday || (typeof amountPaid === 'number' && amountPaid > 0)) {
      feeStatus = 'Paid (Monthly)';
      feePaid = monthlyPaid ? (paymentQuery.empty ? feeAmount : paymentQuery.docs[0].data().amount) : (amountPaid || feeAmount);
      monthlyPaid = true;
    } else {
      feeStatus = 'Unpaid (Monthly)';
      feePaid = 0;
    }
  } else {
    // Weekly fee basis
    if (paidToday || (typeof amountPaid === 'number' && amountPaid > 0)) {
      feeStatus = 'Paid';
      feePaid = typeof amountPaid === 'number' ? amountPaid : feeAmount;
    } else {
      feeStatus = 'Unpaid';
      feePaid = 0;
    }
  }

  const todayDate = new Date();
  const dayOfMonth = todayDate.getDate();
  
  let paymentStatus = { outstanding: false, message: 'Fees up to date' };
  if (feeType === 'monthly' && cardType !== 'free' && !monthlyPaid && feeStatus !== 'Paid (Monthly)') {
    if (dayOfMonth >= 15) {
      paymentStatus = { outstanding: true, message: `Monthly fees pending for ${classData.name} (${currentMonth})` };
    } else {
      // Grace period until 15th
      paymentStatus = { outstanding: false, message: `Grace Period: Monthly fees pending for ${currentMonth}` };
    }
  }

  // Check Attendance for this specific class today
  const attendanceQuery = await db.collection('attendance')
    .where('studentId', '==', studentId)
    .where('classId', '==', classId)
    .where('date', '==', today).get();
  
  if (!attendanceQuery.empty) {
    const error = new Error('Attendance already marked for this class today');
    error.status = 400;
    error.studentName = student.name;
    error.attendanceId = attendanceQuery.docs[0].id;
    error.existingData = attendanceQuery.docs[0].data();
    throw error;
  }

  // Record payment in payments collection if cash collected right now
  if ((paidToday || (typeof amountPaid === 'number' && amountPaid > 0)) && cardType !== 'free') {
    if (feeType !== 'monthly' || paymentQuery.empty) {
      const receiptNo = generateId('REC');
      await db.collection('payments').add({
        studentId,
        studentName: student.name,
        classId,
        className: classData.name,
        amount: feePaid || feeAmount,
        month: currentMonth,
        datePaid: new Date().toISOString(),
        receiptNo,
        paymentType: feeType === 'monthly' ? 'Monthly Class Fee' : 'Weekly Session Fee'
      });
      if (feeType === 'monthly') monthlyPaid = true;
    }
  }

  // Mark Attendance
  const timeIn = new Date().toISOString();
  const attendanceDocRef = await db.collection('attendance').add({
    studentId, 
    studentName: student.name, 
    classId,
    className: classData.name,
    date: today, 
    timeIn, 
    status: 'Present',
    cardType,
    feeType,
    feeStatus,
    feePaid,
    feeAmount,
    monthlyPaid
  });

  return { 
    attendanceId: attendanceDocRef.id,
    message: `Attendance marked for ${classData.name}`, 
    student: {
      studentId: student.studentId,
      name: student.name,
      grade: student.grade,
      cardType,
      cardGrantedBy: student.cardGrantedBy || null,
      feeType,
      defaultFee,
      feeAmount,
      feeStatus,
      feePaid,
      monthlyPaid
    }, 
    timeIn, 
    paymentAlert: paymentStatus 
  };
}

// 3. Scan QR code and mark attendance (Direct from Admin Laptop)
app.post('/api/attendance/scan', async (req, res) => {
  try {
    const { studentId, classId, paidToday, amountPaid } = req.body;
    const result = await processAttendanceScan(studentId, classId, paidToday, amountPaid);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Scan error:', error);
    if (error.status === 400 || error.status === 403) {
      return res.status(error.status).json({ 
        message: error.message, 
        student: error.studentName,
        attendanceId: error.attendanceId,
        existingData: error.existingData 
      });
    }
    const status = error.status || 500;
    res.status(status).json({ error: error.message || 'Failed to process scan' });
  }
});

// 3.5 Toggle or update payment status for today's attendance
app.post('/api/attendance/payment-toggle', async (req, res) => {
  try {
    const { attendanceId, studentId, classId, paidToday, amountPaid } = req.body;
    
    if (!studentId || !classId) {
      return res.status(400).json({ error: 'Missing studentId or classId' });
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const currentMonth = format(new Date(), 'yyyy-MM');

    // Fetch Attendance doc
    let targetDocId = attendanceId;
    if (!targetDocId) {
      const attQuery = await db.collection('attendance')
        .where('studentId', '==', studentId)
        .where('classId', '==', classId)
        .where('date', '==', today).get();
      if (!attQuery.empty) {
        targetDocId = attQuery.docs[0].id;
      }
    }

    if (!targetDocId) {
      return res.status(404).json({ error: 'Today attendance record not found' });
    }

    const attDocRef = db.collection('attendance').doc(targetDocId);
    const attSnap = await attDocRef.get();
    if (!attSnap.exists) {
      return res.status(404).json({ error: 'Attendance document not found' });
    }

    const attData = attSnap.data();
    const studentDoc = await db.collection('students').doc(studentId).get();
    const studentData = studentDoc.exists ? studentDoc.data() : {};
    
    const cardType = studentData.cardType || attData.cardType || 'normal';
    const defaultFee = typeof studentData.defaultFee === 'number' ? studentData.defaultFee : 250;
    
    let feeAmount = defaultFee;
    if (cardType === 'free') feeAmount = 0;
    else if (cardType === 'half') feeAmount = defaultFee / 2;

    const newFeeStatus = cardType === 'free' ? 'Free Card' : (paidToday ? 'Paid' : 'Unpaid');
    const newFeePaid = cardType === 'free' ? 0 : (paidToday ? (amountPaid || feeAmount) : 0);

    // Update Attendance Doc
    await attDocRef.update({
      cardType,
      feeStatus: newFeeStatus,
      feePaid: newFeePaid,
      feeAmount,
      updatedAt: new Date().toISOString()
    });

    // Record payment if changed to Paid
    if (paidToday && newFeePaid > 0 && attData.feeStatus !== 'Paid') {
      const receiptNo = generateId('REC');
      await db.collection('payments').add({
        studentId,
        studentName: attData.studentName || studentData.name,
        classId,
        className: attData.className || 'Class Fee',
        amount: newFeePaid,
        month: currentMonth,
        datePaid: new Date().toISOString(),
        receiptNo,
        paymentType: 'Weekly Session Fee'
      });
    }

    res.json({ 
      success: true, 
      feeStatus: newFeeStatus, 
      feePaid: newFeePaid, 
      cardType,
      message: `Payment status updated to ${newFeeStatus}` 
    });
  } catch (error) {
    console.error('Error toggling attendance payment:', error);
    res.status(500).json({ error: error.message || 'Failed to update payment status' });
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
    const classData = classDoc.data();
    const className = classData.name || '';
    const isAL = String(className).toLowerCase().includes('12') || 
                 String(className).toLowerCase().includes('13') || 
                 String(className).toLowerCase().includes('a/l') || 
                 String(className).toLowerCase().includes('al');
    const feeType = classData.feeType || (isAL ? 'monthly' : 'weekly');

    const receiptNo = generateId('REC');
    const paymentData = { 
      studentId, 
      classId,
      className,
      feeType,
      feeBasis: feeType === 'weekly' ? 'Weekly Fee' : 'Monthly Fee',
      amount: parseFloat(amount), 
      month, 
      datePaid: new Date().toISOString(), 
      receiptNo 
    };

    await db.collection('payments').add(paymentData);

    // Update corresponding attendance record (if unpaid previously)
    try {
      const attSnapshot = await db.collection('attendance')
        .where('studentId', '==', studentId)
        .where('classId', '==', classId)
        .get();

      if (!attSnapshot.empty) {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        let targetDoc = attSnapshot.docs.find(d => d.data().date === todayStr && d.data().feeStatus !== 'Paid');
        if (!targetDoc) {
          targetDoc = attSnapshot.docs.find(d => d.data().feeStatus !== 'Paid');
        }
        if (targetDoc) {
          await db.collection('attendance').doc(targetDoc.id).update({
            feeStatus: feeType === 'monthly' ? 'Paid (Monthly)' : 'Paid',
            feePaid: parseFloat(amount),
            monthlyPaid: feeType === 'monthly' ? true : false,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (attErr) {
      console.error('Failed to sync payment with attendance:', attErr);
    }
    
    // MOCK SMS NOTIFICATION HERE
    console.log(`[SMS NOTIFICATION] Receipt ${receiptNo}: Received Rs.${amount} (${feeType}) for student ${studentId} for ${className} (${month}).`);

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
      .get();
      
    const attendanceData = [];
    attendanceSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.date >= startDate && data.date <= endDate) {
        attendanceData.push(data);
      }
    });

    // 3. Calculate total distinct class days
    const classDates = new Set(attendanceData.map(a => a.date));
    const totalClassDays = classDates.size;

    // 4. Check payments for this class and month
    const paymentsSnapshot = await db.collection('payments')
      .where('classId', '==', classId)
      .where('month', '==', month).get();
      
    const paidStudentIds = new Set();
    paymentsSnapshot.forEach(doc => {
      paidStudentIds.add(doc.data().studentId);
    });

    // 5. Format report
    const report = enrolledStudents.map(student => {
      const studentAttendance = attendanceData.filter(a => a.studentId === student.studentId);
      const daysPresent = studentAttendance.length;
      const percentage = totalClassDays > 0 ? Math.round((daysPresent / totalClassDays) * 100) : 0;
      const feesPaid = paidStudentIds.has(student.studentId);
      
      return {
        studentId: student.studentId,
        studentName: student.name,
        contact: student.contact,
        cardType: student.cardType || 'normal',
        cardGrantedBy: student.cardGrantedBy || null,
        feeType: student.feeType || 'weekly',
        daysPresent,
        totalClassDays,
        percentage,
        feesPaid: student.cardType === 'free' ? true : feesPaid
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
    const commRate = getNormalizedCommissionRate(parseFloat(commissionRate));
    const teacherData = { teacherId, name, subject, contact, commissionRate: commRate, createdAt: new Date().toISOString() };
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
      commissionRate: getNormalizedCommissionRate(parseFloat(commissionRate)),
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
      const commRate = getNormalizedCommissionRate(teacher.commissionRate);
      
      // Fetch classes for this teacher
      const classSnap = await db.collection('classes').where('teacherId', '==', teacherId).get();
      let totalStudents = 0;
      let expectedIncome = 0;

      for (const classDoc of classSnap.docs) {
        const classData = classDoc.data();
        
        // Count students enrolled in this class
        const studentSnap = await db.collection('students')
          .where('enrolledClasses', 'array-contains', classDoc.id).get();
        
        totalStudents += studentSnap.size;

        studentSnap.forEach(sDoc => {
          const s = sDoc.data();
          const studentMonthlyFee = calculateStudentMonthlyFee(s, classData);
          expectedIncome += studentMonthlyFee * commRate;
        });
      }

      teachers.push({
        ...teacher,
        commissionRate: commRate,
        students: totalStudents,
        expectedIncome: Math.round(expectedIncome)
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
      const commRate = getNormalizedCommissionRate(parseFloat(req.body.commissionRate));
      const teacherData = {
        teacherId,
        name,
        subject: req.body.subject || 'General',
        contact: email,
        commissionRate: commRate,
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
    const cardType = student.cardType || 'normal';
    const defaults = getStudentFeeDefaults(student.grade, student.feeType, student.defaultFee);
    const feeType = student.feeType || defaults.feeBasis;
    const defaultFee = typeof student.defaultFee === 'number' ? student.defaultFee : defaults.defaultFee;

    const classesStatus = [];
    for (const classId of enrolledClasses) {
      const classDoc = await db.collection('classes').doc(classId).get();
      if (!classDoc.exists) continue;
      const classData = classDoc.data();
      const isClassAL = String(classData.name || '').toLowerCase().includes('12') || 
                       String(classData.name || '').toLowerCase().includes('13') || 
                       String(classData.name || '').toLowerCase().includes('a/l') || 
                       String(classData.name || '').toLowerCase().includes('al');
      const classFeeType = classData.feeType || (isClassAL ? 'monthly' : 'weekly');
      const classFee = classData.fee || defaultFee;
      const sessionFee = classFeeType === 'weekly' 
        ? (classData.weeklyFee || (classFee > 500 ? Math.round(classFee / 4) : classFee))
        : classFee;

      const isPaidThisMonth = cardType === 'free' || payments.some(p => p.classId === classId && p.month === currentMonth);
      const attendanceThisMonth = attendance.filter(a => a.classId === classId && a.date.startsWith(currentMonth)).length;

      classesStatus.push({
        classId: classData.classId,
        name: classData.name,
        teacherName: classData.teacherName,
        fee: classFee,
        sessionFee,
        cardType,
        cardGrantedBy: student.cardGrantedBy || null,
        feeType: classFeeType,
        isFreeCard: cardType === 'free',
        isHalfCard: cardType === 'half',
        isPaidThisMonth,
        attendanceThisMonth
      });
    }

    res.json({ 
      attendance, 
      payments, 
      classesStatus,
      studentCard: {
        cardType,
        cardGrantedBy: student.cardGrantedBy || null,
        feeType,
        defaultFee
      }
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// --- Materials / Tutes & Exams ---
app.post('/api/materials', async (req, res) => {
  try {
    const { classId, title, type, link, description, teacherId } = req.body;
    const materialId = generateId('MAT');
    
    const materialData = {
      materialId,
      classId,
      title,
      type: type || 'Tute',
      link,
      description: description || '',
      teacherId,
      createdAt: new Date().toISOString()
    };
    
    await db.collection('materials').doc(materialId).set(materialData);
    res.status(201).json({ message: 'Material added successfully', material: materialData });
  } catch (error) {
    console.error('Add material error:', error);
    res.status(500).json({ error: 'Failed to add material' });
  }
});

app.get('/api/materials/class/:id', async (req, res) => {
  try {
    const classId = req.params.id;
    const materialsSnapshot = await db.collection('materials').where('classId', '==', classId).get();
    let materials = [];
    materialsSnapshot.forEach(doc => materials.push(doc.data()));
    materials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // newest first
    res.json(materials);
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

app.delete('/api/materials/:id', async (req, res) => {
  try {
    const materialId = req.params.id;
    const matRef = db.collection('materials').doc(materialId);
    const doc = await matRef.get();

    if (doc.exists) {
      const matData = doc.data();
      const trashId = `TRASH-MAT-${Date.now()}`;
      await db.collection('trash').doc(trashId).set({
        trashId,
        type: 'Material',
        originalId: materialId,
        title: matData.title || 'Untitled Material',
        subtitle: `Type: ${matData.type || 'Tute'} • Class: ${matData.className || matData.classId || 'N/A'}`,
        itemData: { ...matData, materialId },
        deletedAt: new Date().toISOString()
      });
    }

    await matRef.delete();
    res.json({ message: 'Material moved to Trash Bin' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

// --- Trash Bin Endpoints ---

// Get all items in trash
app.get('/api/trash', async (req, res) => {
  try {
    const snapshot = await db.collection('trash').get();
    const items = snapshot.docs.map(doc => ({ trashId: doc.id, ...doc.data() }));
    items.sort((a, b) => new Date(b.deletedAt || 0) - new Date(a.deletedAt || 0));
    res.json(items);
  } catch (error) {
    console.error('Error fetching trash items:', error);
    res.status(500).json({ error: 'Failed to fetch trash items' });
  }
});

// Restore item from trash
app.post('/api/trash/restore/:trashId', async (req, res) => {
  try {
    const { trashId } = req.params;
    const trashRef = db.collection('trash').doc(trashId);
    const doc = await trashRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Trash item not found' });
    }

    const item = doc.data();
    const { type, originalId, itemData } = item;

    if (type === 'Student') {
      await db.collection('students').doc(originalId).set(itemData);
    } else if (type === 'Material') {
      await db.collection('materials').doc(originalId).set(itemData);
    } else if (type === 'Teacher') {
      await db.collection('teachers').doc(originalId).set(itemData);
    } else if (type === 'Class') {
      await db.collection('classes').doc(originalId).set(itemData);
    } else {
      await db.collection(`${type.toLowerCase()}s`).doc(originalId).set(itemData);
    }

    // Delete from trash
    await trashRef.delete();
    res.json({ message: 'Item restored successfully' });
  } catch (error) {
    console.error('Error restoring trash item:', error);
    res.status(500).json({ error: 'Failed to restore item' });
  }
});

// Permanently delete single item from trash
app.delete('/api/trash/:trashId', async (req, res) => {
  try {
    const { trashId } = req.params;
    await db.collection('trash').doc(trashId).delete();
    res.json({ message: 'Item deleted permanently' });
  } catch (error) {
    console.error('Error deleting item from trash:', error);
    res.status(500).json({ error: 'Failed to delete item permanently' });
  }
});

// Empty entire trash
app.delete('/api/trash', async (req, res) => {
  try {
    const snapshot = await db.collection('trash').get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    res.json({ message: 'Trash Bin emptied successfully' });
  } catch (error) {
    console.error('Error emptying trash:', error);
    res.status(500).json({ error: 'Failed to empty trash' });
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
    const commissionRate = getNormalizedCommissionRate(teacherData.commissionRate);
    const classSnap = await db.collection('classes').where('teacherId', '==', teacherId).get();
    
    let totalStudents = 0;
    let expectedIncome = 0;
    let classes = [];

    for (const classDoc of classSnap.docs) {
      const cls = classDoc.data();
      const studentSnap = await db.collection('students').where('enrolledClasses', 'array-contains', classDoc.id).get();
      const studentCount = studentSnap.size;
      
      let classIncome = 0;

      studentSnap.forEach(sDoc => {
        const s = sDoc.data();
        const studentMonthlyFee = calculateStudentMonthlyFee(s, cls);
        classIncome += studentMonthlyFee * commissionRate;
      });
      
      totalStudents += studentCount;
      expectedIncome += classIncome;
      
      const gradeStr = String(cls.grade || '').toLowerCase();
      const isAL = gradeStr.includes('12') || gradeStr.includes('13') || gradeStr.includes('a/l') || gradeStr.includes('al');
      const feeType = cls.feeType || (isAL ? 'monthly' : 'weekly');

      classes.push({
        ...cls,
        classId: classDoc.id,
        feeType,
        studentsCount: studentCount,
        expectedIncome: Math.round(classIncome)
      });
    }

    res.json({
      teacher: {
        ...teacherData,
        commissionRate
      },
      totalStudents,
      expectedIncome: Math.round(expectedIncome),
      classes
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch teacher dashboard data' });
  }
});

// 7. Landing Page CMS Settings Endpoints
const defaultLandingSettings = {
  // Hero Section
  heroTagline: '🏆 Premier Educational Institute | Grade 1 to Grade 13 (All Subjects)',
  heroTitleLine1: 'Empowering Academic Excellence &',
  heroTitleGradient: 'Future Leaders',
  heroSubtitle: 'Comprehensive tuition classes & digital learning portal for Grade 1 to Grade 13 across all subjects. Interactive learning, real-time attendance tracking, and expert academic guidance.',
  heroBtn1Text: 'Meet Our Faculty (Sirs)',
  heroBtn2Text: 'View Exam Results',
  heroBadge1Title: '#1 Rated Institute',
  heroBadge1Sub: 'Auditorium & Live Stream',
  heroBadge2Title: 'Smart QR Attendance',
  heroBadge2Sub: 'Instant Parent SMS Alerts',
  heroImage: '/kc-logo.png',

  // Stat Counters
  statsRanks: '150+',
  statsRanksLabel: 'Island Ranks',
  statsPassRate: '98%',
  statsPassRateLabel: 'A/B Grade Pass Rate',
  statsStudents: '5,000+',
  statsStudentsLabel: 'Active Students',
  statsExperience: '12+ Years',
  statsExperienceLabel: 'Academic Mastery',

  // Faculty (Sirs) Section
  facultyBadge: 'MEET OUR PANEL OF EXPERT SIRS',
  facultyTitle: 'Distinguished Faculty & Subject Specialists',
  facultySub: 'Our institute brings together top Sri Lankan educators dedicated to guiding students from Grade 1 to Grade 13 across all core subjects and academic streams.',
  teachers: [
    {
      teacherId: 'TCH-1001',
      name: 'Eng. Kasun Perera',
      subject: 'Mathematics (Grade 6 - 13)',
      qualification: 'B.Sc. Engineering (Hons) - Peradeniya',
      desc: 'Master lecturer specializing in Mathematics from Grade 6 to 11 O/L as well as A/L Combined Mathematics, simplifying complex algebra, geometry, and calculus.',
      image: '/kc-logo.png',
      videoUrl: '',
      experience: '12+ Years',
      ranks: '150+ Top Ranks',
      badgeColor: 'bg-indigo-600'
    },
    {
      teacherId: 'TCH-1002',
      name: 'Dr. Nimal Wickramasinghe',
      subject: 'Science & Physics Specialist',
      qualification: 'Ph.D., B.Sc. Physics Special (Hons) - Colombo',
      desc: 'Senior Science & Physics educator covering Junior Secondary Science (Grades 6-9), O/L Science (Grades 10-11), and A/L Physics with visual laboratory concepts.',
      image: '/kc-logo.png',
      videoUrl: '',
      experience: '14+ Years',
      ranks: '120+ Top Ranks',
      badgeColor: 'bg-blue-600'
    },
    {
      teacherId: 'TCH-1003',
      name: 'Mrs. Anusha Jayawardena',
      subject: 'Primary & Foundation Specialist (Grade 1 - 5)',
      qualification: 'B.Ed. Primary Education, M.A. Linguistics',
      desc: 'Expert educator dedicated to Grade 1 to 5 foundation learning and Grade 5 Scholarship preparation, building strong literacy, numerical, and analytical skills.',
      image: '/kc-logo.png',
      videoUrl: '',
      experience: '10+ Years',
      ranks: '95+ Island Ranks',
      badgeColor: 'bg-emerald-600'
    }
  ],

  // Classes & Schedule Section
  classesBadge: 'TUITION CLASSES & SCHEDULE',
  classesTitle: 'Our Classes & Schedule',
  classesSub: 'Explore our active auditorium & online live tuition classes managed directly by institute administration.',
  classes: [
    {
      classId: 'CLS-PRI-101',
      name: 'Grade 1 - 5 Primary & Scholarship Class',
      grade: 'Grade 1 - 5',
      teacherName: 'Mrs. Anusha Jayawardena',
      subject: 'Primary Core Subjects & Scholarship',
      schedule: 'Saturday 8:30 AM - 11:30 AM',
      location: 'Primary Learning Wing & Online Stream',
      fee: 2500,
      description: 'Interactive foundation building in Mathematics, Languages, and Scholarship Exam prep tailored for Grade 1-5 primary students.'
    },
    {
      classId: 'CLS-OL-201',
      name: 'Grade 6 - 11 O/L Core Theory & Revision',
      grade: 'Grade 6 - 11',
      teacherName: 'Eng. Kasun Perera & Science Faculty',
      subject: 'Mathematics, Science, English & ICT',
      schedule: 'Sunday 8:00 AM - 1:00 PM',
      location: 'Main Auditorium & Web Stream',
      fee: 3000,
      isPopular: true,
      description: 'Comprehensive syllabus coverage, monthly term test evaluations, and model paper breakdowns for Junior Secondary and G.C.E. O/L students.'
    },
    {
      classId: 'CLS-AL-301',
      name: 'Grade 12 - 13 A/L Theory & Revision',
      grade: 'Grade 12 - 13 (A/L)',
      teacherName: 'Dr. Nimal Wickramasinghe & A/L Panel',
      subject: 'Science, Commerce, Arts & Tech Streams',
      schedule: 'Wednesday 2:30 PM - 6:30 PM',
      location: 'Physical Exam Hall & Online Stream',
      fee: 3500,
      description: 'In-depth concept delivery, past paper breakdowns, and speed revision sessions for G.C.E. Advanced Level success.'
    }
  ],

  // Exam Results & Achievers
  resultsBadge: 'PROVEN EXCELLENCE',
  resultsTitle: 'Celebrating Our Top Achievers',
  resultsSub: 'True success is measured by consistent results. Highlighting our outstanding performers across Grade 1 to Grade 13 examinations.',
  resultsCtaTitle: 'Be the Next Academic Success Story!',
  resultsCtaSub: 'Enroll today and gain instant access to Kingswood Connect student portal, tutes, and exam schedules.',
  achievers: [
    {
      name: 'Kaveen Perera',
      rankBadge: '🏆 A/L Island Rank 01',
      stream: 'G.C.E. A/L Stream',
      zScore: '2.8942',
      district: 'Kandy District',
      image: '/images/top_student_male.png'
    },
    {
      name: 'Shenali Fernando',
      rankBadge: '🌟 O/L 9 A Stars',
      stream: 'G.C.E. O/L Batch',
      zScore: '9 A Passes',
      district: 'Colombo District',
      image: '/images/top_student_female.png'
    },
    {
      name: 'Nipuna Jayasinghe',
      rankBadge: '🥇 Grade 5 Scholarship Top Ranker',
      stream: 'Primary Section (Grade 5)',
      zScore: '196 Marks',
      district: 'Kurunegala',
      image: ''
    },
    {
      name: 'Dilini Ranasinghe',
      rankBadge: '🎖️ A/L District Rank 01',
      stream: 'G.C.E. A/L Stream',
      zScore: '2.7650',
      district: 'Kandy',
      image: ''
    }
  ],

  // Vision & Mission
  visionBadge: 'OUR CORE PURPOSE',
  visionTitle: 'Vision & Mission',
  visionSub: 'Every initiative at Kingswood Connect is guided by an unyielding commitment to student transformation and academic integrity.',
  visionText: 'To become Sri Lanka\'s benchmark educational institute, empowering students from Grade 1 to Grade 13 with analytical thinking, problem-solving skills, and academic excellence across all subjects and streams.',
  missionText: 'To unlock every student\'s highest potential from Grade 1 through Grade 13 by combining modern digital technology, structured paper series, clear concept delivery, and individual mentorship.',

  // Technology Features
  featuresBadge: 'INSTITUTE & DIGITAL FEATURES',
  featuresTitle: 'Modern Tuition & Technology Features',
  featuresSub: 'Engineered specifically to maximize student productivity and keep parents informed in real-time.',
  features: [
    {
      title: 'Smart QR Attendance',
      desc: 'Instant QR code scanning upon class entry automatically logs attendance and dispatches instant SMS alerts to parents.'
    },
    {
      title: 'Exam Analytics & Ranks',
      desc: 'Instant score dashboards, district-level rank indices, and progress trend graphs available right after evaluation.'
    },
    {
      title: 'HD Lecture Recordings',
      desc: 'On-demand access to high-definition recordings of missed or previous lectures anytime on student portal.'
    },
    {
      title: 'Digital Materials & Tutes',
      desc: 'Downloadable PDF tutes, lesson summaries, past paper marking schemes, and speed revision guides.'
    }
  ],

  // Testimonials
  testimonialsBadge: 'STUDENT & PARENT REVIEWS',
  testimonialsTitle: 'Trusted by Thousands',
  testimonials: [
    {
      name: 'Kaveen Perera',
      role: 'Engineering Faculty - Moratuwa (2024 A/L)',
      text: '"Combined Maths felt overwhelming until I joined Kasun Sir\'s class. His visual problem-solving techniques gave me immense clarity, leading directly to my Island Rank 01 achievement."'
    },
    {
      name: 'Shenali Fernando',
      role: 'Medical Student - Colombo (2024 A/L)',
      text: '"The Kingswood Connect Student Portal made studying so effortless. Being able to rewatch HD recordings and check paper results instantly boosted my overall Z-Score tremendously."'
    },
    {
      name: 'N. Jayasinghe',
      role: 'Parent of Nipuna (District Rank 01)',
      text: '"As a parent, receiving real-time QR attendance SMS alerts gave us peace of mind. Sir\'s personal dedication and continuous mentorship are truly commendable."'
    }
  ],

  // Contact Info & WhatsApp
  contactBadge: 'GET IN TOUCH',
  contactTitle: 'Contact Us & Class Enrollment',
  contactSub: 'Have questions regarding upcoming tuition batches or online class registration? Send us an inquiry or reach out to our hotlines directly.',
  address: 'Kingswood Education Complex, Peradeniya Road, Kandy, Sri Lanka',
  phone: '+94 81 222 3456 / +94 77 123 4567',
  whatsapp: '+94 77 123 4567',
  email: 'info@kingswoodconnect.lk'
};

app.get('/api/landing-settings', async (req, res) => {
  try {
    const docSnap = await db.collection('settings').doc('landingPage').get();
    if (docSnap.exists) {
      const data = docSnap.data() || {};
      let needsDbUpdate = false;

      if (!data.heroTagline || data.heroTagline.includes('Physics & Combined')) {
        data.heroTagline = defaultLandingSettings.heroTagline;
        needsDbUpdate = true;
      }
      if (!data.heroSubtitle || data.heroSubtitle.includes('Physics & Combined') || data.heroSubtitle.includes('Master G.C.E. Advanced Level Physics')) {
        data.heroSubtitle = defaultLandingSettings.heroSubtitle;
        needsDbUpdate = true;
      }
      if (!data.facultySub || data.facultySub.includes('A/L Science & Mathematics')) {
        data.facultySub = defaultLandingSettings.facultySub;
        needsDbUpdate = true;
      }
      if (!data.visionText || data.visionText.includes('engineering, medicine, and technology')) {
        data.visionText = defaultLandingSettings.visionText;
        needsDbUpdate = true;
      }
      if (!data.missionText || data.missionText.includes('Z-Scores and Island Ranks')) {
        data.missionText = defaultLandingSettings.missionText;
        needsDbUpdate = true;
      }

      const merged = { ...defaultLandingSettings, ...data };

      if (needsDbUpdate) {
        db.collection('settings').doc('landingPage').set(merged, { merge: true }).catch(err => console.error('Error updating legacy settings:', err));
      }

      res.json(merged);
    } else {
      res.json(defaultLandingSettings);
    }
  } catch (error) {
    console.error('Error fetching landing settings:', error);
    res.json(defaultLandingSettings);
  }
});

app.put('/api/landing-settings', async (req, res) => {
  try {
    const newSettings = req.body;
    const updatedData = {
      ...newSettings,
      updatedAt: new Date().toISOString()
    };
    await db.collection('settings').doc('landingPage').set(updatedData, { merge: true });
    res.json({ message: 'Landing page settings updated successfully', settings: updatedData });
  } catch (error) {
    console.error('Error updating landing settings:', error);
    res.status(500).json({ error: 'Failed to update landing page settings', details: error?.message || 'Unknown database error' });
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
