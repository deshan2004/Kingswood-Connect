import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

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

  const logout = async () => {
    await signOut(auth);
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (!auth.currentUser) throw new Error("No user logged in");
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
