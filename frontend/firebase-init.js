// Initialize Firebase using the project's CDN SDK configuration.
const firebaseConfig = {
  apiKey: "AIzaSyA8XZlPnsdiB_bSB2Xykd4RZ5U5Ei92DtM",
  authDomain: "mental-20-10-01.firebaseapp.com",
  projectId: "mental-20-10-01",
  storageBucket: "mental-20-10-01.firebasestorage.app",
  messagingSenderId: "868442877872",
  appId: "1:868442877872:web:4b0f5449314d9bb4afb075",
  measurementId: "G-0PE8G85LWR"
};

if (typeof firebase !== "undefined") {
  const app = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth(app);
  window.auth = auth;

  if (typeof firebase.firestore !== "undefined") {
    window.db = firebase.firestore(app);
  }

  if (typeof firebase.analytics !== "undefined") {
    firebase.analytics();
  }
} else {
  console.error("Firebase SDK not loaded. Check the Firebase script tags in the HTML.");
}
