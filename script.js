const firebaseConfig = {
  apiKey: "AIzaSyA5svW_GZ6bCIhewmrk8TXMDuJ1CekWFKc",
  authDomain: "tonvault-248cb.firebaseapp.com",
  databaseURL: "https://tonvault-248cb-default-rtdb.firebaseio.com",
  projectId: "tonvault-248cb",
  storageBucket: "tonvault-248cb.firebasestorage.app",
  messagingSenderId: "984871958367",
  appId: "1:984871958367:web:6d1dd5c10e4006a59de8ea",
  measurementId: "G-YRRRZQR0QH"
};

let db = null;
try {
  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    console.log("🟢 FIREBASE CLOUD CONNECTED: Sistem online & tersinkronisasi.");
  }
} catch (e) {
  console.warn("⚠️ FIREBASE ERROR: Menggunakan penyimpanan lokal.");
}


const LOGS_WEBHOOK_URL = "https://discord.com/api/webhooks/1530339697950457896/tJ0pI8L0aA1_eGQalIYceUoQ1OLNgik_60Dbk22JB2w0DtsT2hdeL4Z5bmZcnfbHfL0c";
const ORDERS_WEBHOOK_URL = "https://discord.com/api/webhooks/1530340024275701870/pjcRbUAF5Gfx6VCHLvwaQgap01G5Skwye7QHRkpEemSrtVNsXxvq9Rr8HN_3mGwvpRXU";
const PROFILE_WEBHOOK_URL = "https://discord.com/api/webhooks/1530379645566849167/5k91siHoYLf_ab232QC-AeJnG2SCj_qeQEqhUhYPpHZLQPneW8sTUm0RxSt8H0th5VU7";
const VAULT_LOGS_WEBHOOK_URL = "https://discord.com/api/webhooks/1530401014107209759/_2eW1uFqlstPcpwjm0fU4-blOEP8taAa9x-uwVqSsI0V0CRSxwgQMpS_LXAWuRAJ6cD8";
const METAL_SCRAP_WEBHOOK_URL = "https://discord.com/api/webhooks/1530480654796587031/XYR5Tza9v0Fii60UYD7WdFN8Futv1emOXC2iowkH1dGo1QwTnJAtuaiLDAarWKe5DUAs";

// ==========================================
// 🛡️ KONFIGURASI KEAMANAN DISCORD OAUTH2
// ==========================================
const DISCORD_CLIENT_ID = "1530553213483221083";
const TON_SERVER_ID = "1305954933685878877";
const REDIRECT_URI = "https://tonvault.my.id/";

let currentLoggedInUser = '';
let currentUserRole = '';
let userCart = [];
let globalOrders = [];

let currentCatalogTab = 'Family';
let activeInventoryFilter = 'all';
let currentMarketplaceFilter = 'all';
let appliedDiscount = 0;
let appliedPromoName = '';

// VARIABEL GLOBAL UPLOADER FOTO
let icUploadedBase64 = '';
let newItemUploadedBase64 = '';
let uploadedProofThumbnails = [];

// STATE TRANSACTION PROCESS
let activeTxStatusFilter = 'Pending';
let activeTxSearchQuery = '';
let activeTxSortOrder = 'newest';
let activeTxItemFilter = 'all';
let activeTxPage = 1;
let activeTxPerPage = 10;

// LOAD DATA PERSISTEN & STATE MODERATOR
let adminTransactions = getSafeStorage('ton_admin_transactions') || [];
let orgLeaderboard = getSafeStorage('ton_org_leaderboard') || [];
let vaultBalance = getSafeStorage('ton_vault_balance') || 0;
let stockProofLogs = getSafeStorage('ton_stock_proof_logs') || [];
let metalScrapLogs = getSafeStorage('ton_metal_scrap') || [];

// 🚀 STATE KHUSUS MODERATOR & SECURITY
let isVaultLockdown = getSafeStorage('ton_vault_lockdown') || false;
let blacklistedUsers = getSafeStorage('ton_blacklisted_users') || [];
let savedProfiles = getSafeStorage('ton_all_profiles') || {}; 

let defaultCustomAccounts = {
  "xyroo": { pass: "Xyroo13", rank: "Moderator" },
  "xyro013": { pass: "Xyroo13", rank: "Don" },
  "nayi123": { pass: "nayi123", rank: "Bisnis" },
  "nayi12345": { pass: "nayi12345", rank: "Associates" },
};
// Ganti baris 54 dengan kode ini agar akun dari VS Code selalu terbaca:
let savedAccounts = getSafeStorage('ton_custom_accounts') || {};
let customAccounts = { ...savedAccounts, ...defaultCustomAccounts };

// DATA STOK MASTER TERINTEGRASI
let defaultInventory = [
  { name: "Pistol Kacang", cat: "weapon", badge: "NORMAL", desc: "Senjata api laras pendek standar untuk pertahanan diri.", price: 9000, base: 7500, stock: 15, img: "https://i.imgur.com/OTIXFQy.png", restricted: false },
  { name: "Pistol .50", cat: "weapon", badge: "NORMAL", desc: "Pistol kaliber berat dengan daya stopping power tinggi.", price: 12000, base: 10000, stock: 10, img: "https://i.imgur.com/Xsnv90s.png", restricted: false },
  { name: "Ceramic Pistol", cat: "weapon", badge: "NORMAL", desc: "Pistol berbahan keramik polimer, ringan dan taktis.", price: 34000, base: 28000, stock: 8, img: "https://i.imgur.com/wrBvHHx.png", restricted: false },
  { name: "Machine Pistol", cat: "weapon", badge: "NORMAL", desc: "Pistol otomatis dengan rate of fire sangat cepat.", price: 34000, base: 28000, stock: 8, img: "https://i.imgur.com/BWq6YCX.png", restricted: true },
  { name: "Micro SMG", cat: "weapon", badge: "NORMAL", desc: "Submachine gun berukuran ringkas untuk pertempuran jarak dekat.", price: 36000, base: 30000, stock: 10, img: "https://i.imgur.com/EulYM2J.png", restricted: true },
  { name: "Mini SMG", cat: "weapon", badge: "NORMAL", desc: "Senjata otomatis ringan dengan mobilitas tinggi.", price: 35000, base: 29000, stock: 10, img: "https://i.imgur.com/BnnY0we.png", restricted: true },
  { name: "X17 Modular", cat: "weapon", badge: "NORMAL", desc: "Senjata modifikasi modern dengan akurasi terjamin.", price: 39000, base: 32000, stock: 6, img: "https://i.imgur.com/cjFtTP5.png", restricted: true },
  { name: "Navy Revolver", cat: "weapon", badge: "NORMAL", desc: "Revolver klasik dengan kerusakan fatal per peluru.", price: 75000, base: 65000, stock: 5, img: "https://i.imgur.com/dKMVMTh.png", restricted: true },
  { name: "KVR / Vector", cat: "weapon", badge: "NORMAL", desc: "SMG taktis modern dengan recoil rendah dan fire rate tinggi.", price: 80000, base: 70000, stock: 5, img: "https://i.imgur.com/QeUQFT2.png", restricted: true },
  { name: "Double Action", cat: "weapon", badge: "COMING SOON", desc: "Revolver double action dengan mekanisme tembak cepat.", price: 0, base: 0, stock: 0, img: "https://i.imgur.com/xm9n8C1.png", restricted: true },
  { name: "Revolver Black", cat: "weapon", badge: "COMING SOON", desc: "Varian revolver hitam kustom eksklusif.", price: 0, base: 0, stock: 0, img: "https://i.imgur.com/1GymHIh.png", restricted: true },
  { name: "Assault Rifle", cat: "weapon", badge: "NORMAL", desc: "Senjata serbu standar untuk pertempuran skala besar.", price: 170000, base: 150000, stock: 3, img: "https://i.imgur.com/D5k6n0x.png", restricted: true },
  { name: "Carbine Rifle", cat: "weapon", badge: "COMING SOON", desc: "Senjata serbu laras sedang dengan akurasi jarak jauh yang sangat stabil.", price: 0, base: 0, stock: 0, img: "https://i.imgur.com/jMAOs0V.png", restricted: true },
  { name: "Pump Shotgun", cat: "weapon", badge: "NORMAL", desc: "Senjata laras panjang penetrasi tinggi untuk jarak dekat.", price: 71000, base: 60000, stock: 4, img: "https://i.imgur.com/1ypltGL.png", restricted: true },

  // ==========================================
  // 🎒 AMMUNITION (PELURU)
  // ==========================================
  { name: "Ammo 0.50", cat: "ammo", badge: "NORMAL", desc: "Peluru kaliber .50 untuk pistol berat.", price: 1500, base: 1000, stock: 50, img: "https://i.imgur.com/Y9ARS48.png", restricted: false },
  { name: "Ammo 380", cat: "ammo", badge: "NORMAL", desc: "Peluru standar kaliber .380.", price: 2000, base: 1400, stock: 50, img: "https://i.imgur.com/Y9ARS48.png", restricted: false },
  { name: "Ammo 44 Navy", cat: "ammo", badge: "NORMAL", desc: "Peluru khusus untuk Navy Revolver.", price: 5800, base: 4500, stock: 30, img: "https://i.imgur.com/Y9ARS48.png", restricted: false },
  { name: "Ammo 45Acp Vector", cat: "ammo", badge: "NORMAL", desc: "Peluru kaliber .45 ACP untuk SMG/Vector.", price: 5500, base: 4200, stock: 40, img: "https://i.imgur.com/Y9ARS48.png", restricted: false },
  { name: "Ammo 9mm", cat: "ammo", badge: "NORMAL", desc: "Peluru universal kaliber 9mm.", price: 4000, base: 3000, stock: 60, img: "https://i.imgur.com/Y9ARS48.png", restricted: false },
  { name: "Ammo Shotgun", cat: "ammo", badge: "NORMAL", desc: "Selongsong peluru sebar (shells) untuk Shotgun.", price: 5500, base: 4000, stock: 30, img: "https://i.imgur.com/Y9ARS48.png", restricted: false },
  { name: "Ammo Virtus/Carbine (5.56mm)", cat: "ammo", badge: "COMING SOON", desc: "Peluru senapan serbu kaliber 5.56mm.", price: 0, base: 0, stock: 0, img: "https://i.imgur.com/Y9ARS48.png", restricted: false },
  { name: "Ammo Assault Riffle (7.76mm)", cat: "ammo", badge: "NORMAL", desc: "Peluru senapan serbu kaliber berat 7.62/7.76mm.", price: 7000, base: 5500, stock: 25, img: "https://i.imgur.com/Y9ARS48.png", restricted: false },

  // ==========================================
  // 🦺 VEST (ARMOR / PELINDUNG BODY)
  // ==========================================
  { name: "Vest Merah 50%", cat: "vest", badge: "NORMAL", desc: "Rompi anti-peluru ringan dengan ketahanan armor 50%.", price: 2000, base: 1500, stock: 20, img: "https://i.imgur.com/fn4cyuc.png", restricted: false },
  { name: "Vest Biru 90%", cat: "vest", badge: "NORMAL", desc: "Rompi anti-peluru berat dengan ketahanan armor maksimal 90%.", price: 5000, base: 3800, stock: 15, img: "https://i.imgur.com/QB3dTtQ.png", restricted: false },

  // ==========================================
  // 💊 DRUGS (PRODUK JADI & BAHAN MENTAH)
  // ==========================================
  { name: "Weed Bag", cat: "durgs", badge: "NORMAL", desc: "Paket kanabis siap edar dalam kantong klip.", price: 400, base: 250, stock: 100, img: "https://i.imgur.com/pTSqAeZ.png", restricted: false },
  { name: "Meth Bag", cat: "durgs", badge: "NORMAL", desc: "Paket metamfetamin kristal kemasan klip.", price: 700, base: 450, stock: 80, img: "https://i.imgur.com/YOFVaFI.png", restricted: false },
  { name: "Cocaine Bag", cat: "durgs", badge: "NORMAL", desc: "Paket bubuk kokain murni kualitas tinggi.", price: 3000, base: 2200, stock: 50, img: "https://i.imgur.com/bexkxma.png", restricted: false },
  { name: "Poppy", cat: "durgs", badge: "NORMAL", desc: "Bahan mentah tanaman poppy untuk pengolahan medis/narkotika.", price: 25, base: 15, stock: 200, img: "https://i.imgur.com/wiqdJK7.png", restricted: false },
  { name: "Baggy", cat: "durgs", badge: "NORMAL", desc: "Plastik klip kemasan kosong untuk distribusi.", price: 65, base: 40, stock: 300, img: "https://i.imgur.com/3pwwEbl.png", restricted: false },
  { name: "Seed", cat: "durgs", badge: "NORMAL", desc: "Benih tanaman kualitas unggul siap tanam.", price: 900, base: 600, stock: 100, img: "https://i.imgur.com/cVQsd8E.png", restricted: false },
  { name: "Morphine", cat: "durgs", badge: "NORMAL", desc: "Cairan morfin medis penahan rasa sakit tingkat tinggi.", price: 1375, base: 1000, stock: 40, img: "https://i.imgur.com/oxYJEAA.png", restricted: false },
  { name: "Meth Set", cat: "durgs", badge: "NORMAL", desc: "Satu set perlengkapan bahan kimia untuk produksi Meth.", price: 1500, base: 1100, stock: 30, img: "https://i.imgur.com/TOkCerX.png", restricted: false },

  // ==========================================
  // 🔦 ATTACHMENTS (MODIFIKASI SENJATA)
  // ==========================================
  { name: "Tactical Flashlight", cat: "attachments", badge: "NORMAL", desc: "Senter taktis yang dipasang pada rail senjata untuk penerangan gelap.", price: 4500, base: 3500, stock: 15, img: "https://i.imgur.com/vBf8f4S.png", restricted: false },
  { name: "Extended Pistol Clip (ALL PISTOL)", cat: "attachments", badge: "NORMAL", desc: "Magasin tambahan kapasitas ekstra untuk semua jenis pistol.", price: 4500, base: 3500, stock: 15, img: "https://i.imgur.com/LTH8KGK.png", restricted: false },
  { name: "Grip ( SMG, Rifle )", cat: "attachments", badge: "NORMAL", desc: "pegangan bawah (foregrip) untuk mengurangi recoil SMG dan Rifle.", price: 4500, base: 3500, stock: 15, img: "https://i.imgur.com/Jne4ROG.png", restricted: false },
  { name: "Medium Scope (RIFLE, SNIPER)", cat: "attachments", badge: "NORMAL", desc: "Teropong bidik jarak menengah untuk senapan laras panjang.", price: 4500, base: 3500, stock: 15, img: "https://i.imgur.com/Zk2NBMz.png", restricted: false },
  { name: "Macro Scope ( SMG, Micro SMG, Rifle )", cat: "attachments", badge: "NORMAL", desc: "Teropong bidik optik jarak dekat/menengah.", price: 4500, base: 3500, stock: 15, img: "https://i.imgur.com/Y0SEBLH.png", restricted: false },
  { name: "Extended SMG Clip (SMG & Micro SMG)", cat: "attachments", badge: "NORMAL", desc: "Magasin kapasitas tambahan khusus untuk senjata jenis SMG.", price: 7500, base: 6000, stock: 12, img: "https://i.imgur.com/uyD5Xqx.png", restricted: false },
  { name: "Suppressor ( SMG / Rifle )", cat: "attachments", badge: "NORMAL", desc: "Peredam suara tembakan dan kilatan api untuk SMG dan Rifle.", price: 15000, base: 12000, stock: 10, img: "https://i.imgur.com/T5D2Mwf.png", restricted: false },
  { name: "Tactical Suppressor (Pistol 50, Micro SMG)", cat: "attachments", badge: "NORMAL", desc: "Peredam suara taktis untuk Pistol berat dan Micro SMG.", price: 15000, base: 12000, stock: 10, img: "https://i.imgur.com/MzqBRmy.png", restricted: false },
  { name: "SMG Drum ( SMG Only ! )", cat: "attachments", badge: "NORMAL", desc: "Magasin drum berkapasitas sangat besar khusus SMG standar.", price: 15000, base: 12000, stock: 8, img: "https://i.imgur.com/rGvvlm4.png", restricted: true },
  { name: "Extended Rifle Clip", cat: "attachments", badge: "NORMAL", desc: "Magasin panjang dengan jumlah peluru ekstra untuk Assault Rifle.", price: 22500, base: 18000, stock: 10, img: "https://i.imgur.com/DWpm83s.png", restricted: true },
  { name: "Rifle Drum", cat: "attachments", badge: "NORMAL", desc: "Magasin drum kapasitas maksimal untuk penembakan serbu berkelanjutan.", price: 30000, base: 24000, stock: 5, img: "https://i.imgur.com/Jheijpv.png", restricted: true },

  // ==========================================
  // 🛠️ TOOLS HEIST (PERALATAN PERAMPOKAN & TEKNIS)
  // ==========================================
  { name: "Lockpick", cat: "tool-heist", badge: "NORMAL", desc: "Alat pembuka kunci pintu atau kendaraan secara paksa.", price: 3500, base: 2500, stock: 30, img: "https://i.imgur.com/c6ojdKu.png", restricted: false },
  { name: "Tablet", cat: "tool-heist", badge: "NORMAL", desc: "Perangkat elektronik portabel untuk meretas jaringan keamanan.", price: 4500, base: 3500, stock: 20, img: "https://i.imgur.com/f0YkRoN.png", restricted: false },
  { name: "Oxygen Tank", cat: "tool-heist", badge: "NORMAL", desc: "Tabung oksigen menyelam untuk melarikan diri atau infiltrasi bawah air.", price: 7000, base: 5500, stock: 15, img: "https://i.imgur.com/ECzHxF4.png", restricted: false },
  { name: "Thermite", cat: "tool-heist", badge: "NORMAL", desc: "Bahan pembakar bersuhu tinggi untuk melelehkan gembok atau engsel besi berat.", price: 8000, base: 6000, stock: 15, img: "https://i.imgur.com/aYTqAOk.png", restricted: true },
  { name: "Hack USB", cat: "tool-heist", badge: "NORMAL", desc: "Perangkat USB berisi virus eksploitase untuk membypass sistem server.", price: 8500, base: 6500, stock: 15, img: "https://i.imgur.com/DXpFHHN.png", restricted: true },
  { name: "Spoofing Card", cat: "tool-heist", badge: "NORMAL", desc: "Kartu akses duplikat untuk mengecoh scanner pintu elektronik gedung.", price: 8500, base: 6500, stock: 15, img: "https://i.imgur.com/7paPVIX.png", restricted: true },
  { name: "Signal Booster", cat: "tool-heist", badge: "NORMAL", desc: "Penguat sinyal untuk mempercepat pengunduhan data atau remote bypass.", price: 8500, base: 6500, stock: 15, img: "https://i.imgur.com/RKSNCIK.png", restricted: true },
  { name: "Angle Grinder", cat: "tool-heist", badge: "NORMAL", desc: "Gerinda pemotong berkecepatan tinggi untuk memotong teralis atau brankas kecil.", price: 9000, base: 7000, stock: 10, img: "https://i.imgur.com/nTS8u1g.png", restricted: true },
  { name: "Explosive", cat: "tool-heist", badge: "NORMAL", desc: "Bahan peledak standar untuk menghancurkan barikade atau pintu brankas.", price: 9000, base: 7000, stock: 10, img: "https://i.imgur.com/1hAby9b.png", restricted: true },
  { name: "Small Drill", cat: "tool-heist", badge: "NORMAL", desc: "Bor mekanik ringkas untuk membongkar kotak deposit (Safety Deposit Box).", price: 9500, base: 7500, stock: 10, img: "https://i.imgur.com/3xThtv7.png", restricted: true },
  { name: "Plasma Cutter", cat: "tool-heist", badge: "NORMAL", desc: "Alat pemotong laser plasma untuk menembus baja berlapis tebal dengan senyap.", price: 11000, base: 8500, stock: 8, img: "https://i.imgur.com/gxbin5V.png", restricted: true },
  { name: "Large Drill", cat: "tool-heist", badge: "NORMAL", desc: "Bor industri kelas berat untuk melubangi pintu utama brankas bank.", price: 11000, base: 8500, stock: 8, img: "https://i.imgur.com/JTYOD0S.png", restricted: true },
  { name: "C4 Explosive", cat: "tool-heist", badge: "NORMAL", desc: "Peledak plastik C4 berdaya hancur masif dengan detonator jarak jauh.", price: 11000, base: 8500, stock: 8, img: "https://i.imgur.com/RmxTOqC.png", restricted: true },
  { name: "Hacking Device", cat: "tool-heist", badge: "NORMAL", desc: "Komputer peretas khusus (Brute-Force Device) untuk menembus keamanan tingkat tinggi.", price: 15000, base: 12000, stock: 5, img: "https://i.imgur.com/EJ2qNS2.png", restricted: true }
];

let _savedInv = getSafeStorage('ton_vault_inventory');
let vaultInventory = (_savedInv && Array.isArray(_savedInv) && _savedInv.length > 0) ? _savedInv : defaultInventory;

// DATA VOUCHER PERSISTEN
let defaultVouchers = [
  { code: 'TON2026', type: 'percent', val: 15, allowed: 'don_tier', active: false, expiresAt: null, desc: 'Diskon Spesial 15% untuk Petinggi TON' },
  { code: 'OLDNORSE', type: 'nominal', val: 50000, allowed: 'don_tier', active: false, expiresAt: null, desc: 'Potongan Tunai $50,000 Petinggi' }
];

let _savedVouch = getSafeStorage('ton_vouchers');
let syndVouchers = (_savedVouch && Array.isArray(_savedVouch) && _savedVouch.length > 0) ? _savedVouch : defaultVouchers;

function getSafeStorage(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
}

