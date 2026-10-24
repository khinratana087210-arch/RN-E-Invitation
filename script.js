/**
 * Khmer E-Invitation Builder - Interactive Application Logic
 * Supports real-time preview, Khmer numeral conversion, countdown timer,
 * file uploads, personalized guest URL params, and audio player.
 */

// Khmer numeral character map
const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

function toKhmerDigits(num) {
  return String(num).replace(/[0-9]/g, digit => KHMER_DIGITS[parseInt(digit, 10)]);
}

// Initial Default State
const defaultState = {
  coverImage: 'assets/cover.jpg',
  bgImage: 'assets/bg.jpg',
  mapImage: 'assets/map.svg',
  gallery1: 'assets/gallery1.jpg',
  gallery2: 'assets/gallery2.jpg',
  gallery3: 'assets/gallery3.jpg',
  gallery4: 'assets/gallery4.jpg',
  eventTitle: 'សិរីមង្គលអាពាហ៍ពិពាហ៍',
  groomKhmer: 'ប្រុស តូច',
  groomLatin: 'Pros Toch',
  brideKhmer: 'ខៀវ ពេជ្រចរណៃ',
  brideLatin: 'Khiev Pich Chorai',
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
  thankYouText: 'យើងខ្ញុំទាំងពីរ សូមថ្លែងអំណរគុណ យ៉ាងជ្រាលជ្រៅ ចំពោះវត្តមាន ដ៏ឧត្តុង្គឧត្តមរបស់ សម្តេច ឯកឧត្តម លោកជំទាវ លោកអ្នកឧកញ៉ា អ្នកឧកញ៉ា ឧកញ៉ា លោក លោកស្រី អ្នកនាង កញ្ញា ដែលបាន អញ្ជើញចូលរួមជាកិត្តិយស ក្នុងពិធីសិរីសួស្តីអាពាហ៍ពិពាហ៍ របស់យើងខ្ញុំ នាពេលខាងមុខនេះ។ យើងខ្ញុំសូមការខន្តីអភ័យទោស ដែលពុំបានជូនលិខិតអញ្ជើញ ដោយផ្ទាល់ ។ ដោយការកិច្ចដ៏ខ្ពង់ខ្ពស់ពីយើងខ្ញុំ។'
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
  bindViewButtons();
  bindCalendarAction();
  bindAudio();
  startCountdownTimer();
  updateFullPreview();
});

/**
 * Load state from localStorage or URL search params (?guest=...)
 */
function loadSavedStateOrUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const guestParam = urlParams.get('guest') || urlParams.get('to');
  
  // Try loading saved data from localStorage
  const saved = localStorage.getItem('khmer_e_invitation_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      appState = { ...appState, ...parsed };
    } catch (e) {
      console.warn('Could not parse saved state:', e);
    }
  }

  // If URL has specific guest name or guest mode, automatically activate Guest View Mode!
  if (guestParam || urlParams.get('mode') === 'guest' || urlParams.get('view') === 'guest') {
    if (guestParam) {
      appState.guestName = decodeURIComponent(guestParam);
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
    }
  }

  // Populate Form Fields
  populateFormFields();
}

/**
 * Sync form input values with current appState
 */
