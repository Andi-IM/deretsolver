// Import the functions you need from the SDKs you need
// Lazy initialization to avoid blocking critical render path

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBmfQUl0LgFk5pQl95Yos3-hQyygPdReIc',
  authDomain: 'deretsolver.firebaseapp.com',
  projectId: 'deretsolver',
  storageBucket: 'deretsolver.firebasestorage.app',
  messagingSenderId: '214283161090',
  appId: '1:214283161090:web:6608e6f243200bb054a11b',
  measurementId: 'G-G93KT3SBQP',
};

// Lazy singleton instances
let app = null;
let analytics = null;
let db = null;
let initPromise = null;

/**
 * Lazily initialize Firebase (loads in background)
 * @returns {Promise<{app, analytics, db}>}
 */
export function initializeFirebase() {
  if (initPromise) return initPromise;

  initPromise = Promise.all([
    import('firebase/app'),
    import('firebase/analytics'),
    import('firebase/firestore'),
  ])
    .then(([{ initializeApp }, { getAnalytics }, { getFirestore }]) => {
      app = initializeApp(firebaseConfig);
      analytics = getAnalytics(app);
      db = getFirestore(app);
      return { app, analytics, db };
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize Firebase:', error);
      throw error;
    });

  return initPromise;
}

/**
 * Get Firebase app instance (may be null if not initialized)
 */
export function getFirebaseApp() {
  return app;
}

/**
 * Get Firebase Analytics instance (may be null if not initialized)
 */
export function getFirebaseAnalytics() {
  return analytics;
}

/**
 * Get Firestore instance (may be null if not initialized)
 */
export function getFirebaseDB() {
  return db;
}
