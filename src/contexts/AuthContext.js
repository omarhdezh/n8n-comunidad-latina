// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  FacebookAuthProvider,
  GoogleAuthProvider,  // Añadir este import
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password, displayName) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Actualizar el perfil con el nombre
        await updateProfile(userCredential.user, { displayName });
        
        // Crear documento de usuario en Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          displayName,
          email,
          createdAt: new Date(),
          role: 'user'
        });
        
        return userCredential;
      });
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function loginWithFacebook() {
    const provider = new FacebookAuthProvider();
    return signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        
        // Verificar si el usuario ya existe en Firestore
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // Crear documento de usuario en Firestore si es nuevo
          await setDoc(userRef, {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date(),
            role: 'user'
          });
        }
        
        return result;
      });
  }

  function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        
        // Verificar si el usuario ya existe en Firestore
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // Crear documento de usuario en Firestore si es nuevo
          await setDoc(userRef, {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date(),
            role: 'user'
          });
        }
        
        return result;
      });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Obtener datos adicionales del usuario desde Firestore
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setCurrentUser({
            ...user,
            ...userDoc.data()
          });
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    loginWithFacebook,
    loginWithGoogle,  // Añadir esta línea
    isAdmin: currentUser?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
