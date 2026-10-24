/**
 * Khmer E-Invitation Builder & Live Preview Logic
 * Version 2.0: Typography Studio, 3D Pop Shadows, Clean Links & Strict Guest Mode
 */

// Khmer numeral character map
const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

function toKhmerDigits(num) {
  return String(num).replace(/[0-9]/g, digit => KHMER_DIGITS[parseInt(digit, 10)]);
}

// Initial Default State
const defaultState = {
  // Wedding details
  eventTitle: 'សិរីមង្គលអាពាហ៍ពិពាហ៍',
  groomKhmer: 'យឺន រតនា',
  groomLatin: 'Yoeun Ratana',
  brideKhmer: 'ឌិន រចនា',
  brideLatin: 'Din Rachana',
  weddingDate: '2026-12-10',
  weddingTime: '17:00',
  dateFullKhmer: 'ថ្ងៃព្រហស្បតិ៍ ទី១០ ខែធ្នូ ឆ្នាំ២០២៦ វេលាម៉ោង ៥:០០ ល្ងាច',
  guestSalutation: 'សូមគោរពអញ្ជើញ',
  guestName: 'លោក សុខ រតនៈវិសាល និងភរិយា',
  inviteBody: 'យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ',
  venueName: 'ភោជនីយដ្ឋាន សេនរេប្រាយ យីង',
  locationUrl: 'https://maps.google.com/?q=Phnom+Penh+Wedding+Hall',
  phone1: '097 258 15 37',
  phone2: '011 867 506',
  phone3: '089 483 683',
  useKhmerNumerals: true,
  thankYouText: 'យើងខ្ញុំទាំងពីរ សូមថ្លែងអំណរគុណ យ៉ាងជ្រាលជ្រៅ ចំពោះវត្តមាន ដ៏ឧត្តុង្គឧត្តមរបស់ សម្តេច ឯកឧត្តម លោកជំទាវ លោកអ្នកឧកញ៉ា អ្នកឧកញ៉ា ឧកញ៉ា លោក លោកស្រី អ្នកនាង កញ្ញា ដែលបាន អញ្ជើញចូលរួមជាកិត្តិយស ក្នុងពិធីសិរីសួស្តីអាពាហ៍ពិពាហ៍ របស់យើងខ្ញុំ នាពេលខាងមុខនេះ។ យើងខ្ញុំសូមការខន្តីអភ័យទោស ដែលពុំបានជូនលិខិតអញ្ជើញ ដោយផ្ទាល់ ។ ដោយការកិច្ចដ៏ខ្ពង់ខ្ពស់ពីយើងខ្ញុំ។',

  // Typography, Colors & 3D Pop Shadows
  titleFont: 'Moul',
  titleColor: '#f7a627',
  titleShadow: 'shadow-3d-strong',
  titleSize: '26',
  coupleFont: 'Moul',
  coupleLatinFont: 'Great Vibes',
  coupleColor: '#f9b63a',
  coupleShadow: 'shadow-3d-strong',
  guestFont: 'Moul',
  guestColor: '#1a3250',

  // Images & Media (Fallback relative paths)
  envelopeImage: 'cover.jpg',     // រូបកូនកំលោះកូនក្រមុំក្នុងរង្វង់លើធៀប
  entranceBg: 'bg.jpg',           // រូបភាពផ្ទៃខាងក្រោយ Background លើផ្ទាំងបើកធៀប
  gateVideo: 'Video.mp4',
  coverImage: 'cover.jpg',
  bgImage: 'bg.jpg',
  bgImage1: 'bg.jpg',
  bgImage2: 'bg.jpg',
  bgImage3: 'bg.jpg',
  bgImage4: 'bg.jpg',
  mapImage: 'map.svg',
  gallery1: 'gallery1.jpg',
  gallery2: 'gallery2.jpg',
  gallery3: 'gallery3.jpg',
  gallery4: 'gallery4.jpg'
};

// Current Active State
let appState = { ...defaultState };
let countdownInterval = null;
let audioContext = null;
let isAudioPlaying = false;
let customAudioEl = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  loadSavedStateOrUrlParams();
  bindFormInputs();
  bindImageUploads();
  bindTypographyControls();
  bindViewButtons();
  bindCalendarAction();
  bindAudio();
  startCountdownTimer();
  updateFullPreview();
});

/**
 * Load state: priority = URL params (?guest=...) > localStorage > config.js > defaults
 */
function loadSavedStateOrUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const guestParam = urlParams.get('guest') || urlParams.get('to');
  
  // 1. Merge baseline from window.WEDDING_CONFIG if available
  if (window.WEDDING_CONFIG) {
    const c = window.WEDDING_CONFIG;
    appState = {
      ...appState,
      eventTitle: c.eventTitle || appState.eventTitle,
      groomKhmer: c.groomKhmer || appState.groomKhmer,
      groomLatin: c.groomLatin || appState.groomLatin,
      brideKhmer: c.brideKhmer || appState.brideKhmer,
      brideLatin: c.brideLatin || appState.brideLatin,
      weddingDate: c.weddingDate || appState.weddingDate,
      weddingTime: c.weddingTime || appState.weddingTime,
      dateFullKhmer: c.dateFullKhmer || appState.dateFullKhmer,
      venueName: c.venueName || appState.venueName,
      locationUrl: c.locationUrl || appState.locationUrl,
      phone1: c.phone1 || appState.phone1,
      phone2: c.phone2 || appState.phone2,
      phone3: c.phone3 || appState.phone3,
      thankYouText: c.thankYouText || appState.thankYouText,
      ...(c.styles || {}),
      ...(c.images || {})
    };
  }

  // 2. Try loading local edits saved in browser localStorage
  const saved = localStorage.getItem('khmer_e_invitation_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      appState = { ...appState, ...parsed };
    } catch (e) {
      console.warn('Could not parse saved state:', e);
    }
  }

  // Always enforce Video.mp4 for royal wedding gate
  appState.gateVideo = 'Video.mp4';
  if (!appState.coverImage) appState.coverImage = window.WEDDING_CONFIG?.images?.coverImage || 'cover.jpg';
  if (!appState.envelopeImage) appState.envelopeImage = window.WEDDING_CONFIG?.images?.envelopeImage || appState.coverImage || 'cover.jpg';
  if (!appState.entranceBg) appState.entranceBg = window.WEDDING_CONFIG?.images?.entranceBg || appState.bgImage || 'bg.jpg';
  if (!appState.bgImage1) appState.bgImage1 = window.WEDDING_CONFIG?.images?.bgImage1 || 'bg.jpg';
  if (!appState.bgImage2) appState.bgImage2 = window.WEDDING_CONFIG?.images?.bgImage2 || 'bg.jpg';
  if (!appState.bgImage3) appState.bgImage3 = window.WEDDING_CONFIG?.images?.bgImage3 || 'bg.jpg';
  if (!appState.bgImage4) appState.bgImage4 = window.WEDDING_CONFIG?.images?.bgImage4 || 'bg.jpg';
  if (!appState.gallery1) appState.gallery1 = window.WEDDING_CONFIG?.images?.gallery1 || 'gallery1.jpg';
  if (!appState.gallery2) appState.gallery2 = window.WEDDING_CONFIG?.images?.gallery2 || 'gallery2.jpg';
  if (!appState.gallery3) appState.gallery3 = window.WEDDING_CONFIG?.images?.gallery3 || 'gallery3.jpg';
  if (!appState.gallery4) appState.gallery4 = window.WEDDING_CONFIG?.images?.gallery4 || 'gallery4.jpg';

  // 3. URL Query Parameters Override (Groom, Bride, Title, Date, Venue)
  const groomParam = urlParams.get('groom');
  const brideParam = urlParams.get('bride');
  const titleParam = urlParams.get('title');
  const dateParam = urlParams.get('date');
  const venueParam = urlParams.get('venue');

  if (groomParam) appState.groomKhmer = decodeURIComponent(groomParam).replace(/_/g, ' ');
  if (brideParam) appState.brideKhmer = decodeURIComponent(brideParam).replace(/_/g, ' ');
  if (titleParam) appState.eventTitle = decodeURIComponent(titleParam).replace(/_/g, ' ');
  if (dateParam) appState.dateFullKhmer = decodeURIComponent(dateParam).replace(/_/g, ' ');
  if (venueParam) appState.venueName = decodeURIComponent(venueParam).replace(/_/g, ' ');

  // 4. Guest Mode Detection: URL param, guest.html, or mobile device on public site
  const isGuestPage = window.location.pathname.includes('guest.html');
  const isMobile = window.innerWidth <= 768;
  const isExplicitAdmin = urlParams.get('admin') === 'true' || urlParams.get('edit') === '1';

  if (guestParam || isGuestPage || urlParams.get('mode') === 'guest' || urlParams.get('view') === 'guest' || (!isExplicitAdmin && isMobile)) {
    if (guestParam) {
      // Replace underscores with spaces for clean URLs
      appState.guestName = decodeURIComponent(guestParam).replace(/_/g, ' ');
    }
    document.body.classList.add('guest-view-mode');
    
    // Show Envelope Opening Overlay
    const envOverlay = document.getElementById('envelopeOverlay');
    const envTitle = document.getElementById('envelopeEventTitle');
    const envGuest = document.getElementById('envelopeGuestName');
    if (envOverlay) {
      envOverlay.style.display = 'flex';
      if (envTitle) envTitle.textContent = appState.eventTitle;
      if (envGuest) envGuest.textContent = appState.guestName;
      updateEnvelopePhotoPreview();
      updateEntranceBgPreview();
    }
  }

  // Populate Form Fields (if editor panel exists)
  populateFormFields();
}

/**
 * Populate input fields from appState
 */
function populateFormFields() {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  setVal('inputEventTitle', appState.eventTitle);
  setVal('inputGroomKhmer', appState.groomKhmer);
  setVal('inputGroomLatin', appState.groomLatin);
  setVal('inputBrideKhmer', appState.brideKhmer);
  setVal('inputBrideLatin', appState.brideLatin);
  setVal('inputWeddingDate', appState.weddingDate);
  setVal('inputWeddingTime', appState.weddingTime);
  setVal('inputDateFullKhmer', appState.dateFullKhmer);
  setVal('inputGuestSalutation', appState.guestSalutation);
  setVal('inputGuestName', appState.guestName);
  setVal('inputInviteBody', appState.inviteBody);
  setVal('inputVenueName', appState.venueName);
  setVal('inputLocationUrl', appState.locationUrl);
  setVal('inputPhone1', appState.phone1);
  setVal('inputPhone2', appState.phone2);
  setVal('inputPhone3', appState.phone3);
  setVal('inputThankYouText', appState.thankYouText);

  // Typography controls
  setVal('selectTitleFont', appState.titleFont);
  setVal('selectTitleShadow', appState.titleShadow);
  setVal('inputTitleColor', appState.titleColor);
  setVal('inputTitleColorHex', appState.titleColor);
  setVal('inputTitleSize', appState.titleSize);
  const sizeDisp = document.getElementById('titleSizeDisplay');
  if (sizeDisp) sizeDisp.textContent = `${appState.titleSize}px`;

  setVal('selectCoupleFont', appState.coupleFont);
  setVal('selectCoupleLatinFont', appState.coupleLatinFont);
  setVal('inputCoupleColor', appState.coupleColor);
  setVal('inputCoupleColorHex', appState.coupleColor);
  setVal('selectCoupleShadow', appState.coupleShadow);

  setVal('selectGuestFont', appState.guestFont);
  setVal('inputGuestTextColor', appState.guestColor);
  setVal('inputGuestTextColorHex', appState.guestColor);

  const numToggle = document.getElementById('toggleKhmerNumerals');
  if (numToggle) numToggle.checked = appState.useKhmerNumerals;

  // Thumbnails & Media
  updateThumbnail('envelopeThumb', appState.envelopeImage);
  updateThumbnail('entranceBgThumb', appState.entranceBg || appState.bgImage || 'assets/bg.jpg');
  updateThumbnail('coverThumb', appState.coverImage);
  updateThumbnail('bgThumb1', appState.bgImage1 || appState.bgImage || 'assets/bg.jpg');
  updateThumbnail('bgThumb2', appState.bgImage2 || appState.bgImage || 'assets/bg.jpg');
  updateThumbnail('bgThumb3', appState.bgImage3 || appState.bgImage || 'assets/bg.jpg');
  updateThumbnail('bgThumb4', appState.bgImage4 || appState.bgImage || 'assets/bg.jpg');
  updateThumbnail('mapThumb', appState.mapImage);
  updateThumbnail('galleryThumb1', appState.gallery1);
  updateThumbnail('galleryThumb2', appState.gallery2);
  updateThumbnail('galleryThumb3', appState.gallery3);
  updateThumbnail('galleryThumb4', appState.gallery4);

}

function updateThumbnail(elemId, imgUrl) {
  const el = document.getElementById(elemId);
  if (el && imgUrl) {
    el.style.backgroundImage = `url('${imgUrl}')`;
    el.style.display = 'block';
  }
}

/**
 * Bind form text and info inputs
 */
