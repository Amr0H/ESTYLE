// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDFGs2yixs_eoPskQFvttY5TobkjLtd0-I",
    authDomain: "estyle-21023.firebaseapp.com",
    projectId: "estyle-21023",
    storageBucket: "estyle-21023.firebasestorage.app",
    messagingSenderId: "312833645345",
    appId: "1:312833645345:web:375c5bd7dcd64443d43c60",
    measurementId: "G-QQCWQ29ZHG"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
// Auth State Listener (runs on every page)
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is logged in
    document.getElementById("login-link").textContent = "My Account";
    document.getElementById("login-link").href = "account.html";
  } else {
    // User is logged out
    document.getElementById("login-link").textContent = "Login";
    document.getElementById("login-link").href = "login.html";
  }
});