function saveAppData() {
  const allData = {
    adminTransactions: typeof adminTransactions !== 'undefined' ? adminTransactions : [],
    orgLeaderboard: typeof orgLeaderboard !== 'undefined' ? orgLeaderboard : [],
    vaultInventory: typeof vaultInventory !== 'undefined' ? vaultInventory : [],
    vaultBalance: typeof vaultBalance !== 'undefined' ? vaultBalance : 0,
    syndVouchers: typeof syndVouchers !== 'undefined' ? syndVouchers : [],
    metalScrapLogs: typeof metalScrapLogs !== 'undefined' ? metalScrapLogs : [],
    customAccounts: typeof customAccounts !== 'undefined' ? customAccounts : {},
    stockProofLogs: typeof stockProofLogs !== 'undefined' ? stockProofLogs : [],
    isVaultLockdown: typeof isVaultLockdown !== 'undefined' ? isVaultLockdown : false,
    blacklistedUsers: typeof blacklistedUsers !== 'undefined' ? blacklistedUsers : [],
    savedProfiles: typeof savedProfiles !== 'undefined' ? savedProfiles : {}
  };

  if (typeof db !== 'undefined' && db) {
    db.ref('ton_global_state').set(allData).catch(err => console.warn(err));
  }

  try {
    localStorage.setItem('ton_global_state', JSON.stringify(allData));
  } catch (e) {}
}

  // 2. Simpan cadangan ke Memori Lokal (Fallback)
  try {
    localStorage.setItem('ton_global_state', JSON.stringify(allData));
    // Simpan juga eceran untuk berjaga-jaga jika kode asli Anda membutuhkannya
    localStorage.setItem('ton_admin_transactions', JSON.stringify(allData.adminTransactions));
    localStorage.setItem('ton_vault_inventory', JSON.stringify(allData.vaultInventory));
    localStorage.setItem('ton_all_profiles', JSON.stringify(allData.savedProfiles));
  } catch (e) {
    console.warn("Memori lokal browser penuh atau terblokir.");
  }

// ============================================================================
// ☁️ ENGINE SINKRONISASI FIREBASE REAL-TIME (ANTI-OVERWRITE)
// ============================================================================
let isFirebaseSynced = false; // GEMBOK PELINDUNG

function initCloudRealtimeSync() {
  if (!db) {
    const backup = getSafeStorage('ton_global_state');
    if (backup) applyGlobalState(backup);
    isFirebaseSynced = true;
    return;
  }
  
  db.ref('ton_global_state').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      applyGlobalState(data);
    }
    isFirebaseSynced = true; // KUNCI DIBUKA: Menandakan data awan sudah sukses ditarik!
    if (typeof refreshAllUIDisplays === 'function') refreshAllUIDisplays();
  });
}

function applyGlobalState(data) {
    if (!data) return;
    adminTransactions = data.adminTransactions || [];
    orgLeaderboard = data.orgLeaderboard || [];
    if (data.vaultInventory && data.vaultInventory.length > 0) vaultInventory = data.vaultInventory;
    vaultBalance = data.vaultBalance || 0;
    if (data.syndVouchers && data.syndVouchers.length > 0) syndVouchers = data.syndVouchers;
    metalScrapLogs = data.metalScrapLogs || [];
    
    if (typeof defaultCustomAccounts !== 'undefined') {
        customAccounts = data.customAccounts ? { ...defaultCustomAccounts, ...data.customAccounts } : defaultCustomAccounts;
    } else {
        customAccounts = data.customAccounts || {};
    }
    
    stockProofLogs = data.stockProofLogs || [];
    isVaultLockdown = data.isVaultLockdown || false;
    blacklistedUsers = data.blacklistedUsers || [];
    
    // ========================================================================
    // 🔥 SISTEM ANTI-BUG ANGKA & AUTO-SINKRONISASI (MEMAKSA MUNCUL DI ROSTER)
    // ========================================================================
    let rawProfiles = data.savedProfiles || {};
    savedProfiles = {}; // Bersihkan memori dan bangun ulang dengan benar
    
    // 1. Ekstrak data mentah Firebase (Bypass bug jika Firebase mengubahnya jadi Array)
    Object.keys(rawProfiles).forEach(key => {
        const p = rawProfiles[key];
        if (p && typeof p === 'object' && p.name) {
            const safeKey = p.name.toLowerCase();
            savedProfiles[safeKey] = p;
        }
    });

    // 2. SINKRONISASI PAKSA: Semua Akun di 'Account Manage' WAJIB MUNCUL di Roster
    if (customAccounts) {
        Object.keys(customAccounts).forEach(acc => {
            const safeAcc = acc.toLowerCase();
            // Jika akun ada di Login tapi hilang di Roster, buatkan KTP-nya secara otomatis!
            if (safeAcc && !savedProfiles[safeAcc]) {
                savedProfiles[safeAcc] = {
                    name: acc.toUpperCase(),
                    job: customAccounts[acc].rank || 'Soldiers',
                    groupType: 'Family',
                    phone: '0812-XXXX',
                    idcard: 'TON-' + Math.floor(1000 + Math.random()*9000)
                };
            }
        });
    }

    if (typeof checkAndApplyRankChanges === 'function') checkAndApplyRankChanges();
}

function refreshAllUIDisplays() {
  if (typeof updateDashboardData === 'function') updateDashboardData();
  if (typeof renderMarketplace === 'function') renderMarketplace(currentMarketplaceFilter);
  if (typeof renderVaultInventory === 'function') renderVaultInventory();
  if (typeof renderTxProcessTable === 'function') renderTxProcessTable(true);
  if (typeof renderReleaseOutstanding === 'function') renderReleaseOutstanding();
  if (typeof renderVaultHistory === 'function') renderVaultHistory();
  if (typeof renderLeaderboard === 'function') renderLeaderboard();
  if (typeof renderTonCatalog === 'function') renderTonCatalog();
  if (typeof renderBlacklistTable === 'function') renderBlacklistTable();
  if (typeof renderStaffKPITable === 'function') renderStaffKPITable();
  if (typeof updateLockdownUI === 'function') updateLockdownUI();
  if (typeof renderCartPageUI === 'function') renderCartPageUI();
  if (typeof renderCustomAccountsTable === 'function') renderCustomAccountsTable();
  if (typeof renderProfilePage === 'function') renderProfilePage();
}

// ==========================================
// ⚡ TOAST NOTIFICATION ENGINE
// ==========================================
function showToast(title, message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const isError = type === 'error';
  const borderCol = isError ? 'border-red-600 bg-red-950/90 text-red-200 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-emerald-500 bg-[#13151b]/95 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]';
  const iconName = isError ? 'alert-triangle' : 'check-circle-2';
  const iconColor = isError ? 'text-red-500 animate-pulse' : 'text-emerald-400';

  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border ${borderCol} backdrop-blur-md transform translate-y-5 opacity-0 transition-all duration-300 font-tech z-[200] min-w-[280px] max-w-sm shadow-xl`;
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-5 h-5 shrink-0 ${iconColor}"></i>
    <div class="flex-grow">
      <h4 class="font-bold text-xs uppercase tracking-wider text-white">${title}</h4>
      <p class="text-[11px] font-sans text-zinc-300">${message}</p>
    </div>
  `;

  container.appendChild(toast);
  if (typeof lucide !== 'undefined') lucide.createIcons();

  setTimeout(() => {
    toast.classList.remove('translate-y-5', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-5', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================
// 🚨 CUSTOM CONFIRM MODAL ENGINE
// ==========================================
let confirmCallback = null;
function showCustomConfirm(title, message, onYes) {
  const backdrop = document.getElementById('custom-confirm-backdrop');
  const box = document.getElementById('custom-confirm-box');
  const titleElem = document.getElementById('custom-confirm-title');
  const msgElem = document.getElementById('custom-confirm-message');
  const btnYes = document.getElementById('custom-confirm-btn-yes');

  if (!backdrop || !box || !btnYes) {
    if (confirm(message)) onYes();
    return;
  }

  titleElem.innerText = title || "KONFIRMASI TINDAKAN";
  msgElem.innerText = message || "Apakah Anda yakin ingin melanjutkan?";
  confirmCallback = onYes;

  btnYes.onclick = () => {
    closeCustomConfirm();
    if (typeof confirmCallback === 'function') confirmCallback();
  };

  backdrop.classList.remove('hidden');
  setTimeout(() => {
    box.classList.remove('scale-95', 'opacity-0');
    box.classList.add('scale-100', 'opacity-100');
  }, 10);
}

function closeCustomConfirm() {
  const backdrop = document.getElementById('custom-confirm-backdrop');
  const box = document.getElementById('custom-confirm-box');
  if (backdrop && box) {
    box.classList.remove('scale-100', 'opacity-100');
    box.classList.add('scale-95', 'opacity-0');
    setTimeout(() => backdrop.classList.add('hidden'), 200);
  }
}

// ==========================================
// 👑 RBAC HIERARCHY HELPER
// ==========================================
function getUserRank() {
  const savedProfiles = getSafeStorage('ton_all_profiles') || {};
  const prof = savedProfiles[currentLoggedInUser] || {};
  return prof.job || currentUserRole || 'Soldiers';
}

function isTopAdmin(rank) { return ['Admin', 'Moderator'].includes(rank); }
function isDonTier(rank) { return ['Admin', 'Moderator', 'Don', 'Underboss'].includes(rank); }
function isBisnisTier(rank) { return ['Admin', 'Moderator', 'Don', 'Underboss', 'Bisnis'].includes(rank); }
function isReadOnlyAdminTier(rank) { return ['Capo', 'Captain', 'Consigliere'].includes(rank); }
function canViewAdminPanel(rank) { return isBisnisTier(rank) || isReadOnlyAdminTier(rank); }
function isAssociate(rank) { return rank === 'Associates'; }

function updateRBACUI() {
  const rank = getUserRank();
  
  document.querySelectorAll('.admin-only').forEach(el => {
    if (canViewAdminPanel(rank)) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });

  document.querySelectorAll('.mod-only').forEach(el => {
    if (rank === 'Moderator') el.classList.remove('hidden');
    else el.classList.add('hidden');
  });

  const navHq = document.getElementById('nav-group-hq');
  if (navHq) {
    if (isAssociate(rank)) navHq.classList.add('hidden');
    else navHq.classList.remove('hidden');
  }

  const isWritable = isBisnisTier(rank);
  const invBar = document.getElementById('inventory-action-bar');
  const outBar = document.getElementById('outstanding-action-bar');
  const proofBar = document.getElementById('proof-action-bar');
  const scrapBar = document.getElementById('scrap-action-bar');

  if (invBar) invBar.style.display = isWritable ? 'flex' : 'none';
  if (outBar) outBar.style.display = isWritable ? 'flex' : 'none';
  if (proofBar) proofBar.style.display = isWritable ? 'flex' : 'none';
  if (scrapBar) scrapBar.style.display = isWritable ? 'flex' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  checkDiscordOAuthResponse();

  // TAMBAHKAN BARIS INI:
  initCloudRealtimeSync();

  const discordLoginBtn = document.getElementById('discord-login-btn');
  if (discordLoginBtn) discordLoginBtn.addEventListener('click', handleDiscordLogin);

  const authForm = document.getElementById('auth-form');
  if (authForm) authForm.addEventListener('submit', handleAuthLogin);

  const promoInput = document.getElementById('promo-code-input');
  if (promoInput) {
    promoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); applyPromoCode(); }
    });
  }

  const savedSession = getSafeStorage('ton_current_session');
  if (savedSession && savedSession.name && savedSession.role) {
    initSession(savedSession.role, savedSession.name, false);
  }

  renderCartPageUI(); updateDashboardData(); renderLeaderboard();
  renderMarketplace(); renderTxProcessTable(); renderVaultInventory();
  renderReleaseOutstanding(); renderVaultHistory(); renderStockProofHistory();
  renderProofThumbnails(); renderMetalScrapLogs(); renderVoucherManager();
  
  updateLockdownUI();
  renderBlacklistTable();
  renderStaffKPITable();
});

function toggleMenu(menuId, iconId) {
  const menu = document.getElementById(menuId);
  const icon = document.getElementById(iconId);
  if (menu) {
    menu.classList.toggle('hidden');
    if (icon) icon.classList.toggle('rotate-180');
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('hidden');
  }
}

// ==========================================
// WEBHOOK DISCORD DENGAN DUKUNGAN MULTIPART FILE
// ==========================================
function sendDiscordWebhook(targetUrl, title, description, fields = [], color = 15158332, thumbnailUrl = null, rawFiles = []) {
  const embedData = {
    title: "🛡️ TON SYSTEM | " + title,
    description: description || "System Notification",
    color: color,
    fields: fields.map(f => ({
      name: String(f.name || "Field").substring(0, 256),
      value: String(f.value || "-").substring(0, 1024),
      inline: Boolean(f.inline)
    })),
    footer: { text: "The Old Norse Armory System" },
    timestamp: new Date().toISOString()
  };

  if (thumbnailUrl && typeof thumbnailUrl === 'string' && thumbnailUrl.startsWith('http') && !thumbnailUrl.includes('.svg')) {
    embedData.image = { url: thumbnailUrl };
  }

  if (rawFiles && Array.isArray(rawFiles) && rawFiles.length > 0) {
    const formData = new FormData();
    const base64Data = rawFiles[0];
    if (base64Data.startsWith('data:image')) {
      const arr = base64Data.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) { u8arr[n] = bstr.charCodeAt(n); }
      const fileBlob = new Blob([u8arr], { type: mime });
      
      formData.append('file[0]', fileBlob, 'ton_upload_image.png');
      embedData.image = { url: 'attachment://ton_upload_image.png' };
    }
    formData.append('payload_json', JSON.stringify({ embeds: [embedData] }));
    fetch(targetUrl, { method: "POST", body: formData })
      .catch(err => console.error("Webhook Multipart Error:", err));
  } else {
    fetch(targetUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ embeds: [embedData] }) })
      .catch(err => console.error("Webhook Error:", err));
  }
}

function handleDiscordLogin() {
  if (DISCORD_CLIENT_ID === "MASUKKAN_CLIENT_ID_DISCORD_DISINI" || TON_SERVER_ID === "MASUKKAN_ID_SERVER_TON_DISINI") {
    showToast("CONFIG ERROR", "Harap masukkan Client ID dan Server ID Discord terlebih dahulu!", "error");
    return;
  }
  window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify%20guilds`;
}

function checkDiscordOAuthResponse() {
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];
  if (accessToken) {
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    verifyUserDiscordAccount(tokenType, accessToken);
  }
}

async function verifyUserDiscordAccount(tokenType, accessToken) {
  try {
    const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', { headers: { authorization: `${tokenType} ${accessToken}` } });
    const guilds = await guildsRes.json();
    const isInTonServer = Array.isArray(guilds) && guilds.some(guild => guild.id === TON_SERVER_ID);

    if (!isInTonServer) {
      sendDiscordWebhook(LOGS_WEBHOOK_URL, "🚨 ACCESS BLOCKED", `Seseorang mencoba login ke Web TON tapi **TIDAK TERDAFTAR** di Server Discord TON!`, [], 15158332);
      triggerBlockedModal(); return;
    }

    const userRes = await fetch('https://discord.com/api/users/@me', { headers: { authorization: `${tokenType} ${accessToken}` } });
    const user = await userRes.json();
    const discordUsername = user.username;

    if (blacklistedUsers.includes(discordUsername.toLowerCase())) {
      sendDiscordWebhook(LOGS_WEBHOOK_URL, "🚨 BLACKLISTED DISCORD LOGIN ATTEMPT", `Akun ter-blacklist **${discordUsername}** mencoba login ke brangkas via Discord!`, [], 15158332);
      showToast("ACCOUNT FROZEN", "Akun Discord Anda masuk dalam daftar Blacklist brangkas!", "error");
      triggerBlockedModal();
      return;
    }

    const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(discordUsername)}`;

    const savedProfiles = getSafeStorage('ton_all_profiles') || {};
    if (!savedProfiles[discordUsername]) {
      savedProfiles[discordUsername] = { name: user.global_name || discordUsername, phone: '-', idcard: 'TON-' + Math.floor(1000 + Math.random() * 9000), job: 'Soldiers', avatar: avatarUrl, groupType: 'Family' };
      localStorage.setItem('ton_all_profiles', JSON.stringify(savedProfiles));
    } else if (!savedProfiles[discordUsername].avatar || savedProfiles[discordUsername].avatar.includes('dicebear')) {
      savedProfiles[discordUsername].avatar = avatarUrl;
      localStorage.setItem('ton_all_profiles', JSON.stringify(savedProfiles));
    }

    initSession(savedProfiles[discordUsername].job || 'Soldiers', discordUsername, true);
    showToast("WELCOME", `Selamat datang, ${user.global_name || discordUsername}! Verifikasi keanggotaan berhasil.`, "success");
  } catch (error) {
    console.error("Gagal verifikasi Discord:", error);
    showToast("NETWORK ERROR", "Terjadi kesalahan jaringan saat memverifikasi akun Discord.", "error");
  }
}

function handleAuthLogin(e) {
  if (e) e.preventDefault();

  const user = document.getElementById('auth-username')?.value.trim();
  const pass = document.getElementById('auth-passcode')?.value.trim();
  
  if (!user || !pass) {
      if (typeof showToast === 'function') showToast("WARNING", "Username dan Password wajib diisi!", "error");
      return;
  }

  // Deklarasi HANYA SATU KALI di sini
  const lowerUser = user.toLowerCase();

  // Pastikan variabel siap
  if (typeof blacklistedUsers === 'undefined') window.blacklistedUsers = [];
  if (typeof customAccounts === 'undefined') window.customAccounts = {};
  if (typeof savedProfiles === 'undefined') window.savedProfiles = {};

  if (blacklistedUsers.includes(lowerUser)) {
    if (typeof showToast === 'function') showToast("ACCOUNT FROZEN", "Akun Anda dibekukan (Blacklist)!", "error");
    if (typeof triggerBlockedModal === 'function') triggerBlockedModal();
    return;
  }

  let finalRank = '';
  let isValidLogin = false;

  // 1. CEK AKUN CUSTOM
  if (customAccounts[lowerUser] && customAccounts[lowerUser].pass === pass) {
    finalRank = customAccounts[lowerUser].rank;
    isValidLogin = true;
  } 
  // 2. CEK LOGIN DEFAULT
  else if (pass === 'admin123' || pass === 'xxx123') {
    finalRank = 'Soldiers';
    if (lowerUser === 'admin' || lowerUser === 'xxx') finalRank = 'Admin';
    else if (lowerUser === 'moderator') finalRank = 'Moderator';
    else if (lowerUser === 'don') finalRank = 'Don';
    else if (lowerUser === 'underboss') finalRank = 'Underboss';
    else if (lowerUser === 'bisnis') finalRank = 'Bisnis';
    else if (lowerUser === 'associates') finalRank = 'Associates';
    isValidLogin = true;
  }

  if (isValidLogin) {
    // Sinkronkan selalu dengan Roster terbaru agar rank tidak keriset
    if (savedProfiles[lowerUser] && savedProfiles[lowerUser].job) {
        finalRank = savedProfiles[lowerUser].job;
    } else if (savedProfiles[user] && savedProfiles[user].job) {
        finalRank = savedProfiles[user].job;
    } else {
        savedProfiles[lowerUser] = { 
            name: user.toUpperCase(), 
            phone: '0812-XXXX', 
            idcard: 'TON-' + Math.floor(1000 + Math.random()*9000), 
            job: finalRank, 
            avatar: '', 
            groupType: 'Family' 
        };
    }
    
    if (typeof saveAppData === 'function') saveAppData(); 
    if (typeof initSession === 'function') initSession(finalRank, user, true);
    return;
  }

  // Jika gagal login
  if (typeof triggerBlockedModal === 'function') triggerBlockedModal();
}

  let finalRank = '';
  let isValidLogin = false;
  const lowerUser = user ? user.toLowerCase() : '';

  // 1. CEK AKUN CUSTOM
  if (customAccounts[lowerUser] && customAccounts[lowerUser].pass === pass) {
    finalRank = customAccounts[lowerUser].rank;
    isValidLogin = true;
  } 
  // 2. CEK LOGIN DEFAULT
  else if (pass === 'admin123' || pass === 'xxx123') {
    finalRank = 'Soldiers';
    if (lowerUser === 'admin' || lowerUser === 'xxx') finalRank = 'Admin';
    else if (lowerUser === 'moderator') finalRank = 'Moderator';
    else if (lowerUser === 'don') finalRank = 'Don';
    else if (lowerUser === 'underboss') finalRank = 'Underboss';
    else if (lowerUser === 'bisnis') finalRank = 'Bisnis';
    else if (lowerUser === 'associates') finalRank = 'Associates';
    isValidLogin = true;
  }

  if (isValidLogin) {
    // Sinkronkan selalu dengan Roster terbaru agar rank tidak keriset
    if (savedProfiles[user] && savedProfiles[user].job) {
        finalRank = savedProfiles[user].job;
    } else {
        savedProfiles[user] = { 
            name: user.toUpperCase(), 
            phone: '0812-XXXX', 
            idcard: 'TON-' + Math.floor(1000 + Math.random()*9000), 
            job: finalRank, 
            avatar: '', 
            groupType: 'Family' 
        };
    }
    
    if (typeof saveAppData === 'function') saveAppData(); 
    if (typeof initSession === 'function') initSession(finalRank, user, true);
  }

  // Jika gagal login (salah password)
  if (typeof triggerBlockedModal === 'function') triggerBlockedModal();
}

  // 1. CEK AKUN CUSTOM DARI ACCOUNT MANAGE
  if (typeof customAccounts !== 'undefined' && customAccounts[lowerUser] && customAccounts[lowerUser].pass === pass) {
    let finalRank = customAccounts[lowerUser].rank;

    // Sinkronkan selalu dengan Roster terbaru
    if (typeof savedProfiles !== 'undefined') {
        if (savedProfiles[user] && savedProfiles[user].job) finalRank = savedProfiles[user].job;
        if (!savedProfiles[user]) {
          savedProfiles[user] = { name: user.toUpperCase(), phone: '0812-XXXX', idcard: 'TON-' + Math.floor(1000 + Math.random()*9000), job: finalRank, avatar: '', groupType: 'Family' };
        } else {
          savedProfiles[user].job = finalRank; 
        }
    }
    
    saveAppData(); 
    if (typeof initSession === 'function') initSession(finalRank, user, true);
  }
  
  // 2. CEK LOGIN DEFAULT / BAWAAN SISTEM
  if (pass === 'admin123' || pass === 'xxx123') {
    let finalRank = 'Soldiers';
    if (lowerUser === 'admin' || lowerUser === 'xxx') finalRank = 'Admin';
    else if (lowerUser === 'moderator') finalRank = 'Moderator';
    else if (lowerUser === 'don') finalRank = 'Don';
    else if (lowerUser === 'underboss') finalRank = 'Underboss';
    else if (lowerUser === 'bisnis') finalRank = 'Bisnis';
    else if (lowerUser === 'associates') finalRank = 'Associates';

    if (typeof savedProfiles !== 'undefined') {
        if (savedProfiles[user] && savedProfiles[user].job) finalRank = savedProfiles[user].job;
        if (!savedProfiles[user]) {
          savedProfiles[user] = { name: user.toUpperCase(), phone: '0812-XXXX', idcard: 'TON-' + Math.floor(1000 + Math.random()*9000), job: finalRank, avatar: '', groupType: 'Family' };
        } else {
          savedProfiles[user].job = finalRank; 
        }
    }

    saveAppData(); 
    if (typeof initSession === 'function') initSession(finalRank, user, true);
  }

  if (typeof triggerBlockedModal === 'function') triggerBlockedModal();



