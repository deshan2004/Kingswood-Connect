import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, updatePassword, reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Use onSnapshot to instantly react to changes in Firestore (like changing role to 'admin')
        unsubscribeSnapshot = onSnapshot(doc(db, 'users', firebaseUser.uid), 
          async (docSnap) => {
            if (docSnap.exists()) {
               let userData = docSnap.data();
               
               // Fetch additional student details if role is student
               if (userData.role === 'student' && userData.studentId) {
                 try {
                   const studentDoc = await getDoc(doc(db, 'students', userData.studentId));
                   if (studentDoc.exists()) {
                     userData = { ...userData, ...studentDoc.data() };
                   }
                 } catch (err) {
                   console.error("Failed to fetch student details", err);
                 }
               }
               
               setUser({ ...firebaseUser, ...userData });
            } else {
               // Fallback if user document does not exist yet
               const email = firebaseUser.email ? firebaseUser.email.toLowerCase() : '';
               const fallbackRole = (email.includes('admin') || email === 'deshandhakshitha16@gmail.com') ? 'admin' : 'student';
               setUser({ ...firebaseUser, role: fallbackRole });
            }
            setLoading(false);
          },
          (error) => {
             console.error("Error listening to user document:", error);
             const email = firebaseUser.email ? firebaseUser.email.toLowerCase() : '';
             const fallbackRole = (email.includes('admin') || email === 'deshandhakshitha16@gmail.com') ? 'admin' : 'student';
             setUser({ ...firebaseUser, role: fallbackRole });
             setLoading(false);
          }
        );
      } else {
        setUser(null);
        setLoading(false);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!auth.currentUser) throw new Error("No user logged in");
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  };

  const resetPassword = async (identifier) => {
    let email = identifier.trim().toLowerCase();
    if (email.startsWith('kws-') && !email.includes('@')) {
      email = `${email}@kingswood.edu`;
    }
    return sendPasswordResetEmail(auth, email);
  };

  const checkVerificationStatus = async () => {
    if (!auth.currentUser) return false;
    try {
      await auth.currentUser.reload();
      const isVerified = auth.currentUser.emailVerified;
      
      if (isVerified) {
        // Sync to Firestore
        try {
          await axios.put(`${API_URL}/student/email-verified`, {
            uid: auth.currentUser.uid,
            studentId: user?.studentId
          });
        } catch (err) {
          console.warn("Failed to sync email-verified to firestore", err);
        }

        setUser(prev => prev ? { ...prev, emailVerified: true } : null);
      }
      return isVerified;
    } catch (err) {
      console.error("Failed to check verification status", err);
      return false;
    }
  };

  const sendVerification = async () => {
    if (!auth.currentUser) throw new Error("No user logged in");
    try {
      await auth.currentUser.reload();
    } catch (e) {
      console.warn("User reload before verification note:", e);
    }
    return sendEmailVerification(auth.currentUser);
  };

  const updateStudentEmail = async (newEmail) => {
    if (!auth.currentUser) throw new Error("No user logged in");
    const uid = auth.currentUser.uid;
    const studentId = user?.studentId;

    const formattedEmail = newEmail.trim().toLowerCase();

    // 1. Call API to update Firebase Auth + Firestore
    const res = await axios.put(`${API_URL}/student/email`, {
      uid,
      studentId,
      newEmail: formattedEmail
    });

    // 2. Reload user locally so client SDK updates cached email before sending link
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        await sendEmailVerification(auth.currentUser);
      }
    } catch (err) {
      console.warn("Verification email trigger note:", err);
    }

    // 3. Update local state
    setUser(prev => prev ? { ...prev, email: formattedEmail, emailVerified: false } : null);

    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, changePassword, resetPassword, sendVerification, checkVerificationStatus, updateStudentEmail, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
