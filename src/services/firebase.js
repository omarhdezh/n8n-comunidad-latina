// src/services/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  enableIndexedDbPersistence, 
  CACHE_SIZE_UNLIMITED 
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Inicializar Firestore con configuración personalizada
const firestore = initializeFirestore(firebaseApp, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
});

// Activar persistencia offline
const enableOfflinePersistence = async () => {
  try {
    await enableIndexedDbPersistence(firestore, { synchronizeTabs: true });
    console.debug("Firestore offline persistence enabled.");
  } catch (error) {
    switch (error.code) {
      case "failed-precondition":
        console.warn("Firestore persistence already enabled in another tab.");
        break;
      case "unimplemented":
        console.warn("Offline persistence is not supported by this browser.");
        break;
      default:
        console.error("Error enabling persistence:", error);
    }
  }
};

enableOfflinePersistence().catch(console.error);

// Exportar servicios de Firebase
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);
export const db = firestore;
export default firebaseApp;
