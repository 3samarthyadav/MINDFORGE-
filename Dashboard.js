// Make sure this <script type="module"> is used in dashboard.html
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Check auth state immediately
onAuthStateChanged(auth, user => {
  if (!user) {
    // If not signed in, redirect to login
    window.location.href = 'inndex.html';
  } else {
    // Populate user info
    document.getElementById('user-name').innerText = user.displayName || "User";
    document.getElementById('user-email').innerText = user.email;
    if(user.photoURL) document.getElementById('profile-pic').src = user.photoURL;
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  signOut(auth).then(() => window.location.href = 'inndex.html');
});
