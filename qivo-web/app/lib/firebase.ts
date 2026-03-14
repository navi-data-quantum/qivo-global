import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAitpbOpNYynXMdvRwK-ujx3JQ6BUJ-fps",
  authDomain: "qivo-web.firebaseapp.com",
  projectId: "qivo-web",
  storageBucket: "qivo-web.firebasestorage.app",
  messagingSenderId: "1065998267995",
  appId: "1:1065998267995:web:53e9561de341334f65f17e",
  measurementId: "G-GS9CC4KJ76"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });

if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics }) => {
    getAnalytics(app);
  });
}

export default app;