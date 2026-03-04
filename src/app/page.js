"use client";
import { useState, useEffect, useCallback } from "react";
import QRCode from "react-qr-code";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Home() {

  const GAS_URL = "https://script.google.com/macros/s/AKfycbyxBEvPexUYkHe5vz_h6Rha3MrrET97N8m9kckx9t05HllAvUvT-kCoP6ZGsEk8q0IN/exec";

  const [role, setRole] = useState(null);

  /* ================= DOSEN ================= */

  const [qrData, setQrData] = useState(null);
  const [formDosen, setFormDosen] = useState({
    course_id: "cloud-101",
    session_id: "sesi-02"
  });
  const [kehadiran, setKehadiran] = useState([]);

  const generateQR = useCallback(async () => {
    const res = await fetch(`${GAS_URL}?path=presence/qr/generate`, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(formDosen),
    });
    const json = await res.json();
    if (json.ok) {
      setQrData(json.data);
    } else {
      alert(json.error);
    }
  }, [formDosen]);

  const fetchKehadiran = useCallback(async () => {
    const res = await fetch(
      `${GAS_URL}?path=presence/list&course_id=${formDosen.course_id}&session_id=${formDosen.session_id}`
    );
    const json = await res.json();
    if (json.ok) {
      setKehadiran(json.data.items);
    }
  }, [formDosen]);

  // Auto refresh QR tiap 2 menit
  useEffect(() => {
    if (!qrData) return;
    const interval = setInterval(() => {
      generateQR();
    }, 120000);
    return () => clearInterval(interval);
  }, [qrData, generateQR]);

  // Auto refresh list kehadiran tiap 10 detik
  useEffect(() => {
    if (!qrData) return;
    fetchKehadiran();
    const interval = setInterval(() => {
      fetchKehadiran();
    }, 10000);
    return () => clearInterval(interval);
  }, [qrData, fetchKehadiran]);

  /* ================= MAHASISWA ================= */

  const [scanResult, setScanResult] = useState(null);
  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (role !== "mahasiswa") return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render((decodedText) => {
      setScanResult(decodedText);
      scanner.clear();
    });

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [role]);

  const handleCheckIn = async () => {
    if (!scanResult) return alert("Scan dulu!");

    setStatus("Mengirim...");

    const device_id = localStorage.getItem("device_id") || crypto.randomUUID();
    localStorage.setItem("device_id", device_id);

    const payload = {
      qr_token: scanResult,
      user_id: nim,
      nama: nama,
      device_id: device_id
    };

    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (json.ok) {
      setStatus("✅ Berhasil Absen");
    } else {
      setStatus("❌ " + json.error);
    }
  };

  /* ================= UI ================= */

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 to-purple-700 p-6">

      {!role && (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-6">Sistem Presensi QR</h1>
          <button onClick={() => setRole("dosen")} className="w-full bg-indigo-600 text-white py-3 rounded-xl mb-3">Dosen</button>
          <button onClick={() => setRole("mahasiswa")} className="w-full bg-green-600 text-white py-3 rounded-xl">Mahasiswa</button>
        </div>
      )}

      {role === "dosen" && (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl">
          <button onClick={() => setRole(null)} className="mb-4 text-gray-500 hover:text-gray-800">← Kembali</button>

          <div className="flex gap-8">

            {/* Kolom kiri: form + QR */}
            <div className="flex-1">
              <input
                className="border p-2 w-full my-2 rounded-lg"
                placeholder="Course ID"
                value={formDosen.course_id}
                onChange={(e) => setFormDosen({ ...formDosen, course_id: e.target.value })}
              />
              <input
                className="border p-2 w-full my-2 rounded-lg"
                placeholder="Session ID"
                value={formDosen.session_id}
                onChange={(e) => setFormDosen({ ...formDosen, session_id: e.target.value })}
              />
              <button onClick={generateQR} className="w-full bg-indigo-600 text-white py-2 rounded-xl mt-1">
                Generate QR
              </button>

              {qrData && (
                <div className="text-center mt-6">
                  <QRCode value={qrData.qr_token} size={200} />
                  <p className="text-xs mt-3 text-gray-500">
                    Expired: {new Date(qrData.expires_at).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>

            {/* Kolom kanan: list kehadiran */}
            {qrData && (
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-lg">Kehadiran</h2>
                  <span className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {kehadiran.length} hadir
                  </span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {kehadiran.length === 0 && (
                    <p className="text-gray-400 text-sm text-center mt-8">Belum ada yang absen</p>
                  )}
                  {kehadiran.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 border rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-indigo-600 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-sm">{item.user_id}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-green-600 text-xs font-semibold">✓ Hadir</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {role === "mahasiswa" && (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <button onClick={() => setRole(null)} className="mb-4 text-gray-500 hover:text-gray-800">← Kembali</button>

          <div id="reader" className="mb-4"></div>

          <input
            placeholder="NIM"
            className="border p-2 w-full mb-2 rounded-lg"
            value={nim}
            onChange={(e) => setNim(e.target.value)}
          />

          <input
            placeholder="Nama"
            className="border p-2 w-full mb-2 rounded-lg"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />

          <button
            onClick={handleCheckIn}
            className="w-full bg-green-600 text-white py-2 rounded-xl"
          >
            Absen
          </button>

          <p className="mt-3 text-center font-medium">{status}</p>
        </div>
      )}

    </main>
  );
}