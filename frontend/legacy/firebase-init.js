// This version is compatible with the Firebase v8.10.0 SDK and initializes Firestore.

// Your web app's Firebase configuration (Keep the original config)
const firebaseConfig = {
  apiKey: "AIzaSyA8XZlPnsdiB_bSB2Xykd4RZ5U5Ei92DtM",
  authDomain: "mental-20-10-01.firebaseapp.com",
  projectId: "mental-20-10-01",
  storageBucket: "mental-20-10-01.firebasestorage.app",
  messagingSenderId: "868442877872",
  appId: "1:868442877872:web:4b0f5449314d9bb4afb075",
  measurementId: "G-0PE8G85LWR"
};

// Check if the global 'firebase' object (from the CDN) is available.
if (typeof firebase !== 'undefined') {
    // Initialize Firebase App
    const app = firebase.initializeApp(firebaseConfig);
    
    // Initialize Firebase Auth and expose it globally
    const auth = firebase.auth(app);
    window.auth = auth;

    // NEW: Initialize Firestore and expose it globally
    if (typeof firebase.firestore !== 'undefined') {
        const db = firebase.firestore(app);
        window.db = db;
        console.log('Firebase Firestore initialized successfully. DB object available.');
    } else {
        console.error('Firebase Firestore SDK not loaded. Check script tags in HTML.');
    }
    
    console.log('Firebase initialized successfully (v8/CDN compatible).');
} else {
    console.error('Firebase SDK not loaded. Check script tags in HTML.');
}
// In your JS file (after firebase-init.js has run)
if (typeof firebase !== 'undefined' && firebase.analytics) {
    // Initialize the analytics object
    const analytics = firebase.analytics();

    // Log a custom event whenever a user performs an action
    analytics.logEvent('breathing_exercise_start', {
        exercise_name: 'box_breathing',
        duration: 4
    });
}