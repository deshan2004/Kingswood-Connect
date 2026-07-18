import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch custom user data/role from backend
          const res = await axios.get(`${import.meta.env.VITE_API_URL || '/api'}/auth/me/${firebaseUser.uid}`);
          setUser({ ...firebaseUser, ...res.data });
        } catch (error) {
          console.error("Failed to fetch user role from API:", error);
          
          try {
            // Fallback 1: Try fetching directly from Firestore if backend is down
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            
            if (userDoc.exists()) {
              setUser({ ...firebaseUser, ...userDoc.data() });
              setLoading(false);
              return;
            }
          } catch (fsError) {
            console.error("Failed to fetch directly from Firestore", fsError);
          }

          try {
            // Fallback 2: Token claims or email-based fallback
            const idTokenResult = await firebaseUser.getIdTokenResult();
            let role = idTokenResult.claims.role;
            if (!role) {
              // If manually created in Firebase console without claims, guess from email
              const email = firebaseUser.email ? firebaseUser.email.toLowerCase() : '';
              if (email.includes('admin') || email === 'deshandhakshitha16@gmail.com') {
                role = 'admin';
              } else {
                role = 'student';
              }
            }
            setUser({ ...firebaseUser, role });
          } catch (e) {
            setUser({ ...firebaseUser, role: 'student' });
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