function bindFormInputs() {
  const mapping = [
    { id: 'inputEventTitle', key: 'eventTitle', preview: ['previewCoverTitle', 'envelopeEventTitle'] },
    { id: 'inputGroomKhmer', key: 'groomKhmer', preview: ['previewCoverGroom', 'previewFormalGroom'] },
    { id: 'inputGroomLatin', key: 'groomLatin', preview: ['previewFormalGroomLatin'] },
    { id: 'inputBrideKhmer', key: 'brideKhmer', preview: ['previewCoverBride', 'previewFormalBride'] },
    { id: 'inputBrideLatin', key: 'brideLatin', preview: ['previewFormalBrideLatin'] },
    { id: 'inputDateFullKhmer', key: 'dateFullKhmer', preview: ['previewCoverDate', 'previewCountdownDate'] },
    { id: 'inputGuestSalutation', key: 'guestSalutation', preview: ['previewCoverSalutation'] },
    { id: 'inputGuestName', key: 'guestName', preview: ['previewCoverGuest', 'previewFormalGuest', 'envelopeGuestName'] },
    { id: 'inputInviteBody', key: 'inviteBody', preview: ['previewInviteBody'] },
    { id: 'inputVenueName', key: 'venueName', preview: ['previewVenueName'] },
    { id: 'inputThankYouText', key: 'thankYouText', preview: ['previewThankYouText'] }
  ];

  mapping.forEach(item => {
    const el = document.getElementById(item.id);
    if (!el) return;
    el.addEventListener('input', e => {
      appState[item.key] = e.target.value;
      item.preview.forEach(pId => {
        const target = document.getElementById(pId);
        if (target) target.textContent = e.target.value;
      });
      saveStateDebounced();
    });
  });

  // Date and Time inputs
  const dateInput = document.getElementById('inputWeddingDate');
  const timeInput = document.getElementById('inputWeddingTime');

  if (dateInput) {
    dateInput.addEventListener('change', e => {
      appState.weddingDate = e.target.value;
      updateKhmerDateAuto();
      saveStateDebounced();
    });
  }

  if (timeInput) {
    timeInput.addEventListener('change', e => {
      appState.weddingTime = e.target.value;
      updateKhmerDateAuto();
      saveStateDebounced();
    });
  }

  // Toggle Khmer Numerals
  const numToggle = document.getElementById('toggleKhmerNumerals');
  if (numToggle) {
    numToggle.addEventListener('change', e => {
      appState.useKhmerNumerals = e.target.checked;
      updateCountdownValues();
      saveStateDebounced();
    });
  }

  // Location URL
  const locInput = document.getElementById('inputLocationUrl');
  if (locInput) {
    locInput.addEventListener('input', e => {
      appState.locationUrl = e.target.value;
      const btn = document.getElementById('previewGoogleMapBtn');
      if (btn) btn.href = e.target.value || '#';
      saveStateDebounced();
    });
  }

  // Reset to default button
  const resetBtn = document.getElementById('btnResetDefault');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('តើអ្នកពិតជាចង់កំណត់ទិន្នន័យទាំងអស់មកទម្រង់ដើមវិញមែនទេ?')) {
        localStorage.removeItem('khmer_e_invitation_state');
        appState = { ...defaultState };
        populateFormFields();
        updateFullPreview();
        showToast('បានកំណត់មកទម្រង់ដើមវិញ!');
      }
    });
  }
}

/**
 * Bind Typography & 3D Shadow Controls
 */
function bindTypographyControls() {
  const syncColor = (pickerId, hexId, stateKey) => {
    const picker = document.getElementById(pickerId);
    const hex = document.getElementById(hexId);
    if (!picker || !hex) return;

    picker.addEventListener('input', e => {
      hex.value = e.target.value;
      appState[stateKey] = e.target.value;
      applyTypographyStyles();
      saveStateDebounced();
    });

    hex.addEventListener('input', e => {
      picker.value = e.target.value;
      appState[stateKey] = e.target.value;
      applyTypographyStyles();
      saveStateDebounced();
    });
  };

  // Title controls
  const titleFont = document.getElementById('selectTitleFont');
  if (titleFont) {
    titleFont.addEventListener('change', e => {
      appState.titleFont = e.target.value;
      applyTypographyStyles();
      saveStateDebounced();
    });
  }

  const titleShadow = document.getElementById('selectTitleShadow');
  if (titleShadow) {
    titleShadow.addEventListener('change', e => {
      appState.titleShadow = e.target.value;
      applyTypographyStyles();
      saveStateDebounced();
    });
  }

  const titleSize = document.getElementById('inputTitleSize');
  if (titleSize) {
    titleSize.addEventListener('input', e => {
      appState.titleSize = e.target.value;
      const sizeDisp = document.getElementById('titleSizeDisplay');
      if (sizeDisp) sizeDisp.textContent = `${e.target.value}px`;
      applyTypographyStyles();
      saveStateDebounced();
    });
  }

  syncColor('inputTitleColor', 'inputTitleColorHex', 'titleColor');

  // Couple controls
  const coupleFont = document.getElementById('selectCoupleFont');
  if (coupleFont) {
    coupleFont.addEventListener('change', e => {
      appState.coupleFont = e.target.value;
      applyTypographyStyles();
      saveStateDebounced();
    });
  }

  const coupleLatin = document.getElementById('selectCoupleLatinFont');
  if (coupleLatin) {
    coupleLatin.addEventListener('change', e => {
      appState.coupleLatinFont = e.target.value;
      applyTypographyStyles();
      saveStateDebounced();
    });
  }

  const coupleShadow = document.getElementById('selectCoupleShadow');
  if (coupleShadow) {
    coupleShadow.addEventListener('change', e => {
      appState.coupleShadow = e.target.value;
      applyTypographyStyles();
      saveStateDebounced();
    });
  }

  syncColor('inputCoupleColor', 'inputCoupleColorHex', 'coupleColor');

  // Guest Badge controls
  const guestFont = document.getElementById('selectGuestFont');
  if (guestFont) {
    guestFont.addEventListener('change', e => {
      appState.guestFont = e.target.value;
      applyTypographyStyles();
      saveStateDebounced();
    });
  }

  syncColor('inputGuestTextColor', 'inputGuestTextColorHex', 'guestColor');
}

/**
 * Apply Typography & 3D Shadow Styles dynamically to Preview Elements
 */
function applyTypographyStyles() {
  // Title
  const titleEl = document.getElementById('previewCoverTitle');
  if (titleEl) {
    titleEl.style.fontFamily = `'${appState.titleFont}', serif`;
    titleEl.style.color = appState.titleColor;
    titleEl.style.fontSize = `${appState.titleSize}px`;
    titleEl.className = `cover-title-khmer ${appState.titleShadow}`;
  }

  // Couple Khmer Names
  const coupleTargets = [
    document.getElementById('previewCoverGroom'),
    document.getElementById('previewCoverBride'),
    document.getElementById('previewFormalGroom'),
    document.getElementById('previewFormalBride')
  ];
  coupleTargets.forEach(el => {
    if (el) {
      el.style.fontFamily = `'${appState.coupleFont}', serif`;
      el.style.color = appState.coupleColor;
      el.className = `${el.className.replace(/shadow-[a-z0-9-]+/g, '')} ${appState.coupleShadow}`.trim();
    }
  });

  // Couple Latin Names
  const latinTargets = [
    document.getElementById('previewFormalGroomLatin'),
    document.getElementById('previewFormalBrideLatin')
  ];
  latinTargets.forEach(el => {
    if (el) {
      el.style.fontFamily = `'${appState.coupleLatinFont}', cursive`;
    }
  });

  // Guest Name Badge
  const guestTargets = [
    document.getElementById('previewCoverGuest'),
    document.getElementById('previewFormalGuest'),
    document.getElementById('envelopeGuestName')
  ];
  guestTargets.forEach(el => {
    if (el) {
      el.style.fontFamily = `'${appState.guestFont}', serif`;
      el.style.color = appState.guestColor;
    }
  });
}

