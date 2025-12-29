// Firebase Service with Dependency Injection for Testability
// ============================================================

// Your web app's Firebase configuration
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
 * Firebase SDK loader abstraction for dependency injection.
 * This allows tests to inject mock SDK modules.
 */
export const defaultFirebaseLoader = {
  loadApp: () => import('firebase/app'),
  loadAnalytics: () => import('firebase/analytics'),
  loadFirestore: () => import('firebase/firestore'),
};

/**
 * Lazily initialize Firebase (loads in background)
 * @param {Object} options - Optional configuration for testing
 * @param {Object} options.loader - Custom SDK loader (for testing)
 * @param {Object} options.config - Custom Firebase config (for testing)
 * @returns {Promise<{app, analytics, db}>}
 */
export function initializeFirebase(options = {}) {
  const { loader = defaultFirebaseLoader, config = firebaseConfig } = options;

  // If already initializing/initialized, return existing promise
  if (initPromise && !options.forceReinit) return initPromise;

  initPromise = Promise.all([loader.loadApp(), loader.loadAnalytics(), loader.loadFirestore()])
    .then(([appModule, analyticsModule, firestoreModule]) => {
      const { initializeApp } = appModule;
      const { getAnalytics } = analyticsModule;
      const { getFirestore } = firestoreModule;

      app = initializeApp(config);
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
 * Reset Firebase state - for testing only
 */
export function resetFirebaseState() {
  app = null;
  analytics = null;
  db = null;
  initPromise = null;
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
