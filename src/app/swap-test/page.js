"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function SwapTestPage() {
  const [activeTab, setActiveTab] = useState("menu");
  const [targetGasUrl, setTargetGasUrl] = useState("");

  // ==========================================
  // SUB-MODUL 1: PRESENSI
  // ==========================================
  const [scanResult, setScanResult] = useState(null);
  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [courseId, setCourseId] = useState("cloud-101");
  const [sessionId, setSessionId] = useState("sesi-01");
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
  if (!targetGasUrl) return alert("Isi URL GAS kelompok lain dulu!");
  if (!scanResult) return alert("Scan QR dulu!");
  if (!nim) return alert("Isi NIM dulu!");

  setStatusPresensi("loading");

  const device_id = localStorage.getItem("device_id") || crypto.randomUUID();
  localStorage.setItem("device_id", device_id);

  // 🔥 FIX 1: ambil qr_token dari hasil scan
  let finalToken = scanResult;
  try {
    const parsed = JSON.parse(scanResult);
    finalToken = parsed.qr_token; // ambil token asli
  } catch (e) {
    // kalau bukan JSON, pakai langsung
  }

  // 🔥 FIX 2: payload sesuai contract
  const payload = {
    qr_token: finalToken,
    user_id: nim,
    device_id: device_id,
    course_id: courseId,
    session_id: sessionId,
    ts: new Date().toISOString(),
  };

  try {
    // 🔥 FIX 3: endpoint pakai ?path= (biar kompatibel semua kelompok)
    const res = await fetch(`${targetGasUrl}?path=presence/checkin`, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const text = await res.text(); // pakai text dulu biar aman
    console.log("RESPONSE:", text);

    const json = JSON.parse(text);

    if (json.ok) {
      setStatusPresensi("success");
    } else {
      setStatusPresensi("error:" + json.error);
    }

  } catch (e) {
    setStatusPresensi("error:" + e.message);
  }
};

  // ==========================================
  // SUB-MODUL 2: ACCELEROMETER
  // ==========================================
  const [accel, setAccel] = useState({ x: 0, y: 0, z: 0 });
  const [statusAccel, setStatusAccel] = useState("");

  useEffect(() => {
    if (activeTab !== "accel") return;
    const handleMotion = (e) => {
      if (e.accelerationIncludingGravity) {
        setAccel({
          x: parseFloat(e.accelerationIncludingGravity.x?.toFixed(2)) || 0,
          y: parseFloat(e.accelerationIncludingGravity.y?.toFixed(2)) || 0,
          z: parseFloat(e.accelerationIncludingGravity.z?.toFixed(2)) || 0,
        });
      }
    };
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [activeTab]);

 const sendAccelSwap = async () => {
  if (!targetGasUrl) return alert("Isi URL GAS dulu!");

  setStatusAccel("loading");

  const device_id = localStorage.getItem("device_id") || crypto.randomUUID();
  localStorage.setItem("device_id", device_id);

  const payload = {
    device_id: device_id,
    ts: new Date().toISOString(),
    samples: [
      {
        t: new Date().toISOString(),
        x: accel.x,
        y: accel.y,
        z: accel.z,
      }
    ]
  };

  try {
    const res = await fetch(`${targetGasUrl}?path=telemetry/accel`, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("ACCEL RESPONSE:", text);

    const json = JSON.parse(text);

    setStatusAccel(json.ok ? "success" : "error:" + json.error);

  } catch (e) {
    setStatusAccel("error:" + e.message);
  }
};

  // ==========================================
  // SUB-MODUL 3: GPS
  // ==========================================
  const [location, setLocation] = useState({ lat: null, lng: null, accuracy: null });
  const [statusGps, setStatusGps] = useState("");

  useEffect(() => {
    if (activeTab !== "gps") return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
    });
  }, [activeTab]);

 const sendGpsSwap = async () => {
  if (!targetGasUrl) return alert("Isi URL GAS dulu!");
  if (!location.lat) return alert("Tunggu GPS terdeteksi dulu!");

  setStatusGps("loading");

  const device_id = localStorage.getItem("device_id") || crypto.randomUUID();
  localStorage.setItem("device_id", device_id);

  const payload = {
    device_id: device_id,
    ts: new Date().toISOString(),
    lat: location.lat,
    lng: location.lng,
    accuracy_m: location.accuracy,
  };

  try {
    const res = await fetch(`${targetGasUrl}?path=telemetry/gps`, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("GPS RESPONSE:", text);

    const json = JSON.parse(text);

    setStatusGps(json.ok ? "success" : "error:" + json.error);

  } catch (e) {
    setStatusGps("error:" + e.message);
  }
};

  // ==========================================
  // HELPER: Status Badge
  // ==========================================
  const StatusBadge = ({ status }) => {
    if (!status) return null;
    if (status === "loading") return (
      <p className="text-center text-xs font-bold text-blue-500 uppercase tracking-widest">Mengirim...</p>
    );
    if (status === "success") return (
      <p className="text-center text-xs font-bold text-green-500 uppercase tracking-widest">✓ Berhasil! Data masuk ke spreadsheet teman</p>
    );
    return (
      <p className="text-center text-xs font-bold text-red-500 uppercase tracking-widest">✗ Gagal: {status.replace("error:", "")}</p>
    );
  };

  // ==========================================
  // RENDER
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
              placeholder="https://script.google.com/macros/s/.../exec"
              value={targetGasUrl}
              onChange={(e) => setTargetGasUrl(e.target.value)}
            />
            {targetGasUrl && (
              <p className="text-xs text-green-600 font-medium">
                ✓ Target: {targetGasUrl.substring(0, 60)}...
              </p>
            )}
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

        {/* CONTENT */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[400px]">

          {/* MENU */}
          {activeTab === "menu" && (
            <div className="text-center py-10">
              <div className="mb-6 text-purple-600 flex justify-center">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Mode Uji Coba Lintas Kelompok</h2>
              <p className="text-slate-500 max-w-md mx-auto mb-4">Isi URL GAS kelompok lain di atas, lalu pilih modul untuk mengirim data ke spreadsheet mereka.</p>
              <div className="text-left bg-slate-50 rounded-2xl p-4 text-xs text-slate-500 space-y-1 max-w-md mx-auto">
                <p className="font-bold text-slate-700 mb-2">Endpoint yang akan dikirim:</p>
                <p>📋 Presensi → <span className="font-mono">/presence/checkin</span></p>
                <p>📡 Accel → <span className="font-mono">/telemetry/accel</span></p>
                <p>📍 GPS → <span className="font-mono">/telemetry/gps</span></p>
              </div>
            </div>
          )}

          {/* PRESENSI */}
          {activeTab === "presensi" && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold border-b pb-2">Sub-Modul: Presensi Mahasiswa</h3>

              {!scanResult ? (
                <div id="reader-swap" className="overflow-hidden rounded-2xl border-2 border-dashed border-slate-200"></div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm break-all font-mono">
                    Token: {scanResult}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Course ID</label>
                      <input className="w-full p-3 border rounded-xl text-sm" value={courseId} onChange={e => setCourseId(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Session ID</label>
                      <input className="w-full p-3 border rounded-xl text-sm" value={sessionId} onChange={e => setSessionId(e.target.value)} />
                    </div>
                  </div>

                  <input className="w-full p-3 border rounded-xl" placeholder="NIM" value={nim} onChange={e => setNim(e.target.value)} />
                  <input className="w-full p-3 border rounded-xl" placeholder="Nama Lengkap" value={nama} onChange={e => setNama(e.target.value)} />

                  <button
                    onClick={handleCheckInSwap}
                    disabled={statusPresensi === "loading"}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
                  >
                    Check-in ke GAS Kelompok Lain
                  </button>
                  <button onClick={() => { setScanResult(null); setStatusPresensi(""); }} className="w-full py-2 text-slate-500 text-sm">
                    Scan Ulang
                  </button>
                </div>
              )}

              <StatusBadge status={statusPresensi} />
            </div>
          )}

          {/* ACCEL */}
          {activeTab === "accel" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2">Sub-Modul: Accelerometer Batch</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-xs text-slate-400">X</div>
                  <div className="text-xl font-bold">{accel.x}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-xs text-slate-400">Y</div>
                  <div className="text-xl font-bold">{accel.y}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-xs text-slate-400">Z</div>
                  <div className="text-xl font-bold">{accel.z}</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-xs font-mono text-slate-500">
                <p className="font-bold text-slate-700 mb-1">Payload yang akan dikirim:</p>
                <pre>{JSON.stringify({
                  device_id: "device-kamu",
                  ts: new Date().toISOString(),
                  samples: [{ t: new Date().toISOString(), x: accel.x, y: accel.y, z: accel.z }]
                }, null, 2)}</pre>
              </div>

              <button
                onClick={sendAccelSwap}
                disabled={statusAccel === "loading"}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
              >
                Kirim Data Accel ke GAS Kelompok Lain
              </button>
              <StatusBadge status={statusAccel} />
            </div>
          )}

          {/* GPS */}
          {activeTab === "gps" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2">Sub-Modul: GPS Tracker</h3>
              <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 text-center">
                <p className="text-sm text-orange-600 font-bold mb-2">Lokasi Terdeteksi:</p>
                <p className="font-mono text-lg">
                  {location.lat ? `${location.lat}, ${location.lng}` : 'Mengambil GPS...'}
                </p>
                {location.accuracy && (
                  <p className="text-xs text-orange-400 mt-1">Akurasi: ±{location.accuracy?.toFixed(0)}m</p>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-xs font-mono text-slate-500">
                <p className="font-bold text-slate-700 mb-1">Payload yang akan dikirim:</p>
                <pre>{JSON.stringify({
                  device_id: "device-kamu",
                  ts: new Date().toISOString(),
                  lat: location.lat,
                  lng: location.lng,
                  accuracy_m: location.accuracy,
                }, null, 2)}</pre>
              </div>

              <button
                onClick={sendGpsSwap}
                disabled={statusGps === "loading" || !location.lat}
                className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
              >
                Kirim Data GPS ke GAS Kelompok Lain
              </button>
              <StatusBadge status={statusGps} />
            </div>
          )}

        </div>
      </div>
    </main>
  );
}