/**
 * Client-side Canvas Image Compression Helper
 * បង្រួមរូបភាពស្វ័យប្រវត្តិកុំឲ្យលើសកំណត់ localStorage 5MB
 */
function compressImage(file, maxDimension, quality, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    if (file.type === 'image/svg+xml') {
      return callback(e.target.result);
    }
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > maxDimension || h > maxDimension) {
        if (w > h) {
          h = Math.round((h * maxDimension) / w);
          w = maxDimension;
        } else {
          w = Math.round((w * maxDimension) / h);
          h = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      callback(compressedDataUrl);
    };
    img.onerror = () => callback(e.target.result);
    img.src = e.target.result;
  };
  reader.onerror = () => callback(null);
  reader.readAsDataURL(file);
}

/**
 * Handle File Uploads with instant Base64 preview & auto-compression
 */
function bindImageUploads() {
  const fileInputs = [
    { inputId: 'envelopeImageInput', key: 'envelopeImage', thumbId: 'envelopeThumb', updateFn: updateEnvelopePhotoPreview },
    { inputId: 'entranceBgInput', key: 'entranceBg', thumbId: 'entranceBgThumb', updateFn: updateEntranceBgPreview },
    { inputId: 'coverImageInput', key: 'coverImage', thumbId: 'coverThumb', updateFn: updateCoverPreview },
    { inputId: 'bgImageInput1', key: 'bgImage1', thumbId: 'bgThumb1', updateFn: updateBgPreview },
    { inputId: 'bgImageInput2', key: 'bgImage2', thumbId: 'bgThumb2', updateFn: updateBgPreview },
    { inputId: 'bgImageInput3', key: 'bgImage3', thumbId: 'bgThumb3', updateFn: updateBgPreview },
    { inputId: 'bgImageInput4', key: 'bgImage4', thumbId: 'bgThumb4', updateFn: updateBgPreview },
    { inputId: 'mapImageInput', key: 'mapImage', thumbId: 'mapThumb', updateFn: updateMapPreview },
    { inputId: 'galleryInput1', key: 'gallery1', thumbId: 'galleryThumb1', updateFn: () => updateGallerySlot(1) },
    { inputId: 'galleryInput2', key: 'gallery2', thumbId: 'galleryThumb2', updateFn: () => updateGallerySlot(2) },
    { inputId: 'galleryInput3', key: 'gallery3', thumbId: 'galleryThumb3', updateFn: () => updateGallerySlot(3) },
    { inputId: 'galleryInput4', key: 'gallery4', thumbId: 'galleryThumb4', updateFn: () => updateGallerySlot(4) }
  ];

  fileInputs.forEach(item => {
    const inputEl = document.getElementById(item.inputId);
    if (!inputEl) return;
    inputEl.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;

      showToast('កំពុងដំណើរការរូបភាព...');
      compressImage(file, 1200, 0.82, dataUrl => {
        if (!dataUrl) return;
        appState[item.key] = dataUrl;
        updateThumbnail(item.thumbId, dataUrl);
        item.updateFn();
        saveStateDebounced();
        showToast('បានផ្លាស់ប្ដូររូបភាពរួចរាល់!');
      });
    });
  });
}

/**
 * Safely set background image with automatic dual-path fallback (root vs assets/)
 */
