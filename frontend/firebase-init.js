// Firebase configuration is supplied by the backend at runtime from environment variables.
const firebaseConfig = window.firebaseConfig;

if (!firebaseConfig) {
  console.error("Firebase configuration was not loaded from the backend.");
} else if (typeof firebase !== "undefined") {
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