function populateFormFields() {
  document.getElementById('inputEventTitle').value = appState.eventTitle;
  document.getElementById('inputGroomKhmer').value = appState.groomKhmer;
  document.getElementById('inputGroomLatin').value = appState.groomLatin;
  document.getElementById('inputBrideKhmer').value = appState.brideKhmer;
  document.getElementById('inputBrideLatin').value = appState.brideLatin;
  document.getElementById('inputWeddingDate').value = appState.weddingDate;
  document.getElementById('inputWeddingTime').value = appState.weddingTime;
  document.getElementById('inputDateFullKhmer').value = appState.dateFullKhmer;
  document.getElementById('inputGuestSalutation').value = appState.guestSalutation;
  document.getElementById('inputGuestName').value = appState.guestName;
  document.getElementById('inputInviteBody').value = appState.inviteBody;
  document.getElementById('inputVenueName').value = appState.venueName;
  document.getElementById('inputLocationUrl').value = appState.locationUrl;
  document.getElementById('inputPhone1').value = appState.phone1;
  document.getElementById('inputPhone2').value = appState.phone2;
  document.getElementById('inputPhone3').value = appState.phone3;
  document.getElementById('inputThankYouText').value = appState.thankYouText;
  document.getElementById('toggleKhmerNumerals').checked = appState.useKhmerNumerals;

  // Thumbnails
  updateThumbnail('coverThumb', appState.coverImage);
  updateThumbnail('bgThumb', appState.bgImage);
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
 * Bind text & change inputs to update preview instantly
 */
function bindFormInputs() {
  const mapping = [
    { id: 'inputEventTitle', key: 'eventTitle', preview: ['previewCoverTitle'] },
    { id: 'inputGroomKhmer', key: 'groomKhmer', preview: ['previewCoverGroom', 'previewFormalGroom'] },
    { id: 'inputGroomLatin', key: 'groomLatin', preview: ['previewFormalGroomLatin'] },
    { id: 'inputBrideKhmer', key: 'brideKhmer', preview: ['previewCoverBride', 'previewFormalBride'] },
    { id: 'inputBrideLatin', key: 'brideLatin', preview: ['previewFormalBrideLatin'] },
    { id: 'inputDateFullKhmer', key: 'dateFullKhmer', preview: ['previewCoverDate', 'previewCountdownDate'] },
    { id: 'inputGuestSalutation', key: 'guestSalutation', preview: ['previewCoverSalutation'] },
    { id: 'inputGuestName', key: 'guestName', preview: ['previewCoverGuest', 'previewFormalGuest'] },
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

  dateInput.addEventListener('change', e => {
    appState.weddingDate = e.target.value;
    updateKhmerDateAuto();
    saveStateDebounced();
  });

  timeInput.addEventListener('change', e => {
    appState.weddingTime = e.target.value;
    updateKhmerDateAuto();
    saveStateDebounced();
  });

  // Toggle Khmer Numerals
  document.getElementById('toggleKhmerNumerals').addEventListener('change', e => {
    appState.useKhmerNumerals = e.target.checked;
    updateCountdownValues();
    saveStateDebounced();
  });

  // Location URL
  document.getElementById('inputLocationUrl').addEventListener('input', e => {
    appState.locationUrl = e.target.value;
    const btn = document.getElementById('previewGoogleMapBtn');
    if (btn) btn.href = e.target.value || '#';
    saveStateDebounced();
  });

  // Reset to default button
  document.getElementById('btnResetDefault').addEventListener('click', () => {
    if (confirm('តើអ្នកពិតជាចង់កំណត់ទិន្នន័យទាំងអស់មកទម្រង់ដើមវិញមែនទេ?')) {
      localStorage.removeItem('khmer_e_invitation_state');
      appState = { ...defaultState };
      populateFormFields();
      updateFullPreview();
      showToast('បានកំណត់មកទម្រង់ដើមវិញ!');
    }
  });
}

/**
 * Handle File Uploads with instant Base64 preview
 */
function bindImageUploads() {
  const fileInputs = [
    { inputId: 'coverImageInput', key: 'coverImage', thumbId: 'coverThumb', updateFn: updateCoverPreview },
    { inputId: 'bgImageInput', key: 'bgImage', thumbId: 'bgThumb', updateFn: updateBgPreview },
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

      const reader = new FileReader();
      reader.onload = evt => {
        const dataUrl = evt.target.result;
        appState[item.key] = dataUrl;
        updateThumbnail(item.thumbId, dataUrl);
        item.updateFn();
        saveStateDebounced();
        showToast('បានផ្លាស់ប្ដូររូបភាពរួចរាល់!');
      };
      reader.readAsDataURL(file);
    });
  });
}

function updateCoverPreview() {
  const coverBg = document.getElementById('previewCoverBg');
  if (coverBg) {
    coverBg.style.backgroundImage = `url('${appState.coverImage}')`;
  }
}

function updateBgPreview() {
  const bgSections = ['previewBgSection2', 'previewBgSection3', 'previewBgSection4', 'previewBgSection5'];
  bgSections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.backgroundImage = `url('${appState.bgImage}')`;
  });
}