function safeSetBg(element, primaryUrl, fallbackFilename) {
  if (!element) return;
  const url = primaryUrl || fallbackFilename;
  if (!url) return;
  if (url.startsWith('data:')) {
    element.style.backgroundImage = `url('${url}')`;
    return;
  }

  element.style.backgroundImage = `url('${url}')`;
  const img = new Image();
  img.onerror = () => {
    const alt = url.startsWith('assets/') ? url.replace(/^assets\//, '') : ('assets/' + url);
    element.style.backgroundImage = `url('${alt}')`;
  };
  img.src = url;
}

/**
 * Safely set img element src with automatic dual-path fallback (root vs assets/)
 */
function safeSetImg(imgEl, primaryUrl, fallbackFilename) {
  if (!imgEl) return;
  const url = primaryUrl || fallbackFilename;
  if (!url) return;
  imgEl.src = url;
  if (!url.startsWith('data:')) {
    imgEl.onerror = () => {
      imgEl.onerror = null;
      const alt = url.startsWith('assets/') ? url.replace(/^assets\//, '') : ('assets/' + url);
      imgEl.src = alt;
    };
  }
}

function updateEnvelopePhotoPreview() {
  const photo = document.getElementById('envelopePhotoImg');
  safeSetImg(photo, appState.envelopeImage || appState.coverImage, 'cover.jpg');
}

function updateEntranceBgPreview() {
  const bgBackdrop = document.getElementById('envelopeBgBackdrop');
  safeSetBg(bgBackdrop, appState.entranceBg || appState.bgImage || appState.bgImage1, 'bg.jpg');
}

function updateCoverPreview() {
  const coverBg = document.getElementById('previewCoverBg');
  safeSetBg(coverBg, appState.coverImage, 'cover.jpg');
}

function updateBgPreview() {
  const bgConfigs = [
    { id: 'previewBgSection2', img: appState.bgImage1 || appState.bgImage, def: 'bg.jpg' },
    { id: 'previewBgSection3', img: appState.bgImage2 || appState.bgImage, def: 'bg.jpg' },
    { id: 'previewBgSection4', img: appState.bgImage3 || appState.bgImage, def: 'bg.jpg' },
    { id: 'previewBgSection5', img: appState.bgImage4 || appState.bgImage, def: 'bg.jpg' }
  ];
  bgConfigs.forEach(item => {
    const el = document.getElementById(item.id);
    safeSetBg(el, item.img, item.def);
  });
}

function updateMapPreview() {
  const mapImg = document.getElementById('previewMapImage');
  safeSetImg(mapImg, appState.mapImage, 'map.svg');
}

function updateGallerySlot(slotNum) {
  const imgEl = document.getElementById(`previewGallery${slotNum}`);
  safeSetImg(imgEl, appState[`gallery${slotNum}`], `gallery${slotNum}.jpg`);
}

/**
 * Update the whole Preview Screen to match appState
 */
function updateFullPreview() {
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setText('previewCoverTitle', appState.eventTitle);
  setText('previewCoverGroom', appState.groomKhmer);
  setText('previewCoverBride', appState.brideKhmer);
  setText('previewCoverSalutation', appState.guestSalutation);
  setText('previewCoverGuest', appState.guestName);
  setText('previewCoverDate', appState.dateFullKhmer);

  setText('previewFormalGroom', appState.groomKhmer);
  setText('previewFormalGroomLatin', appState.groomLatin);
  setText('previewFormalBride', appState.brideKhmer);
  setText('previewFormalBrideLatin', appState.brideLatin);
  setText('previewInviteBody', appState.inviteBody);
  setText('previewFormalGuest', appState.guestName);
  setText('previewCountdownDate', appState.dateFullKhmer);

  setText('previewVenueName', appState.venueName);
  const mapBtn = document.getElementById('previewGoogleMapBtn');
  if (mapBtn) mapBtn.href = appState.locationUrl || '#';
  setText('previewThankYouText', appState.thankYouText);

  // Images
  updateEnvelopePhotoPreview();
  updateEntranceBgPreview();
  updateCoverPreview();
  updateBgPreview();
  updateMapPreview();
  updateGallerySlot(1);
  updateGallerySlot(2);
  updateGallerySlot(3);
  updateGallerySlot(4);

  // Typography & 3D Pop Shadows
  applyTypographyStyles();

  // Countdown
  updateCountdownValues();
}

/**
 * Real-time Countdown Timer logic
 */
function startCountdownTimer() {
  if (countdownInterval) clearInterval(countdownInterval);
  updateCountdownValues();
  countdownInterval = setInterval(updateCountdownValues, 1000);
}

function updateCountdownValues() {
  const targetStr = `${appState.weddingDate}T${appState.weddingTime || '17:00'}:00`;
  const targetDate = new Date(targetStr).getTime();
  const now = new Date().getTime();
  const diff = targetDate - now;

  let days = 0, hours = 0, minutes = 0, seconds = 0;

  if (diff > 0) {
    days = Math.floor(diff / (1000 * 60 * 60 * 24));
    hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((diff % (1000 * 60)) / 1000);
  }

  const formatFn = appState.useKhmerNumerals ? toKhmerDigits : num => String(num).padStart(2, '0');

  const cdD = document.getElementById('cdDays');
  const cdH = document.getElementById('cdHours');
  const cdM = document.getElementById('cdMinutes');
  const cdS = document.getElementById('cdSeconds');

  if (cdD) cdD.textContent = formatFn(days);
  if (cdH) cdH.textContent = formatFn(hours);
  if (cdM) cdM.textContent = formatFn(minutes);
  if (cdS) cdS.textContent = formatFn(seconds);
}

/**
 * Auto-generate full Khmer date string if user picks from HTML date picker
 */
function updateKhmerDateAuto() {
  if (!appState.weddingDate) return;
  const daysOfWeekKhmer = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
  const monthsKhmer = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ];

  const dateObj = new Date(`${appState.weddingDate}T${appState.weddingTime || '17:00'}:00`);
  if (isNaN(dateObj.getTime())) return;

  const dayOfWeek = daysOfWeekKhmer[dateObj.getDay()];
  const day = toKhmerDigits(dateObj.getDate());
  const month = monthsKhmer[dateObj.getMonth()];
  const year = toKhmerDigits(dateObj.getFullYear());

  let hour = dateObj.getHours();
  const minute = toKhmerDigits(String(dateObj.getMinutes()).padStart(2, '0'));
  let period = 'ព្រឹក';
  if (hour >= 12) {
    period = hour >= 17 ? 'ល្ងាច' : 'រសៀល';
    if (hour > 12) hour -= 12;
  } else if (hour === 0) {
    hour = 12;
  }
  const hourKhmer = toKhmerDigits(hour);

  const formattedKhmer = `ថ្ងៃ${dayOfWeek} ទី${day} ខែ${month} ឆ្នាំ${year} វេលាម៉ោង ${hourKhmer}:${minute} ${period}`;
  
  appState.dateFullKhmer = formattedKhmer;
  const inputEl = document.getElementById('inputDateFullKhmer');
  if (inputEl) inputEl.value = formattedKhmer;
  const covDate = document.getElementById('previewCoverDate');
  if (covDate) covDate.textContent = formattedKhmer;
  const cdDate = document.getElementById('previewCountdownDate');
  if (cdDate) cdDate.textContent = formattedKhmer;
}

/**
 * Bind View & Header Buttons
 */
function bindViewButtons() {
  const btnSplit = document.getElementById('btnModeSplit');
  const btnFullscreen = document.getElementById('btnModeFullscreen');

  if (btnSplit) {
    btnSplit.addEventListener('click', () => {
      document.body.classList.remove('fullscreen-mode');
      btnSplit.classList.add('active');
      if (btnFullscreen) btnFullscreen.classList.remove('active');
    });
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      document.body.classList.add('fullscreen-mode');
      btnFullscreen.classList.add('active');
      if (btnSplit) btnSplit.classList.remove('active');
    });
  }

  // Mobile Tabs
  const mobileTabBtns = document.querySelectorAll('.mobile-tab-btn');
  mobileTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      mobileTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      if (tab === 'preview-tab') {
        document.body.classList.add('show-preview-mobile');
      } else {
        document.body.classList.remove('show-preview-mobile');
      }
    });
  });

  // Share Guest Link Modal
  const btnShare = document.getElementById('btnShareLink');
  if (btnShare) {
    btnShare.addEventListener('click', () => {
      openShareModal();
    });
  }

  const domainModalInput = document.getElementById('modalDomainInput');
  const btnSaveDomain = document.getElementById('btnSaveDomain');
  if (domainModalInput) {
    domainModalInput.addEventListener('input', e => {
      localStorage.setItem('wedding_custom_domain', e.target.value.trim());
      const guestInput = document.getElementById('modalGuestInput');
      updateGeneratedLink(guestInput ? guestInput.value : appState.guestName);
    });
  }
  if (btnSaveDomain) {
    btnSaveDomain.addEventListener('click', () => {
      if (domainModalInput) {
        localStorage.setItem('wedding_custom_domain', domainModalInput.value.trim());
        const guestInput = document.getElementById('modalGuestInput');
        updateGeneratedLink(guestInput ? guestInput.value : appState.guestName);
        showToast('បានរក្សាទុក Domain ជោគជ័យ!');
      }
    });
  }

  const guestModalInput = document.getElementById('modalGuestInput');
  if (guestModalInput) {
    guestModalInput.addEventListener('input', e => {
      updateGeneratedLink(e.target.value);
    });
  }

  const copyLinkBtn = document.getElementById('btnCopyGeneratedLink');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      const linkInput = document.getElementById('modalGeneratedLink');
      linkInput.select();
      navigator.clipboard.writeText(linkInput.value);
      showToast('បានចម្លង Link ភ្ញៀវដោយជោគជ័យ!');
    });
  }

  // Copy Full Invitation Message for Telegram / Messenger
  const btnCopyMsg = document.getElementById('btnCopyFullMessage');
  if (btnCopyMsg) {
    btnCopyMsg.addEventListener('click', () => {
      const msgArea = document.getElementById('modalShareMessage');
      msgArea.select();
      navigator.clipboard.writeText(msgArea.value);
      showToast('បានចម្លងសារអញ្ជើញពេញលេញ រួចរាល់សម្រាប់ផ្ញើ!');
    });
  }

  // Open Envelope Button in Guest Mode / Gate Opening
  const btnOpenEnv = document.getElementById('btnOpenEnvelope');
  if (btnOpenEnv) {
    btnOpenEnv.addEventListener('click', triggerWeddingGateOpening);
  }

  // Quick Test Gate Effect Button in Admin Editor
  const btnTestGate = document.getElementById('btnTestGateEffect');
  if (btnTestGate) {
    btnTestGate.addEventListener('click', () => {
      const overlay = document.getElementById('envelopeOverlay');
      const envPhoto = document.getElementById('envelopePhotoImg');
      const envTitle = document.getElementById('envelopeEventTitle');
      const envGuest = document.getElementById('envelopeGuestName');
      const video = document.getElementById('gateOpeningVideo');
      const card = document.getElementById('envelopeCard');
      const btnSkip = document.getElementById('btnSkipVideo');
      if (overlay) {
        overlay.classList.remove('opened', 'gate-opening');
        if (card) {
          card.style.opacity = '';
          card.style.transform = '';
          card.style.pointerEvents = '';
        }
        if (btnSkip) btnSkip.style.display = 'none';
        if (video) {
          video.classList.remove('playing');
          video.style.display = 'none';
          try { video.pause(); } catch (e) {}
        }
        if (envTitle) envTitle.textContent = appState.eventTitle;
        if (envGuest) envGuest.textContent = appState.guestName;
        if (envPhoto) envPhoto.src = appState.envelopeImage || appState.coverImage || 'assets/cover.jpg';
        overlay.style.display = 'flex';
      }
    });
  }

  // Save config.js button
  const btnSave = document.getElementById('btnSaveConfig');
  if (btnSave) {
    btnSave.addEventListener('click', saveAndDownloadConfig);
  }

  // Export HTML Package
  const btnExp = document.getElementById('btnExport');
  if (btnExp) {
    btnExp.addEventListener('click', () => {
      exportInvitationHTML();
    });
  }
}

