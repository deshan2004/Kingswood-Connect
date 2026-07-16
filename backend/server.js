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

// Socket.IO Setup
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });

  socket.on('scan-result', (data) => {
    const { sessionId, studentId } = data;
    console.log(`Scan result for session ${sessionId}: ${studentId}`);
    // Emit to everyone in the room (which should just be the desktop client)
    io.to(sessionId).emit('scan-received', studentId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Firebase Admin Initialization
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./firebase-serviceAccount.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
console.log('Connected to Firebase Firestore successfully!');

// --- Helper Functions ---
const generateId = (prefix) => `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;

// --- API Routes ---

// Health check
app.get('/', (req, res) => {
  res.send('Kingswood Connect API is running with Firebase!');
});

// 1. Register a new student
app.post('/api/students', async (req, res) => {
  try {
    const { name, email: reqEmail, grade, contact } = req.body;
    const studentId = generateId('KWS');
    const qrCodeUrl = await qrcode.toDataURL(studentId);

    // Create Firebase Auth User
    const email = (reqEmail && reqEmail.includes('@')) 
      ? reqEmail.trim().toLowerCase() 
      : `${studentId.toLowerCase()}@kingswood.edu`;
      
    let password = contact.replace(/\s+/g, ''); // Use contact as password without spaces
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
      createdAt: new Date().toISOString()
    };
    await db.collection('students').doc(studentId).set(studentData);
    
    res.status(201).json(studentData);
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

// 3. Scan QR code and mark attendance
app.post('/api/attendance/scan', async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ error: 'Student ID is required' });

    const currentMonth = format(new Date(), 'yyyy-MM');
    const today = format(new Date(), 'yyyy-MM-dd');

    const studentDoc = await db.collection('students').doc(studentId).get();
    if (!studentDoc.exists) return res.status(404).json({ error: 'Student not found' });
    const student = studentDoc.data();

    // Check Payments
    const paymentQuery = await db.collection('payments')
      .where('studentId', '==', studentId)
      .where('month', '==', currentMonth).get();
    
    let paymentStatus = { outstanding: false, message: 'Fees up to date' };
    if (paymentQuery.empty) {
      paymentStatus = { outstanding: true, message: 'Fees pending for ' + currentMonth };
    }

    // Check Attendance
    const attendanceQuery = await db.collection('attendance')
      .where('studentId', '==', studentId)
      .where('date', '==', today).get();
    
    if (!attendanceQuery.empty) return res.status(400).json({ message: 'Attendance already marked', student: student.name });

    // Mark Attendance
    const timeIn = new Date().toISOString();
    await db.collection('attendance').add({
      studentId, studentName: student.name, grade: student.grade, date: today, timeIn, status: 'Present'
    });

    return res.status(200).json({ message: 'Attendance marked successfully', student: student.name, timeIn, paymentAlert: paymentStatus });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Failed to process scan' });
  }
});

// 4. Record a Payment
app.post('/api/payments', async (req, res) => {
  try {
    const { studentId, amount, month } = req.body; // month format: 'yyyy-MM'
    const receiptNo = generateId('REC');
    const paymentData = { studentId, amount, month, datePaid: new Date().toISOString(), receiptNo };

    await db.collection('payments').add(paymentData);
    
    // MOCK SMS NOTIFICATION HERE
    console.log(`[SMS NOTIFICATION] Receipt ${receiptNo}: Received Rs.${amount} for student ${studentId} for month ${month}.`);

    res.status(201).json({ message: 'Payment recorded', paymentData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// Dashboard Metrics (Real Firebase logic)
app.get('/api/attendance/dashboard', async (req, res) => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const studentsSnapshot = await db.collection('students').get();
    const totalStudents = studentsSnapshot.size;
    
    const attendanceSnapshot = await db.collection('attendance').where('date', '==', today).where('status', '==', 'Present').get();
    const presentToday = attendanceSnapshot.size;

    let recentScans = [];
    // Firestore doesn't easily sort if we use 'where' on a different field without index, so we sort in memory for this small demo
    attendanceSnapshot.forEach(doc => recentScans.push({ _id: doc.id, ...doc.data() }));
    recentScans.sort((a, b) => new Date(b.timeIn) - new Date(a.timeIn));
    recentScans = recentScans.slice(0, 10).map(scan => ({
      _id: scan._id,
      student: { name: scan.studentName, grade: scan.grade },
      timeIn: scan.timeIn,
      status: scan.status
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

// 5. Teachers & Commission Calculator (Basic endpoint)
app.get('/api/teachers/commission', async (req, res) => {
  // Still mock for now since we don't have a teacher UI to add teachers
  res.json([
    { teacherId: 'T01', name: 'Mr. Silva', subject: 'Science', students: 45, commissionRate: 0.6, expectedIncome: 45 * 2000 * 0.6 },
    { teacherId: 'T02', name: 'Ms. Perera', subject: 'Maths', students: 60, commissionRate: 0.5, expectedIncome: 60 * 1500 * 0.5 }
  ]);
});

// 6. Class Schedule
app.get('/api/classes', async (req, res) => {
  // Mock classes
  res.json([
    { id: 1, name: 'Grade 10 Science', teacher: 'Mr. Silva', time: 'Mon 2:30 PM - 4:30 PM' },
    { id: 2, name: 'Grade 11 Maths', teacher: 'Ms. Perera', time: 'Tue 3:00 PM - 5:00 PM' }
  ]);
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
    }

    // Store user metadata in Firestore
    const userData = {
      uid,
      email,
      name,
      role, // 'admin' or 'student'
      createdAt: new Date().toISOString()
    };

    if (role === 'student') {
      userData.studentId = studentId; // Link to auto-generated KWS-XXXXX
    }

    await db.collection('users').doc(uid).set(userData);

    res.status(201).json({ message: 'User created successfully', user: userData });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message || 'Failed to sign up' });
  }
});

// Remove old hardcoded login since frontend will handle login directly via Firebase Client SDK
// 8. Get Current User Role (called after client login)
app.get('/api/auth/me/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    
    res.json(userDoc.data());
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// 9. Student Dashboard Data
app.get('/api/student/:id/dashboard', async (req, res) => {
  try {
    const { id } = req.params;
    
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

    res.json({ attendance, payments });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
