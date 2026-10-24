/**
 * Wedding E-Invitation Configuration
 * កំណត់ត្រាទិន្នន័យធៀបការអាពាហ៍ពិពាហ៍ (កូនកំលោះ កូនក្រមុំ ពុម្ពអក្សរ ពណ៌ និងស្រមោល)
 * ឯកសារនេះត្រូវបានប្រើដោយស្វ័យប្រវត្តិទាំងលើ Admin និងទំព័រភ្ញៀវ (guest.html)
 */

window.WEDDING_CONFIG = {
  // ព័ត៌មានកម្មវិធី
  eventTitle: 'សិរីមង្គលអាពាហ៍ពិពាហ៍',
  groomKhmer: 'ប្រុស តូច',
  groomLatin: 'Pros Toch',
  brideKhmer: 'ខៀវ ពេជ្រចរណៃ',
  brideLatin: 'Khiev Pich Chorai',
  weddingDate: '2026-12-10',
  weddingTime: '17:00',
  dateFullKhmer: 'ថ្ងៃព្រហស្បតិ៍ ទី១០ ខែធ្នូ ឆ្នាំ២០២៦ វេលាម៉ោង ៥:០០ ល្ងាច',
  guestSalutation: 'សូមគោរពអញ្ជើញ',
  guestDefaultName: 'ភ្ញៀវកិត្តិយស',
  inviteBody: 'យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ',
  venueName: 'ភោជនីយដ្ឋាន សេនរេប្រាយ យីង',
  locationUrl: 'https://maps.google.com/?q=Phnom+Penh+Wedding+Hall',
  phone1: '097 258 15 37',
  phone2: '011 867 506',
  phone3: '089 483 683',
  useKhmerNumerals: true,
  thankYouText: 'យើងខ្ញុំទាំងពីរ សូមថ្លែងអំណរគុណ យ៉ាងជ្រាលជ្រៅ ចំពោះវត្តមាន ដ៏ឧត្តុង្គឧត្តមរបស់ សម្តេច ឯកឧត្តម លោកជំទាវ លោកអ្នកឧកញ៉ា អ្នកឧកញ៉ា ឧកញ៉ា លោក លោកស្រី អ្នកនាង កញ្ញា ដែលបាន អញ្ជើញចូលរួមជាកិត្តិយស ក្នុងពិធីសិរីសួស្តីអាពាហ៍ពិពាហ៍ របស់យើងខ្ញុំ នាពេលខាងមុខនេះ។ យើងខ្ញុំសូមការខន្តីអភ័យទោស ដែលពុំបានជូនលិខិតអញ្ជើញ ដោយផ្ទាល់ ។ ដោយការកិច្ចដ៏ខ្ពង់ខ្ពស់ពីយើងខ្ញុំ។',

  // រចនាបថអក្សរ ពណ៌ និងស្រមោល (Typography, Colors & Text Shadows)
  styles: {
    // ចំណងជើងធំ Cover Title
    titleFont: 'Moul',
    titleColor: '#f7a627',
    titleShadow: '3d-strong', // '3d-strong', 'glow-gold', 'dark-crisp', 'soft'
    titleSize: '26',

    // ឈ្មោះកូនកំលោះកូនក្រមុំ
    coupleFont: 'Moul',
    coupleColor: '#f9b63a',
    coupleShadow: '3d-strong',
    coupleLatinFont: 'Great Vibes',
    coupleLatinColor: '#83561a',

    // ឈ្មោះភ្ញៀវកិត្តិយស
    guestFont: 'Moul',
    guestColor: '#1a3250',
    guestCapsuleBg: 'gold-gradient', // 'gold-gradient', 'pearl-white', 'royal-red'

    // កាលបរិច្ឆេទ Date
    dateColor: '#f8c85c',
    dateShadow: 'dark-crisp',

    // ពណ៌អត្ថបទក្នុងធៀប Body
    themeColor: '#df951e'
  },

  // ផ្លូវរូបភាព (Relative asset paths)
  images: {
    envelopeImage: 'assets/cover.jpg',     // រូបកូនកំលោះកូនក្រមុំកណ្ដាលរង្វង់លើធៀប
    entranceBg: 'assets/bg.jpg',           // រូបភាពផ្ទៃខាងក្រោយ Background លើផ្ទាំងបើកធៀប
    gateVideo: 'Video.mp4',                // វីដេអូបើកទ្វាររោងការ
    coverImage: 'assets/cover.jpg',
    bgImage: 'assets/bg.jpg',
    bgImage1: 'assets/bg.jpg', // ផ្ទៃ Background ផ្នែកទី ២ (រាប់ថយក្រោយ)
    bgImage2: 'assets/bg.jpg', // ផ្ទៃ Background ផ្នែកទី ៣ (ទីតាំង & ផែនទី)
    bgImage3: 'assets/bg.jpg', // ផ្ទៃ Background ផ្នែកទី ៤ (កម្រងរូបភាព)
    bgImage4: 'assets/bg.jpg', // ផ្ទៃ Background ផ្នែកទី ៥ (ថ្លែងអំណរគុណ)
    mapImage: 'assets/map.svg',
    gallery1: 'assets/gallery1.jpg',
    gallery2: 'assets/gallery2.jpg',
    gallery3: 'assets/gallery3.jpg',
    gallery4: 'assets/gallery4.jpg'
  }
};