/**
 * Trigger Royal Wedding Gate Opening with Video.mp4 directly
 */
function triggerWeddingGateOpening() {
  const overlay = document.getElementById('envelopeOverlay');
  const video = document.getElementById('gateOpeningVideo');
  const card = document.getElementById('envelopeCard');
  const btnSkip = document.getElementById('btnSkipVideo');
  if (!overlay) return;

  // Start romantic ambient wedding music
  if (!isAudioPlaying) {
    toggleAudio();
  }

  // Directly use Video.mp4 as requested
  if (video) {
    video.src = 'Video.mp4';
    video.style.display = 'block';
    video.currentTime = 0;

    // Dissolve card into video
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.85)';
      card.style.pointerEvents = 'none';
    }

    const tryPlay = () => {
      video.play().then(() => {
        video.classList.add('playing');
        if (btnSkip) btnSkip.style.display = 'block';
      }).catch(err => {
        console.warn('Video auto-play blocked, trying fallback assets/Video.mp4:', err);
        if (!video.src.includes('assets/')) {
          video.src = 'assets/Video.mp4';
          video.play().then(() => {
            video.classList.add('playing');
            if (btnSkip) btnSkip.style.display = 'block';
          }).catch(e => {
            console.warn('Fallback video blocked, running doors fallback:', e);
            run3DGateAnimation(overlay);
          });
        } else {
          run3DGateAnimation(overlay);
        }
      });
    };

    video.onerror = () => {
      if (!video.src.includes('assets/')) {
        video.src = 'assets/Video.mp4';
        tryPlay();
      } else {
        run3DGateAnimation(overlay);
      }
    };

    tryPlay();

    let hasEnded = false;
    const endVideo = () => {
      if (hasEnded) return;
      hasEnded = true;
      video.classList.remove('playing');
      if (btnSkip) btnSkip.style.display = 'none';
      setTimeout(() => {
        video.style.display = 'none';
        try { video.pause(); } catch (e) {}
        overlay.classList.add('opened');
        setTimeout(() => {
          overlay.style.display = 'none';
          if (card) {
            card.style.opacity = '';
            card.style.transform = '';
            card.style.pointerEvents = '';
          }
        }, 900);
      }, 350);
    };

    video.onended = endVideo;
    video.onclick = endVideo; // allow tap video to skip
    if (btnSkip) btnSkip.onclick = endVideo; // allow tap skip button
    return;
  }

  // Built-in Majestic 3D Double Khmer Doors Animation fallback
  run3DGateAnimation(overlay);
}

function run3DGateAnimation(overlay) {
  overlay.classList.add('gate-opening');

  // After doors swing open and light bursts, transition smoothly into invitation
  setTimeout(() => {
    overlay.classList.add('opened');
    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.classList.remove('gate-opening');
    }, 900);
  }, 2200);
}

function openShareModal() {
  const modal = document.getElementById('shareModal');
  const domainInput = document.getElementById('modalDomainInput');
  const guestInput = document.getElementById('modalGuestInput');

  if (domainInput) {
    const saved = localStorage.getItem('wedding_custom_domain');
    if (saved) {
      domainInput.value = saved;
    } else if (window.location.protocol.startsWith('http') && window.location.origin && window.location.origin !== 'null') {
      domainInput.value = window.location.origin;
    } else {
      domainInput.value = '';
    }
  }

  if (guestInput) {
    guestInput.value = appState.guestName;
  }

  updateGeneratedLink(guestInput ? guestInput.value : appState.guestName);
  if (modal) modal.classList.add('active');
}

function closeShareModal() {
  const modal = document.getElementById('shareModal');
  if (modal) modal.classList.remove('active');
}

/**
 * Get Base Domain safely without "null/E:..." mess
 */
function getBaseGuestUrl() {
  // 1. Check if user configured a custom domain or Render URL
  const savedDomain = localStorage.getItem('wedding_custom_domain');
  if (savedDomain && savedDomain.trim()) {
    let d = savedDomain.trim().replace(/\/+$/, '');
    if (!d.startsWith('http://') && !d.startsWith('https://')) {
      d = 'https://' + d;
    }
    return `${d}/guest.html`;
  }

  // 2. If running via HTTP/HTTPS (e.g. Render, Vercel, or local Python server)
  if (window.location.protocol.startsWith('http') && window.location.origin && window.location.origin !== 'null') {
    let path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '');
    return `${window.location.origin}${path}/guest.html`;
  }

  // 3. Clean fallback for file:/// protocol so it never produces "null/E:/..."
  return 'http://localhost:8000/guest.html';
}

/**
 * Generate clean, human-readable guest invitation link & Telegram message
 */
