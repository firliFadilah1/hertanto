// auth.js - Hanya Logika Auth dan Eksport Objek Auth
// PENTING: Ganti placeholder konfigurasi Firebase Anda.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js';

// === KONFIGURASI FIREBASE ANDA ===
const firebaseConfig = {
  apiKey: "REPLACE_API_KEY_ANDA",
  authDomain: "REPLACE_AUTH_DOMAIN_ANDA",
  projectId: "REPLACE_PROJECT_ID_ANDA",
  appId: "REPLACE_APP_ID_ANDA"
};
// ==================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Elemen UI login/logout dari upload.html atau login.html
const btnGoogle = document.getElementById('btn-google');
const btnLogout = document.getElementById('btn-logout');
const status = document.getElementById('status');
const userDiv = document.getElementById('user');
const avatar = document.getElementById('avatar');
const userName = document.getElementById('userName');

// --- EVENT HANDLER LOGIN/LOGOUT ---
if (btnGoogle) btnGoogle.addEventListener('click', async () => {
  if(status) status.textContent = 'Menghubungkan ke Google...';
  try { await signInWithPopup(auth, provider); } 
  catch (error) { if(status) status.textContent = 'Login gagal: ' + error.code; }
});

if (btnLogout) btnLogout.addEventListener('click', async () => {
  try { await signOut(auth); } 
  catch (error) { console.error('Logout gagal', error); }
});

// --- STATE CHANGE HANDLER (Mengontrol Tampilan Login Status & Redirection) ---
onAuthStateChanged(auth, (user) => {
  const page = document.body.getAttribute('data-page'); 

  if (user) {
    // USER TELAH LOGIN: Update UI
    if (avatar) avatar.src = user.photoURL;
    if (userName) userName.textContent = user.displayName;
    if (userDiv) userDiv.style.display = 'block';
    if (btnLogout) btnLogout.style.display = 'inline-block';
    if (btnGoogle) btnGoogle.style.display = 'none';
    if (status) status.textContent = 'Login sebagai ' + user.email;

    // Redirection dari login.html ke index.html
    if (page === 'login') {
        if(status) status.textContent = '✅ Login Berhasil! Mengarahkan ke Beranda...';
        setTimeout(() => { window.location.href = 'index.html'; }, 800); 
    }

  } else {
    // USER TELAH LOGOUT: Update UI
    if (userDiv) userDiv.style.display = 'none';
    if (btnLogout) btnLogout.style.display = 'none';
    if (btnGoogle) btnGoogle.style.display = 'inline-block';
    if (status) status.textContent = 'Silakan login.';
    
    // Redirection dari halaman terproteksi ke login.html
    if (page === 'upload' || page === 'kenangan') {
         if(status) status.textContent = 'Akses ditolak. Silakan login.';
         setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    }
  }
});

// EKS-PORT objek Auth untuk digunakan oleh app.js
export { auth };