function updateMapPreview() {
  const mapImg = document.getElementById('previewMapImage');
  if (mapImg) {
    mapImg.src = appState.mapImage;
  }
}

function updateGallerySlot(slotNum) {
  const imgEl = document.getElementById(`previewGallery${slotNum}`);
  if (imgEl) {
    imgEl.src = appState[`gallery${slotNum}`];
  }
}

/**
 * Update the whole Preview Screen to match appState
 */
function updateFullPreview() {
  // Text Elements
  document.getElementById('previewCoverTitle').textContent = appState.eventTitle;
  document.getElementById('previewCoverGroom').textContent = appState.groomKhmer;
  document.getElementById('previewCoverBride').textContent = appState.brideKhmer;
  document.getElementById('previewCoverSalutation').textContent = appState.guestSalutation;
  document.getElementById('previewCoverGuest').textContent = appState.guestName;
  document.getElementById('previewCoverDate').textContent = appState.dateFullKhmer;

  document.getElementById('previewFormalGroom').textContent = appState.groomKhmer;
  document.getElementById('previewFormalGroomLatin').textContent = appState.groomLatin;
  document.getElementById('previewFormalBride').textContent = appState.brideKhmer;
  document.getElementById('previewFormalBrideLatin').textContent = appState.brideLatin;
  document.getElementById('previewInviteBody').textContent = appState.inviteBody;
  document.getElementById('previewFormalGuest').textContent = appState.guestName;
  document.getElementById('previewCountdownDate').textContent = appState.dateFullKhmer;

  document.getElementById('previewVenueName').textContent = appState.venueName;
  document.getElementById('previewGoogleMapBtn').href = appState.locationUrl || '#';
  document.getElementById('previewThankYouText').textContent = appState.thankYouText;

  // Images
  updateCoverPreview();
  updateBgPreview();
  updateMapPreview();
  updateGallerySlot(1);
  updateGallerySlot(2);
  updateGallerySlot(3);
  updateGallerySlot(4);

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

  document.getElementById('cdDays').textContent = formatFn(days);
  document.getElementById('cdHours').textContent = formatFn(hours);
  document.getElementById('cdMinutes').textContent = formatFn(minutes);
  document.getElementById('cdSeconds').textContent = formatFn(seconds);
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
  document.getElementById('inputDateFullKhmer').value = formattedKhmer;
  document.getElementById('previewCoverDate').textContent = formattedKhmer;
  document.getElementById('previewCountdownDate').textContent = formattedKhmer;
}

/**
 * Bind View & Header Buttons (Split mode, Fullscreen, Share, Export)
 */
function bindViewButtons() {
  const btnSplit = document.getElementById('btnModeSplit');
  const btnFullscreen = document.getElementById('btnModeFullscreen');

  btnSplit.addEventListener('click', () => {
    document.body.classList.remove('fullscreen-mode');
    btnSplit.classList.add('active');
    btnFullscreen.classList.remove('active');
  });

  btnFullscreen.addEventListener('click', () => {
    document.body.classList.add('fullscreen-mode');
    btnFullscreen.classList.add('active');
    btnSplit.classList.remove('active');
  });

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
  btnShare.addEventListener('click', () => {
    openShareModal();
  });

  const guestModalInput = document.getElementById('modalGuestInput');
  guestModalInput.addEventListener('input', e => {
    updateGeneratedLink(e.target.value);
  });

  document.getElementById('btnCopyGeneratedLink').addEventListener('click', () => {
    const linkInput = document.getElementById('modalGeneratedLink');
    linkInput.select();
    navigator.clipboard.writeText(linkInput.value);
    showToast('បានចម្លង Link ភ្ញៀវដោយជោគជ័យ!');
  });

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

  // Open Envelope Button in Guest Mode
  const btnOpenEnv = document.getElementById('btnOpenEnvelope');
  if (btnOpenEnv) {
    btnOpenEnv.addEventListener('click', () => {
      const overlay = document.getElementById('envelopeOverlay');
      if (overlay) {
        overlay.classList.add('opened');
        // Start romantic ambient wedding music
        if (!isAudioPlaying) {
          toggleAudio();
        }
      }
    });
  }

  // Back to Admin / Editor Button
  const btnAdmin = document.getElementById('btnBackToAdmin');
  if (btnAdmin) {
    btnAdmin.addEventListener('click', () => {
      document.body.classList.remove('guest-view-mode');
      const overlay = document.getElementById('envelopeOverlay');
      if (overlay) overlay.style.display = 'none';
      showToast('បានត្រឡប់មកផ្ទាំងកែសម្រួលព័ត៌មាន (Admin Mode)!');
    });
  }

  // Export HTML Package
  document.getElementById('btnExport').addEventListener('click', () => {
    exportInvitationHTML();
  });
}

