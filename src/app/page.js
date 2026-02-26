
"use client";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Home() {

  const GAS_URL = "https://script.google.com/macros/s/AKfycbwg4SESdJg9Z8H02adL8IDNDehmkXlBowfn1zXE2KKykB4_BmLvGigqYr7veUzFF5Mn/exec";

  const [role, setRole] = useState(null);

  // ================= DOSEN STATE =================
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [formDosen, setFormDosen] = useState({
    course_id: "cloud-101",
    session_id: "sesi-02"
  });

  const handleGenerate = async () => {
    setLoading(true);
    setQrData(null);

    try {
      const url = `${GAS_URL}?path=presence/qr/generate`;

      const payload = {
        course_id: formDosen.course_id,
        session_id: formDosen.session_id,
        ts: new Date().toISOString()
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (json.ok && json.data.qr_token) {
        setQrData(json.data);
      } else {
        alert("Gagal generate QR");
      }

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= MAHASISWA STATE =================
  const [scanResult, setScanResult] = useState(null);
  const [status, setStatus] = useState("Menunggu scan...");
  const [formMahasiswa, setFormMahasiswa] = useState({
    user_id: "2023001",
    device_id: "hp-nextjs-01",
    course_id: "cloud-101",
    session_id: "sesi-02",
  });

  useEffect(() => {
    if (role !== "mahasiswa") return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render((decodedText) => {
      setScanResult(decodedText);
      setStatus("QR berhasil dibaca!");
      scanner.clear();
    });

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [role]);

  const handleCheckIn = async () => {
    if (!scanResult) return alert("Scan QR terlebih dahulu!");

    setStatus("Mengirim presensi...");

    const payload = {
      ...formMahasiswa,
      qr_token: scanResult,
      ts: new Date().toISOString()
    };

    await fetch(`${GAS_URL}?path=presence/checkin`, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

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

    setStatus("Presensi terkirim! Silakan cek Google Sheet.");
    setScanResult(null);
  };

  // ================= UI =================
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-800 via-indigo-700 to-purple-700 flex items-center justify-center p-6">

      {/* ================= ROLE SELECTOR ================= */}
      {!role && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center w-full max-w-md">

          <div className="flex flex-col items-center mb-6">
            <img
              src="/logo-its.png"
              alt="Logo its"
              className="w-24 h-24 object-contain mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-800">
              Sistem Presensi QR
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Institut Teknologi Sepuluh Nopember
            </p>
          </div>

          <div className="space-y-4 mt-6">
            <button
              onClick={() => setRole("dosen")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white font-semibold hover:scale-105 transition shadow-lg"
            >
              👨‍🏫 Masuk sebagai Dosen
            </button>

            <button
              onClick={() => setRole("mahasiswa")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold hover:scale-105 transition shadow-lg"
            >
              👨‍🎓 Masuk sebagai Mahasiswa
            </button>
          </div>
        </div>
      )}

      {/* ================= DOSEN ================= */}
      {role === "dosen" && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-lg">

          <button onClick={() => setRole(null)} className="text-sm text-gray-500 mb-4">
            ← Kembali
          </button>

          <div className="flex items-center gap-3 mb-6">
            <img src="/logo-its.png" className="w-12 h-12 object-contain" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Panel Dosen
              </h2>
              <p className="text-xs text-gray-500">
                Generate QR Presensi
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <input
              className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formDosen.course_id}
              onChange={(e) =>
                setFormDosen({ ...formDosen, course_id: e.target.value })
              }
            />
            <input
              className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formDosen.session_id}
              onChange={(e) =>
                setFormDosen({ ...formDosen, session_id: e.target.value })
              }
            />
          </div>

          <button
            onClick={handleGenerate}
            className="w-full py-3 bg-indigo-700 text-white rounded-xl font-semibold hover:scale-105 transition shadow-lg"
          >
            {loading ? "Membuat QR..." : "Generate QR Code"}
          </button>

          {qrData && (
            <div className="mt-8 text-center">
              <div className="bg-white p-4 rounded-xl inline-block shadow-lg">
                <QRCode value={qrData.qr_token} size={200} />
              </div>
              <p className="text-sm mt-4 break-all">{qrData.qr_token}</p>
              <p className="text-xs text-gray-500 mt-2">
                Berlaku sampai: {new Date(qrData.expires_at).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ================= MAHASISWA ================= */}
      {role === "mahasiswa" && (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md">

          <button onClick={() => setRole(null)} className="text-sm text-gray-500 mb-4">
            ← Kembali
          </button>

          <div className="flex items-center gap-3 mb-6">
            <img src="/logo-its.png" className="w-12 h-12 object-contain" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Scan QR Dosen
              </h2>
              <p className="text-xs text-gray-500">
                Institut Teknologi Sepuluh Nopember
              </p>
            </div>
          </div>

          <div id="reader" className="rounded-xl overflow-hidden mb-4"></div>

          {scanResult && (
            <div className="bg-green-100 text-green-700 p-2 rounded-lg text-sm break-all">
              {scanResult}
            </div>
          )}

          <button
            onClick={handleCheckIn}
            disabled={!scanResult}
            className="w-full mt-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:scale-105 transition disabled:bg-gray-400"
          >
            Kirim Presensi
          </button>

          <p className="text-center text-sm text-gray-600 mt-4">{status}</p>
        </div>
      )}

    </main>
  );
}
