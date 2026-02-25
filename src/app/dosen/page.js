"use client";
import { useState } from "react";
import QRCode from "react-qr-code";

export default function DosenPage() {
  // GANTI URL INI DENGAN DEPLOYMENT GAS ANDA
  const GAS_URL = "https://script.google.com/macros/s/AKfycbwg4SESdJg9Z8H02adL8IDNDehmkXlBowfn1zXE2KKykB4_BmLvGigqYr7veUzFF5Mn/exec";
  

  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null); // Menyimpan token hasil generate
  const [form, setForm] = useState({
    course_id: "cloud-101",
    session_id: "sesi-02"
  });

  const handleGenerate = async () => {
    setLoading(true);
    setQrData(null); // Reset QR lama

    try {
      // Kita request ke endpoint generate
      const url = `${GAS_URL}?path=presence/qr/generate`;
      
      // Payload sesuai API Contract
      const payload = {
        course_id: form.course_id,
        session_id: form.session_id,
        ts: new Date().toISOString()
      };

      // NOTE: Fetch ke GAS dari browser sering kena CORS.
      // Jika error CORS, gunakan extension browser "Allow CORS" untuk testing
      // atau gunakan Next.js API Route sebagai proxy.
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // Trik menghindari Preflight CORS GAS
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (json.ok && json.data.qr_token) {
        setQrData(json.data); // Simpan data response (qr_token & expires_at)
      } else {
        alert("Gagal generate: " + JSON.stringify(json));
      }

    } catch (error) {
      console.error(error);
      alert("Error (Cek Console): " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel Dosen: Generate QR</h1>

        {/* Form Input */}
        <div className="text-left space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Mata Kuliah (Course ID)</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded mt-1"
              value={form.course_id}
              onChange={(e) => setForm({...form, course_id: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Sesi (Session ID)</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded mt-1"
              value={form.session_id}
              onChange={(e) => setForm({...form, session_id: e.target.value})}
            />
          </div>
        </div>

        {/* Tombol Generate */}
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? "Sedang Membuat..." : "Buat QR Code"}
        </button>

        {/* Area Tampil QR */}
        {qrData && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100 flex flex-col items-center animate-fade-in">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Scan QR Ini:</h3>
            
            <div className="bg-white p-4 rounded shadow-sm">
              {/* Component Render QR Code */}
              <QRCode 
                value={qrData.qr_token} 
                size={200}
                viewBox={`0 0 256 256`}
              />
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Token:</strong> {qrData.qr_token}</p>
              <p><strong>Berlaku sampai:</strong> {new Date(qrData.expires_at).toLocaleTimeString()}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
