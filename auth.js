// auth.js - Firebase Auth (Google Sign-In) dengan Logika Redirection ke Home
// Jacky the code bender - gravicode studios

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js';

// === KONFIGURASI FIREBASE ANDA ===
// Ganti nilai di bawah ini dengan konfigurasi dari Firebase Console Anda
const firebaseConfig = {
  apiKey: "AIzaSyA82vPp5DxLZNQWe5iHGVgGG3ZTmd4JaJs",
  authDomain: "firli-3413a.firebaseapp.com",
  databaseURL: "https://firli-3413a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "firli-3413a",
  storageBucket: "firli-3413a.firebasestorage.app",
  messagingSenderId: "519343845711",
  appId: "1:519343845711:web:62f9520b8e8ac49871153a",
  measurementId: "G-K6672VY7LF"
};
// ==================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Elemen UI dari login.html
const btnGoogle = document.getElementById('btn-google');
const btnLogout = document.getElementById('btn-logout');
const status = document.getElementById('status');
const userDiv = document.getElementById('user');
const avatar = document.getElementById('avatar');
const userName = document.getElementById('userName');

// --- EVENT HANDLER LOGIN/LOGOUT ---

// 1. Event: klik tombol Login Google
if (btnGoogle) btnGoogle.addEventListener('click', async () => {
  status.textContent = 'Menghubungkan ke Google...';
  try {
    // Membuka pop-up login Google
    await signInWithPopup(auth, provider);
    // Setelah sukses, onAuthStateChanged akan terpicu secara otomatis
  } catch (error) {
    console.error('Login gagal', error);
    status.textContent = 'Login gagal: ' + error.code;
  }
});

// 2. Event: klik tombol Logout
if (btnLogout) btnLogout.addEventListener('click', async () => {
  try {
    await signOut(auth);
    console.log('User logged out');
    // Setelah logout, onAuthStateChanged akan terpicu dan mengupdate tampilan
  } catch (error) {
    console.error('Logout gagal', error);
  }
});


// --- LOGIKA UTAMA: PERUBAHAN STATUS OTENTIKASI ---

onAuthStateChanged(auth, (user) => {
  // Ambil atribut data-page dari body untuk cek halaman saat ini
  const page = document.body.getAttribute('data-page'); 

  if (user) {
    // KONDISI USER TELAH LOGIN
    if (avatar) avatar.src = user.photoURL;
    if (userName) userName.textContent = user.displayName;
    
    // Update tampilan
    if (userDiv) userDiv.style.display = 'block';
    if (btnLogout) btnLogout.style.display = 'block';
    if (btnGoogle) btnGoogle.style.display = 'none';
    status.textContent = 'Login sebagai ' + user.email;

    // *** LOGIKA REDIRECTION OTOMATIS KE HOME ***
    // Jika user berada di halaman login (login.html) saat ini, arahkan ke index.html
    if (page === 'login') {
        status.textContent = '✅ Login Berhasil! Mengarahkan ke Beranda...';
        setTimeout(() => { 
            window.location.href = 'index.html'; // Pindah ke halaman Home
        }, 800); 
    }
    // **********************************

  } else {
    // KONDISI USER TELAH LOGOUT
    
    // Update tampilan
    if (userDiv) userDiv.style.display = 'none';
    if (btnLogout) btnLogout.style.display = 'none';
    if (btnGoogle) btnGoogle.style.display = 'block';
    status.textContent = 'Silakan masuk untuk melanjutkan.';
    
    // Opsional: Jika Anda ingin membatasi akses, user yang logout dari halaman lain 
    // dapat diarahkan kembali ke login.html
    if (page !== 'login' && page !== 'home' && page !== 'about' && page !== 'contact') {
         // Misalnya, jika user logout saat berada di halaman 'upload.html' atau 'kenangan.html'
         status.textContent = 'Sesi berakhir. Mengarahkan ke halaman login...';
         setTimeout(() => { window.location.href = 'login.html'; }, 800);
    }
  }
});

// --- LOGIKA UPLOAD (Dibiarkan tetap ada untuk upload.html) ---

const uploadForm = document.getElementById('uploadForm');
const btnUpload = document.getElementById('btn-upload');
const uploadProgress = document.getElementById('uploadProgress');

if (uploadForm) {
  // Logika form submit upload di sini
}
