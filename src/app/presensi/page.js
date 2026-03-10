"use client";

import { useState, useEffect, useCallback } from "react";
import QRCode from "react-qr-code";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Presensi() {

  const GAS_URL = "https://script.google.com/macros/s/AKfycbxa2DD20hVIMol4-LRpOxdR5fN_kRjh4Itm-sADeDV8VDLRb8SgZHWcypS5luyzwOeS/exec";

  const [role, setRole] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [kehadiran, setKehadiran] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [nim, setNim] = useState("");
  const [nama, setNama] = useState("");
  const [status, setStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState("");

  const [courses, setCourses] = useState([
    { id: "cloud-101", name: "Cloud Computing" },
    { id: "basdat-001", name: "Basis Data" },
    { id: "design-thinking", name: "Design Thinking" },
  ]);

  const [formDosen, setFormDosen] = useState({
    course_id: "cloud-101",
    session_id: "sesi-01",
  });

  const sessions = [
    { id: "sesi-01", name: "Sesi 01" },
    { id: "sesi-02", name: "Sesi 02" },
    { id: "sesi-03", name: "Sesi 03" },
  ];

  const addCourse = () => {
    if (!newCourse) return;
    const id = newCourse.toLowerCase().replace(/\s+/g, "-");
    setCourses([...courses, { id, name: newCourse }]);
    setNewCourse("");
    setShowAddCourse(false);
  };

  const generateQR = useCallback(async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${GAS_URL}?path=presence/qr/generate`, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(formDosen),
      });
      const json = await res.json();
      if (json.ok) {
        setQrData(json.data);
        setCountdown(120);
      } else {
        alert(json.error);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [formDosen]);

  const fetchKehadiran = useCallback(async () => {
    const res = await fetch(
      `${GAS_URL}?path=presence/list&course_id=${formDosen.course_id}&session_id=${formDosen.session_id}`
    );
    const json = await res.json();
    if (json.ok) setKehadiran(json.data.items);
  }, [formDosen]);

  // Auto refresh QR tiap 2 menit
  useEffect(() => {
    if (!qrData) return;
    const interval = setInterval(() => { generateQR(); }, 120000);
    return () => clearInterval(interval);
  }, [qrData, generateQR]);

  // Countdown timer
  useEffect(() => {
    if (!qrData) return;
    const timer = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 120 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [qrData]);

  // Auto refresh kehadiran tiap 10 detik
  useEffect(() => {
    if (!qrData) return;
    fetchKehadiran();
    const interval = setInterval(fetchKehadiran, 30000);
    return () => clearInterval(interval);
  }, [qrData, fetchKehadiran]);

  // QR Scanner
  useEffect(() => {
    if (role !== "mahasiswa") return;
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
    scanner.render((decodedText) => {
      setScanResult(decodedText);
      scanner.clear();
    });
    return () => scanner.clear().catch(() => {});
  }, [role]);

  const handleCheckIn = async () => {
    if (!scanResult) return alert("Scan QR code dulu!");
    if (!nim) return alert("Masukkan NIM terlebih dahulu!");
    setStatus("loading");
    const device_id = localStorage.getItem("device_id") || crypto.randomUUID();
    localStorage.setItem("device_id", device_id);
    const payload = { qr_token: scanResult, user_id: nim, nama, device_id };
    const res = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setStatus(json.ok ? "success" : "error:" + json.error);
  };

  const resetRole = () => {
    setRole(null);
    setQrData(null);
    setKehadiran([]);
    setScanResult(null);
    setStatus("");
  };

  const getInitials = (userId) => {
    const str = String(userId);
    return str.substring(str.length - 2).toUpperCase();
  };

  const avatarColors = [
    "#3b82f6","#8b5cf6","#10b981","#f59e0b","#ec4899","#14b8a6",
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
        .card { background: white; border-radius: 24px; border: 1px solid #e8edf2; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .card-hover { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
        .btn-blue { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; border: none; cursor: pointer; transition: opacity 0.2s, transform 0.1s; }
        .btn-blue:hover { opacity: 0.92; }
        .btn-blue:active { transform: scale(0.99); }
        .btn-green { background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; cursor: pointer; transition: opacity 0.2s; }
        .btn-green:hover { opacity: 0.92; }
        .fade-in { animation: fadeIn 0.35s ease both; }
        .slide-in { animation: slideIn 0.3s ease both; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform: translateX(-8px); } to { opacity:1; transform: translateX(0); } }
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        select, input { outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        select:focus, input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      <main style={{ minHeight: "100vh", background: "#f0f4f8" }}>

        {/* ===== WELCOME ===== */}
        {!role && (
          <div className="fade-in" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#eff6ff", color: "#3b82f6", padding: "6px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 600, marginBottom: "24px" }}>
                <span className="pulse" style={{ width: 8, height: 8, background: "#3b82f6", borderRadius: "50%", display: "inline-block" }}></span>
                Sistem Presensi Digital
              </div>
              <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: "#0f172a", marginBottom: "12px", letterSpacing: "-0.02em" }}>
                Selamat Datang
              </h1>
              <p style={{ color: "#94a3b8", fontSize: "16px" }}>
                Pilih mode sesuai dengan peran Anda untuk melanjutkan
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", width: "100%", maxWidth: "640px" }}>
              {/* Dosen */}
              <div className="card card-hover fade-in" onClick={() => setRole("dosen")} style={{ padding: "32px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#6366f1)", opacity: 0.06, transform: "translate(30%,-30%)" }}/>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>🎓</div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Mode Dosen</h2>
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                  Generate QR code presensi dan pantau kehadiran mahasiswa
                </p>
                <span style={{ color: "#3b82f6", fontWeight: 600, fontSize: 13 }}>Masuk sebagai Dosen →</span>
              </div>

              {/* Mahasiswa */}
              <div className="card card-hover fade-in" onClick={() => setRole("mahasiswa")} style={{ padding: "32px", position: "relative", overflow: "hidden", animationDelay: "0.08s" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", opacity: 0.06, transform: "translate(30%,-30%)" }}/>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>👨‍🎓</div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Mode Mahasiswa</h2>
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                  Scan QR code atau input manual untuk melakukan absensi kehadiran
                </p>
                <span style={{ color: "#10b981", fontWeight: 600, fontSize: 13 }}>Masuk sebagai Mahasiswa →</span>
              </div>
            </div>
          </div>
        )}

        {/* ===== HEADER ===== */}
        {role && (
          <div style={{ background: "white", borderBottom: "1px solid #e8edf2", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button onClick={resetRole} style={{ width: 36, height: 36, borderRadius: 10, background: "#f1f5f9", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>←</button>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📷</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Presensi QR Dinamis</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>Modul 1 - Sistem Presensi</div>
              </div>
            </div>
            <button onClick={resetRole} style={{ border: "1px solid #e2e8f0", background: "white", padding: "8px 16px", borderRadius: 10, fontSize: 13, color: "#64748b", cursor: "pointer", fontWeight: 500 }}>
              Kembali ke Pemilihan Role
            </button>
          </div>
        )}

        {/* ===== DOSEN ===== */}
        {role === "dosen" && (
          <div className="fade-in" style={{ padding: "32px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

              {/* Kiri */}
              <div className="card" style={{ padding: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 40, height: 40, background: "#eff6ff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📋</div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>Generate QR Presensi</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>Buat QR code untuk sesi kuliah hari ini</div>
                  </div>
                </div>

                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Mata Kuliah</label>
                <select
                  style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", fontSize: 13, background: "#f8fafc", marginBottom: 12, color: "#374151" }}
                  value={formDosen.course_id}
                  onChange={(e) => setFormDosen({ ...formDosen, course_id: e.target.value })}
                >
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <button
                  onClick={() => setShowAddCourse(!showAddCourse)}
                  style={{ width: "100%", border: "1.5px dashed #93c5fd", background: "transparent", color: "#3b82f6", padding: "10px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 16 }}
                >
                  + Tambah Mata Kuliah Baru
                </button>

                {showAddCourse && (
                  <div className="slide-in" style={{ background: "#f8fafc", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <input
                      value={newCourse}
                      onChange={(e) => setNewCourse(e.target.value)}
                      placeholder="Nama Mata Kuliah"
                      style={{ border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: 10, width: "100%", fontSize: 13, marginBottom: 10, background: "white" }}
                    />
                    <button onClick={addCourse} style={{ background: "#3b82f6", color: "white", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      Simpan
                    </button>
                  </div>
                )}

                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Sesi Perkuliahan</label>
                <select
                  style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", fontSize: 13, background: "#f8fafc", marginBottom: 24, color: "#374151" }}
                  value={formDosen.session_id}
                  onChange={(e) => setFormDosen({ ...formDosen, session_id: e.target.value })}
                >
                  {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                <button
                  onClick={generateQR}
                  disabled={isGenerating}
                  className="btn-blue"
                  style={{ width: "100%", padding: "16px", borderRadius: 16, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {isGenerating ? (
                    <><svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> Generating...</>
                  ) : "🔄 Generate QR Code"}
                </button>

                {qrData && (
                  <div className="fade-in" style={{ textAlign: "center", marginTop: 32 }}>
                    <div style={{ display: "inline-block", background: "white", padding: 24, borderRadius: 20, border: "2px solid #e8edf2", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
                      <QRCode value={qrData.qr_token} size={180} />
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff7ed", color: "#ea580c", padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                        ⏱ Refresh dalam {countdown}s
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Kanan: Kehadiran */}
              <div className="card" style={{ padding: 32 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: "#f0fdf4", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👥</div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>Kehadiran</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", color: "#16a34a", padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
                    <span className="pulse" style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", display: "inline-block" }}></span>
                    {kehadiran.length} hadir
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto" }}>
                  {!qrData && (
                    <div style={{ textAlign: "center", padding: "64px 0" }}>
              
                      <p style={{ color: "#94a3b8", fontSize: 13 }}>Generate QR terlebih dahulu</p>
                    </div>
                  )}
                  {qrData && kehadiran.length === 0 && (
                    <div style={{ textAlign: "center", padding: "64px 0" }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                      <p style={{ color: "#94a3b8", fontSize: 13 }}>Menunggu mahasiswa absen...</p>
                    </div>
                  )}
                  {kehadiran.map((item, i) => (
                    <div key={i} className="slide-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", border: "1px solid #e8edf2", borderRadius: 16, padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: avatarColors[i % avatarColors.length], display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700 }}>
                          {getInitials(item.user_id)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>NIM: {item.user_id}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>
                            {new Date(item.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#f0fdf4", color: "#16a34a", padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                        ✓ Hadir
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== MAHASISWA ===== */}
        {role === "mahasiswa" && (
          <div className="fade-in" style={{ padding: "32px", display: "flex", justifyContent: "center" }}>
            <div className="card" style={{ padding: 32, width: "100%", maxWidth: 440 }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, background: "#f0fdf4", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px" }}>📱</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Absen Kehadiran</h2>
                <p style={{ color: "#94a3b8", fontSize: 13 }}>Scan QR code atau masukkan data untuk check-in</p>
              </div>

              {/* Scanner */}
              <div style={{ borderRadius: 16, overflow: "hidden", border: "2px dashed #e2e8f0", background: "#f8fafc", marginBottom: 20 }}>
                {!scanResult ? (
                  <div id="reader"></div>
                ) : (
                  <div style={{ padding: 24, textAlign: "center" }}>
                    <div style={{ width: 48, height: 48, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p style={{ color: "#16a34a", fontWeight: 600, fontSize: 13 }}>QR berhasil di-scan!</p>
                    <button onClick={() => setScanResult(null)} style={{ marginTop: 8, fontSize: 12, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                      Scan ulang
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }}></div>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em" }}>ATAU INPUT MANUAL</span>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }}></div>
              </div>

              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>NIM</label>
              <input
                placeholder="Masukkan NIM Anda"
                style={{ border: "1px solid #e2e8f0", width: "100%", padding: "12px 14px", borderRadius: 12, fontSize: 13, background: "#f8fafc", marginBottom: 14, color: "#374151" }}
                value={nim}
                onChange={(e) => setNim(e.target.value)}
              />

              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Nama Lengkap</label>
              <input
                placeholder="Masukkan nama lengkap"
                style={{ border: "1px solid #e2e8f0", width: "100%", padding: "12px 14px", borderRadius: 12, fontSize: 13, background: "#f8fafc", marginBottom: 20, color: "#374151" }}
                value={nama}
                onChange={(e) => setNama(e.target.value)}
              />

              <button
                onClick={handleCheckIn}
                disabled={status === "loading"}
                className="btn-green"
                style={{ width: "100%", padding: "16px", borderRadius: 16, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: status === "loading" ? 0.7 : 1 }}
              >
                {status === "loading" ? (
                  <><svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg> Mengirim...</>
                ) : "✔ Absen Sekarang"}
              </button>

              {status && status !== "loading" && (
                <div className="fade-in" style={{
                  marginTop: 16, padding: "14px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, textAlign: "center",
                  background: status === "success" ? "#f0fdf4" : "#fef2f2",
                  color: status === "success" ? "#16a34a" : "#dc2626",
                  border: `1px solid ${status === "success" ? "#bbf7d0" : "#fecaca"}`
                }}>
                  {status === "success" ? "✅ Berhasil Absen!" : "❌ " + status.replace("error:", "")}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}