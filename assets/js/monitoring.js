// Konfigurasi Firebase - Menggunakan Host yang sama dengan Game RFID
const firebaseConfig = {
    apiKey: "AIzaSyDteBUQcuTNazDitdmJ7i0lyiq6axCBD1A",
    authDomain: "itfest-solo.firebaseapp.com",
    databaseURL: "https://itfest-solo-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "itfest-solo",
    storageBucket: "itfest-solo.firebasestorage.app",
    messagingSenderId: "131177808138",
    appId: "1:131177808138:web:b9eb392ee8c0ad16b07af3"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Referensi ke path data sensor dari ESP32
const sensorRef = database.ref('/monitoring_lingkungan');

/**
 * Fungsi Pembantu untuk Membuat Grafik Ringkas
 * @param {string} canvasId - ID dari elemen canvas di HTML
 * @param {string} color - Warna garis dan area grafik
 */
const createMiniChart = (canvasId, color) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                data: [],
                borderColor: color,
                backgroundColor: color + '33', // Warna transparan untuk area di bawah garis
                fill: true,
                tension: 0.4, // Membuat garis terlihat melengkung halus
                borderWidth: 2,
                pointRadius: 0 // Menghilangkan titik agar grafik terlihat lebih bersih
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false } // Sembunyikan legenda agar lebih ringkas
            },
            scales: {
                y: { 
                    ticks: { display: false }, // Sembunyikan angka sumbu Y
                    grid: { color: 'rgba(255,255,255,0.05)' } 
                },
                x: { 
                    ticks: { display: false }, // Sembunyikan label waktu di sumbu X
                    grid: { display: false } 
                }
            },
            animation: false // Nonaktifkan animasi default agar update data lebih ringan
        }
    });
};

// Inisialisasi 4 Chart dengan warna yang berbeda-beda
const tempChart = createMiniChart('tempChart', '#ff4b2b'); // Merah untuk Suhu
const humChart = createMiniChart('humChart', '#00d2ff');  // Biru untuk Kelembapan
const presChart = createMiniChart('presChart', '#f1c40f'); // Kuning untuk Tekanan
const gasChart = createMiniChart('gasChart', '#2ecc71');  // Hijau untuk Gas

/**
 * Mendengarkan perubahan data dari Firebase secara Real-time
 * Data dikirim oleh ESP32 ke path /monitoring_lingkungan
 */
sensorRef.on('value', (snapshot) => {
    const data = snapshot.val();
    
    if (data) {
        // 1. Update Angka di Kartu Sensor (UI)
        document.getElementById('val-suhu').innerText = data.suhu || 0;
        document.getElementById('val-hum').innerText = data.kelembapan || 0;
        document.getElementById('val-pres').innerText = data.tekanan || 0;
        document.getElementById('val-gas').innerText = data.gas || 0;

        // 2. Ambil waktu saat ini sebagai label
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // 3. Fungsi Internal untuk Memperbarui Data Grafik
        const updateChartData = (chart, newValue) => {
            if (!chart) return;
            
            // Batasi jumlah titik data yang ditampilkan (misal: 15 titik terakhir)
            if (chart.data.labels.length > 15) {
                chart.data.labels.shift(); // Hapus data terlama
                chart.data.datasets[0].data.shift();
            }
            
            chart.data.labels.push(timeNow);
            chart.data.datasets[0].data.push(newValue);
            chart.update('none'); // Update tanpa animasi agar performa tetap terjaga
        };

        // Jalankan update untuk ke-4 grafik
        updateChartData(tempChart, data.suhu);
        updateChartData(humChart, data.kelembapan);
        updateChartData(presChart, data.tekanan);
        updateChartData(gasChart, data.gas);
    }
}, (error) => {
    console.error("Gagal mengambil data dari Firebase: ", error);
});