function triggerBlockedModal() { document.getElementById('blocked-modal')?.classList.remove('hidden'); }
function closeBlockedModal() { document.getElementById('blocked-modal')?.classList.add('hidden'); }

// ==========================================
// 🔐 INIT SESSION & SWITCH TAB
// ==========================================
function initSession(role, name, sendLog = true) {
  if (blacklistedUsers.includes((name || '').toLowerCase())) {
    showToast("ACCOUNT FROZEN", "Akun Anda telah dibekukan (Blacklist)! Anda tidak diizinkan mengakses sistem.", "error");
    triggerBlockedModal();
    localStorage.removeItem('ton_current_session');
    return;
  }

  currentLoggedInUser = name;
  currentUserRole = role;
  localStorage.setItem('ton_current_session', JSON.stringify({ role, name }));

  document.getElementById('auth-gate').classList.add('hidden');
  document.getElementById('main-app').classList.remove('hidden');
  document.getElementById('user-display-name').innerText = name.toUpperCase();
  
  const roleElem = document.getElementById('user-role-text');
  if (roleElem) {
    roleElem.innerText = role.toUpperCase();
    roleElem.className = "text-[9px] font-bold font-tech tracking-wider uppercase mt-0.5 px-1.5 py-0.5 rounded inline-block border ";
    if (isTopAdmin(role)) roleElem.className += "bg-red-950 text-red-400 border-red-800";
    else if (role === 'Don' || role === 'Underboss') roleElem.className += "bg-amber-950 text-amber-400 border-amber-800";
    else if (canViewAdminPanel(role)) roleElem.className += "bg-purple-950 text-purple-400 border-purple-800";
    else if (role === 'Soldiers') roleElem.className += "bg-blue-950 text-blue-400 border-blue-800";
    else roleElem.className += "bg-zinc-800 text-zinc-400 border-zinc-700";
  }

  updateRBACUI();

  if (sendLog) {
    sendDiscordWebhook(LOGS_WEBHOOK_URL, "SYSTEM LOGIN LOG", `User **${name}** terautentikasi ke sistem.`, [{ name: "Role Access", value: role.toUpperCase(), inline: true }], isTopAdmin(role) ? 15105570 : 3066993);
    showToast("SYSTEM READY", `Successfully logged in as ${role.toUpperCase()}.`, "success");
  }

  if (isAssociate(role)) switchTab('weapon-shop');
  else switchTab('admin-dashboard');
  
  renderCartPageUI(); updateDashboardData(); renderProfilePage(); renderTonCatalog();
}

function logout() {
  sendDiscordWebhook(LOGS_WEBHOOK_URL, "USER LOGOUT", `Pengguna **${currentLoggedInUser}** telah logout.`, [], 10181046);
  localStorage.removeItem('ton_current_session');
  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('auth-gate').classList.remove('hidden');
  showToast("LOGOUT", "You have logged out of the session.", "error");
}

function getLucideIconForSubmenu(tabId) {
  const iconMap = {
    'weapon-shop': 'shopping-bag',
    'my-orders': 'shopping-cart',
    'admin-dashboard': 'layout-dashboard',
    'transaction-process': 'clipboard-check',
    'vault-stock': 'box',
    'release-outstanding': 'file-text',
    'vault-history': 'history',
    'stock-proof': 'camera',
    'metal-scrap': 'cpu',
    'the-old-norse': 'users',
    'profile': 'user',
    'voucher-manager': 'ticket',
    'account-manager': 'key',
    'blacklist-manager': 'shield-alert'
  };
  return iconMap[tabId] || 'circle';
}

