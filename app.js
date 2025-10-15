// Hertanto.web - app.js
// Dibuat oleh jacky the code bender - Gravicode Studios

// Inisialisasi hero background dan thumbnails sample
const hero = document.querySelector('.hero');
const heroInner = document.getElementById('heroInner');
const sideThumbs = document.getElementById('sideThumbs');

// Contoh item gallery default (jika pengguna belum upload apa-apa)
const defaultItems = [
  {type:'image',src:'https://images.unsplash.com/photo-1505691723518-36a57efb222d?auto=format&fit=crop&w=1650&q=80',title:'Living Room'},
  {type:'image',src:'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=800&q=60',title:'Cozy Corner'},
  {type:'image',src:'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=900&q=60',title:'Family Dinner'},
]

// Load background image lazily
function setHeroBg(url){
  if(!hero) return;
  const img = new Image();
  img.onload = ()=>{
    hero.style.backgroundImage = `url(${url})`;
    hero.style.backgroundSize = 'cover';
    hero.style.backgroundPosition = 'center';
  }
  img.src = url;
}

setHeroBg(hero?.dataset?.bg);

// Render thumbnails
function renderThumbs(items){
  if(!sideThumbs) return;
  sideThumbs.innerHTML = '';
  items.slice(0,5).forEach((it,idx)=>{
    const d = document.createElement('div');
    d.className = 'thumb thumb-animate';
    d.style.backgroundImage = `url(${it.src})`;
    d.style.backgroundSize = 'cover';
    d.style.backgroundPosition = 'center';
    d.title = it.title || ('Item ' + (idx+1));
    d.addEventListener('click', ()=>{
      // ganti hero background ketika diklik
      setHeroBg(it.src);
    });
    sideThumbs.appendChild(d);
  })
}

// Gallery rendering (works on pages with #galleryGrid)
const galleryGrid = document.getElementById('galleryGrid');

// Helper: create card element
function createCard(it, idx){
  const card = document.createElement('div');
  card.className = 'card';

  const mediaWrap = document.createElement('div');
  mediaWrap.className = 'card-media';

  if(it.type === 'video'){
    const vid = document.createElement('video');
    vid.src = it.src;
    vid.controls = true;
    vid.preload = 'metadata';
    vid.setAttribute('playsinline','');
    mediaWrap.appendChild(vid);
  }else{
    const img = document.createElement('img');
    img.src = it.src;
    img.alt = it.title || ('Image ' + (idx+1));
    // add event to open viewer
    img.style.cursor = 'zoom-in';
    img.addEventListener('click',(e)=>openViewer(e.currentTarget, it));
    mediaWrap.appendChild(img);
  }
  card.appendChild(mediaWrap);

  const meta = document.createElement('div');
  meta.className = 'meta';
  const p = document.createElement('p');
  p.textContent = it.title || new Date(it.created||Date.now()).toLocaleString();
  meta.appendChild(p);
  card.appendChild(meta);

  return card;
}

function loadGallery(){
  const saved = localStorage.getItem('hertanto_gallery');
  let items = saved ? JSON.parse(saved) : defaultItems;
  if(galleryGrid) galleryGrid.innerHTML = '';
  items.forEach((it,idx)=>{
    const card = createCard(it, idx);
    galleryGrid?.appendChild(card);
  })
  // Also fill thumbs from gallery
  renderThumbs(items);
}

loadGallery();

// Viewer (floating image when clicked) implementation
let viewerOverlay = null;
let viewerClone = null;
let viewerCaption = null;
let viewerCloseBtn = null;

function openViewer(imgEl, item){
  // create overlay
  if(!viewerOverlay){
    viewerOverlay = document.createElement('div');
    viewerOverlay.className = 'viewer-overlay';
    document.body.appendChild(viewerOverlay);
  }
  viewerOverlay.classList.add('open');

  // compute original position and size
  const rect = imgEl.getBoundingClientRect();
  const clone = imgEl.cloneNode(true);
  clone.style.width = rect.width + 'px';
  clone.style.height = rect.height + 'px';
  clone.style.objectFit = 'contain';
  clone.className = 'viewer-clone';
  clone.style.top = rect.top + 'px';
  clone.style.left = rect.left + 'px';
  clone.style.position = 'fixed';
  clone.style.transform = 'translateZ(0)';

  // append to body
  document.body.appendChild(clone);
  viewerClone = clone;

  // force reflow and then animate to center and larger
  requestAnimationFrame(()=>{
    const vw = Math.min(window.innerWidth * 0.92, 1100);
    const vh = Math.min(window.innerHeight * 0.82, 820);
    const finalW = vw;
    const finalH = 'auto';
    const top = (window.innerHeight - vh) / 2;
    const left = (window.innerWidth - vw) / 2;

    clone.style.width = finalW + 'px';
    clone.style.height = 'auto';
    clone.style.top = top + 'px';
    clone.style.left = left + 'px';
  });

  // caption
  viewerCaption = document.createElement('div');
  viewerCaption.className = 'viewer-caption';
  viewerCaption.textContent = item.title || '';
  document.body.appendChild(viewerCaption);

  // close
  viewerCloseBtn = document.createElement('button');
  viewerCloseBtn.className = 'viewer-close';
  viewerCloseBtn.innerHTML = '✕';
  viewerCloseBtn.addEventListener('click', closeViewer);
  document.body.appendChild(viewerCloseBtn);

  // close when overlay clicked
  viewerOverlay.addEventListener('click', closeViewer);
}

