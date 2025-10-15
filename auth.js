// auth.js - Integrasi Penuh dengan Firebase Auth dan Logika Upload
// Catatan: Ganti placeholder konfigurasi di bawah dengan kredensial Firebase Anda.

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

// Elemen UI dari upload.html
const btnGoogle = document.getElementById('btn-google');
const btnLogout = document.getElementById('btn-logout');
const status = document.getElementById('status');
const userDiv = document.getElementById('user');
const avatar = document.getElementById('avatar');
const userName = document.getElementById('userName');

// Elemen UI Form Upload
const uploadForm = document.getElementById('uploadForm');
const btnUpload = document.getElementById('btn-upload');
const uploadProgress = document.getElementById('uploadProgress');


// --- 1. EVENT HANDLER LOGIN/LOGOUT ---

// Event: klik tombol Login Google
if (btnGoogle) btnGoogle.addEventListener('click', async () => {
  status.textContent = 'Menghubungkan ke Google...';
  try {
    // Membuka pop-up login Google
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error('Login gagal', error);
    status.textContent = 'Login gagal. Coba lagi.';
  }
});

// Event: klik tombol Logout
if (btnLogout) btnLogout.addEventListener('click', async () => {
  try {
    await signOut(auth);
    console.log('User logged out');
  } catch (error) {
    console.error('Logout gagal', error);
  }
});


// --- 2. LOGIKA UPLOAD DENGAN DATA TAMBAHAN ---

if (uploadForm) {
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Pastikan user sudah login
    const user = auth.currentUser;
    if (!user) {
      status.textContent = 'Anda harus login untuk mengunggah file.';
      return;
    }

    // Ambil data dari form
    const fileInput = document.getElementById('fileInput');
    const fileTitle = document.getElementById('fileTitle').value;
    const fileDescription = document.getElementById('fileDescription').value;
    const file = fileInput.files[0];
    
    if (!file) {
      status.textContent = 'Pilih file terlebih dahulu.';
      return;
    }
    
    // Mulai proses upload
    status.textContent = 'Mengirim file ke server...';
    btnUpload.disabled = true;
    uploadProgress.style.display = 'block';

    try {
      // Ambil token ID untuk otorisasi di sisi server (Backend Anda)
      const idToken = await user.getIdToken();

      const form = new FormData();
      form.append('file', file);
      // **MENAMBAHKAN DATA TAMBAHAN JUDUL DAN DESKRIPSI**
      form.append('title', fileTitle); 
      form.append('description', fileDescription); 
      form.append('uploaderEmail', user.email);
      // ***************************************

      // SIMULASI pengiriman ke server backend
      // Anda HARUS mengganti ini dengan endpoint server backend NYATA Anda
      // yang menangani upload dan penyimpanan file di Firebase Storage/Cloud Storage.
      const res = await fetch('/api/upload', { 
        method: 'POST', 
        headers: {
          // Mengirim token otorisasi
          'Authorization': `Bearer ${idToken}`
        },
        body: form 
      });

      if (!res.ok) throw new Error(`Upload gagal, Kode: ${res.status}`);
      
      // Simpan data ke localStorage untuk SIMULASI tampilan di kenangan.html
      const saved = JSON.parse(localStorage.getItem('hertanto_files') || '[]');
      saved.push({
        id: 'simulasi_id_' + Date.now(), // ID palsu untuk simulasi
        name: `${fileTitle} - (${file.name})`,
        mimeType: file.type,
        uploadedBy: user.displayName,
        description: fileDescription
      });
      localStorage.setItem('hertanto_files', JSON.stringify(saved));
      
      uploadProgress.textContent = 'Mengunggah: 100%';
      status.textContent = '✅ File sukses diunggah!';
      
      // Reset form setelah sukses
      uploadForm.reset();
      
      // Arahkan ke halaman kenangan setelah upload (opsional)
      setTimeout(() => { window.location.href = 'kenangan.html'; }, 1500);
      
    } catch (err) {
      console.error('Client upload error', err);
      status.textContent = '❌ Upload gagal: ' + err.message;
      btnUpload.disabled = false;
      uploadProgress.style.display = 'none';
    }
  });
}


// --- 3. PERUBAHAN STATUS OTENTIKASI (Mengontrol Tampilan) ---

onAuthStateChanged(auth, (user) => {
  const page = document.body.getAttribute('data-page'); 

  if (user) {
    // USER TELAH LOGIN
    if (avatar) avatar.src = user.photoURL;
    if (userName) userName.textContent = user.displayName;
    
    // Tampilkan informasi pengguna, sembunyikan tombol login
    if (userDiv) userDiv.style.display = 'block';
    if (btnLogout) btnLogout.style.display = 'inline-block';
    if (btnGoogle) btnGoogle.style.display = 'none';
    
    status.textContent = 'Login sebagai ' + user.email;
    
    // Aktifkan tombol Upload (hanya jika di halaman upload.html)
    if (page === 'upload' && btnUpload) {
      btnUpload.disabled = false;
    }


  } else {
    // USER TELAH LOGOUT
    
    // Tampilkan tombol login, sembunyikan info pengguna
    if (userDiv) userDiv.style.display = 'none';
    if (btnLogout) btnLogout.style.display = 'none';
    if (btnGoogle) btnGoogle.style.display = 'inline-block';
    
    status.textContent = 'Anda belum login.';
    
    // Nonaktifkan tombol Upload
    if (btnUpload) {
      btnUpload.disabled = true;
    }
    
    // Redirection opsional: Jika user tidak di halaman index/about/contact, arahkan ke login.
    if (page !== 'index' && page !== 'about' && page !== 'contact') {
         status.textContent = 'Akses ditolak. Silakan login.';
         setTimeout(() => { 
            window.location.href = 'login.html'; 
         }, 1000);
    }
  }
});