function switchTab(tabId) {
  if (blacklistedUsers.includes((currentLoggedInUser || '').toLowerCase())) {
    logout();
    showToast("ACCOUNT FROZEN", "Sesi dihentikan! Akun Anda baru saja dibekukan oleh Moderator.", "error");
    triggerBlockedModal();
    return;
  }

  const rank = getUserRank();
  const adminOnlyTabs = ['transaction-process', 'vault-stock', 'release-outstanding', 'vault-history', 'stock-proof', 'metal-scrap'];
  
  if (adminOnlyTabs.includes(tabId) && !canViewAdminPanel(rank)) {
    showToast("ACCESS DENIED", "The Vault & TON Management area is CONFIDENTIAL!", "error");
    switchTab('weapon-shop'); return;
  }

  if ((tabId === 'voucher-manager' || tabId === 'account-manager' || tabId === 'blacklist-manager') && rank !== 'Moderator') {
    showToast("ACCESS DENIED", "This feature is EXCLUSIVE to the Moderator rank!", "error");
    switchTab('weapon-shop'); return;
  }

  if (tabId === 'admin-dashboard' && isAssociate(rank)) {
    showToast("ACCESS DENIED", "Rank Associates does not have permission to access the dashboard..", "error");
    switchTab('weapon-shop'); return;
  }

  const allNavButtons = document.querySelectorAll('.nav-btn');
  allNavButtons.forEach(btn => {
    const targetTab = btn.getAttribute('data-tab');
    const iconName = getLucideIconForSubmenu(targetTab);
    btn.className = "nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition text-xs list-none";
    
    let iconEl = btn.querySelector('[data-lucide]');
    if (!iconEl) {
      btn.insertAdjacentHTML('afterbegin', `<i data-lucide="${iconName}" class="w-4 h-4 shrink-0"></i>`);
    } else {
      iconEl.setAttribute('data-lucide', iconName);
    }
  });

  const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
  if (activeBtn) {
    activeBtn.className = "nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white font-bold bg-white/10 transition shadow-sm text-xs list-none";
  }

  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
  const titleMap = {
    'weapon-shop': ['Marketplace Armory', 'Order weaponry and complete the transaction live at the checkout terminal.'],
    'my-orders': ['Processing Order', 'Your order process and history.'],
    'admin-dashboard': ['Dashboard', 'A detailed summary of the identity, rank, and vault operations of The Old Norse.'],
    'transaction-process': ['Resident Order Processing', 'Review, approve, or reject incoming orders from residents.'],
    'vault-stock': ['Catalog Inventory', 'Manage inventory items and selling prices, and monitor safe stock levels.'],
    'release-outstanding': ['Release Held Balance', 'Manage transactions where stock has already been deducted, pending final settlement to the vault balance.'],
    'vault-history': ['Cash Flow History Archive', 'A complete history of all incoming and outgoing transactions for The Old Norse.'],
    'stock-proof': ['Upload Stock Photo Proof', 'Attach a screenshot of the stock inventory to validate the database log sent to Discord.'],
    'metal-scrap': ['Metal Scrap Inventory & Log', 'Official records of scrap metal intake and usage for crafting purposes.'],
    'the-old-norse': ['List Roster The Old Norse', 'List of official internal and family members of The Old Norse.'],
    'profile': ['IC Character Profile', 'Detailed information regarding resident identity, population registration number, and occupation.'],
    'voucher-manager': ['Syndicate Voucher Manager', 'Manage, activate, and set quotas for discount promo codes for weaponry.'],
    'account-manager': ['Account Login Credentials', 'Create and manage custom login username and password combinations for senior staff.'],
    'blacklist-manager': ['Account Blacklist & Freeze Control', 'Manage the blacklist and freeze the accounts of residents who violate IC/OOC rules.']
  };
  const info = titleMap[tabId] || [tabId.toUpperCase(), 'Dynamic Vault System'];
  document.getElementById('view-title').innerHTML = `<i data-lucide="${tabId === 'admin-dashboard' ? 'layout-dashboard' : 'box'}" class="w-5 h-5 text-amber-400 inline"></i> ` + info[0];
  document.getElementById('view-subtitle').innerText = info[1];

  const target = document.getElementById('tab-' + tabId);
  if (target) target.classList.remove('hidden');
  
  const floatCartBtn = document.getElementById('floating-cart-btn');
  if (floatCartBtn) {
    if (tabId === 'weapon-shop') {
      floatCartBtn.style.display = 'flex';
    } else {
      floatCartBtn.style.display = 'none';
    }
  }

  if (tabId === 'weapon-shop') renderMarketplace(currentMarketplaceFilter);
  if (tabId === 'profile') renderProfilePage();
  if (tabId === 'the-old-norse') renderTonCatalog();
  if (tabId === 'account-manager') renderCustomAccountsTable();
  if (tabId === 'blacklist-manager') renderBlacklistTable();
  if (tabId === 'transaction-process') renderTxProcessTable(true);
  if (tabId === 'vault-stock') renderVaultInventory();
  if (tabId === 'release-outstanding') renderReleaseOutstanding();
  if (tabId === 'vault-history') renderVaultHistory(true);
  if (tabId === 'voucher-manager') renderVoucherManager();
  if (tabId === 'stock-proof') {
    renderStockProofHistory();
    if (document.getElementById('proof-date-auto')) document.getElementById('proof-date-auto').value = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    if (document.getElementById('proof-member-name')) document.getElementById('proof-member-name').value = (currentLoggedInUser || 'ADMIN').toUpperCase();
  }
  if (tabId === 'metal-scrap') renderMetalScrapLogs();
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================================
// 🛒 OPTIMIZED MARKETPLACE RENDERER (WITH COMING SOON FEATURE)
// ============================================================================
function renderMarketplace(category = 'all') {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  const filtered = vaultInventory.filter(item => {
    if (category === 'all') return true;
    if (category === 'weapon') return item.cat === 'weapon';
    if (category === 'ammo') return item.cat === 'ammo';
    if (category === 'vest') return item.cat === 'vest';
    if (category === 'durgs') return item.cat === 'durgs' || item.cat === 'PACKAGE';
    if (category === 'attachments') return item.cat === 'attachments' || item.cat.includes('ATTACH');
    if (category === 'tool-heist') return item.cat === 'tool-heist';
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-span-full py-12 text-center text-zinc-500 italic"><i data-lucide="package-open" class="w-8 h-8 mx-auto mb-2 opacity-30"></i>Belum ada barang di kategori ini.</div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  const htmlBuilder = filtered.map(item => {
    const originalIdx = vaultInventory.indexOf(item);
    const isComingSoon = item.badge === 'COMING SOON' || item.badge === 'COMING_SOON';
    const isOOS = (item.stock <= 0) && !isComingSoon;
    
    let cardBorder = 'border-[#1e2230] hover:border-red-500/50 bg-[#0e1017] shadow-sm';
    if (isComingSoon) {
      cardBorder = 'border-emerald-500/60 bg-[#0e1017] shadow-[0_0_15px_rgba(16,185,129,0.15)]';
    } else if (isOOS) {
      cardBorder = 'border-red-900/60 opacity-60 bg-red-950/10';
    }

    const imgStyle = isOOS ? 'grayscale opacity-40' : (isComingSoon ? 'opacity-80 group-hover:scale-105 transition duration-300' : 'group-hover:scale-105 transition duration-300 drop-shadow-md');

    let badgeText = (item.cat || 'ITEM').toUpperCase();
    let badgeStyle = 'bg-[#131622] border-[#1e2230] text-zinc-400';
    if (isComingSoon) {
      badgeText = 'COMING SOON';
      badgeStyle = 'bg-pink-500/10 border-pink-500/30 text-pink-500 font-bold';
    } else if (isOOS) {
      badgeText = 'OUT OF STOCK';
      badgeStyle = 'bg-red-500/10 border-red-500/20 text-red-500';
    }

    let priceHtml = `<span class="text-emerald-400 font-bold text-sm">$${(item.price || 0).toLocaleString()}</span>`;
    if (isComingSoon) {
      priceHtml = `<span class="text-zinc-600 font-bold tracking-widest text-sm uppercase">LOCKED</span>`;
    }

    let actionButtonHtml = '';
    if (isComingSoon) {
      actionButtonHtml = `
        <div class="w-full pt-1">
          <button disabled class="w-full bg-[#131622] border border-[#1e2230] text-zinc-600 font-bold py-2 rounded-xl text-xs uppercase tracking-wider cursor-not-allowed text-center transition">UNAVAILABLE</button>
        </div>
      `;
    } else if (isOOS) {
      actionButtonHtml = `
        <span class="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">STOK KOSONG</span>
        <button disabled class="bg-[#131622] text-zinc-600 font-bold px-3 py-1.5 rounded-xl text-xs cursor-not-allowed">KOSONG</button>
      `;
    } else {
      actionButtonHtml = `
        <span class="text-[10px] text-zinc-400 flex items-center gap-1.5 font-medium"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Ready (${item.stock})</span>
        <button onclick="addToCartSimple(${originalIdx})" class="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-1.5 rounded-xl text-xs transition shadow-md shadow-red-600/20 flex items-center gap-1.5 ml-auto">
          <i data-lucide="shopping-cart" class="w-3.5 h-3.5 inline"></i> Buy
        </button>
      `;
    }

    return `
      <div class="product-card border rounded-2xl p-4 flex flex-col justify-between group transition duration-200 ${cardBorder}">
        <div>
          <div class="h-44 bg-[#131622] rounded-xl border border-[#1e2230] flex items-center justify-center overflow-hidden mb-3 p-3 relative">
            <img src="${item.img}" alt="${item.name}" class="h-full object-contain ${imgStyle}" loading="lazy">
            <span class="absolute top-2.5 right-2.5 px-2 py-0.5 border rounded-lg text-[9px] font-bold uppercase backdrop-blur-sm ${badgeStyle}">${badgeText}</span>
          </div>

          <div class="flex justify-between items-start mb-1">
            <h3 class="text-base font-bold text-white ${isOOS || isComingSoon ? '' : 'group-hover:text-red-400'} transition tracking-wide">${item.name}</h3>
            ${priceHtml}
          </div>
          <p class="text-[11px] text-zinc-400 line-clamp-2 min-h-[32px]">${item.desc || ''}</p>
        </div>

        <div class="pt-3 border-t border-[#1e2230] mt-4 flex items-center justify-between gap-2">
          ${actionButtonHtml}
        </div>
      </div>
    `;
  }).join('');

  grid.innerHTML = htmlBuilder;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function filterProducts(category) {
  currentMarketplaceFilter = category;
  document.querySelectorAll('.cat-btn').forEach(btn => btn.className = 'cat-btn bg-[#0e1017] text-zinc-400 hover:text-white font-semibold px-4 py-2 border border-[#1e2230] rounded-xl transition text-xs');
  if (event && event.currentTarget) event.currentTarget.className = 'cat-btn bg-red-600 text-white font-semibold px-4 py-2 rounded-xl transition shadow-sm text-xs';
  renderMarketplace(category);
}

function addToCartSimple(index) {
  if (isVaultLockdown && !isDonTier(getUserRank())) {
    showToast("VAULT LOCKDOWN", "The vault is currently LOCKED by the Moderator! All transactions are temporarily disabled.", "error");
    return;
  }
  if (blacklistedUsers.includes((currentLoggedInUser || '').toLowerCase())) {
    showToast("ACCOUNT FROZEN", "Akun Anda dibekukan (Blacklist)! Anda tidak diizinkan melakukan transaksi.", "error");
    return;
  }

  const item = vaultInventory[index];
  if (!item || item.stock <= 0) {
    showToast("OUT OF STOCK", "Barang ini sedang kosong!", "error");
    return;
  }
  if (isAssociate(getUserRank()) && item.restricted) {
    showToast("ACCESS DENIED", "Rank Associates hanya diizinkan membeli Amunisi, Vest & Attachments!", "error");
    return;
  }

  const existingIndex = userCart.findIndex(i => i.name === item.name);
  if (existingIndex > -1) {
    if (userCart[existingIndex].qty + 1 > item.stock) {
      showToast("STOK KURANG", `Maksimal pembelian untuk item ini adalah ${item.stock} unit!`, "error");
      return;
    }
    userCart[existingIndex].qty += 1;
  } else {
    userCart.push({ name: item.name, unitPrice: item.price, qty: 1 });
  }
  
  renderCartPageUI();
  showToast("VAULT ARMORY", `Successfully added 1x ${item.name} ke keranjang!`, "success");
}

function removeFromCart(index) { userCart.splice(index, 1); renderCartPageUI(); }
function clearCart() { 
  if (userCart.length > 0) {
    showCustomConfirm("KOSONGKAN KERANJANG", "Empty all orders in your shopping cart?", () => {
      userCart = []; appliedDiscount = 0; renderCartPageUI();
      showToast("CART CLEARED", "Keranjang berhasil dikosongkan.", "error");
    });
  } 
}

// ==========================================
// 🎟️ VOUCHER ENGINE
// ==========================================
function applyPromoCode() {
  const codeElem = document.getElementById('promo-code-input');
  if (!codeElem) return;
  
  const code = codeElem.value.trim().toUpperCase();
  const userRank = getUserRank();

  if (code === '') {
    if (appliedDiscount > 0) {
      appliedDiscount = 0;
      appliedPromoName = '';
      showToast("VOUCHER DIHAPUS", "Penggunaan voucher telah dibatalkan.", "error");
      renderCartPageUI();
    } else {
      showToast("WARNING", "Harap masukkan kode voucher terlebih dahulu!", "error");
    }
    return;
  }

  const matchedVoucher = syndVouchers.find(v => v.code === code);

  if (!matchedVoucher) {
    appliedDiscount = 0;
    appliedPromoName = '';
    codeElem.value = '';
    showToast("VOUCHER DITOLAK", "Voucher Tidak Tersedia untuk Digunakan", "error");
    renderCartPageUI();
    return;
  }

  if (matchedVoucher.expiresAt && Date.now() > matchedVoucher.expiresAt) {
    appliedDiscount = 0;
    appliedPromoName = '';
    codeElem.value = '';
    showToast("VOUCHER EXPIRED", `Voucher ${code} sudah melewati batas waktu (Kadaluarsa)!`, "error");
    renderCartPageUI();
    return;
  }

  if (!matchedVoucher.active) {
    appliedDiscount = 0;
    appliedPromoName = '';
    codeElem.value = '';
    showToast("VOUCHER NON-AKTIF", `Voucher ${code} saat ini belum diaktifkan oleh Moderator!`, "error");
    renderCartPageUI();
    return;
  }

  if (matchedVoucher.allowed === 'don_tier' && !isDonTier(userRank)) {
    appliedDiscount = 0;
    appliedPromoName = '';
    codeElem.value = '';
    showToast("VOUCHER EKSKLUSIF", "Voucher ini khusus untuk rank Moderator, Don, Underboss & Admin!", "error");
    renderCartPageUI();
    return;
  }

  if (matchedVoucher.type === 'percent') {
    appliedDiscount = matchedVoucher.val / 100;
    appliedPromoName = `${matchedVoucher.code} (${matchedVoucher.val}%)`;
    showToast("VOUCHER AKTIF", `Diskon ${matchedVoucher.val}% berhasil diterapkan untuk ${userRank}!`, "success");
  } else {
    appliedDiscount = matchedVoucher.val;
    appliedPromoName = `${matchedVoucher.code} ($${matchedVoucher.val.toLocaleString()})`;
    showToast("VOUCHER AKTIF", `Potongan tunai $${matchedVoucher.val.toLocaleString()} berhasil diterapkan!`, "success");
  }

  renderCartPageUI();
}

function renderVoucherManager() {
  const table = document.getElementById('voucher-manager-table');
  const countElem = document.getElementById('total-voucher-count');
  if (!table) return;

  if (countElem) countElem.innerText = syndVouchers.length;

  if (syndVouchers.length === 0) {
    table.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-zinc-500 italic">There are no voucher codes stored in the system yet.</td></tr>`;
    return;
  }

  table.innerHTML = '';
  syndVouchers.forEach((v, idx) => {
    const isExpired = v.expiresAt && Date.now() > v.expiresAt;

    const typeLabel = v.type === 'percent' ? `${v.val}% (Persentase)` : `$${v.val.toLocaleString()} (Tunai)`;
    const allowedLabel = v.allowed === 'don_tier' ? `<span class="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] rounded-full font-semibold uppercase">High-ranking officials</span>` : `<span class="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] rounded-full font-semibold uppercase">All Warga</span>`;
    
    let expLabel = `<span class="text-zinc-500 font-mono text-[11px]">Without limit</span>`;
    if (v.expiresAt) {
      const expDate = new Date(v.expiresAt);
      const formattedDate = expDate.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
      expLabel = isExpired ? `<span class="text-red-500 font-bold font-mono text-[11px] line-through">${formattedDate} (Expired)</span>` : `<span class="text-amber-400 font-mono text-[11px]">${formattedDate} WIB</span>`;
    }

    let activeBadge = v.active ? `<span class="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block">Aktif</span>` : `<span class="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block">Non-Aktif</span>`;
    if (isExpired) activeBadge = `<span class="px-2.5 py-1 bg-zinc-800 text-zinc-500 border border-zinc-700 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block">Expired</span>`;

    const toggleBtnText = v.active ? 'Non-Aktifkan' : 'Activate Now';
    const toggleBtnStyle = v.active ? 'bg-[#131622] text-zinc-300 hover:bg-red-600 hover:text-white border border-[#1e2230]' : 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm';

    table.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0 ${isExpired ? 'opacity-60' : ''}">
        <td class="p-3.5 font-mono font-bold text-white text-sm">${v.code}</td>
        <td class="p-3.5 font-semibold text-emerald-400 text-xs">${typeLabel}</td>
        <td class="p-3.5">${allowedLabel}</td>
        <td class="p-3.5">${expLabel}</td>
        <td class="p-3.5 text-zinc-300 max-w-xs truncate">${v.desc || '-'}</td>
        <td class="p-3.5 text-center">${activeBadge}</td>
        <td class="p-3.5 text-right space-x-1.5 whitespace-nowrap">
          <button onclick="toggleVoucherStatus(${idx})" class="px-3 py-1.5 rounded-xl text-xs transition ${toggleBtnStyle}" ${isExpired ? 'disabled title="Sudah Kadaluarsa"' : ''}>${toggleBtnText}</button>
          <button onclick="deleteVoucher(${idx})" class="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition" title="Hapus Permanen"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </td>
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function createNewVoucher() {
  if (getUserRank() !== 'Moderator') { 
    showToast("ACCESS DENIED", "Hanya Moderator yang berhak mengelola Voucher!", "error"); 
    return; 
  }
  
  const codeElem = document.getElementById('new-voucher-code');
  const typeElem = document.getElementById('new-voucher-type');
  const valElem = document.getElementById('new-voucher-val');
  const allowedElem = document.getElementById('new-voucher-allowed');
  const durationElem = document.getElementById('new-voucher-duration');
  const descElem = document.getElementById('new-voucher-desc');

  const code = codeElem.value.trim().toUpperCase().replace(/\s+/g, '');
  const type = typeElem.value;
  const val = parseInt(valElem.value);
  const allowed = allowedElem.value;
  const hoursDuration = parseInt(durationElem.value) || 0;
  const desc = descElem.value.trim() || 'Syndicate Promo Code';

  if (!code) { showToast("WARNING", "Kode voucher tidak boleh kosong!", "error"); return; }
  if (isNaN(val) || val <= 0) { showToast("WARNING", "Nilai diskon harus berupa angka lebih dari 0!", "error"); return; }

  const exists = syndVouchers.some(v => v.code === code);
  if (exists) { showToast("DUPLIKAT", `Kode voucher ${code} sudah ada di tabel!`, "error"); return; }

  let expiresAt = null;
  if (hoursDuration > 0) {
    expiresAt = Date.now() + (hoursDuration * 60 * 60 * 1000);
  }

  syndVouchers.push({ code, type, val, allowed, active: true, expiresAt, desc });
  saveAppData();

  codeElem.value = ''; valElem.value = ''; descElem.value = ''; durationElem.value = '0';
  renderVoucherManager();
  showToast("VOUCHER DISIMPAN", `Voucher ${code} berhasil dibuat dan langsung AKTIF!`, "success");
}

function toggleVoucherStatus(index) {
  if (getUserRank() !== 'Moderator') {
    showToast("ACCESS DENIED", "Hanya Moderator yang berhak mengelola Voucher!", "error");
    return;
  }
  if (syndVouchers[index]) {
    if (syndVouchers[index].expiresAt && Date.now() > syndVouchers[index].expiresAt) {
      showToast("WARNING", "Voucher ini sudah kadaluarsa dan tidak bisa diaktifkan lagi!", "error");
      return;
    }
    syndVouchers[index].active = !syndVouchers[index].active;
    saveAppData();
    renderVoucherManager();
    const statText = syndVouchers[index].active ? 'ACTIVATED' : 'DEACTIVATED';
    showToast("STATUS UPDATED", `Voucher ${syndVouchers[index].code} berhasil ${statText}.`, "success");
  }
}

function deleteVoucher(index) {
  if (getUserRank() !== 'Moderator') {
    showToast("ACCESS DENIED", "Only Moderators have the authority to manage vouchers!", "error");
    return;
  }
  if (syndVouchers[index]) {
    showCustomConfirm("HAPUS VOUCHER", `Permanently delete promo code ${syndVouchers[index].code} from the system?`, () => {
      const deletedCode = syndVouchers[index].code;
      syndVouchers.splice(index, 1);
      saveAppData();
      renderVoucherManager();
      showToast("VOUCHER DIHAPUS", `Promo code ${deletedCode} has been removed from the system.`, "error");
    });
  }
}

// ==========================================
// 📦 MODAL TAMBAH BARANG (ADD ITEM)
// ==========================================
function addNewInventoryItem() {
  if (!isBisnisTier(getUserRank())) { 
    showToast("ACCESS DENIED", "Mode Read-Only tidak dapat menambah barang!", "error"); 
    return; 
  }
  openAddItemModal();
}

function openAddItemModal() {
  const modal = document.getElementById('add-item-modal');
  if (modal) {
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-price').value = '';
    document.getElementById('new-item-base').value = '';
    document.getElementById('new-item-stock').value = '10';
    document.getElementById('new-item-img-url').value = '';
    document.getElementById('new-item-desc').value = '';
    if (document.getElementById('new-item-file')) document.getElementById('new-item-file').value = '';
    newItemUploadedBase64 = '';
    
    modal.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function closeAddItemModal() {
  const modal = document.getElementById('add-item-modal');
  if (modal) modal.classList.add('hidden');
}

// ============================================================================
// 🛡️ SUPER-SAFE ENGINE: 100% KEBAL BENTROK (ZERO SYNTAX ERROR)
// ============================================================================

window.tonUploadImgBase64 = window.tonUploadImgBase64 || '';
window.tonMarketSearch = window.tonMarketSearch || '';
window.tonMarketSort = window.tonMarketSort || 'name_asc';

function handleNewItemImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxDim = 400; let width = img.width; let height = img.height;
      if (width > height) { if (width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; } }
      else { if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      window.tonUploadImgBase64 = canvas.toDataURL('image/jpeg', 0.75);
      if (typeof showToast === 'function') showToast("IMAGE READY", "Foto barang siap disimpan!", "success");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function submitNewItem() {
  try {
    const nameInput = document.getElementById('new-item-name');
    const priceInput = document.getElementById('new-item-price');
    
    if (!nameInput || !priceInput) { 
      if (typeof showToast === 'function') showToast("ERROR", "Form input tidak ditemukan!", "error"); 
      return; 
    }

    const name = nameInput.value.trim();
    const cat = document.getElementById('new-item-cat')?.value || 'weapon';
    const price = parseInt(priceInput.value) || 0;
    const base = parseInt(document.getElementById('new-item-base')?.value) || price;
    let stock = parseInt(document.getElementById('new-item-stock')?.value) || 0;
    const restricted = document.getElementById('new-item-restricted')?.value === 'true';
    const desc = document.getElementById('new-item-desc')?.value.trim() || 'Custom Syndicate Armory Item';
    const urlImg = document.getElementById('new-item-img-url')?.value.trim();
    const statusVal = document.getElementById('new-item-status')?.value || 'ready';
    
    const finalImg = window.tonUploadImgBase64 || urlImg;

    if (!name) { if (typeof showToast === 'function') showToast("WARNING", "Nama barang wajib diisi!", "error"); return; }
    if (price <= 0) { if (typeof showToast === 'function') showToast("WARNING", "Harga jual harus lebih dari 0!", "error"); return; }
    if (!finalImg) { if (typeof showToast === 'function') showToast("PHOTO MANDATORY", "Wajib upload foto atau masukkan URL gambar!", "error"); return; }

    let badgeVal = "NORMAL";
    if (statusVal === 'coming_soon') {
      badgeVal = "COMING SOON";
      stock = 0;
    } else if (stock <= 0) {
      badgeVal = "OUT OF STOCK";
    } else if (stock <= 5) {
      badgeVal = "LOW";
    }

    vaultInventory.unshift({
      name: name, cat: cat, badge: badgeVal, desc: desc,
      price: price, base: base, stock: stock,
      img: finalImg, restricted: restricted
    });

    if (typeof saveAppData === 'function') saveAppData(); 
    
    renderVaultInventory(); 
    const activeFilter = typeof currentMarketplaceFilter !== 'undefined' ? currentMarketplaceFilter : 'all';
    renderMarketplace(activeFilter);
    
    if (typeof closeAddItemModal === 'function') closeAddItemModal();
    if (typeof showToast === 'function') showToast("ITEM ADDED", `${name} berhasil ditambahkan!`, "success");
  } catch (err) {
    console.error("Error submitNewItem:", err);
    if (typeof closeAddItemModal === 'function') closeAddItemModal();
  }
}

// ============================================================================
// 🔍 MARKETPLACE RENDERER (DENGAN SEARCH & SORT SAFE-STATE)
// ============================================================================
function handleMarketplaceSearch(query) {
  window.tonMarketSearch = query.toLowerCase().trim();
  renderMarketplace(typeof currentMarketplaceFilter !== 'undefined' ? currentMarketplaceFilter : 'all');
}

function handleMarketplaceSort(sortVal) {
  window.tonMarketSort = sortVal;
  renderMarketplace(typeof currentMarketplaceFilter !== 'undefined' ? currentMarketplaceFilter : 'all');
}

function renderMarketplace(category = 'all') {
  try {
    const grid = document.getElementById('product-grid');
    if (!grid || typeof vaultInventory === 'undefined') return;

    let filtered = vaultInventory.filter(item => {
      if (!item) return false;
      const itemCat = String(item.cat || 'weapon').toLowerCase();
      if (category === 'all') return true;
      if (category === 'weapon') return itemCat === 'weapon';
      if (category === 'ammo') return itemCat === 'ammo';
      if (category === 'vest') return itemCat === 'vest';
      if (category === 'durgs') return itemCat === 'durgs' || itemCat === 'package';
      if (category === 'attachments') return itemCat === 'attachments' || itemCat.includes('attach');
      if (category === 'tool-heist') return itemCat === 'tool-heist';
      return true;
    });

    if (window.tonMarketSearch) {
      filtered = filtered.filter(item => {
        const matchName = String(item.name || '').toLowerCase().includes(window.tonMarketSearch);
        const matchDesc = String(item.desc || '').toLowerCase().includes(window.tonMarketSearch);
        return matchName || matchDesc;
      });
    }

    filtered.sort((a, b) => {
      if (window.tonMarketSort === 'name_asc') return String(a.name || '').localeCompare(String(b.name || ''));
      if (window.tonMarketSort === 'price_desc') return Number(b.price || 0) - Number(a.price || 0);
      if (window.tonMarketSort === 'price_asc') return Number(a.price || 0) - Number(b.price || 0);
      return 0;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-zinc-500 italic"><i data-lucide="package-open" class="w-8 h-8 mx-auto mb-2 opacity-30"></i>Item not found.</div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    const htmlBuilder = filtered.map(item => {
      const originalIdx = vaultInventory.indexOf(item);
      const badge = String(item.badge || 'NORMAL').toUpperCase();
      const isComingSoon = badge === 'COMING SOON' || badge === 'COMING_SOON';
      const stockNum = Number(item.stock || 0);
      const isOOS = (stockNum <= 0) && !isComingSoon;
      
      let cardBorder = 'border-[#1e2230] hover:border-red-500/50 bg-[#0e1017] shadow-sm';
      if (isComingSoon) cardBorder = 'border-emerald-500/60 bg-[#0e1017] shadow-[0_0_15px_rgba(16,185,129,0.15)]';
      else if (isOOS) cardBorder = 'border-red-900/60 opacity-60 bg-red-950/10';

      const imgStyle = isOOS ? 'grayscale opacity-40' : (isComingSoon ? 'opacity-80 group-hover:scale-105 transition duration-300' : 'group-hover:scale-105 transition duration-300 drop-shadow-md');

      let badgeText = String(item.cat || 'ITEM').toUpperCase();
      let badgeStyle = 'bg-[#131622] border-[#1e2230] text-zinc-400';
      if (isComingSoon) { badgeText = 'COMING SOON'; badgeStyle = 'bg-pink-500/10 border-pink-500/30 text-pink-500 font-bold'; }
      else if (isOOS) { badgeText = 'OUT OF STOCK'; badgeStyle = 'bg-red-500/10 border-red-500/20 text-red-500'; }

      let priceHtml = `<span class="text-emerald-400 font-bold text-sm">$${Number(item.price || 0).toLocaleString()}</span>`;
      if (isComingSoon) priceHtml = `<span class="text-zinc-600 font-bold tracking-widest text-sm uppercase">LOCKED</span>`;

      let actionButtonHtml = '';
      if (isComingSoon) {
        actionButtonHtml = `<div class="w-full pt-1"><button disabled class="w-full bg-[#131622] border border-[#1e2230] text-zinc-600 font-bold py-2 rounded-xl text-xs uppercase tracking-wider cursor-not-allowed text-center transition">UNAVAILABLE</button></div>`;
      } else if (isOOS) {
        actionButtonHtml = `<span class="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">STOK KOSONG</span><button disabled class="bg-[#131622] text-zinc-600 font-bold px-3 py-1.5 rounded-xl text-xs cursor-not-allowed">KOSONG</button>`;
      } else {
        actionButtonHtml = `<span class="text-[10px] text-zinc-400 flex items-center gap-1.5 font-medium"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Ready (${stockNum})</span><button onclick="addToCartSimple(${originalIdx})" class="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-1.5 rounded-xl text-xs transition shadow-md shadow-red-600/20 flex items-center gap-1.5 ml-auto"><i data-lucide="shopping-cart" class="w-3.5 h-3.5 inline"></i> Buy</button>`;
      }

      return `
        <div class="product-card border rounded-2xl p-4 flex flex-col justify-between group transition duration-200 ${cardBorder}">
          <div>
            <div class="h-44 bg-[#131622] rounded-xl border border-[#1e2230] flex items-center justify-center overflow-hidden mb-3 p-3 relative">
              <img src="${item.img || ''}" alt="${item.name || ''}" class="h-full object-contain ${imgStyle}" loading="lazy">
              <span class="absolute top-2.5 right-2.5 px-2 py-0.5 border rounded-lg text-[9px] font-bold uppercase backdrop-blur-sm ${badgeStyle}">${badgeText}</span>
            </div>
            <div class="flex justify-between items-start mb-1">
              <h3 class="text-base font-bold text-white ${isOOS || isComingSoon ? '' : 'group-hover:text-red-400'} transition tracking-wide">${item.name || 'Unnamed Item'}</h3>
              ${priceHtml}
            </div>
            <p class="text-[11px] text-zinc-400 line-clamp-2 min-h-[32px]">${item.desc || ''}</p>
          </div>
          <div class="pt-3 border-t border-[#1e2230] mt-4 flex items-center justify-between gap-2">
            ${actionButtonHtml}
          </div>
        </div>
      `;
    }).join('');

    grid.innerHTML = htmlBuilder;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (e) {
    console.error("Error renderMarketplace:", e);
  }
}

// ============================================================================
// 📦 VAULT INVENTORY RENDERER (100% SAFE TABLE RENDERER)
// ============================================================================
function renderVaultInventory() {
  try {
    const grid = document.getElementById('vault-inventory-grid') || document.getElementById('inventory-grid') || document.getElementById('logs-inventory-grid');
    if (!grid || typeof vaultInventory === 'undefined') return;
    
    const activeFilter = typeof activeInventoryFilter !== 'undefined' ? activeInventoryFilter : 'all';
    
    const filteredItems = vaultInventory.filter(item => {
      if (!item) return false;
      const itemCat = String(item.cat || 'weapon').toLowerCase();
      if (activeFilter === 'all') return true;
      if (activeFilter === 'weapon') return itemCat === 'weapon';
      if (activeFilter === 'ammo') return itemCat === 'ammo';
      if (activeFilter === 'vest') return itemCat === 'vest';
      if (activeFilter === 'durgs') return itemCat === 'durgs' || itemCat === 'package';
      if (activeFilter === 'attachments') return itemCat === 'attachments' || itemCat.includes('attach');
      if (activeFilter === 'tool-heist') return itemCat === 'tool-heist';
      return true;
    });
    
    const countElem = document.getElementById('total-inventory-count');
    if (countElem) countElem.innerText = filteredItems.length;
    
    grid.innerHTML = '';
    if (filteredItems.length === 0) {
      grid.innerHTML = `<div class="col-span-full py-12 text-center text-zinc-500 italic"><i data-lucide="box" class="w-8 h-8 mx-auto mb-2 opacity-30"></i>Belum ada barang di kategori ini.</div>`;
      if (typeof lucide !== 'undefined') lucide.createIcons(); return;
    }

    const isWritable = ['Admin', 'Moderator', 'Don', 'Underboss', 'Bisnis'].includes(typeof getUserRank === 'function' ? getUserRank() : 'Admin');

    filteredItems.forEach((item) => {
      const originalIdx = vaultInventory.indexOf(item);
      const badge = String(item.badge || 'NORMAL').toUpperCase();
      const isComingSoon = badge === 'COMING SOON' || badge === 'COMING_SOON';
      
      let badgeStyle = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      if (isComingSoon) badgeStyle = 'bg-pink-500/10 text-pink-500 border border-pink-500/30 font-bold';
      else if (badge === 'OUT OF STOCK') badgeStyle = 'bg-red-500/10 text-red-500 border border-red-500/20';
      else if (badge === 'LOW') badgeStyle = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      
      let stockButtonsHtml = '';
      if (isWritable) {
        stockButtonsHtml = `
          <button onclick="changeStock(${originalIdx}, -1)" class="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white flex items-center justify-center transition font-bold shrink-0" title="Kurangi Stok">-</button>
          <button onclick="changeStock(${originalIdx}, 1)" class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition font-bold shrink-0" title="Tambah Stok">+</button>
          <button onclick="openEditItemModal(${originalIdx})" class="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white flex items-center justify-center transition ml-0.5 shrink-0" title="Edit Item Details"><i data-lucide="edit-3" class="w-3.5 h-3.5"></i></button>
          <button onclick="deleteInventoryItem(${originalIdx})" class="w-7 h-7 rounded-lg bg-[#131622] hover:bg-red-600 text-zinc-400 hover:text-white flex items-center justify-center transition ml-0.5 border border-[#1e2230] shrink-0" title="Hapus Barang Permanen"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        `;
      }

      grid.innerHTML += `
        <div class="bg-[#0e1017] border border-[#1e2230] rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-500 transition shadow-sm">
          <div>
            <div class="h-36 bg-[#131622] rounded-xl border border-[#1e2230] flex items-center justify-center overflow-hidden mb-5 p-3 relative group">
              <img src="${item.img || ''}" alt="${item.name || ''}" class="h-full object-contain group-hover:scale-105 transition duration-300">
            </div>
            <div class="flex items-center justify-between gap-2 pt-1 mb-2">
              <h3 class="font-bold text-white text-base truncate leading-relaxed">${item.name || 'Unnamed Item'} <span class="px-2 py-0.5 bg-[#131622] border border-[#1e2230] text-zinc-400 text-[10px] rounded-md ml-1.5 align-middle">${String(item.cat || 'item').toUpperCase()}</span></h3>
              <span class="px-2.5 py-1 text-[9px] font-bold rounded-full uppercase shrink-0 ${badgeStyle}">${badge === 'NORMAL' ? 'NORMAL' : badge}</span>
            </div>
            <p class="text-xs text-zinc-400 line-clamp-2 min-h-[32px] mt-2 leading-relaxed">${item.desc || ''}</p>
          </div>
          
          <div class="border-t border-[#1e2230] pt-3 mt-4 space-y-3">
            <div class="w-full bg-[#131622]/60 p-2.5 rounded-xl border border-[#1e2230]">
              <span class="text-[10px] text-zinc-500 block uppercase tracking-wider font-semibold">Selling / Base Price</span>
              <div class="flex items-baseline gap-1.5 flex-wrap mt-0.5">
                <span class="text-lg font-bold font-tech text-amber-400 break-all leading-none">$${Number(item.price || 0).toLocaleString()}</span>
                <span class="text-xs text-zinc-500 font-mono">($${Number(item.base || item.price || 0).toLocaleString()})</span>
              </div>
            </div>

            <div class="flex items-center justify-between gap-2 pt-0.5">
              <div class="flex items-center gap-1.5 bg-[#131622] px-2.5 py-1.5 rounded-xl border border-[#1e2230]">
                <span class="text-[10px] text-zinc-400 uppercase font-semibold">Stock:</span>
                <span class="text-sm font-bold text-white font-mono leading-none">${Number(item.stock || 0)}</span>
              </div>
              <div class="flex items-center gap-1 shrink-0 ml-auto">
                ${stockButtonsHtml}
              </div>
            </div>
          </div>
        </div>
      `;
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {
    console.error("Error renderVaultInventory:", err);
  }
}
// ==========================================
// 🛍️ FLOATING CYBERPUNK CART & DRAWER ENGINE
// ==========================================
function openCartDrawer() {
  const backdrop = document.getElementById('cart-drawer-backdrop');
  const drawer = document.getElementById('cart-drawer');
  if (backdrop && drawer) {
    backdrop.classList.remove('hidden');
    setTimeout(() => drawer.classList.remove('translate-x-full'), 10);
    renderCartPageUI();
  }
}

function closeCartDrawer() {
  const backdrop = document.getElementById('cart-drawer-backdrop');
  const drawer = document.getElementById('cart-drawer');
  if (backdrop && drawer) {
    drawer.classList.add('translate-x-full');
    setTimeout(() => backdrop.classList.add('hidden'), 300);
  }
}

function changeCartItemQty(index, delta) {
  if (userCart[index]) {
    const itemObj = vaultInventory.find(i => i.name === userCart[index].name);
    const maxStk = itemObj ? itemObj.stock : 999;

    userCart[index].qty += delta;
    if (userCart[index].qty <= 0) {
      userCart.splice(index, 1);
    } else if (userCart[index].qty > maxStk) {
      userCart[index].qty = maxStk;
      showToast("STOK KURANG", `Maksimal stok untuk ${itemObj.name} adalah ${maxStk} unit!`, "error");
    }
    renderCartPageUI();
  }
}

function setCartItemQty(index, newQty) {
  if (!userCart[index]) return;
  const itemObj = vaultInventory.find(i => i.name === userCart[index].name);
  const maxStk = itemObj ? itemObj.stock : 999;
  
  let val = parseInt(newQty) || 1;
  if (val <= 0) {
    userCart.splice(index, 1);
  } else if (val > maxStk) {
    userCart[index].qty = maxStk;
    showToast("STOK KURANG", `Maksimal stok untuk ${itemObj.name} adalah ${maxStk} unit!`, "error");
  } else {
    userCart[index].qty = val;
  }
  renderCartPageUI();
}

function renderCartPageUI() {
  const totalQty = userCart.reduce((sum, item) => sum + item.qty, 0);
  
  const floatBadge = document.getElementById('floating-cart-badge');
  const floatTotal = document.getElementById('floating-cart-total');
  const sideBadge = document.getElementById('sidebar-cart-badge');
  
  if (floatBadge) floatBadge.innerText = totalQty;
  if (sideBadge) sideBadge.innerText = totalQty;

  let subtotal = 0;
  userCart.forEach(item => subtotal += item.unitPrice * item.qty);
  let finalTotal = appliedDiscount > 0 ? (appliedDiscount < 1 ? subtotal - (subtotal * appliedDiscount) : Math.max(0, subtotal - appliedDiscount)) : subtotal;

  if (floatTotal) floatTotal.innerText = "$" + finalTotal.toLocaleString();

  const drawerItems = document.getElementById('drawer-cart-items');
  const drawerSubtotal = document.getElementById('drawer-subtotal');
  const drawerTotal = document.getElementById('drawer-cart-total');

  if (drawerSubtotal) drawerSubtotal.innerText = "$" + subtotal.toLocaleString();
  if (drawerTotal) drawerTotal.innerText = "$" + finalTotal.toLocaleString();

  if (!drawerItems) return;

  if (userCart.length === 0) {
    drawerItems.innerHTML = `
      <div class="text-center py-12 text-zinc-500 font-tech">
        <i data-lucide="shopping-cart" class="w-12 h-12 mx-auto mb-2 opacity-30 animate-pulse"></i>
        <p class="text-sm font-bold uppercase">KERANJANG MASIH KOSONG</p>
        <p class="text-[11px] font-sans text-zinc-400 mt-1">Pilih barang dari katalog persenjataan untuk menambahkan.</p>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  drawerItems.innerHTML = '';
  userCart.forEach((item, idx) => {
    const itemObj = vaultInventory.find(i => i.name === item.name);
    const maxStk = itemObj ? itemObj.stock : 999;

    drawerItems.innerHTML += `
      <div class="flex items-center justify-between bg-[#131622] p-3 rounded-xl border border-[#1e2230] shadow-sm">
        <div class="flex-grow pr-2">
          <p class="font-bold text-white text-sm leading-tight">${item.name}</p>
          <p class="text-[11px] text-zinc-400">$${item.unitPrice.toLocaleString()} / unit</p>
          <span class="text-xs font-semibold text-emerald-400 mt-1 block">$${(item.unitPrice * item.qty).toLocaleString()}</span>
        </div>
        
        <div class="flex items-center gap-1 bg-[#0e1017] p-1 rounded-lg border border-[#1e2230] shrink-0">
          <button onclick="changeCartItemQty(${idx}, -1)" class="w-6 h-6 rounded bg-[#131622] hover:bg-red-600 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-xs transition">-</button>
          <input type="number" value="${item.qty}" min="1" max="${maxStk}" onchange="setCartItemQty(${idx}, this.value)" class="w-10 bg-transparent text-center font-bold text-white text-xs focus:outline-none focus:bg-black/40 rounded">
          <button onclick="changeCartItemQty(${idx}, 1)" class="w-6 h-6 rounded bg-[#131622] hover:bg-emerald-600 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-xs transition">+</button>
        </div>

        <button onclick="removeFromCart(${idx})" class="text-zinc-500 hover:text-red-400 p-1.5 ml-1 transition" title="Hapus">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function checkoutCart() {
  try {
    // 1. Cek Lockdown
    if (typeof isVaultLockdown !== 'undefined' && isVaultLockdown) {
      const rank = typeof getUserRank === 'function' ? getUserRank() : 'Soldiers';
      if (typeof isDonTier === 'function' && !isDonTier(rank)) {
        if (typeof showToast === 'function') showToast("VAULT LOCKDOWN", "Brangkas sedang DIKUNCI oleh Moderator! Transaksi ditangguhkan.", "error");
        return;
      }
    }

    // 2. Cek Keranjang Kosong
    if (!userCart || !Array.isArray(userCart) || userCart.length === 0) {
      if (typeof showToast === 'function') showToast("WARNING", "Keranjang kosong! Silakan pilih barang terlebih dahulu.", "error");
      return;
    }

    // 3. Setup Order ID & Subtotal
    const orderId = "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    let subtotal = 0;
    userCart.forEach(i => subtotal += ((Number(i.unitPrice) || 0) * (Number(i.qty) || 1)));

    let discountNominal = 0;
    let finalSpent = subtotal;

    if (typeof appliedDiscount !== 'undefined' && appliedDiscount > 0) {
      if (appliedDiscount < 1) { 
        discountNominal = subtotal * appliedDiscount;
        finalSpent = subtotal - discountNominal;
      } else { 
        discountNominal = appliedDiscount;
        finalSpent = Math.max(0, subtotal - appliedDiscount);
      }
    }

    // 4. Paksa format Array & Potong Stok
    if (!Array.isArray(vaultInventory)) vaultInventory = [];
    userCart.forEach(cartItem => {
      const invItem = vaultInventory.find(i => i.name === cartItem.name);
      if (invItem) {
        invItem.stock = Math.max(0, Number(invItem.stock) - Number(cartItem.qty));
        if (invItem.stock === 0) invItem.badge = 'OUT OF STOCK';
        else if (invItem.stock <= 5) invItem.badge = 'LOW';
      }
    });

    const activeUser = (typeof currentLoggedInUser !== 'undefined' && currentLoggedInUser) ? currentLoggedInUser : "BUYER";
    const userRank = (typeof getUserRank === 'function') ? String(getUserRank()).toUpperCase() : "SOLDIERS";
    const promoStr = (typeof appliedPromoName !== 'undefined' && appliedPromoName) ? appliedPromoName : '';

    const newTx = {
      id: orderId, buyer: activeUser, role: userRank,
      package: "No", qty: userCart.reduce((s, i) => s + (Number(i.qty) || 1), 0), total: finalSpent,
      subtotal: subtotal, promoName: promoStr, discountAmount: discountNominal,
      processed: "Pending", time: new Date().toLocaleString('en-US', { hour12: true }),
      waiting: "Just now", priority: finalSpent > 50000 ? "HIGH" : "MEDIUM", status: "Pending",
      items: JSON.parse(JSON.stringify(userCart)) 
    };

    // 5. PAKSA FORMAT ARRAY UNTUK DATABASE
    if (!Array.isArray(adminTransactions)) adminTransactions = [];
    adminTransactions.unshift(newTx);

    if (!Array.isArray(orgLeaderboard)) orgLeaderboard = [];
    let existingSpender = orgLeaderboard.find(s => s.name === activeUser);
    if (existingSpender) existingSpender.spent = (Number(existingSpender.spent) || 0) + finalSpent;
    else orgLeaderboard.push({ name: activeUser, role: userRank, spent: finalSpent, top: false });

    // 6. Simpan ke Firebase
    if (typeof saveAppData === 'function') saveAppData(); 

    // 7. Tembak Discord Webhook
    if (typeof sendDiscordWebhook === 'function' && typeof ORDERS_WEBHOOK_URL !== 'undefined') {
        sendDiscordWebhook(ORDERS_WEBHOOK_URL, "PESANAN BARU MASUK", `Pesanan dari **${activeUser}**`, [
          { name: "Order ID", value: orderId, inline: true }, { name: "Total Payable", value: "$" + finalSpent.toLocaleString(), inline: true }
        ], 15844367);
    }

    // 8. Bersihkan & Refresh UI
    userCart.length = 0; 
    if (typeof appliedDiscount !== 'undefined') appliedDiscount = 0;
    if (typeof appliedPromoName !== 'undefined') appliedPromoName = '';

    if (typeof renderCartPageUI === 'function') renderCartPageUI();
    if (typeof updateDashboardData === 'function') updateDashboardData();
    if (typeof renderTxProcessTable === 'function') renderTxProcessTable(true);
    if (typeof renderVaultInventory === 'function') renderVaultInventory();
    if (typeof renderReleaseOutstanding === 'function') renderReleaseOutstanding();
    if (typeof renderVaultHistory === 'function') renderVaultHistory();
    if (typeof renderLeaderboard === 'function') renderLeaderboard();
    if (typeof closeCartDrawer === 'function') closeCartDrawer();

    if (typeof showToast === 'function') showToast("ORDER PLACED", `Pesanan ID ${orderId} berhasil dikirim!`, "success");
    if (typeof switchTab === 'function') switchTab('my-orders');

  } catch (err) {
    // MENAMPILKAN SUMBER MASALAH ASLI DI CONSOLE
    console.error("🔥 BACA ERROR INI DI CONSOLE:", err);
    if (typeof showToast === 'function') showToast("SYSTEM ERROR", "Terjadi kesalahan sistem. Tekan F12 (Console) untuk melihat detailnya.", "error");
  }
}

// ==========================================
// 🔥 TRANSAKSI & ADMIN RENDERER
// ==========================================
function filterTxStatus(status) {
  activeTxStatusFilter = status; activeTxPage = 1;
  document.querySelectorAll('[id^="tx-btn-"]').forEach(btn => {
    btn.className = "bg-[#131622] text-zinc-400 border border-[#1e2230] hover:text-white px-4 py-1.5 rounded-xl transition flex items-center gap-1.5";
  });
  const activeBtn = document.getElementById('tx-btn-' + status);
  if (activeBtn) activeBtn.className = "bg-amber-500 text-black font-semibold px-4 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm";
  renderTxProcessTable();
}

function handleTxSearch(query) { activeTxSearchQuery = query.toLowerCase().trim(); activeTxPage = 1; renderTxProcessTable(); }
function handleTxSort(sortVal) { activeTxSortOrder = sortVal; activeTxPage = 1; renderTxProcessTable(); }
function handleTxItemFilter(itemVal) { activeTxItemFilter = itemVal; activeTxPage = 1; renderTxProcessTable(); }
function handleTxPerPage(perPageVal) { activeTxPerPage = parseInt(perPageVal) || 10; activeTxPage = 1; renderTxProcessTable(); }
function changeTxPage(delta) { activeTxPage += delta; renderTxProcessTable(); }

function calculateWaitingDuration(timeStr) {
  if (!timeStr) return "Just now";
  const orderTime = new Date(timeStr.replace(' ', 'T')).getTime();
  if (isNaN(orderTime)) return "Just now";
  const diffMs = Date.now() - orderTime;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function renderTxProcessTable(isRefresh = false) {
  const table = document.getElementById('transaction-process-table');
  if (!table) return;
  if (isRefresh) {
    const refreshTimeElem = document.getElementById('tx-refreshed-time');
    if (refreshTimeElem) refreshTimeElem.innerText = new Date().toLocaleTimeString('en-US');
  }

  const counts = { Pending: 0, "Waiting Release": 0, Released: 0, Approved: 0, Rejected: 0 };
  adminTransactions.forEach(tx => { 
    if (counts[tx.status] !== undefined) counts[tx.status]++;
    tx.waiting = calculateWaitingDuration(tx.time);
  });
  
  Object.keys(counts).forEach(key => {
    const countElem = document.getElementById('count-' + key);
    if (countElem) countElem.innerText = counts[key];
  });
  const pendTodayElem = document.getElementById('tx-pending-today-count');
  if (pendTodayElem) pendTodayElem.innerText = counts.Pending;

  let filtered = adminTransactions.filter(tx => {
    if (activeTxStatusFilter !== 'All' && tx.status !== activeTxStatusFilter) return false;
    if (activeTxSearchQuery) {
      const matchId = tx.id.toLowerCase().includes(activeTxSearchQuery);
      const matchBuyer = tx.buyer.toLowerCase().includes(activeTxSearchQuery);
      if (!matchId && !matchBuyer) return false;
    }
    if (activeTxItemFilter !== 'all') {
      const hasItem = tx.items && tx.items.some(i => i.name.toLowerCase() === activeTxItemFilter.toLowerCase());
      if (!hasItem && tx.package !== activeTxItemFilter) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (activeTxSortOrder === 'newest') return b.id.localeCompare(a.id);
    if (activeTxSortOrder === 'oldest') return a.id.localeCompare(b.id);
    if (activeTxSortOrder === 'highest') return b.total - a.total;
    if (activeTxSortOrder === 'lowest') return a.total - b.total;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / activeTxPerPage));
  if (activeTxPage > totalPages) activeTxPage = totalPages;
  if (activeTxPage < 1) activeTxPage = 1;

  const startIndex = (activeTxPage - 1) * activeTxPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + activeTxPerPage);

  const curPageElem = document.getElementById('tx-current-page-num');
  const totPageElem = document.getElementById('tx-total-page-num');
  const prevBtn = document.getElementById('tx-btn-prev');
  const nextBtn = document.getElementById('tx-btn-next');
  if (curPageElem) curPageElem.innerText = activeTxPage;
  if (totPageElem) totPageElem.innerText = totalPages;
  if (prevBtn) prevBtn.disabled = (activeTxPage === 1);
  if (nextBtn) nextBtn.disabled = (activeTxPage === totalPages || totalPages === 1);

  table.innerHTML = '';
  if (paginatedData.length === 0) {
    table.innerHTML = `<tr><td colspan="12" class="p-8 text-center text-zinc-500 italic">No transactions found matching your filter criteria.</td></tr>`;
    return;
  }

  const userRank = getUserRank();
  const isWritable = isBisnisTier(userRank);
  const isTop = isTopAdmin(userRank);

  paginatedData.forEach(tx => {
    const prioColor = tx.priority === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    const statColor = tx.status === 'Released' || tx.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : (tx.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500 text-black font-semibold');

    const isFinalized = ['Released', 'Approved', 'Rejected'].includes(tx.status);

    let actionButtonsHtml = `<button onclick="openTxDetailModal('${tx.id}')" class="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition" title="View Detail"><i data-lucide="eye" class="w-3.5 h-3.5"></i></button>`;
    
    if (isWritable && (!isFinalized || isTop)) {
      actionButtonsHtml += `
        <button onclick="quickApproveTx('${tx.id}')" class="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg transition ml-1" title="Approve & Credit"><i data-lucide="check" class="w-3.5 h-3.5"></i></button>
        <button onclick="quickRejectTx('${tx.id}')" class="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition ml-1" title="Reject & Refund"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
      `;
    }

    let voucherBadgeHtml = '';
    if (tx.promoName) {
      voucherBadgeHtml = `<span class="block text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded-md mt-1 w-max" title="Voucher Diskon Applied"><i data-lucide="ticket" class="w-2.5 h-2.5 inline mr-0.5"></i> ${tx.promoName}</span>`;
    }

    table.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-4 font-mono text-zinc-300 font-semibold">${tx.id}</td>
        <td class="p-4 font-semibold text-white flex items-center gap-2"><i data-lucide="user" class="w-3.5 h-3.5 text-zinc-500"></i> ${tx.buyer}</td>
        <td class="p-3.5"><span class="px-2.5 py-0.5 bg-[#131622] border border-[#1e2230] text-zinc-300 rounded-full text-[10px] font-semibold uppercase">${tx.role}</span></td>
        <td class="p-4 text-zinc-400">${tx.package}</td>
        <td class="p-4 font-semibold text-white">${tx.qty}</td>
        <td class="p-4">
          <span class="font-bold text-amber-400 text-sm block">$${tx.total.toLocaleString()}</span>
          ${voucherBadgeHtml}
        </td>
        <td class="p-4 text-zinc-300">${tx.processed}</td>
        <td class="p-4 font-mono text-zinc-400 text-[11px]">${tx.time}</td>
        <td class="p-4 text-amber-400 font-semibold font-mono">${tx.waiting}</td>
        <td class="p-4"><span class="px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase ${prioColor}">${tx.priority}</span></td>
        <td class="p-4"><span class="px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase ${statColor}">${tx.status}</span></td>
        <td class="p-4 text-right whitespace-nowrap">${actionButtonsHtml}</td>
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

let currentModalTxId = null;
function openTxDetailModal(txId) {
  const tx = adminTransactions.find(t => t.id === txId);
  if (!tx) return;
  currentModalTxId = txId;
  document.getElementById('modal-tx-id').innerText = `Transaction Detail — ${tx.id}`;
  document.getElementById('modal-tx-buyer').innerText = tx.buyer;
  document.getElementById('modal-tx-role').innerText = tx.role;
  document.getElementById('modal-tx-date').innerText = tx.time;
  document.getElementById('modal-tx-duration').innerText = tx.waiting;
  
  const subElem = document.getElementById('modal-tx-subtotal');
  const vouElem = document.getElementById('modal-tx-voucher');
  if (subElem) subElem.innerText = "$" + (tx.subtotal ? tx.subtotal.toLocaleString() : tx.total.toLocaleString());
  if (vouElem) {
    if (tx.promoName) {
      vouElem.innerHTML = `${tx.promoName} <span class="text-red-400 font-mono">[- $${tx.discountAmount ? tx.discountAmount.toLocaleString() : '0'}]</span>`;
      vouElem.className = "font-tech font-bold text-purple-400";
    } else {
      vouElem.innerText = "None (No Voucher Used)";
      vouElem.className = "font-mono text-zinc-500 text-[11px]";
    }
  }

  document.getElementById('modal-tx-total').innerText = `$${tx.total.toLocaleString()}`;
  document.getElementById('modal-tx-profit').innerText = `$${Math.round(tx.total * 0.05).toLocaleString()}`;

  const itemsContainer = document.getElementById('modal-tx-items');
  itemsContainer.innerHTML = '';
  tx.items.forEach(i => {
    itemsContainer.innerHTML += `
      <div class="flex justify-between items-center py-1.5 border-b border-[#1e2230] last:border-0">
        <span class="text-white font-medium">${i.name}</span>
        <span class="text-zinc-400">x${i.qty}</span>
        <span class="text-zinc-400 font-mono">$${i.unitPrice ? i.unitPrice.toLocaleString() : i.price.toLocaleString()}</span>
        <span class="text-amber-400 font-bold font-mono">$${(i.qty * (i.unitPrice || i.price)).toLocaleString()}</span>
      </div>
    `;
  });

  const modalActions = document.getElementById('modal-action-buttons');
  if (modalActions) {
    const isFinalized = ['Released', 'Approved', 'Rejected'].includes(tx.status);
    modalActions.style.display = (isBisnisTier(getUserRank()) && (!isFinalized || isTopAdmin(getUserRank()))) ? 'grid' : 'none';
  }

  document.getElementById('tx-detail-modal').classList.remove('hidden');
}

function closeTxDetailModal() { document.getElementById('tx-detail-modal').classList.add('hidden'); }
function approveModalOrder() { if (currentModalTxId) quickApproveTx(currentModalTxId); closeTxDetailModal(); }
function rejectModalOrder() { if (currentModalTxId) quickRejectTx(currentModalTxId); closeTxDetailModal(); }

// ==========================================
// 💸 VAULT INVENTORY & STOCK MANAGEMENT
// ==========================================
function filterVaultInventory(category) {
  activeInventoryFilter = category;
  document.querySelectorAll('#vault-inventory-filters button').forEach(btn => {
    btn.className = 'cat-btn-inv bg-[#131622] text-zinc-400 border border-[#1e2230] hover:text-white px-4 py-2 rounded-xl transition text-xs';
  });
  const activeBtn = document.getElementById('inv-btn-' + category);
  if (activeBtn) {
    activeBtn.className = 'cat-btn-inv bg-red-600 text-white px-4 py-2 rounded-xl transition shadow-sm text-xs';
  } else if (event && event.currentTarget) {
    event.currentTarget.className = 'cat-btn-inv bg-red-600 text-white px-4 py-2 rounded-xl transition shadow-sm text-xs';
  }
  renderVaultInventory();
}

// ==========================================
// 🚀 PERBAIKAN LOGIKA: IZINKAN ROLE BISNIS MEMPROSES / RILIS TRANSAKSI
// ==========================================
function quickApproveTx(txId) {
  const userRank = getUserRank();
  if (!isBisnisTier(userRank)) { 
    showToast("ACCESS DENIED", "Read-Only mode cannot validate orders!", "error"); 
    return; 
  }
  
  const tx = adminTransactions.find(t => t.id === txId);
  if (tx) {
    const isFinalized = ['Released', 'Approved', 'Rejected'].includes(tx.status);
    if (isFinalized && !isBisnisTier(userRank)) {
      showToast("ACCESS DENIED", "You do not have permission to modify completed transactions!", "error");
      return;
    }

    if (tx.status === 'Pending') {
      tx.status = 'Waiting Release';
      tx.processed = currentLoggedInUser || 'ADMIN';
      saveAppData();
      updateDashboardData();
      showToast("PROCESSED", `TXID ${tx.id} moved to Waiting Release!`, "success");
      return;
    }

    if (tx.status !== 'Approved' && tx.status !== 'Released') {
      vaultBalance += tx.total;
    }

    tx.status = 'Released'; 
    tx.processed = currentLoggedInUser || 'ADMIN'; 
    saveAppData();
    
    updateDashboardData(); 
    showToast("RELEASED & CREDITED", `TXID ${tx.id} released! Balance of $${tx.total.toLocaleString()} credited to Vault.`, "success");
  }
}

function releaseAllOutstanding() {
  if (!isBisnisTier(getUserRank())) { showToast("ACCESS DENIED", "Mode Read-Only tidak dapat merilis saldo!", "error"); return; }
  const waitingReleaseTx = adminTransactions.filter(t => t.status === 'Waiting Release');
  if (waitingReleaseTx.length === 0) { showToast("WARNING", "Tidak ada pesanan dengan status Waiting Release!", "error"); return; }
  
  showCustomConfirm("Release all balances", `Otensikasi dan rilis total ${waitingReleaseTx.length} pesanan ke dalam kas brangkas?`, () => {
    let totalReleasedCash = 0;
    waitingReleaseTx.forEach(tx => {
      tx.status = 'Released';
      tx.processed = currentLoggedInUser || 'ADMIN';
      vaultBalance += tx.total;
      totalReleasedCash += tx.total;
    });
    saveAppData();
    updateDashboardData();
    sendDiscordWebhook(ORDERS_WEBHOOK_URL, "🟢 MASS SALDO RELEASED", `Sebanyak **${waitingReleaseTx.length} pesanan** telah dirilis oleh **${currentLoggedInUser.toUpperCase()}**. Total saldo **$${totalReleasedCash.toLocaleString()}** masuk ke brangkas!`, [], 3066993);
    showToast("SUCCESS", `Berhasil merilis ${waitingReleaseTx.length} pesanan sebesar $${totalReleasedCash.toLocaleString()} ke Brangkas!`, "success");
  });
}

function changeStock(index, delta) {
  if (!['Admin', 'Moderator', 'Don', 'Underboss', 'Bisnis'].includes(getUserRank())) return;
  if (vaultInventory[index]) {
    vaultInventory[index].stock = Math.max(0, vaultInventory[index].stock + delta);
    if (vaultInventory[index].stock === 0) vaultInventory[index].badge = 'OUT OF STOCK';
    else if (vaultInventory[index].stock <= 5) vaultInventory[index].badge = 'LOW';
    else vaultInventory[index].badge = 'NORMAL';
    
    saveAppData();
    renderVaultInventory();
    renderMarketplace(currentMarketplaceFilter);
  }
}

function deleteInventoryItem(index) {
  if (!['Admin', 'Moderator', 'Don', 'Underboss', 'Bisnis'].includes(getUserRank())) {
    showToast("ACCESS DENIED", "Your rank does not have permission to delete items!", "error");
    return;
  }
  if (vaultInventory[index]) {
    const itemName = vaultInventory[index].name;
    showCustomConfirm("DELETE ITEM", `Are you sure you want to permanently delete [${itemName}] from the catalog?`, () => {
      vaultInventory.splice(index, 1);
      saveAppData();
      renderVaultInventory();
      renderMarketplace(currentMarketplaceFilter);
      showToast("ITEM DELETED", `Item [${itemName}] has been removed from the system!`, "error");
    });
  }
}

// ==========================================
// 📜 FITUR: VAULT TRANSACTION HISTORY
// ==========================================
function renderVaultHistory(isRefresh = false) {
  const table = document.getElementById('vault-history-table');
  if (!table) return;

  let totalInflow = 0;
  let completedCount = 0;
  let rejectedCount = 0;

  adminTransactions.forEach(tx => {
    if (tx.status === 'Approved' || tx.status === 'Released') {
      totalInflow += tx.total;
      completedCount++;
    } else if (tx.status === 'Rejected') {
      rejectedCount++;
    }
  });

  const inflowElem = document.getElementById('hist-total-inflow');
  const countElem = document.getElementById('hist-total-count');
  const rejElem = document.getElementById('hist-total-rejected');
  if (inflowElem) inflowElem.innerText = "$" + totalInflow.toLocaleString();
  if (countElem) countElem.innerText = completedCount;
  if (rejElem) rejElem.innerText = rejectedCount;

  const searchQuery = document.getElementById('hist-search-input')?.value.toLowerCase().trim() || '';
  const statusFilter = document.getElementById('hist-status-filter')?.value || 'ALL';

  const filtered = adminTransactions.filter(tx => {
    if (statusFilter !== 'ALL' && tx.status !== statusFilter) return false;
    if (searchQuery) {
      const matchId = tx.id.toLowerCase().includes(searchQuery);
      const matchBuyer = tx.buyer.toLowerCase().includes(searchQuery);
      if (!matchId && !matchBuyer) return false;
    }
    return true;
  });

  table.innerHTML = '';
  if (filtered.length === 0) {
    table.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-zinc-500 italic">No transaction history found matching criteria.</td></tr>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  filtered.forEach(tx => {
    const statColor = tx.status === 'Approved' || tx.status === 'Released' 
      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
      : (tx.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20');
    
    const itemNames = tx.items ? tx.items.map(i => `${i.name} (x${i.qty})`).join(", ") : `${tx.qty} items`;

    table.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5 font-mono text-zinc-400 text-[11px]">${tx.time}</td>
        <td class="p-3.5 font-mono text-white font-bold">${tx.id}</td>
        <td class="p-3.5 font-bold text-white flex items-center gap-1.5"><i data-lucide="user" class="w-3.5 h-3.5 text-zinc-500"></i> ${tx.buyer}</td>
        <td class="p-3.5"><span class="px-2 py-0.5 bg-[#131622] border border-[#1e2230] text-zinc-300 rounded-md text-[10px] font-semibold uppercase">${tx.role}</span></td>
        <td class="p-3.5 text-zinc-300 max-w-xs truncate" title="${itemNames}">${itemNames}</td>
        <td class="p-3.5 font-bold text-emerald-400 text-sm">$${tx.total.toLocaleString()}</td>
        <td class="p-3.5"><span class="px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase ${statColor}">${tx.status}</span></td>
        <td class="p-3.5 text-right font-bold text-white uppercase">${tx.processed || 'ADMIN'}</td>
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// 📸 FILE UPLOADER DARI LAPTOP/PC & URL PROOF
// ==========================================
function handleProofFileUpload(event) {
  if (!isBisnisTier(getUserRank())) {
    showToast("ACCESS DENIED", "Mode Read-Only tidak dapat mengunggah bukti screenshot!", "error");
    return;
  }
  const files = event.target.files;
  if (!files || files.length === 0) return;

  if (uploadedProofThumbnails.length + files.length > 10) {
    showToast("WARNING", "Maksimal total lampiran adalah 10 foto!", "error");
    return;
  }

  let count = 0;
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedProofThumbnails.push(e.target.result);
      count++;
      if (count === files.length) {
        renderProofThumbnails();
        showToast("UPLOAD SUKSES", `${count} foto berhasil diunggah dari laptop/PC!`, "success");
      }
    };
    reader.readAsDataURL(file);
  });
}

function renderProofThumbnails() {
  const container = document.getElementById('proof-thumbnails-container');
  const countText = document.getElementById('proof-image-count-text');
  if (countText) countText.innerText = `${uploadedProofThumbnails.length} / 10 images selected`;
  if (!container) return;
  if (uploadedProofThumbnails.length === 0) {
    container.innerHTML = `<div class="col-span-full py-6 text-center text-zinc-500 italic"><i data-lucide="image-off" class="w-6 h-6 mx-auto mb-1 opacity-40"></i>There is no image proof yet for the selected stock.</div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons(); return;
  }
  container.innerHTML = '';
  uploadedProofThumbnails.forEach((url, idx) => {
    container.innerHTML += `
      <div class="relative group h-20 bg-[#131622] rounded-xl border border-[#1e2230] overflow-hidden shadow-sm">
        <img src="${url}" class="w-full h-full object-cover">
        <button onclick="removeProofThumbnail(${idx})" class="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">✕</button>
      </div>
    `;
  });
}

function promptAddProofUrl() {
  if (!isBisnisTier(getUserRank())) {
    showToast("ACCESS DENIED", "Mode Read-Only tidak dapat mengunggah bukti screenshot!", "error");
    return;
  }
  const url = prompt("Masukkan URL Gambar Bukti Screenshot / Discord Attachment:");
  if (url && url.startsWith('http')) {
    if (uploadedProofThumbnails.length >= 10) { alert("Maksimal 10 gambar!"); return; }
    uploadedProofThumbnails.push(url); renderProofThumbnails();
  }
}

function removeProofThumbnail(idx) { uploadedProofThumbnails.splice(idx, 1); renderProofThumbnails(); }
function clearProofForm() { document.getElementById('proof-details-input').value = ''; uploadedProofThumbnails = []; renderProofThumbnails(); }

function submitStockProof() {
  if (!isBisnisTier(getUserRank())) return;
  const detailsElem = document.getElementById('proof-details-input');
  if (!detailsElem || !detailsElem.value.trim()) { showToast("WARNING", "Harap isi deskripsi Verification Details terlebih dahulu!", "error"); return; }
  if (uploadedProofThumbnails.length === 0) { showToast("WARNING", "Harap tambahkan minimal 1 foto/URL gambar bukti screenshot!", "error"); return; }
  
  const details = detailsElem.value.trim();
  const dateStr = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  const activeMember = (currentLoggedInUser || "ADMIN").toUpperCase();
  
  const attachedImages = [...uploadedProofThumbnails];

  stockProofLogs.unshift({ 
    member: activeMember, 
    date: dateStr, 
    details: details, 
    proofCount: attachedImages.length, 
    images: attachedImages,
    posted: true 
  });

  const firstImage = attachedImages[0];
  const isBase64 = firstImage.startsWith('data:image');
  const urlParam = isBase64 ? null : firstImage;
  const rawParam = isBase64 ? attachedImages : [];

  sendDiscordWebhook(
    VAULT_LOGS_WEBHOOK_URL, 
    "🚨 VAULT STOCK PROOF VERIFIED & LOGGED", 
    `Bukti verifikasi stok brangkas baru saja diunggah oleh **${activeMember}**!`, 
    [
      { name: "📋 Verification Details", value: `\`\`\`${details}\`\`\``, inline: false }, 
      { name: "👤 Logged By", value: activeMember, inline: true },
      { name: "🖼️ Visual Proofs Attached", value: `${attachedImages.length} Screenshots Validated`, inline: true }, 
      { name: "⏰ Verification Time", value: dateStr, inline: false }
    ], 
    3447003, 
    urlParam, 
    rawParam
  );

  clearProofForm(); 
  renderStockProofHistory();  
  showToast("SUCCESS", "Bukti verifikasi stok berhasil disimpan dan foto masuk ke Discord!", "success");
}

function renderStockProofHistory() {
  const table = document.getElementById('stock-proof-history-table');
  if (!table) return;
  if (stockProofLogs.length === 0) {
    table.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-zinc-500 italic">There is no record of safe stock verification (Clean).</td></tr>`;
    return;
  }
  table.innerHTML = '';
  stockProofLogs.forEach((log, idx) => {
    const postBtn = `<span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-semibold uppercase inline-block"><i data-lucide="check-circle-2" class="w-3 h-3 inline"></i> Sent to Discord</span>`;
    const viewPhotoBtn = `
      <button onclick="openProofViewerModal(${idx})" class="px-3 py-1 bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-1.5 mx-auto">
        <i data-lucide="eye" class="w-3.5 h-3.5"></i> Lihat Foto (${log.proofCount || 1})
      </button>
    `;
    table.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5 font-bold text-white flex items-center gap-2"><i data-lucide="user" class="w-3.5 h-3.5 text-zinc-500"></i> ${log.member}</td>
        <td class="p-3.5 font-mono text-zinc-400 text-[11px]">${log.date}</td>
        <td class="p-3.5 font-semibold text-blue-400">${log.details}</td>
        <td class="p-3.5 text-center">${viewPhotoBtn}</td>
        <td class="p-3.5 text-right">${postBtn}</td>
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderMetalScrapLogs() {
  const table = document.getElementById('metal-scrap-table');
  if (!table) return;
  let totalIn = 0; let totalOut = 0;
  metalScrapLogs.forEach(l => { if (l.type === 'IN') totalIn += l.qty; else totalOut += l.qty; });
  const totalStock = totalIn - totalOut;
  document.getElementById('scrap-total-stock').innerText = `${totalStock.toLocaleString()} unit`;
  document.getElementById('scrap-total-in').innerText = `+${totalIn.toLocaleString()} unit`;
  document.getElementById('scrap-total-out').innerText = `-${totalOut.toLocaleString()} unit`;

  if (metalScrapLogs.length === 0) {
    table.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-zinc-500 italic">There are no records yet of metal scrap coming in or going out.</td></tr>`;
    return;
  }
  table.innerHTML = '';
  metalScrapLogs.forEach(log => {
    const badge = log.type === 'IN' ? `<span class="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px] rounded-full uppercase">PEMASUKAN (IN)</span>` : `<span class="px-2.5 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 font-bold text-[10px] rounded-full uppercase">PENGELUARAN (OUT)</span>`;
    const valText = log.type === 'IN' ? `+${log.qty.toLocaleString()}` : `-${log.qty.toLocaleString()}`;
    const valColor = log.type === 'IN' ? 'text-emerald-400' : 'text-red-500';
    table.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5 font-mono text-zinc-400 text-[11px]">${log.time}</td>
        <td class="p-3.5">${badge}</td>
        <td class="p-3.5 font-bold text-sm ${valColor}">${valText} unit</td>
        <td class="p-3.5 text-zinc-300 font-medium">${log.reason}</td>
        <td class="p-3.5 text-right font-bold text-white uppercase">${log.user}</td>
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// 🔩 METAL SCRAP ENGINE (DENGAN MODAL KUSTOM)
// ==========================================
let scrapCallback = null;

function showCustomPrompt(title, message, defaultValue, onSubmitted) {
  const backdrop = document.getElementById('custom-prompt-backdrop');
  const titleElem = document.getElementById('custom-prompt-title');
  const msgElem = document.getElementById('custom-prompt-message');
  const inputElem = document.getElementById('custom-prompt-input');

  if (!backdrop || !inputElem) {
    const val = prompt(message, defaultValue);
    if (val !== null) onSubmitted(val);
    return;
  }

  titleElem.innerText = title || "INPUT DATA";
  msgElem.innerText = message || "Masukkan nilai:";
  inputElem.value = defaultValue || "";
  scrapCallback = onSubmitted;

  backdrop.classList.remove('hidden');
  setTimeout(() => {
    inputElem.focus();
    inputElem.select();
  }, 50);

  inputElem.onkeypress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitCustomPrompt();
    }
  };
}

function submitCustomPrompt() {
  const inputElem = document.getElementById('custom-prompt-input');
  const val = inputElem ? inputElem.value : "";
  
  const backdrop = document.getElementById('custom-prompt-backdrop');
  if (backdrop) {
    backdrop.classList.add('hidden');
  }

  if (typeof scrapCallback === 'function') {
    const cb = scrapCallback;
    scrapCallback = null;
    cb(val);
  }
}

function addScrapLog(type) {
  if (!isBisnisTier(getUserRank())) return;

  showCustomPrompt(
    type === 'IN' ? "Pemasukan Metal Scrap" : "Pengeluaran Metal Scrap",
    `Masukkan jumlah (unit) besi scrap yang ${type === 'IN' ? 'MASUK' : 'KELUAR'}:`,
    "100",
    (qtyStr) => {
      const qty = parseInt(qtyStr);
      if (isNaN(qty) || qty <= 0) {
        showToast("WARNING", "Jumlah kuantitas harus berupa angka valid lebih dari 0!", "error");
        return;
      }

      setTimeout(() => {
        showCustomPrompt(
          "Keterangan Alur Scrap",
          "Masukkan alasan atau keterangan alur material:",
          type === 'IN' ? "Hasil peleburan scrap" : "Bahan crafting senjata",
          (reason) => {
            if (!reason) return;
            
            const timeStr = new Date().toLocaleString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
            const activeUser = (currentLoggedInUser || "ADMIN").toUpperCase();
            
            metalScrapLogs.unshift({ type: type, qty, reason, time: timeStr, user: activeUser });
            saveAppData();

            sendDiscordWebhook(METAL_SCRAP_WEBHOOK_URL, `🔩 METAL SCRAP LOG (${type === 'IN' ? 'PEMASUKAN' : 'PENGELUARAN'})`, `Catatan material scrap baru dicatat oleh **${activeUser}**`, [
              { name: "Tipe Alur", value: type === 'IN' ? "🟢 Pemasukan (+IN)" : "🔴 Pengeluaran (-OUT)", inline: true },
              { name: "Jumlah Qty", value: `${qty.toLocaleString()} Unit`, inline: true }, 
              { name: "Keterangan", value: reason, inline: false }
            ], type === 'IN' ? 3066993 : 15158332);

            renderMetalScrapLogs();
            showToast("SCRAP LOGGED", `Catatan ${type === 'IN' ? 'Pemasukan' : 'Pengeluaran'} Metal Scrap berhasil disimpan!`, "success");
          }
        );
      }, 200);
    }
  );
}

function switchCatalogTab(tabName) {
  currentCatalogTab = tabName;
  const dropdown = document.getElementById('catalog-filter-dropdown');
  if (dropdown && dropdown.value !== tabName) {
    dropdown.value = tabName;
  }
  renderTonCatalog();
}

function renderTonCatalog() {
  const tableBody = document.getElementById('ton-catalog-table');
  if (!tableBody) return;
  const savedProfiles = getSafeStorage('ton_all_profiles') || {};
  const allUsers = Object.keys(savedProfiles);

  const filteredUsers = allUsers.filter(user => {
    if (currentCatalogTab === 'All') return true;
    return (savedProfiles[user].groupType || 'Family') === currentCatalogTab;
  });

  const rank = getUserRank();
  const canModifyRoster = isDonTier(rank);

  const thActions = document.getElementById('th-roster-actions');
  const noteAdmin = document.getElementById('roster-admin-note');
  if (thActions) thActions.style.display = canModifyRoster ? 'table-cell' : 'none';
  if (noteAdmin) noteAdmin.style.display = canModifyRoster ? 'inline' : 'none';

  if (filteredUsers.length === 0) {
    const colCount = canModifyRoster ? 4 : 3;
    tableBody.innerHTML = `<tr><td colspan="${colCount}" class="p-4 text-center text-zinc-500 italic">There are no members registered in the category yet.[${currentCatalogTab}].</td></tr>`;
    return;
  }
  const rankOptions = ["Admin", "Moderator", "Don", "Underboss", "Bisnis", "Consigliere", "Captain", "Capo", "Soldiers", "Associates"];
  tableBody.innerHTML = '';
  filteredUsers.forEach((username, idx) => {
    const prof = savedProfiles[username] || {};
    if (!prof || typeof prof !== 'object' || !prof.name) return;
    const rankInputId = `catalog-rank-${idx}`;
    const groupSelectId = `catalog-group-${idx}`;
    const safeName = prof.name || '-';
    const currentJob = prof.job || 'Soldiers';
    const currentGroup = prof.groupType || 'Family';
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
    const avatarUrl = (prof.avatar && prof.avatar.startsWith('http')) ? prof.avatar : defaultAvatar;

    let groupCellHtml = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${currentGroup === 'Internal' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}">${currentGroup}</span>`;
    let rankCellHtml = `<span class="font-bold text-white">${currentJob}</span>`;
    let actionCellHtml = '';

    if (canModifyRoster) {
      groupCellHtml = `<select id="${groupSelectId}" class="bg-[#131622] border border-[#1e2230] text-white px-2 py-1 rounded-lg text-xs font-bold"><option value="Internal" ${currentGroup === 'Internal' ? 'selected' : ''}>Internal</option><option value="Family" ${currentGroup === 'Family' ? 'selected' : ''}>Family</option></select>`;
      let rankSelectOptions = rankOptions.map(r => `<option value="${r}" ${currentJob === r ? 'selected' : ''}>${r}</option>`).join('');
      rankCellHtml = `<select id="${rankInputId}" class="w-full bg-[#131622] border border-[#1e2230] text-white px-2.5 py-1 rounded-lg text-xs font-bold">${rankSelectOptions}</select>`;
      actionCellHtml = `<td class="p-3.5 text-right space-x-1.5"><button onclick="adminUpdateCatalogUser('${username}', '${rankInputId}', '${groupSelectId}')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1 rounded-lg text-xs uppercase shadow-sm">Update</button><button onclick="adminDeleteUser('${username}')" class="bg-red-600 hover:bg-red-500 text-white font-bold px-2 py-1 rounded-lg text-xs uppercase shadow-sm"><i data-lucide="trash-2" class="w-3.5 h-3.5 inline"></i></button></td>`;
    }

    tableBody.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full border border-[#1e2230] overflow-hidden shrink-0 bg-red-500/10"><img src="${avatarUrl}" onerror="this.src='${defaultAvatar}'" class="w-full h-full object-cover"></div><div><p class="font-bold text-white text-xs">${safeName}</p><p class="font-mono text-[11px] text-zinc-500">${username}</p></div></div></td>
        <td class="p-3.5">${groupCellHtml}</td>
        <td class="p-3.5">${rankCellHtml}</td>
        ${actionCellHtml}
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function adminUpdateCatalogUser(targetUsername, rankInputId, groupSelectId) {
  // Ambil nilai terbaru dari kotak pilihan (dropdown)
  const newRank = document.getElementById(rankInputId)?.value || 'Soldiers';
  const newGroup = document.getElementById(groupSelectId)?.value || 'Internal';
  
  if (!targetUsername) return;

  // 1. CARI NAMA ASLI DI DATABASE (Anti-error Huruf Besar/Kecil)
  let profileKey = Object.keys(savedProfiles).find(k => k.toLowerCase() === targetUsername.toLowerCase());
  if (!profileKey) profileKey = targetUsername.toLowerCase(); // Buat baru jika tidak ketemu

  if (!savedProfiles[profileKey]) {
      savedProfiles[profileKey] = { name: targetUsername.toUpperCase(), job: 'Soldiers', groupType: 'Family' };
  }
  
  // 2. Ubah Pangkat di Daftar Roster
  savedProfiles[profileKey].job = newRank; 
  savedProfiles[profileKey].groupType = newGroup;

  // 3. Ubah Pangkat di Sistem Login (Agar tidak bentrok saat dia login)
  const lowerTarget = targetUsername.toLowerCase();
  if (customAccounts[lowerTarget]) {
      customAccounts[lowerTarget].rank = newRank;
  }
  
  // 4. Simpan & Tembak ke Firebase
  if (typeof saveAppData === 'function') saveAppData(); 
  
  // 5. Refresh Layar Sendiri
  if (typeof renderTonCatalog === 'function') renderTonCatalog();
  if (typeof renderCustomAccountsTable === 'function') renderCustomAccountsTable();
  
  if (typeof showToast === 'function') showToast("ROSTER UPDATED", `Data ${targetUsername} berhasil diperbarui jadi ${newRank}!`, "success");
}

function adminDeleteUser(targetUsername) {
  const currentRank = getUserRank();
  if (!isTopAdmin(currentRank)) {
    showToast("ACCESS DENIED", "Only admins and moderators have the authority to permanently delete member data!", "error");
    return;
  }
  showCustomConfirm("Remove Member", `Permanently delete member ${targetUsername} from the system?`, () => {
    const savedProfiles = getSafeStorage('ton_all_profiles') || {};
    const deletedName = savedProfiles[targetUsername]?.name || targetUsername;
    const deletedRank = savedProfiles[targetUsername]?.job || 'No Rank';
    delete savedProfiles[targetUsername];
    localStorage.setItem('ton_all_profiles', JSON.stringify(savedProfiles));
    sendDiscordWebhook(PROFILE_WEBHOOK_URL, "🗑️ ROSTER MEMBER REMOVED / DELETED", `Administrator **${currentLoggedInUser || 'ADMIN'}** has removed a member from The Old Norse roster.`, [
      { name: "👤 Member Removed", value: `**${targetUsername}**`, inline: true },
      { name: "📝 Character Name (IC)", value: deletedName, inline: true },
      { name: "💼 Last Position Held", value: deletedRank, inline: true }
    ], 15158332);
    showToast("MEMBER DELETED", `Member [${targetUsername}] has been removed from the system!`, "error");
    renderTonCatalog();
  });
}

function handleProfileImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxDim = 300; 
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
      } else {
        if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      icUploadedBase64 = canvas.toDataURL('image/jpeg', 0.75);
      
      const imgElem = document.getElementById('profile-avatar-img');
      const sideImg = document.getElementById('sidebar-user-avatar');
      const sideInit = document.getElementById('sidebar-user-initials');
      
      if (imgElem) imgElem.src = icUploadedBase64;
      if (sideImg && sideInit) {
        sideImg.src = icUploadedBase64;
        sideImg.classList.remove('hidden');
        sideInit.classList.add('hidden');
      }
      
      showToast("AVATAR READY", "Foto otomatis dikompres agar ringan & siap disimpan permanen!", "success");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function renderProfilePage() {
  const activeName = currentLoggedInUser || 'GUEST';
  const activeRole = getUserRank().toUpperCase();
  const nameElem = document.getElementById('profile-name');
  const badgeElem = document.getElementById('profile-rank-badge');
  if (nameElem) nameElem.innerText = activeName;
  if (badgeElem) badgeElem.innerText = activeRole;

  const savedProfiles = getSafeStorage('ton_all_profiles') || {};
  const prof = savedProfiles[activeName] || { name: '', phone: '', idcard: '', job: '', avatar: '' };
  updateUserAvatars(prof.avatar, activeName);

  if (document.getElementById('ic-name')) document.getElementById('ic-name').value = prof.name || '';
  if (document.getElementById('ic-phone')) document.getElementById('ic-phone').value = prof.phone || '';
  if (document.getElementById('ic-idcard')) document.getElementById('ic-idcard').value = prof.idcard || '';
  if (document.getElementById('ic-avatar')) {
    const isBase64 = prof.avatar && prof.avatar.startsWith('data:image');
    document.getElementById('ic-avatar').value = isBase64 ? '' : (prof.avatar || '');
  }

  const icJob = document.getElementById('ic-job');
  const icJobLabel = document.getElementById('ic-job-label');
  if (icJob && icJobLabel) {
    icJob.value = prof.job || activeRole || 'Soldiers';
    if (!isDonTier(getUserRank())) {
      icJob.disabled = true; icJob.classList.add('opacity-50', 'cursor-not-allowed', 'border-red-900/50');
      icJobLabel.innerHTML = 'Rank <span class="text-red-500 font-bold">(🔒 LOCKED BY ADMIN)</span>';
    } else {
      icJob.disabled = false; icJob.classList.remove('opacity-50', 'cursor-not-allowed', 'border-red-900/50');
      icJobLabel.innerHTML = 'Pekerjaan / Gang / Jabatan <span class="text-emerald-400 font-bold">(🔓 ADMIN ACCESS)</span>';
    }
  }
}

function updateUserAvatars(customUrl, userName) {
  const activeName = userName || currentLoggedInUser || 'GUEST';
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeName)}`;
  const finalUrl = (customUrl && (customUrl.startsWith('http') || customUrl.startsWith('data:image'))) ? customUrl : defaultAvatar;
  const profileImg = document.getElementById('profile-avatar-img');
  const sidebarImg = document.getElementById('sidebar-user-avatar');
  const sidebarInitials = document.getElementById('sidebar-user-initials');

  if (profileImg) { profileImg.src = finalUrl; profileImg.onerror = () => { profileImg.src = defaultAvatar; }; }
  if (sidebarImg && sidebarInitials) {
    sidebarImg.src = finalUrl; sidebarImg.classList.remove('hidden'); sidebarInitials.classList.add('hidden');
    sidebarImg.onerror = () => { sidebarImg.src = defaultAvatar; sidebarImg.onerror = null; };
  }
}

function saveUserProfile() {
  const activeName = currentLoggedInUser || 'GUEST';
  const savedProfiles = getSafeStorage('ton_all_profiles') || {};
  const existing = savedProfiles[activeName] || {};
  
  const nameInput = document.getElementById('ic-name');
  const phoneInput = document.getElementById('ic-phone');
  const idcardInput = document.getElementById('ic-idcard');
  const jobInput = document.getElementById('ic-job');
  const avatarInput = document.getElementById('ic-avatar');

  if (!nameInput || !phoneInput || !idcardInput) {
    showToast("ERROR", "Form Profile IC tidak lengkap di HTML!", "error");
    return;
  }

  let validatedJob = existing.job || 'Soldiers';
  if (isDonTier(getUserRank()) && jobInput) {
    validatedJob = jobInput.value || 'Soldiers';
  }

  const urlVal = avatarInput?.value.trim() || '';
  const finalAvatar = icUploadedBase64 || urlVal || existing.avatar || '';

  const profileData = {
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
    idcard: idcardInput.value.trim(),
    job: validatedJob,
    avatar: finalAvatar,
    groupType: existing.groupType || 'Family'
  };

  if (!profileData.name || !profileData.phone || !profileData.idcard) { 
    showToast("WARNING", "Mohon lengkapi Nama Karakter, Telepon, dan ID Card!", "error"); 
    return; 
  }

  try {
    savedProfiles[activeName] = profileData;
    localStorage.setItem('ton_all_profiles', JSON.stringify(savedProfiles));
    updateUserAvatars(profileData.avatar, activeName);
    renderProfilePage(); 
    renderTonCatalog();
    
    const isBase64 = profileData.avatar && profileData.avatar.startsWith('data:image');
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(activeName)}`;
    
    const urlParam = (isBase64 || !profileData.avatar) ? null : profileData.avatar;
    const rawParam = isBase64 ? [profileData.avatar] : [];

    sendDiscordWebhook(
      PROFILE_WEBHOOK_URL, 
      "NEW IN-CHARACTER (IC) PROFILE REGISTERED", 
      `Data diri IC dan Foto Profil baru saja diperbarui oleh **${activeName}**`, 
      [
        { name: "🪪 Akun Login (Role)", value: `**${activeName}** (${getUserRank().toUpperCase()})`, inline: false },
        { name: "👤 Nama Karakter (IC)", value: profileData.name || "-", inline: true },
        { name: "📞 Nomor Telepon", value: profileData.phone || "-", inline: true },
        { name: "🆔 ID Card / Kependudukan", value: profileData.idcard || "-", inline: true },
        { name: "💼 Pekerjaan / Jabatan", value: profileData.job || "Soldiers", inline: true }
      ], 
      3447003, 
      urlParam, 
      rawParam 
    );
    
    icUploadedBase64 = ''; 
    showToast("PROFILE SAVED", "Data In-Character (IC) dan Foto Profil berhasil disimpan dan dikirim ke Discord!", "success");
  } catch (e) {
    showToast("MEMORI PENUH", "Gagal menyimpan foto! Gunakan URL gambar eksternal yang lebih pendek.", "error");
  }
}

function updateDashboardData() {
  const balElem = document.getElementById('sidebar-vault-balance');
  if (balElem) balElem.innerText = "$" + vaultBalance.toLocaleString();
  const syncTime = document.getElementById('synced-time');
  if (syncTime) syncTime.innerText = new Date().toLocaleTimeString('en-US');

  let orgSpendTotal = adminTransactions.filter(t => t.status === 'Released' || t.status === 'Approved').reduce((s, i) => s + i.total, 0);
  const orgSpendElem = document.getElementById('hq-org-spending');
  if (orgSpendElem) orgSpendElem.innerText = "$" + orgSpendTotal.toLocaleString();

  if (orgLeaderboard.length > 0) {
    orgLeaderboard.sort((a,b) => b.spent - a.spent);
    if (document.getElementById('hq-top-spender-name')) document.getElementById('hq-top-spender-name').innerText = orgLeaderboard[0].name;
    if (document.getElementById('hq-top-spender-val')) document.getElementById('hq-top-spender-val').innerHTML = `$${orgLeaderboard[0].spent.toLocaleString()} <span class="text-[10px] text-zinc-500">total</span>`;
  } else {
    if (document.getElementById('hq-top-spender-name')) document.getElementById('hq-top-spender-name').innerText = "None";
    if (document.getElementById('hq-top-spender-val')) document.getElementById('hq-top-spender-val').innerHTML = `$0 <span class="text-[10px] text-zinc-500">total</span>`;
  }

  const myOrdersList = document.getElementById('my-orders-list');
  if (myOrdersList) {
    const myOrders = adminTransactions.filter(o => o.buyer === currentLoggedInUser || o.buyer === "ADMIN");
    myOrdersList.innerHTML = myOrders.length === 0 ? `<p class="text-zinc-500 italic">No orders yet.</p>` : '';
    myOrders.forEach(o => {
      myOrdersList.innerHTML += `<div class="bg-[#131622] p-3.5 rounded-xl border border-[#1e2230] flex justify-between items-center"><div><span class="font-mono text-zinc-400 text-[11px] font-bold">${o.id}</span><p class="font-bold text-white text-xs">${o.items ? o.items.map(i => `${i.name} (x${i.qty})`).join(', ') : 'Weapon Items'}</p></div><div class="text-right"><span class="font-tech font-bold text-amber-400 text-base">$${o.total.toLocaleString()}</span><p class="text-[10px] font-bold uppercase ${o.status === 'Released' || o.status === 'Approved' ? 'text-emerald-400' : 'text-amber-500'}">${o.status}</p></div></div>`;
    });
  }
  renderTxProcessTable(); renderReleaseOutstanding(); renderVaultHistory(); renderLeaderboard();
  
  updateLockdownUI();
  renderBlacklistTable();
  renderStaffKPITable();
}

// ============================================================================
// 🚨 FITUR RESET DENGAN DOUBLE AUTENTIKASI (ROSTER SAFE)
// ============================================================================
function triggerSystemReset() {
    if (getUserRank() !== 'Moderator') {
        showToast("ACCESS DENIED", "The System Reset feature is EXCLUSIVE to the Moderator rank!", "error");
        return;
    }

    showCustomConfirm(
        "CONFIRMATION 1/2: SYSTEM RESET",
        "Warning: Transaction history, cash, and logs will be permanently deleted. (DATA ROSTER & AKUN TETAP AMAN). Are you sure?",
        () => {
            setTimeout(() => {
                showCustomConfirm(
                    "FINAL CONFIRMATION 2/2: REPEAT WARNING",
                    "This action cannot be undone! Are you absolutely 100% sure you want to delete transaction history?",
                    () => {
                        // 1. HAPUS MEMORI LOKAL (KECUALI ton_all_profiles)
                        localStorage.removeItem('ton_admin_transactions');
                        localStorage.removeItem('ton_org_leaderboard');
                        localStorage.removeItem('ton_metal_scrap');
                        
                        // 2. KOSONGKAN VARIABEL TRANSAKSI (JANGAN KOSONGKAN savedProfiles/customAccounts)
                        adminTransactions = [];
                        orgLeaderboard = [];
                        metalScrapLogs = [];
                        vaultBalance = 0;

                        // 3. SIMPAN KE FIREBASE
                        if (typeof saveAppData === 'function') saveAppData();

                        showToast("SYSTEM RESET", "Riwayat transaksi berhasil direset! Data Roster AMAN.", "success");

                        setTimeout(() => {
                            location.reload();
                        }, 1500);
                    }
                );
            }, 300); // Sedikit jeda agar modal pertama menutup dengan mulus
        }
    );
}

// ==========================================
// 📋 FUNGSI PENDUKUNG VISUAL PROOF & ROSTER VIEWER
// ==========================================
function openProofViewerModal(index) {
  const log = stockProofLogs[index];
  if (!log || !log.images || log.images.length === 0) {
    showToast("WARNING", "Tidak ada data foto tersimpan pada log ini.", "error");
    return;
  }

  let oldModal = document.getElementById('proof-viewer-modal');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'proof-viewer-modal';
  modal.className = 'fixed inset-0 z-[250] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-opacity';
  
  let imagesHtml = '';
  log.images.forEach((imgUrl, i) => {
    imagesHtml += `
      <div class="space-y-1">
        <span class="text-[10px] font-mono text-zinc-400">Lampiran #${i + 1}</span>
        <div class="bg-black rounded-lg border border-[#1e2230] overflow-hidden flex items-center justify-center max-h-[70vh]">
          <img src="${imgUrl}" class="max-w-full max-h-[70vh] object-contain mx-auto" alt="Proof Image">
        </div>
      </div>
    `;
  });

  modal.innerHTML = `
    <div class="w-full max-w-4xl bg-[#0e1017] border border-blue-500/50 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.2)] p-6 relative overflow-hidden flex flex-col max-h-[90vh]">
      <div class="flex items-center justify-between border-b border-[#1e2230] pb-3 mb-4 shrink-0">
        <div class="flex items-center gap-2">
          <i data-lucide="image" class="w-5 h-5 text-blue-400"></i>
          <div>
            <h3 class="font-bold font-tech text-white uppercase text-base tracking-wider">VISUAL PROOF VIEWER</h3>
            <p class="text-[10px] text-zinc-400 font-mono">Uploaded by ${log.member} on ${log.date}</p>
          </div>
        </div>
        <button onclick="document.getElementById('proof-viewer-modal').remove()" class="text-zinc-500 hover:text-white p-1 rounded-lg bg-[#131622] hover:bg-red-600 transition">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
      
      <div class="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl mb-4 shrink-0 font-medium">
        <strong>Details:</strong> "${log.details}"
      </div>

      <div class="overflow-y-auto space-y-6 pr-2 flex-1 scrollbar-thin">
        ${imagesHtml}
      </div>

      <div class="mt-4 pt-3 border-t border-[#1e2230] flex justify-end shrink-0">
        <button onclick="document.getElementById('proof-viewer-modal').remove()" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-tech font-bold text-xs uppercase rounded-xl shadow transition">
          Tutup Viewer
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// 🔐 MANAJEMEN AKUN CUSTOM (MODERATOR ONLY!)
// ==========================================
function renderCustomAccountsTable() {
  const tbody = document.getElementById('custom-accounts-table');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  const users = Object.keys(customAccounts);
  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-zinc-500 italic">Belum ada akun custom.</td></tr>`;
    return;
  }
  
  users.forEach((username) => {
    const acc = customAccounts[username];
    tbody.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5 font-bold text-white font-mono">${username}</td>
        <td class="p-3.5 font-mono text-purple-400"><span class="bg-black/40 rounded px-2 py-0.5">${acc.pass}</span></td>
        <td class="p-3.5"><span class="px-2.5 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full text-[10px] font-bold uppercase">${acc.rank}</span></td>
        <td class="p-3.5 text-right">
          <button onclick="deleteCustomAccount('${username}')" class="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition" title="Hapus Akun"><i data-lucide="trash-2" class="w-4 h-4 inline"></i></button>
        </td>
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addCustomAccount() {
    // 1. Cek rank kebal huruf besar/kecil
    const currentRank = (typeof getUserRank === 'function' ? getUserRank() : currentUserRole || '').toLowerCase();
    if (currentRank !== 'moderator' && currentRank !== 'admin') {
        if(typeof showToast === 'function') showToast("AKSES DITOLAK", "Hanya Moderator yang bisa membuat akun.", "error");
        return;
    }

    const user = document.getElementById('new-bisnis-user')?.value.trim();
    const pass = document.getElementById('new-bisnis-pass')?.value.trim();
    const rank = document.getElementById('new-bisnis-rank')?.value || 'Bisnis';
    
    if (!user || !pass) {
        if(typeof showToast === 'function') showToast("WARNING", "Username dan Password wajib diisi!", "error");
        return;
    }

    const lowerUser = user.toLowerCase();
    if (typeof customAccounts === 'undefined') window.customAccounts = {};
    if (typeof savedProfiles === 'undefined') window.savedProfiles = {};

    // 2. Simpan ke Login System
    customAccounts[lowerUser] = { pass: pass, rank: rank };
    
    // 3. Bersihkan data ganda di Roster (jika ada)
    const existingKey = Object.keys(savedProfiles).find(k => k.toLowerCase() === lowerUser);
    if (existingKey && existingKey !== user) {
        delete savedProfiles[existingKey];
    }

    // 4. Masukkan langsung ke Roster TON!
    savedProfiles[user] = { 
        name: user.toUpperCase(), 
        phone: '0812-XXXX', 
        idcard: 'TON-' + Math.floor(1000 + Math.random()*9000), 
        job: rank, 
        avatar: '', 
        groupType: 'Family' 
    };
    
    // 5. Tembak ke Firebase dan Segarkan Layar
    if (typeof saveAppData === 'function') saveAppData(); 
    if (typeof renderCustomAccountsTable === 'function') renderCustomAccountsTable();
    if (typeof renderTonCatalog === 'function') renderTonCatalog(); 

    if (typeof showToast === 'function') showToast("AKUN DISIMPAN", `Akun "${user}" berhasil dibuat & masuk Roster!`, "success");

    // Kosongkan kotak ketikan
    if (document.getElementById('new-bisnis-user')) document.getElementById('new-bisnis-user').value = '';
    if (document.getElementById('new-bisnis-pass')) document.getElementById('new-bisnis-pass').value = '';
}
  
function deleteCustomAccount(username) {
    // 1. Cek rank kebal huruf besar/kecil
    const currentRank = (typeof getUserRank === 'function' ? getUserRank() : currentUserRole || '').toLowerCase();
    if (currentRank !== 'moderator' && currentRank !== 'admin') {
        if(typeof showToast === 'function') showToast("AKSES DITOLAK", "Hanya Moderator yang bisa menghapus akun.", "error");
        return;
    }

    // 2. Konfirmasi & Eksekusi Hapus
    if (typeof showCustomConfirm === 'function') {
        showCustomConfirm("Hapus Akun", `Yakin hapus akun "${username}"?`, () => executeDelete(username));
    } else if (confirm(`Yakin hapus akun "${username}"?`)) {
        executeDelete(username);
    }

    function executeDelete(targetUser) {
        const lowerTarget = targetUser.toLowerCase();
        
        // Hapus dari data Login
        if (typeof customAccounts !== 'undefined' && customAccounts[lowerTarget]) {
            delete customAccounts[lowerTarget];
        }
        
        // Hapus dari Roster (Sapu bersih semua huruf besar/kecilnya)
        if (typeof savedProfiles !== 'undefined') {
            const realKey = Object.keys(savedProfiles).find(k => k.toLowerCase() === lowerTarget);
            if (realKey) delete savedProfiles[realKey];
            if (savedProfiles[targetUser]) delete savedProfiles[targetUser];
        }

        // Tembak ke Firebase dan Refresh
        if (typeof saveAppData === 'function') saveAppData();
        if (typeof renderCustomAccountsTable === 'function') renderCustomAccountsTable();
        if (typeof renderTonCatalog === 'function') renderTonCatalog();
        
        if (typeof showToast === 'function') showToast("AKUN DIHAPUS", `Akun "${targetUser}" berhasil dihapus bersih!`, "success");
    }
}


// ============================================================================
// 🚨 FITUR 1: VAULT LOCKDOWN MODE (PANIC BUTTON)
// ============================================================================
function toggleVaultLockdown() {
  if (!isDonTier(getUserRank())) {
    showToast("ACCESS DENIED", "Only the Superiors & Moderators have the right to set the Lockdown status!", "error");
    return;
  }
  
  isVaultLockdown = !isVaultLockdown;
  saveAppData();
  updateLockdownUI();
  
  const statusText = isVaultLockdown ? "🔒 EMERGENCY CLOSED ( LOCKDOWN )" : "🔓 OPEN ( OPERATIONAL )";
  const embedColor = isVaultLockdown ? 15158332 : 3066993;
  
  sendDiscordWebhook(
    LOGS_WEBHOOK_URL, 
    "🚨 VAULT OPERATIONAL STATUS CHANGED", 
    `Status operasional brangkas dan pasar persenjataan telah diubah menjadi: **${statusText}** oleh **${currentLoggedInUser.toUpperCase()}**.`, 
    [], 
    embedColor
  );

  showToast("LOCKDOWN STATUS", `Safe now: ${statusText}`, isVaultLockdown ? "error" : "success");
}

function updateLockdownUI() {
  const banner = document.getElementById('lockdown-warning-banner');
  const btnText = document.getElementById('lockdown-btn-text');
  const btnIcon = document.getElementById('lockdown-btn-icon');
  
  if (banner) {
    if (isVaultLockdown) banner.classList.remove('hidden');
    else banner.classList.add('hidden');
  }
  
  if (btnText && btnIcon) {
    if (isVaultLockdown) {
      btnText.innerText = "BUKA KEMBALI BRANGKAS (UNLOCK)";
      btnIcon.setAttribute('data-lucide', 'unlock');
      document.getElementById('btn-lockdown-container')?.classList.replace('bg-red-600', 'bg-emerald-600');
    } else {
      btnText.innerText = "Activate Emergency Mode";
      btnIcon.setAttribute('data-lucide', 'lock');
      document.getElementById('btn-lockdown-container')?.classList.replace('bg-emerald-600', 'bg-red-600');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

// ============================================================================
// 🛡️ FITUR 2: BLACKLIST / FREEZE ACCOUNT MANAGER
// ============================================================================
function renderBlacklistTable() {
  const tbody = document.getElementById('blacklist-users-table');
  const countElem = document.getElementById('total-blacklist-count');
  if (!tbody) return;
  
  if (countElem) countElem.innerText = blacklistedUsers.length;
  tbody.innerHTML = '';

  if (blacklistedUsers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="2" class="p-6 text-center text-zinc-500 italic">No accounts have been blacklisted yet.</td></tr>`;
    return;
  }

  blacklistedUsers.forEach((user) => {
    tbody.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5 font-bold text-red-400 font-mono flex items-center gap-2">
          <i data-lucide="shield-alert" class="w-4 h-4 shrink-0"></i> ${user.toUpperCase()}
        </td>
        <td class="p-3.5 text-right">
          <button onclick="removeBlacklistUser('${user}')" class="px-3.5 py-1.5 bg-[#131622] hover:bg-emerald-600 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold uppercase transition border border-[#1e2230]">
            Pulihkan (Unfreeze)
          </button>
        </td>
      </tr>
    `;
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addBlacklistUser() {
  if (getUserRank() !== 'Moderator') {
    showToast("ACCESS DENIED", "Hanya Moderator yang berhak membekukan akun!", "error");
    return;
  }
  const inputElem = document.getElementById('new-blacklist-username');
  const targetUser = inputElem?.value.trim().toLowerCase();

  if (!targetUser) { showToast("WARNING", "Masukkan username Discord/IC yang ingin dibekukan!", "error"); return; }
  if (blacklistedUsers.includes(targetUser)) { showToast("DUPLIKAT", `Akun "${targetUser}" sudah ada di dalam daftar Blacklist!`, "error"); return; }

  blacklistedUsers.push(targetUser);
  saveAppData();
  if (inputElem) inputElem.value = '';
  renderBlacklistTable();
  
  sendDiscordWebhook(LOGS_WEBHOOK_URL, "🛡️ USER ACCOUNT FROZEN", `Moderator **${currentLoggedInUser.toUpperCase()}** telah membekukan (blacklist) akun: **${targetUser.toUpperCase()}**.`, [], 15158332);
  showToast("USER FROZEN", `Akun [${targetUser.toUpperCase()}] berhasil dibekukan!`, "error");
}

function removeBlacklistUser(targetUser) {
  if (getUserRank() !== 'Moderator') {
    showToast("ACCESS DENIED", "Hanya Moderator yang berhak memulihkan akun!", "error");
    return;
  }
  showCustomConfirm("PULIHKAN AKUN", `Lepaskan status Blacklist dari akun [${targetUser.toUpperCase()}]?`, () => {
    blacklistedUsers = blacklistedUsers.filter(u => u !== targetUser);
    saveAppData();
    renderBlacklistTable();
    sendDiscordWebhook(LOGS_WEBHOOK_URL, "🟢 USER ACCOUNT RESTORED", `Moderator **${currentLoggedInUser.toUpperCase()}** telah memulihkan akun: **${targetUser.toUpperCase()}**.`, [], 3066993);
    showToast("USER RESTORED", `Akun [${targetUser.toUpperCase()}] telah dipulihkan!`, "success");
  });
}

// ============================================================================
// 📊 FITUR 3: STAFF KPI & PRODUCTIVITY TRACKER
// ============================================================================
function renderStaffKPITable() {
  const tbody = document.getElementById('staff-kpi-table');
  if (!tbody) return;

  let staffStats = {};
  
  adminTransactions.forEach(tx => {
    if (['Approved', 'Released', 'Rejected'].includes(tx.status) && tx.processed && tx.processed !== 'Pending') {
      const staffName = tx.processed.toUpperCase();
      if (!staffStats[staffName]) {
        staffStats[staffName] = { approved: 0, rejected: 0, totalVal: 0 };
      }
      if (tx.status === 'Approved' || tx.status === 'Released') {
        staffStats[staffName].approved++;
        staffStats[staffName].totalVal += tx.total;
      } else if (tx.status === 'Rejected') {
        staffStats[staffName].rejected++;
      }
    }
  });

  const staffNames = Object.keys(staffStats);
  if (staffNames.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-zinc-500 italic">There is no order processing activity by the cashier staff yet.</td></tr>`;
    return;
  }

  staffNames.sort((a, b) => staffStats[b].approved - staffStats[a].approved);

  tbody.innerHTML = '';
  staffNames.forEach((name, idx) => {
    const stat = staffStats[name];
    const totalHandled = stat.approved + stat.rejected;
    const approvalRate = totalHandled > 0 ? Math.round((stat.approved / totalHandled) * 100) : 0;
    
    let badgeColor = idx === 0 ? "bg-amber-500 text-black font-bold" : "bg-[#131622] text-zinc-300 border border-[#1e2230]";

    tbody.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5 font-semibold text-white flex items-center gap-2.5">
          <span class="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] ${badgeColor}">#${idx + 1}</span>
          ${name}
        </td>
        <td class="p-3.5 text-center font-semibold text-emerald-400 text-sm">${stat.approved}</td>
        <td class="p-3.5 text-center font-semibold text-red-500 text-sm">${stat.rejected}</td>
        <td class="p-3.5 text-center font-mono text-xs text-zinc-300">${approvalRate}%</td>
        <td class="p-3.5 text-right font-bold text-amber-400 text-sm">$${stat.totalVal.toLocaleString()}</td>
      </tr>
    `;
  });
}

// ============================================================================
// 📊 FITUR 4: SPENDING LEADERBOARD ENGINE
// ============================================================================
function renderLeaderboard() {
  const container = document.getElementById('spending-leaderboard-list');
  if (!container) return;
  
  if (orgLeaderboard.length === 0) {
    container.innerHTML = `<div class="py-12 text-center text-zinc-500 italic">There is no shopping history from residents yet.</div>`;
    return;
  }

  orgLeaderboard.sort((a, b) => b.spent - a.spent);
  container.innerHTML = '';

  orgLeaderboard.forEach((user, idx) => {
    let rankBadge = '';
    if (idx === 0) rankBadge = '<span class="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[10px] rounded-full">Top 1 Spender</span>';
    else if (idx === 1) rankBadge = '<span class="px-2 py-0.5 bg-zinc-500/10 text-zinc-300 border border-zinc-500/20 font-bold text-[10px] rounded-full">Top 2</span>';
    else if (idx === 2) rankBadge = '<span class="px-2 py-0.5 bg-amber-700/10 text-amber-600 border border-amber-700/20 font-bold text-[10px] rounded-full">Top 3</span>';

    container.innerHTML += `
      <div class="flex items-center justify-between p-3.5 bg-[#131622] rounded-xl border border-[#1e2230] hover:border-zinc-500/50 transition">
        <div class="flex items-center gap-3">
          <span class="w-6 h-6 rounded-lg bg-[#0e1017] border border-[#1e2230] text-zinc-400 font-bold text-xs flex items-center justify-center">${idx + 1}</span>
          <div>
            <p class="font-bold text-white text-sm">${user.name}</p>
            <p class="text-[10px] text-zinc-500 uppercase">${user.role || 'SOLDIERS'}</p>
          </div>
        </div>
        <div class="text-right flex items-center gap-3">
          ${rankBadge}
          <span class="text-base font-bold text-emerald-400 font-mono">$${user.spent.toLocaleString()}</span>
        </div>
      </div>
    `;
  });
}

// ==========================================
// 🔍 FITUR PENCARIAN MENU SIDEBAR (LIVE SEARCH & RBAC SAFE)
// ==========================================
function filterSidebarMenu(query) {
  const q = query.toLowerCase().trim();
  const nav = document.querySelector('aside nav');
  if (!nav) return;

  const allButtons = nav.querySelectorAll('button');
  const dropdownMenus = nav.querySelectorAll('#menu-order, #menu-vault');

  if (!q) {
    allButtons.forEach(btn => btn.style.display = '');
    dropdownMenus.forEach(menu => menu.classList.add('hidden'));
    updateRBACUI(); 
    return;
  }

  allButtons.forEach(btn => {
    const rbacContainer = btn.closest('.admin-only, .mod-only, #nav-group-hq');
    if (rbacContainer && rbacContainer.classList.contains('hidden')) {
      btn.style.display = 'none';
      return;
    }

    const text = btn.innerText.toLowerCase();
    if (text.includes(q)) {
      btn.style.display = 'flex';
      
      const parentDropdown = btn.closest('#menu-order, #menu-vault');
      if (parentDropdown) {
        parentDropdown.classList.remove('hidden');
        const parentToggle = nav.querySelector(`[onclick*="${parentDropdown.id}"]`);
        if (parentToggle) parentToggle.style.display = 'flex';
      }
    } else {
      btn.style.display = 'none';
    }
  });

  dropdownMenus.forEach(menu => {
    const visibleChildren = Array.from(menu.querySelectorAll('button')).filter(b => b.style.display !== 'none');
    const parentToggle = nav.querySelector(`[onclick*="${menu.id}"]`);
    if (visibleChildren.length > 0 && parentToggle) {
      parentToggle.style.display = 'flex';
      menu.classList.remove('hidden');
    }
  });
}

// ============================================================================
// ✏️ ENGINE EDIT ITEM (BULLETPROOF & ANTI-SILENT ERROR)
// ============================================================================
var currentEditItemIndex = null;
var editItemUploadedBase64 = '';

function openEditItemModal(index) {
  if (!isBisnisTier(getUserRank())) { 
    showToast("ACCESS DENIED", "Mode Read-Only tidak dapat mengedit barang!", "error"); 
    return; 
  }
  const item = vaultInventory[index];
  if (!item) {
    showToast("ERROR", "Data barang tidak ditemukan di memori!", "error");
    return;
  }

  const modal = document.getElementById('edit-item-modal');
  if (!modal) { 
    showToast("ERROR HTML", "Kode Modal Edit belum dipasang di index.html!", "error"); 
    return; 
  }

  currentEditItemIndex = index;
  editItemUploadedBase64 = ''; 

  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

  setVal('edit-item-name', item.name || '');
  setVal('edit-item-cat', item.cat || 'weapon');
  setVal('edit-item-price', item.price || 0);
  setVal('edit-item-base', item.base || 0);
  setVal('edit-item-stock', item.stock || 0);
  setVal('edit-item-restricted', String(Boolean(item.restricted)));
  setVal('edit-item-desc', item.desc || '');
  setVal('edit-item-img-url', '');
  
  const isComingSoon = (item.badge === 'COMING SOON' || item.badge === 'COMING_SOON');
  const statusSelect = document.getElementById('edit-item-status');
  if (statusSelect) {
    statusSelect.value = isComingSoon ? 'coming_soon' : 'ready';
  }

  if (document.getElementById('edit-item-file')) document.getElementById('edit-item-file').value = '';

  modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeEditItemModal() {
  const modal = document.getElementById('edit-item-modal');
  if (modal) modal.classList.add('hidden');
  currentEditItemIndex = null;
}

function handleEditItemImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const maxDim = 400; let width = img.width; let height = img.height;
      if (width > height) { if (width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; } }
      else { if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      editItemUploadedBase64 = canvas.toDataURL('image/jpeg', 0.75);
      showToast("IMAGE READY", "Foto baru siap disimpan!", "success");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function submitEditItem() {
  if (currentEditItemIndex === null || currentEditItemIndex === undefined) {
    showToast("ERROR SISTEM", "Sesi edit terputus! Harap tutup modal dan klik tombol ikon pensil lagi.", "error");
    return;
  }
  
  const item = vaultInventory[currentEditItemIndex];
  if (!item) {
    showToast("ERROR SISTEM", "Data barang tidak ditemukan pada indeks ke-" + currentEditItemIndex, "error");
    return;
  }

  const nameInput = document.getElementById('edit-item-name');
  if (!nameInput) {
    showToast("ERROR HTML", "Input ID 'edit-item-name' tidak ditemukan!", "error");
    return;
  }

  const name = nameInput.value.trim();
  const cat = document.getElementById('edit-item-cat')?.value || 'weapon';
  const price = parseInt(document.getElementById('edit-item-price')?.value) || 0;
  const base = parseInt(document.getElementById('edit-item-base')?.value) || price;
  let stock = parseInt(document.getElementById('edit-item-stock')?.value) || 0;
  const restricted = document.getElementById('edit-item-restricted')?.value === 'true';
  const desc = document.getElementById('edit-item-desc')?.value.trim() || 'Custom Syndicate Armory Item';
  const urlImg = document.getElementById('edit-item-img-url')?.value.trim();
  
  const statusSelect = document.getElementById('edit-item-status');
  const statusVal = statusSelect ? statusSelect.value : 'ready';

  if (!name) { showToast("WARNING", "Nama barang tidak boleh kosong!", "error"); return; }
  if (price <= 0) { showToast("WARNING", "Harga jual harus lebih dari 0!", "error"); return; }

  const oldImg = item.img;
  const finalImg = editItemUploadedBase64 || urlImg || oldImg;

  let badgeVal = "NORMAL";
  if (statusVal === 'coming_soon') {
    badgeVal = "COMING SOON";
    stock = 0; 
  } else if (stock <= 0) {
    badgeVal = "OUT OF STOCK";
  } else if (stock <= 5) {
    badgeVal = "LOW";
  }

  vaultInventory[currentEditItemIndex] = {
    name: name, cat: cat, badge: badgeVal, desc: desc,
    price: price, base: base, stock: stock,
    img: finalImg, restricted: restricted
  };

  saveAppData(); 
  renderVaultInventory(); 
  renderMarketplace(currentMarketplaceFilter);
  closeEditItemModal();
  showToast("ITEM UPDATED", `Barang [${name}] berhasil diperbarui menjadi ${badgeVal}!`, "success");
}

// ==========================================
// 🔄 MISSING FUNCTIONS: quickRejectTx & renderReleaseOutstanding
// ==========================================
function quickRejectTx(txId) {
  const userRank = getUserRank();
  if (!isBisnisTier(userRank)) {
    showToast("ACCESS DENIED", "Read-Only mode cannot reject orders!", "error");
    return;
  }

  const tx = adminTransactions.find(t => t.id === txId);
  if (!tx) {
    showToast("ERROR", "Transaction not found!", "error");
    return;
  }

  const isFinalized = ['Released', 'Approved', 'Rejected'].includes(tx.status);
  if (isFinalized && !isTopAdmin(userRank)) {
    showToast("ACCESS DENIED", "You do not have permission to modify completed transactions!", "error");
    return;
  }

  showCustomConfirm("REJECT ORDER", `Reject order ${tx.id} from ${tx.buyer}? Stock will be refunded.`, () => {
    // Refund stock
    if (tx.items && Array.isArray(tx.items)) {
      tx.items.forEach(cartItem => {
        const invItem = vaultInventory.find(i => i.name === cartItem.name);
        if (invItem) {
          invItem.stock += cartItem.qty;
          if (invItem.stock > 5) invItem.badge = 'NORMAL';
          else if (invItem.stock > 0) invItem.badge = 'LOW';
        }
      });
    }

    tx.status = 'Rejected';
    tx.processed = currentLoggedInUser || 'ADMIN';
    saveAppData();
    updateDashboardData();
    renderTxProcessTable();
    renderReleaseOutstanding();
    renderVaultInventory();
    renderMarketplace(currentMarketplaceFilter);
    showToast("ORDER REJECTED", `Order ${tx.id} has been rejected and stock refunded.`, "error");
  });
}

function renderReleaseOutstanding() {
  const table = document.getElementById('release-outstanding-table');
  if (!table) return;

  const waitingTx = adminTransactions.filter(t => t.status === 'Waiting Release');
  const totalOutstanding = waitingTx.reduce((sum, tx) => sum + tx.total, 0);

  const countElem = document.getElementById('outstanding-count');
  const totalElem = document.getElementById('outstanding-total');
  if (countElem) countElem.innerText = waitingTx.length;
  if (totalElem) totalElem.innerText = "$" + totalOutstanding.toLocaleString();

  const canRelease = isBisnisTier(getUserRank());
  const releaseBtn = document.getElementById('release-all-btn');
  if (releaseBtn) {
    releaseBtn.style.display = canRelease && waitingTx.length > 0 ? 'inline-flex' : 'none';
  }

  if (waitingTx.length === 0) {
    table.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-zinc-500 italic">No transactions are awaiting release at this time.</td></tr>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }

  table.innerHTML = '';
  waitingTx.forEach(tx => {
    const itemNames = tx.items ? tx.items.map(i => `${i.name} (x${i.qty})`).join(", ") : `${tx.qty} items`;
    
    const actionBtn = canRelease
      ? `<button onclick="quickApproveTx('${tx.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5">
          <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Release Now
        </button>`
      : `<span class="text-[10px] text-zinc-500 italic">Read Only</span>`;

    table.innerHTML += `
      <tr class="hover:bg-white/[0.02] transition border-b border-[#1e2230] last:border-0">
        <td class="p-3.5 font-mono text-white font-bold text-xs">${tx.id}</td>
        <td class="p-3.5 font-bold text-white">${tx.buyer}</td>
        <td class="p-3.5 text-zinc-300 max-w-xs truncate" title="${itemNames}">${itemNames}</td>
        <td class="p-3.5 font-mono text-zinc-400 text-[11px]">${tx.time}</td>
        <td class="p-3.5 font-bold text-amber-400">$${tx.total.toLocaleString()}</td>
        <td class="p-3.5"><span class="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase rounded-full">${tx.processed}</span></td>
        <td class="p-3.5 text-right">${actionBtn}</td>
      </tr>
    `;
  }); 
  if (typeof lucide !== 'undefined') lucide.createIcons();
}


// ============================================================================
// 🪄 FITUR AUTO-UPDATE RANK TANPA RELOGIN
// ============================================================================
function checkAndApplyRankChanges() {
    if (!currentLoggedInUser) return; // Jika belum login, abaikan

    let latestRank = currentUserRole;
    const lowerUser = currentLoggedInUser.toLowerCase();

    // Ambil data pangkat paling baru dari Firebase
    if (typeof savedProfiles !== 'undefined' && savedProfiles[currentLoggedInUser] && savedProfiles[currentLoggedInUser].job) {
        latestRank = savedProfiles[currentLoggedInUser].job;
    } else if (typeof customAccounts !== 'undefined' && customAccounts[lowerUser]) {
        latestRank = customAccounts[lowerUser].rank;
    }

    // Jika pangkat di database BEDA dengan pangkat di layar saat ini
    if (latestRank !== currentUserRole) {
        currentUserRole = latestRank; // Update variabel sistem
        
        // Simpan sesi baru ke memori lokal browser
        localStorage.setItem('ton_current_session', JSON.stringify({ role: currentUserRole, name: currentLoggedInUser }));

        // Ubah tulisan pangkat di pojok kiri bawah UI
        const roleElem = document.getElementById('user-role-text');
        if (roleElem) roleElem.innerText = currentUserRole.toUpperCase();

        // Update hak akses tombol (Sembunyikan/Tampilkan menu Admin)
        if (typeof updateRBACUI === 'function') updateRBACUI();

        // Jika pangkat diturunkan dan tidak boleh lihat menu admin, lempar ke Shop
        if (typeof canViewAdminPanel === 'function' && !canViewAdminPanel(currentUserRole)) {
            if (typeof switchTab === 'function') switchTab('weapon-shop');
        }

        // Tampilkan notifikasi
        if (typeof showToast === 'function') showToast("RANK UPDATED", `Sistem mendeteksi perubahan: Pangkat Anda kini menjadi ${currentUserRole.toUpperCase()}`, "success");
    }
}
