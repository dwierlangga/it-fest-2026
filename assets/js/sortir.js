const firebaseConfig = {
    apiKey: "AIzaSyDteBUQcuTNazDitdmJ7i0lyiq6axCBD1A",
    authDomain: "itfest-solo.firebaseapp.com",
    databaseURL: "https://itfest-solo-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "itfest-solo",
    storageBucket: "itfest-solo.firebasestorage.app",
    messagingSenderId: "131177808138",
    appId: "1:131177808138:web:b9eb392ee8c0ad16b07af3"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const sortirRef = database.ref('/sortir_warna/deteksi_terakhir');

sortirRef.on('value', (snapshot) => {
    const warna = snapshot.val();
    const display = document.getElementById('color-display');
    const text = document.getElementById('text-warna');

    if (!warna || warna === "") {
        // Tampilan Standby
        text.innerText = "MENUNGGU BENDA...";
        display.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
        display.style.boxShadow = "none";
        display.style.borderColor = "rgba(255, 255, 255, 0.2)";
        return;
    }

    // Update Tampilan Saat Warna Terdeteksi
    text.innerText = "WARNA: " + warna.toUpperCase();
    
    const colorMap = {
        'Merah': '#ff4b2b',
        'Biru': '#00d2ff',
        'Kuning': '#f1c40f',
        'Hijau': '#2ecc71'
    };

    if (colorMap[warna]) {
        display.style.backgroundColor = colorMap[warna] + "44"; // Transparansi 44
        display.style.borderColor = colorMap[warna];
        display.style.boxShadow = `0 0 50px ${colorMap[warna]}66`;
        text.style.color = "#fff";
    }
});