function closeViewer(){
  if(!viewerClone) return;
  // animate back: compute original thumbnail if present
  const clonesrc = viewerClone.src;
  // try to find an element with same src to compute destination
  const orig = document.querySelectorAll('.card-media img');
  let targetRect = null;
  for(const el of orig){ if(el.src === clonesrc){ targetRect = el.getBoundingClientRect(); break } }

  if(targetRect){
    viewerClone.style.width = targetRect.width + 'px';
    viewerClone.style.height = targetRect.height + 'px';
    viewerClone.style.top = targetRect.top + 'px';
    viewerClone.style.left = targetRect.left + 'px';
  } else {
    // shrink to center
    viewerClone.style.transform = 'scale(.92)';
    viewerClone.style.opacity = '0';
  }

  // remove overlay and other elements after animation
  setTimeout(()=>{
    viewerOverlay.classList.remove('open');
    viewerClone?.remove(); viewerClone = null;
    viewerCaption?.remove(); viewerCaption = null;
    viewerCloseBtn?.remove(); viewerCloseBtn = null;
  },380);
}

// Appointment modal logic (keep existing)
const modal = document.getElementById('modalAppointment');
const openBtn = document.getElementById('openAppointment');
const closeBtn = document.getElementById('closeAppointment');
if(openBtn) openBtn.addEventListener('click', ()=>{modal.setAttribute('aria-hidden','false')});
if(closeBtn) closeBtn.addEventListener('click', ()=>{modal.setAttribute('aria-hidden','true')});

const apForm = document.getElementById('appointmentForm');
const apResult = document.getElementById('apResult');
if(apForm){
  apForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    apResult.textContent = 'Terima kasih! Janji (simulasi) berhasil dikirim.';
    apForm.reset();
    setTimeout(()=>{modal.setAttribute('aria-hidden','true');apResult.textContent=''},2200);
  })
}

// Simple message to prompt user to upload
const heroTitle = document.querySelector('.hero-title');
if(heroTitle){
  heroTitle.addEventListener('touchstart',()=>{
    heroTitle.style.transform='scale(1.02)';
    setTimeout(()=>heroTitle.style.transform='',180);
  });
}

// Expose function for upload page to add items
window.Hertanto = {
  addItem(item){
    const saved = localStorage.getItem('hertanto_gallery');
    let items = saved ? JSON.parse(saved) : defaultItems.slice();
    items.unshift(item);
    localStorage.setItem('hertanto_gallery', JSON.stringify(items));
    loadGallery();
    return true;
  }
}

// Touch animation for thumbs
sideThumbs?.addEventListener('touchstart', (e)=>{
  const t = e.target.closest('.thumb-animate');
  if(t){t.style.transform='scale(.96) rotate(-2deg)'}
})
sideThumbs?.addEventListener('touchend', (e)=>{
  const t = e.target.closest('.thumb-animate');
  if(t){t.style.transform=''}
})


// ---------------------------
// NAVIGATION CLICK ANIMATION (baru)
// - Membuat efek ripple / circular expansion dari titik klik
// - Menghormati prefers-reduced-motion (jika diaktifkan, navigasi langsung tanpa animasi)
// - Tidak mengganggu link eksternal, anchor (#) atau target="_blank"
// ---------------------------
(function setupNavTransition(){
  const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // jika user meminta reduced motion, jangan tampilkan animasi
  if(prefersReduce) return;

  // buat overlay hanya sekali
  let overlay = document.querySelector('.page-transition-overlay');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.innerHTML = '<div class="pt-layer"></div>';
    document.body.appendChild(overlay);
  }
  const layer = overlay.querySelector('.pt-layer');

  function triggerTransition(x, y){
    overlay.style.setProperty('--x', x + 'px');
    overlay.style.setProperty('--y', y + 'px');
    overlay.classList.add('active');
    // pastikan overlay tidak permanen
    setTimeout(()=>{ overlay.classList.remove('active'); }, 900);
  }

  const navLinks = document.querySelectorAll('.nav a');
  navLinks.forEach(a=>{
    a.addEventListener('click', function(e){
      const href = a.getAttribute('href');
      const target = a.getAttribute('target');
      const isExternal = href && (href.startsWith('http') && !href.includes(location.host));

      // skip animation untuk eksternal, anchor, atau target blank
      if(!href || href.startsWith('#') || target === '_blank' || isExternal) return;

      e.preventDefault();

      // ambil posisi klik (fallback ke pusat elemen jika keyboard)
      let x = e.clientX;
      let y = e.clientY;
      if(typeof x !== 'number' || isNaN(x) || x === 0){
        const r = a.getBoundingClientRect();
        x = r.left + r.width/2;
        y = r.top + r.height/2;
      }

      triggerTransition(x, y);

      // delay navigasi agar animasi terasa (sinkron dengan CSS .6s)
      setTimeout(()=>{
        // gunakan location.assign agar behavior mirip klik normal
        window.location.assign(href);
      }, 620);
    });

    // instant press feedback
    a.addEventListener('pointerdown', function(){
      a.style.transform = 'translateY(1px) scale(.997)';
      setTimeout(()=>{ a.style.transform = ''; }, 140);
    });
  });
})();

console.log('Hertanto web loaded');
