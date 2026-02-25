
"use client";
import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Home() {
  // ================= KONFIGURASI =================
  // Masukkan URL Google Apps Script Anda di sini (Pastikan akses: Anyone)
  const GAS_URL = "https://script.google.com/macros/s/AKfycbwg4SESdJg9Z8H02adL8IDNDehmkXlBowfn1zXE2KKykB4_BmLvGigqYr7veUzFF5Mn/exec";

  // ================= STATE =================
  const [scanResult, setScanResult] = useState(null);
  const [status, setStatus] = useState("Menunggu input...");
  const [loading, setLoading] = useState(false);
  
  // Data Form Mahasiswa
  const [formData, setFormData] = useState({
    user_id: "2023001",
    device_id: "hp-nextjs-01",
    course_id: "cloud-101",
    session_id: "sesi-02",
  });

  // ================= LOGIC SCANNER =================
  useEffect(() => {
    // Inisialisasi Scanner saat komponen dimuat
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText, decodedResult) {
      // Saat QR berhasil discan
      setScanResult(decodedText);
      setStatus("QR Terbaca! Silakan klik 'Kirim Presensi'.");
      scanner.clear(); // Matikan kamera setelah dapat hasil
    }

    function onScanFailure(error) {
      // Error minor saat scanning (bisa diabaikan agar console tidak penuh)
    }

    // Cleanup saat keluar halaman
    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, []);

  // ================= LOGIC KIRIM DATA =================
  const handleCheckIn = async () => {
    if (!scanResult) {
      alert("Scan QR Code terlebih dahulu!");
      return;
    }

    setLoading(true);
    setStatus("Mengirim data ke server...");

    const payload = {
      ...formData,
      qr_token: scanResult, // Token dari hasil scan
      ts: new Date().toISOString()
    };

    // URL dengan query param path (sesuai backend GAS Anda)
    const url = `${GAS_URL}?path=presence/checkin`;

    try {
      // Gunakan no-cors agar browser tidak memblokir request ke Google
     const res = await fetch("/api/checkin", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const json = await res.json();
setStatus(json.ok ? "✅ Berhasil" : "❌ " + json.error);

      // Karena no-cors, kita anggap sukses jika tidak ada error network
      setStatus("✅ Data Terkirim! Cek Google Sheet Anda.");
      setScanResult(null); // Reset scan
    } catch (error) {
      setStatus(`❌ Gagal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ================= TAMPILAN (UI) =================
  return (
    <main className="min-h-screen p-4 bg-gray-100 flex flex-col items-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">Presensi QR Cloud</h1>

        {/* Form Identitas */}
        <div className="space-y-3 mb-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">NIM / User ID</label>
                <input 
                    type="text" 
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    value={formData.user_id}
                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Device ID</label>
                <input 
                    type="text" 
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    value={formData.device_id}
                    onChange={(e) => setFormData({...formData, device_id: e.target.value})}
                />
            </div>
        </div>

        {/* Area Scanner */}
        <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-center">Scan QR Dosen</h2>
            {/* Div ini akan diisi oleh kamera */}
            <div id="reader" className="w-full bg-black rounded-lg overflow-hidden"></div>
            
            {scanResult && (
                <div className="mt-2 p-2 bg-green-100 text-green-800 text-center rounded text-sm break-all">
                    Token: <strong>{scanResult}</strong>
                </div>
            )}
        </div>

        {/* Tombol Aksi */}
        <button
            onClick={handleCheckIn}
            disabled={loading || !scanResult}
            className={`w-full py-3 px-4 rounded-md text-white font-bold transition duration-200
                ${loading || !scanResult ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
            {loading ? "Sedang Mengirim..." : "Kirim Presensi"}
        </button>

        {/* Status Log */}
        <div className="mt-4 p-3 bg-gray-50 border rounded text-sm text-gray-600 text-center">
            {status}
        </div>
      </div>
    </main>
  );
}