function updateGeneratedLink(guestName) {
  const baseGuestUrl = getBaseGuestUrl();
  const cleanGuest = (guestName || appState.guestName || 'ភ្ញៀវកិត្តិយស').trim();
  const guestSlug = cleanGuest.replace(/\s+/g, '_');
  const groomSlug = (appState.groomKhmer || '').trim().replace(/\s+/g, '_');
  const brideSlug = (appState.brideKhmer || '').trim().replace(/\s+/g, '_');
  const titleSlug = (appState.eventTitle || '').trim().replace(/\s+/g, '_');

  let queryReadable = `guest=${guestSlug}`;
  let queryEncoded = `guest=${encodeURIComponent(guestSlug)}`;

  if (groomSlug) {
    queryReadable += `&groom=${groomSlug}`;
    queryEncoded += `&groom=${encodeURIComponent(groomSlug)}`;
  }
  if (brideSlug) {
    queryReadable += `&bride=${brideSlug}`;
    queryEncoded += `&bride=${encodeURIComponent(brideSlug)}`;
  }
  if (titleSlug && titleSlug !== 'សិរីមង្គលអាពាហ៍ពិពាហ៍') {
    queryReadable += `&title=${titleSlug}`;
    queryEncoded += `&title=${encodeURIComponent(titleSlug)}`;
  }

  // Readable URL with Khmer text for visual inspection and easy copying
  const readableUrl = `${baseGuestUrl}?${queryReadable}`;
  // Encoded URL for web links/browsers/Telegram
  const webLinkUrl = `${baseGuestUrl}?${queryEncoded}`;

  const linkInput = document.getElementById('modalGeneratedLink');
  if (linkInput) linkInput.value = readableUrl;

  const fullMessage = `💍 ${appState.eventTitle} 💍\n` +
    `កូនកំលោះ៖ ${appState.groomKhmer} & កូនក្រមុំ៖ ${appState.brideKhmer}\n\n` +
    `សូមគោរពអញ្ជើញ៖ ${cleanGuest}\n` +
    `ចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ក្នុងពិធីសិរីមង្គលអាពាហ៍ពិពាហ៍\n\n` +
    `📅 កាលបរិច្ឆេទ៖ ${appState.dateFullKhmer}\n` +
    `📍 ទីតាំង៖ ${appState.venueName}\n\n` +
    `👉 សូមចុចតំណភ្ជាប់ខាងក្រោម ដើម្បីបើកមើលធៀបការឌីជីថល៖\n${webLinkUrl}`;

  const msgArea = document.getElementById('modalShareMessage');
  if (msgArea) msgArea.value = fullMessage;

  const tgBtn = document.getElementById('shareTelegram');
  const fbBtn = document.getElementById('shareFacebook');
  if (tgBtn) tgBtn.href = `https://t.me/share/url?url=${encodeURIComponent(webLinkUrl)}&text=${encodeURIComponent(fullMessage)}`;
  if (fbBtn) fbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(webLinkUrl)}`;
}

/**
 * Save configuration to downloadable config.js file
 */
function saveAndDownloadConfig() {
  // Construct config.js content
  const configContent = `/**
 * Wedding E-Invitation Configuration
 * រក្សាទុកដោយស្វ័យប្រវត្តិចេញពី E-Invitation Builder
 */

window.WEDDING_CONFIG = {
  eventTitle: ${JSON.stringify(appState.eventTitle)},
  groomKhmer: ${JSON.stringify(appState.groomKhmer)},
  groomLatin: ${JSON.stringify(appState.groomLatin)},
  brideKhmer: ${JSON.stringify(appState.brideKhmer)},
  brideLatin: ${JSON.stringify(appState.brideLatin)},
  weddingDate: ${JSON.stringify(appState.weddingDate)},
  weddingTime: ${JSON.stringify(appState.weddingTime)},
  dateFullKhmer: ${JSON.stringify(appState.dateFullKhmer)},
  guestSalutation: ${JSON.stringify(appState.guestSalutation)},
  inviteBody: ${JSON.stringify(appState.inviteBody)},
  venueName: ${JSON.stringify(appState.venueName)},
  locationUrl: ${JSON.stringify(appState.locationUrl)},
  phone1: ${JSON.stringify(appState.phone1)},
  phone2: ${JSON.stringify(appState.phone2)},
  phone3: ${JSON.stringify(appState.phone3)},
  useKhmerNumerals: ${appState.useKhmerNumerals},
  thankYouText: ${JSON.stringify(appState.thankYouText)},

  styles: {
    titleFont: ${JSON.stringify(appState.titleFont)},
    titleColor: ${JSON.stringify(appState.titleColor)},
    titleShadow: ${JSON.stringify(appState.titleShadow)},
    titleSize: ${JSON.stringify(appState.titleSize)},
    coupleFont: ${JSON.stringify(appState.coupleFont)},
    coupleLatinFont: ${JSON.stringify(appState.coupleLatinFont)},
    coupleColor: ${JSON.stringify(appState.coupleColor)},
    coupleShadow: ${JSON.stringify(appState.coupleShadow)},
    guestFont: ${JSON.stringify(appState.guestFont)},
    guestColor: ${JSON.stringify(appState.guestColor)}
  },

  images: {
    envelopeImage: ${JSON.stringify(appState.envelopeImage || 'cover.jpg')},
    entranceBg: ${JSON.stringify(appState.entranceBg || 'bg.jpg')},
    gateVideo: 'Video.mp4',
    coverImage: ${JSON.stringify(appState.coverImage || 'cover.jpg')},
    bgImage: ${JSON.stringify(appState.bgImage || 'bg.jpg')},
    bgImage1: ${JSON.stringify(appState.bgImage1 || 'bg.jpg')},
    bgImage2: ${JSON.stringify(appState.bgImage2 || 'bg.jpg')},
    bgImage3: ${JSON.stringify(appState.bgImage3 || 'bg.jpg')},
    bgImage4: ${JSON.stringify(appState.bgImage4 || 'bg.jpg')},
    mapImage: ${JSON.stringify(appState.mapImage || 'map.svg')},
    gallery1: ${JSON.stringify(appState.gallery1 || 'gallery1.jpg')},
    gallery2: ${JSON.stringify(appState.gallery2 || 'gallery2.jpg')},
    gallery3: ${JSON.stringify(appState.gallery3 || 'gallery3.jpg')},
    gallery4: ${JSON.stringify(appState.gallery4 || 'gallery4.jpg')}
  }
};
`;

  const blob = new Blob([configContent], { type: 'application/javascript;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'config.js';
  a.click();
  showToast('បានទាញយក config.js! សូមយកវាទៅ Upload ចូល GitHub');
  openSaveGuideModal();
}

function openSaveGuideModal() {
  const modal = document.getElementById('saveGuideModal');
  if (modal) modal.classList.add('active');
}

function closeSaveGuideModal() {
  const modal = document.getElementById('saveGuideModal');
  if (modal) modal.classList.remove('active');
}

/**
 * Add to Calendar (Google Calendar & .ics)
 */
function bindCalendarAction() {
  const btn = document.getElementById('btnAddToCalendar');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const startDate = new Date(`${appState.weddingDate}T${appState.weddingTime || '17:00'}:00`);
    const endDate = new Date(startDate.getTime() + (4 * 60 * 60 * 1000)); // +4 hours

    const formatGCal = dt => dt.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(appState.eventTitle + ' - ' + appState.groomKhmer + ' & ' + appState.brideKhmer)}&dates=${formatGCal(startDate)}/${formatGCal(endDate)}&details=${encodeURIComponent(appState.thankYouText)}&location=${encodeURIComponent(appState.venueName)}`;

    window.open(gcalUrl, '_blank');
    showToast('កំពុងបើកប្រតិទិន Google Calendar...');
  });
}

