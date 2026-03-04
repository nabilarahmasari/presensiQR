"use client";
import { useState, useEffect } from "react";
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

  const generateQR = async () => {
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
  };

  useEffect(() => {
    if (!qrData) return;

    const interval = setInterval(() => {
      generateQR();
    }, 120000);

    return () => clearInterval(interval);
  }, [qrData]);

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
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <button onClick={() => setRole(null)}>← Kembali</button>

          <input className="border p-2 w-full my-2"
            value={formDosen.course_id}
            onChange={(e) => setFormDosen({ ...formDosen, course_id: e.target.value })}
          />

          <input className="border p-2 w-full my-2"
            value={formDosen.session_id}
            onChange={(e) => setFormDosen({ ...formDosen, session_id: e.target.value })}
          />

          <button onClick={generateQR} className="w-full bg-indigo-600 text-white py-2 rounded-xl">
            Generate QR
          </button>

          {qrData && (
            <div className="text-center mt-6">
              <QRCode value={qrData.qr_token} size={200} />
              <p className="text-xs mt-3">Expired: {new Date(qrData.expires_at).toLocaleTimeString()}</p>
            </div>
          )}
        </div>
      )}

      {role === "mahasiswa" && (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <button onClick={() => setRole(null)}>← Kembali</button>

          <div id="reader" className="mb-4"></div>

          <input
            placeholder="NIM"
            className="border p-2 w-full mb-2"
            value={nim}
            onChange={(e) => setNim(e.target.value)}
          />

          <input
            placeholder="Nama"
            className="border p-2 w-full mb-2"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />

          <button
            onClick={handleCheckIn}
            className="w-full bg-green-600 text-white py-2 rounded-xl"
          >
            Absen
          </button>

          <p className="mt-3 text-center">{status}</p>
        </div>
      )}

    </main>
  );
}