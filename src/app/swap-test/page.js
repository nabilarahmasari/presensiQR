"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function SwapTestPage() {
  const [activeTab, setActiveTab] = useState("menu"); // menu, presensi, accel, gps
  const [targetGasUrl, setTargetGasUrl] = useState("");
  
  // ==========================================
  // STATE SHARED & HELPER
  // ==========================================
  const getUrl = () => targetGasUrl || "URL_KOSONG_HARAP_ISI_DI_ATAS";

  // ==========================================
  // SUB-MODUL 1: PRESENSI LOGIC (COPY)
  // ==========================================
  const [scanResult, setScanResult] = useState(null);
  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [statusPresensi, setStatusPresensi] = useState("");

  useEffect(() => {
    if (activeTab !== "presensi") return;
    const scanner = new Html5QrcodeScanner("reader-swap", { fps: 10, qrbox: 250 }, false);
    scanner.render((decodedText) => {
      setScanResult(decodedText);
      scanner.clear();
    });
    return () => scanner.clear().catch(() => {});
  }, [activeTab]);

  const handleCheckInSwap = async () => {
    if (!targetGasUrl) return alert("Isi URL GAS Kelompok lain dulu!");
    if (!scanResult || !nim) return alert("Lengkapi Scan & NIM!");
    
    setStatusPresensi("loading");
    const payload = { 
      qr_token: scanResult, 
      user_id: nim, 
      nama: nama, 
      device_id: "SWAP-TEST-DEVICE" 
    };

    try {
      const res = await fetch(getUrl(), {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ path: "presence/checkin", ...payload }),
      });
      setStatusPresensi("success (Sent to External GAS)");
    } catch (e) {
      setStatusPresensi("error: " + e.message);
    }
  };

  // ==========================================
  // SUB-MODUL 2: ACCEL LOGIC (COPY)
  // ==========================================
  const [accel, setAccel] = useState({ x: 0, y: 0, z: 0 });
  useEffect(() => {
    if (activeTab !== "accel") return;
    const handleMotion = (e) => {
      if (e.accelerationIncludingGravity) {
        setAccel({
          x: e.accelerationIncludingGravity.x?.toFixed(2),
          y: e.accelerationIncludingGravity.y?.toFixed(2),
          z: e.accelerationIncludingGravity.z?.toFixed(2),
        });
      }
    };
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [activeTab]);

  const sendAccelSwap = async () => {
    if (!targetGasUrl) return alert("Isi URL GAS!");
    try {
      await fetch(getUrl(), {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ path: "accelerometer", ...accel })
      });
      alert("Data Accelerometer terkirim ke GAS luar!");
    } catch (e) { alert("Gagal: " + e.message); }
  };

  // ==========================================
  // SUB-MODUL 3: GPS LOGIC (COPY)
  // ==========================================
  const [location, setLocation] = useState({ lat: null, lng: null });
  useEffect(() => {
    if (activeTab !== "gps") return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, [activeTab]);

  const sendGpsSwap = async () => {
    if (!targetGasUrl) return alert("Isi URL GAS!");
    try {
      await fetch(getUrl(), {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ path: "gps", ...location })
      });
      alert("Data GPS terkirim ke GAS luar!");
    } catch (e) { alert("Gagal: " + e.message); }
  };

  // ==========================================
  // RENDER VIEW
  // ==========================================
  return (
    <main className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER & GAS INPUT */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-6">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </Link>
                <h1 className="text-xl font-bold text-slate-800">Swap Test Modul</h1>
            </div>
            
            <div className="space-y-2">
                <label className="text-xs font-bold text-purple-600 uppercase">Target URL GAS Kelompok Lain</label>
                <input 
                    type="text" 
                    className="w-full p-3 bg-purple-50 border border-purple-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Paste link script.google.com di sini..."
                    value={targetGasUrl}
                    onChange={(e) => setTargetGasUrl(e.target.value)}
                />
            </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['menu', 'presensi', 'accel', 'gps'].map((t) => (
                <button 
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-6 py-2 rounded-full text-sm font-bold capitalize transition-all ${activeTab === t ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}
                >
                    {t === 'menu' ? 'Pilih Modul' : t}
                </button>
            ))}
        </div>

        {/* CONTENT AREA */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[400px]">
            
            {/* 0. MENU UTAMA SWAP */}
            {activeTab === "menu" && (
                <div className="text-center py-10">
                    <div className="mb-6 text-purple-600 flex justify-center">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Mode Uji Coba Lintas Kelompok</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">Pilih salah satu sub-modul di atas untuk mengetes pengiriman data ke Spreadsheet milik kelompok lain.</p>
                </div>
            )}

            {/* 1. MODUL PRESENSI (MAHASISWA MODE) */}
            {activeTab === "presensi" && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold border-b pb-2">Sub-Modul: Presensi Mahasiswa</h3>
                    {!scanResult ? (
                        <div id="reader-swap" className="overflow-hidden rounded-2xl border-2 border-dashed border-slate-200"></div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm break-all font-mono">
                                QR Detected: {scanResult}
                            </div>
                            <input className="w-full p-3 border rounded-xl" placeholder="Masukkan NIM" value={nim} onChange={e => setNim(e.target.value)} />
                            <input className="w-full p-3 border rounded-xl" placeholder="Masukkan Nama" value={nama} onChange={e => setNama(e.target.value)} />
                            <button 
                                onClick={handleCheckInSwap}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg"
                            >
                                Check-in ke GAS Luar
                            </button>
                            <button onClick={() => setScanResult(null)} className="w-full py-2 text-slate-500 text-sm">Scan Ulang</button>
                        </div>
                    )}
                    {statusPresensi && <p className="text-center text-xs font-bold text-orange-500 uppercase tracking-widest">{statusPresensi}</p>}
                </div>
            )}

            {/* 2. MODUL ACCELEROMETER */}
            {activeTab === "accel" && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold border-b pb-2">Sub-Modul: Accelerometer Batch</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-slate-50 rounded-2xl"><div className="text-xs text-slate-400">X</div><div className="text-xl font-bold">{accel.x}</div></div>
                        <div className="p-4 bg-slate-50 rounded-2xl"><div className="text-xs text-slate-400">Y</div><div className="text-xl font-bold">{accel.y}</div></div>
                        <div className="p-4 bg-slate-50 rounded-2xl"><div className="text-xs text-slate-400">Z</div><div className="text-xl font-bold">{accel.z}</div></div>
                    </div>
                    <button 
                        onClick={sendAccelSwap}
                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg"
                    >
                        Kirim Data Accel ke GAS Luar
                    </button>
                </div>
            )}

            {/* 3. MODUL GPS */}
            {activeTab === "gps" && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold border-b pb-2">Sub-Modul: GPS Tracker</h3>
                    <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 text-center">
                        <p className="text-sm text-orange-600 font-bold mb-2">Lokasi Terdeteksi:</p>
                        <p className="font-mono text-lg">{location.lat ? `${location.lat}, ${location.lng}` : 'Mengambil GPS...'}</p>
                    </div>
                    <button 
                        onClick={sendGpsSwap}
                        className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold shadow-lg"
                    >
                        Kirim Data Lokasi ke GAS Luar
                    </button>
                </div>
            )}

        </div>
      </div>
    </main>
  );
}