function openShareModal() {
  const modal = document.getElementById('shareModal');
  const guestInput = document.getElementById('modalGuestInput');
  guestInput.value = appState.guestName;
  updateGeneratedLink(appState.guestName);
  modal.classList.add('active');
}

function closeShareModal() {
  document.getElementById('shareModal').classList.remove('active');
}

function updateGeneratedLink(guestName) {
  const baseUrl = window.location.origin + window.location.pathname;
  const fullUrl = `${baseUrl}?guest=${encodeURIComponent(guestName || '')}`;
  document.getElementById('modalGeneratedLink').value = fullUrl;

  // Format full message for Telegram / Messenger
  const fullMessage = `💍 ${appState.eventTitle} 💍\n` +
    `កូនកំលោះ៖ ${appState.groomKhmer} & កូនក្រមុំ៖ ${appState.brideKhmer}\n\n` +
    `សូមគោរពអញ្ជើញ៖ ${guestName || 'ភ្ញៀវកិត្តិយស'}\n` +
    `ចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយស ក្នុងពិធីសិរីមង្គលអាពាហ៍ពិពាហ៍\n\n` +
    `📅 កាលបរិច្ឆេទ៖ ${appState.dateFullKhmer}\n` +
    `📍 ទីតាំង៖ ${appState.venueName}\n\n` +
    `👉 សូមចុចតំណភ្ជាប់ខាងក្រោម ដើម្បីបើកមើលធៀបការឌីជីថល៖\n${fullUrl}`;

  const msgArea = document.getElementById('modalShareMessage');
  if (msgArea) msgArea.value = fullMessage;

  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedText = encodeURIComponent(fullMessage);
  
  document.getElementById('shareTelegram').href = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
  document.getElementById('shareFacebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
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
  const container = document.getElementById('phoneScreen');
  if (el && container) {
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
  imgEl.src = appState[targetKey];
  modal.classList.add('active');
}

function closeLightbox() {
  document.getElementById('lightboxModal').classList.remove('active');
}

/**
 * Ambient Wedding Music Synthesizer & Custom Audio Player
 */
function bindAudio() {
  const floatBtn = document.getElementById('floatingMusicBtn');
  const testBtn = document.getElementById('btnTestMusic');
  const fileInput = document.getElementById('musicFileInput');

  floatBtn.addEventListener('click', toggleAudio);
  testBtn.addEventListener('click', toggleAudio);

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

  // Use Web Audio API synthesizer for serene traditional flute/harp tones
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
    btn.textContent = '⏸️ ផ្អាកតន្ត្រី';
    floatBtn.style.borderColor = '#10b981';
  } else {
    btn.textContent = '▶️ ចាក់ភ្លេងតេស្ត';
    floatBtn.style.borderColor = 'rgba(223, 158, 40, 0.7)';
  }
}

// Gentle Khmer pentatonic scale notes (Flute / Roneat frequencies)
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
  <link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Cinzel:wght@500;700&family=Great+Vibes&family=Kantumruy+Pro:wght@400;600;700&family=Moul&family=Playfair+Display:ital,wght@0,600;1,500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <style>
    body { background: #12141a; display: flex; justify-content: center; min-height: 100vh; margin: 0; }
    .invitation-container { width: 100%; max-width: 440px; background: #fffdfa; min-height: 100vh; position: relative; }
  </style>
</head>
<body>
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
  text.textContent = msg;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
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
    }
  }, 400);
}
