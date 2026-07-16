# Kingswood Connect

Kingswood Connect is a modern, real-time student attendance and management system designed for seamless administration. It features a robust desktop dashboard alongside an innovative "Mobile Scanner" capability that turns any smartphone into a remote, real-time ID scanner.

## ✨ Features

- **📊 Real-time Dashboard**: Live metrics, attendance overview charts, and recent scan logs.
- **📱 Mobile Scanner Integration**: Connect your smartphone via a secure QR code link to use its camera as a remote barcode/QR scanner. Scans register instantly on the desktop!
- **📸 Built-in Web Scanner**: Utilize standard webcams for fast, localized ID scanning.
- **🔐 Role-based Access**: Secure Firebase Authentication for administrators and students.
- **💰 Financial Tracking**: Simple UI for monitoring student fee payments and alerting when dues are outstanding.
- **📅 Schedule & Teachers**: Manage class timetables and view teacher statistics.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (v4)
- **Icons & Charts**: Lucide React, Recharts
- **Scanning**: HTML5-QRCode
- **Real-time**: Socket.IO Client

### Backend
- **Framework**: Node.js + Express
- **Database & Auth**: Firebase Admin SDK (Firestore & Firebase Auth)
- **Real-time**: Socket.IO Server
- **Utilities**: Date-fns, QRCode generator

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- A [Firebase](https://firebase.google.com/) Project with Firestore and Authentication enabled

### 1. Clone the repository
```bash
git clone https://github.com/YourUsername/your-repo-name.git
cd your-repo-name
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add your Firebase credentials:
   - Generate a private key from your Firebase Project Settings -> Service Accounts.
   - Save the file as `firebase-serviceAccount.json` in the `backend/` directory.
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your Firebase Config:
   - Update your `frontend/src/config/firebase.js` with your Firebase web configuration.
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The app will typically run on `http://localhost:5173`.*

---

## 📱 How the Mobile Scanner Works
1. Navigate to the **Fast Scan** page on the desktop app.
2. Click **Link Mobile Scanner** to generate a session QR Code.
3. Scan the code using your mobile phone's standard camera app.
4. Grant camera permissions on the mobile page.
5. Scan student ID cards! The results are sent in real-time over WebSockets to your desktop session.

---

## 📄 License
This project is for educational and administrative purposes.