/**
 * Smooth scrolling to specific section in the preview
 */
function scrollToPreviewSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }

  // Update pills
  document.querySelectorAll('.nav-pill').forEach(pill => {
    pill.classList.remove('active');
  });
}

/**
 * Lightbox Modal for Photo Gallery
 */
function openLightbox(index) {
  const modal = document.getElementById('lightboxModal');
  const imgEl = document.getElementById('lightboxImg');
  const targetKey = `gallery${index + 1}`;
  if (imgEl && modal) {
    imgEl.src = appState[targetKey];
    modal.classList.add('active');
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (modal) modal.classList.remove('active');
}

/**
 * Ambient Wedding Music Synthesizer & Custom Audio Player
 */
function bindAudio() {
  const floatBtn = document.getElementById('floatingMusicBtn');
  const testBtn = document.getElementById('btnTestMusic');
  const fileInput = document.getElementById('musicFileInput');

  if (floatBtn) floatBtn.addEventListener('click', toggleAudio);
  if (testBtn) testBtn.addEventListener('click', toggleAudio);

  if (fileInput) {
    fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        if (!customAudioEl) {
          customAudioEl = new Audio();
          customAudioEl.loop = true;
        }
        customAudioEl.src = URL.createObjectURL(file);
        customAudioEl.play();
        isAudioPlaying = true;
        updateAudioVisuals();
        showToast('កំពុងចាក់ចម្រៀងដែលបានជ្រើសរើស!');
      }
    });
  }
}

function toggleAudio() {
  if (customAudioEl && customAudioEl.src) {
    if (isAudioPlaying) {
      customAudioEl.pause();
      isAudioPlaying = false;
    } else {
      customAudioEl.play();
      isAudioPlaying = true;
    }
    updateAudioVisuals();
    return;
  }

  // Web Audio API synthesizer for serene traditional flute/harp tones
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (isAudioPlaying) {
    if (audioContext.state === 'running') audioContext.suspend();
    isAudioPlaying = false;
  } else {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    } else {
      playWeddingPentatonicMelody();
    }
    isAudioPlaying = true;
  }
  updateAudioVisuals();
}

function updateAudioVisuals() {
  const btn = document.getElementById('btnTestMusic');
  const floatBtn = document.getElementById('floatingMusicBtn');
  if (isAudioPlaying) {
    if (btn) btn.textContent = '⏸️ ផ្អាកតន្ត្រី';
    if (floatBtn) floatBtn.style.borderColor = '#10b981';
  } else {
    if (btn) btn.textContent = '▶️ ចាក់ភ្លេងតេស្ត';
    if (floatBtn) floatBtn.style.borderColor = 'rgba(223, 158, 40, 0.7)';
  }
}

function playWeddingPentatonicMelody() {
  if (!audioContext) return;
  const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
  let noteIndex = 0;

  function scheduleNextNote() {
    if (!isAudioPlaying) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    const freq = notes[noteIndex % notes.length];
    noteIndex = (noteIndex + Math.floor(Math.random() * 3) + 1) % notes.length;

    osc.frequency.setValueAtTime(freq, audioContext.currentTime);

    gain.gain.setValueAtTime(0.001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.8);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 1.9);

    setTimeout(scheduleNextNote, 1200 + Math.random() * 600);
  }

  scheduleNextNote();
}

/**
 * Export standalone invitation package
 */
function exportInvitationHTML() {
  const phoneScreenHtml = document.getElementById('phoneScreen').innerHTML;
  const fullHtml = `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appState.eventTitle} - ${appState.groomKhmer} & ${appState.brideKhmer}</title>
  <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Battambang:wght@400;700&family=Bayon&family=Bokor&family=Cinzel:wght@500;700&family=Great+Vibes&family=Kantumruy+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Koulen&family=Moul&family=Moulpali&family=Playfair+Display:ital,wght@0,600;1,500&family=Preahvihear&family=Siemreap&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <script src="config.js"><\/script>
  <style>
    body { background: #12141a; display: flex; justify-content: center; min-height: 100vh; margin: 0; }
    .invitation-container { width: 100%; max-width: 440px; background: #fffdfa; min-height: 100vh; position: relative; }
  </style>
</head>
<body class="guest-view-mode">
  <!-- Ceremonial Royal Wedding Gate & Entrance Overlay -->
  <div class="envelope-overlay" id="envelopeOverlay">
    <div class="envelope-bg-backdrop" id="envelopeBgBackdrop" style="background-image: url('${appState.entranceBg || appState.bgImage || 'assets/bg.jpg'}');"></div>
    <video id="gateOpeningVideo" class="gate-opening-video" playsinline preload="auto" style="display: none;"></video>
    <div class="gate-light-rays" id="gateLightRays"></div>
    <!-- Center Grand Invitation Welcome Card -->
    <div class="envelope-card" id="envelopeCard">
      <div class="envelope-photo-frame">
        <img src="${appState.envelopeImage || 'assets/cover.jpg'}" alt="កូនកំលោះកូនក្រមុំ" id="envelopePhotoImg" class="envelope-photo-img">
        <div class="frame-gold-border"></div>
      </div>
      <h2 class="envelope-title" id="envelopeEventTitle">${appState.eventTitle}</h2>
      <p class="envelope-subtitle">លិខិតអញ្ជើញឌីជីថល E-Invitation</p>
      <div class="envelope-guest-badge">
        <span style="font-size: 13px; color: #83561a; display: block; margin-bottom: 2px;">សូមគោរពអញ្ជើញ</span>
        <strong class="envelope-guest-name" id="envelopeGuestName">${appState.guestName}</strong>
      </div>
      <button type="button" class="envelope-open-btn" id="btnOpenEnvelope">
        <span>🚪✨ ចុចបើកទ្វារចូលរោងការ</span>
      </button>
    </div>
  </div>

  <div class="invitation-container" id="phoneScreen">
    ${phoneScreenHtml}
  </div>
  <script src="script.js"><\/script>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `E-Invitation-${appState.groomKhmer}-${appState.brideKhmer}.html`;
  a.click();
  showToast('បានទាញយកឯកសារធៀបការជា HTML!');
}

/**
 * Toast Notice Utility
 */
let toastTimeout = null;
function showToast(msg) {
  const toast = document.getElementById('toastNotice');
  const text = document.getElementById('toastText');
  if (text) text.textContent = msg;
  if (toast) {
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
}

/**
 * LocalStorage Debounced Saver
 */
let saveTimeout = null;
function saveStateDebounced() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem('khmer_e_invitation_state', JSON.stringify(appState));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
      showToast('⚠️ ការចងចាំ Browser ពេញ! សូមចុចប៊ូតុង "រក្សាទុក config.js"');
    }
  }, 250);
}
