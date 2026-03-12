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

  // ==========================================
  // LOGIC (TETAP SAMA - TIDAK DIUBAH)
  // ==========================================
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

  useEffect(() => {
    if (!qrData) return;
    const interval = setInterval(() => { generateQR(); }, 120000);
    return () => clearInterval(interval);
  }, [qrData, generateQR]);

  useEffect(() => {
    if (!qrData) return;
    const timer = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 120 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [qrData]);

  useEffect(() => {
    if (!qrData) return;
    fetchKehadiran();
    const interval = setInterval(fetchKehadiran, 30000);
    return () => clearInterval(interval);
  }, [qrData, fetchKehadiran]);

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
    return str.substring(Math.max(0, str.length - 2)).toUpperCase();
  };

  const avatarColors = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ec4899","#14b8a6"];

  // ==========================================
  // VIEW (TAMPILAN BARU)
  // ==========================================
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        /* Reset & Base */
        * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; margin: 0; padding: 0; }
        
        /* Advanced Background */
        body { 
          background-color: #f8fafc;
          background-image: 
            radial-gradient(at 10% 10%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
            radial-gradient(at 90% 10%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
            radial-gradient(at 50% 90%, rgba(99, 102, 241, 0.1) 0px, transparent 50%);
          color: #1e293b;
          min-height: 100vh;
        }
        
        /* Layout Helpers */
        .container { width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 20px; }
        
        /* Glassmorphism Card */
        .card { 
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 24px; 
          border: 1px solid rgba(255, 255, 255, 0.5); 
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.02), 0 4px 6px -4px rgba(0, 0, 0, 0.01);
          overflow: hidden; 
        }
        
        /* Grid Layouts */
        .responsive-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 32px; align-items: start; }
        @media (max-width: 1024px) { .responsive-grid { grid-template-columns: 1fr; gap: 24px; } }

        /* Buttons Premium */
        .btn-premium { 
          border: none; cursor: pointer; transition: all 0.2s ease; 
          display: flex; alignItems: center; justifyContent: center; gap: 10px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
        }
        .btn-premium:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); opacity: 0.95; }
        .btn-premium:active { transform: translateY(0px); }
        .btn-premium:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .btn-blue { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; }
        .btn-green { background: linear-gradient(135deg, #10b981, #059669); color: white; }
        
        /* Form Elements Modern */
        .input-field { 
          width: 100%; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px 16px; 
          fontSize: 14px; background: rgba(255,255,255,0.6); outline: none; transition: all 0.2s; 
          color: #1e293b;
        }
        .input-field:focus { border-color: #3b82f6; background: rgba(255,255,255,1); box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
        
        /* Label styling */
        .field-label { display: block; fontSize: 13px; fontWeight: 600; color: #475569; marginBottom: 8px; marginLeft: 4px; }

        /* Custom Scrollbar */
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        /* Animations */
        .fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1; transform: scale(1);} 50%{opacity:0.5; transform: scale(1.05);} }

        /* Background shapes */
        .bg-shape { position: fixed; border-radius: 50%; filter: blur(60px); z-index: -1; opacity: 0.5; }

        /* Mobile Adjustments */
        @media (max-width: 640px) {
          .welcome-title { font-size: 2rem !important; }
          .container { padding: 0 16px; }
          .card { padding: 24px !important; border-radius: 20px; }
          .responsive-grid { gap: 20px; }
          header .container { flex-direction: column; gap: 12px; text-align: center; }
        }
      `}</style>

      {/* Background Decorative Shapes */}
      <div className="bg-shape" style={{ width: '300px', height: '300px', background: '#3b82f6', top: '-100px', left: '-100px' }}></div>
      <div className="bg-shape" style={{ width: '400px', height: '400px', background: '#10b981', bottom: '-150px', right: '-150px', animationDelay: '1s' }}></div>

      <main style={{ minHeight: "100vh", paddingBottom: "40px" }}>

        {/* ===== WELCOME SCREEN ===== */}
        {!role && (
          <div className="container fade-in" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 20px" }}>
            <div style={{ textAlign: "center", marginBottom: "60px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "white", color: "#3b82f6", padding: "8px 20px", borderRadius: "999px", fontSize: "14px", fontWeight: 600, marginBottom: "20px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
                <span className="pulse" style={{ width: 10, height: 10, background: "#3b82f6", borderRadius: "50%" }}></span>
                Smart Presence System v2.0
              </div>
              <h1 className="welcome-title" style={{ fontSize: "3.5rem", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: "12px", color: "#0f172a", lineHeight: 1 }}>Selamat Datang</h1>
              <p style={{ color: "#64748b", fontSize: "18px", maxWidth: "500px", margin: "0 auto" }}>Silakan pilih mode akses Anda untuk melanjutkan proses presensi.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", width: "100%", maxWidth: "800px" }}>
              {/* Role Dosen */}
              <div className="card" onClick={() => setRole("dosen")} style={{ padding: "40px", cursor: "pointer", border: "2px solid transparent", transition: "all 0.3s ease", position: 'relative' }} onMouseEnter={e => e.currentTarget.style.borderColor = "#3b82f6"} onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
                <div style={{ width: "70px", height: "70px", borderRadius: "20px", background: "linear-gradient(135deg, #eff6ff, #dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", color: "#3b82f6" }}>
                  <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
                <h3 style={{ marginBottom: "10px", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>Mode Pendidik (Dosen)</h3>
                <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.6, marginBottom: "20px" }}>Kelola kelas, generate QR code dinamis, dan pantau kehadiran mahasiswa secara real-time.</p>
                <span style={{ color: "#3b82f6", fontWeight: 600, fontSize: "14px", display: "flex", alignItems: "center", gap: "5px" }}>Masuk Sebagai Dosen →</span>
              </div>
              
              {/* Role Mahasiswa */}
              <div className="card" onClick={() => setRole("mahasiswa")} style={{ padding: "40px", cursor: "pointer", border: "2px solid transparent", transition: "all 0.3s ease" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#10b981"} onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
                <div style={{ width: "70px", height: "70px", borderRadius: "20px", background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", color: "#10b981" }}>
                  <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                </div>
                <h3 style={{ marginBottom: "10px", fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>Mode Mahasiswa</h3>
                <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.6, marginBottom: "20px" }}>Lakukan absensi kehadiran dengan cepat menggunakan *scan* QR Code dari perangkat Anda.</p>
                <span style={{ color: "#10b981", fontWeight: 600, fontSize: "14px", display: "flex", alignItems: "center", gap: "5px" }}>Mulai Presensi →</span>
              </div>
            </div>
          </div>
        )}

        {/* ===== HEADER ===== */}
        {role && (
          <header style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(226, 232, 240, 0.5)", padding: "16px 0", marginBottom: "32px", position: "sticky", top: 0, zIndex: 100 }}>
            <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <button onClick={resetRole} style={{ background: "white", border: "1px solid #e2e8f0", width: "40px", height: "40px", borderRadius: "12px", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>Smart Presence</h2>
                  <p style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 600 }}>Universitas Airlangga</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: role === 'dosen' ? "#eff6ff" : "#ecfdf5", color: role === 'dosen' ? "#3b82f6" : "#10b981", padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 700 }}>
                {role === 'dosen' ? '👨‍🏫 Mode Dosen' : '👨‍🎓 Mode Mahasiswa'}
              </div>
            </div>
          </header>
        )}

        {/* ===== CONTENT AREA ===== */}
        <div className="container">
          
          {/* DOSEN VIEW */}
          {role === "dosen" && (
            <div className="responsive-grid fade-in">
              {/* Control Panel */}
              <div className="card" style={{ padding: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ color: "#3b82f6" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a2 2 0 0 1 2.83 0l1.4 1.4a2 2 0 0 1 0 2.83L18.4 17.3a1 1 0 0 1-1.4 0l-1.6-1.6a1 1 0 0 1 0-1.4l3.77-3.77a2 2 0 0 0 0-2.83l-1.4-1.4a2 2 0 0 0-2.83 0l-3.77 3.77z"/><path d="m3.13 11.77 1.6 1.6a1 1 0 0 0 1.4 0l1.6-1.6a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0l-1.6 1.6a1 1 0 0 0 0 1.4z"/><path d="m18.4 17.3-3.77 3.77a2 2 0 0 1-2.83 0l-1.4-1.4a2 2 0 0 1 0-2.83L14.7 13.3a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 1 0 1.4z"/><path d="m6.3 14.7-3.77 3.77a2 2 0 0 0 0 2.83l1.4 1.4a2 2 0 0 0 2.83 0L10.7 18.7a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0z"/></svg>
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Konfigurasi Sesi Perkuliahan</h3>
                </div>
                
                <div style={{ marginBottom: "20px" }}>
                  <label className="field-label">Pilih Mata Kuliah</label>
                  <select className="input-field" value={formDosen.course_id} onChange={(e) => setFormDosen({ ...formDosen, course_id: e.target.value })}>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <button onClick={() => setShowAddCourse(!showAddCourse)} style={{ width: "100%", background: "none", border: "1px dashed #cbd5e1", color: "#64748b", padding: "12px", borderRadius: "14px", fontSize: "13px", fontWeight: 600, marginBottom: "20px", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = "#3b82f6"} onMouseLeave={e => e.currentTarget.style.borderColor = "#cbd5e1"}>
                  {showAddCourse ? "× Batal Tambah" : "+ Tambah Mata Kuliah Baru"}
                </button>

                {showAddCourse && (
                  <div style={{ background: "#f1f5f9", padding: "16px", borderRadius: "16px", marginBottom: "20px" }} className="fade-in">
                    <input className="input-field" style={{ background: "white", marginBottom: "10px" }} placeholder="Ketik Nama Mata Kuliah..." value={newCourse} onChange={(e) => setNewCourse(e.target.value)} />
                    <button onClick={addCourse} className="btn-premium btn-blue" style={{ width: "100%", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: 600 }}>Simpan Mata Kuliah</button>
                  </div>
                )}

                <div style={{ marginBottom: "28px" }}>
                  <label className="field-label">Pilih Sesi</label>
                  <select className="input-field" value={formDosen.session_id} onChange={(e) => setFormDosen({ ...formDosen, session_id: e.target.value })}>
                    {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <button onClick={generateQR} disabled={isGenerating} className="btn-premium btn-blue" style={{ width: "100%", padding: "16px", borderRadius: "16px", fontWeight: 700, fontSize: "15px" }}>
                  {isGenerating ? (
                    <><svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg> Memproses...</>
                  ) : (
                    <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/></svg> Generate QR Code Absensi</>
                  )}
                </button>

                {qrData && (
                  <div style={{ marginTop: "32px", textAlign: "center", paddingTop: "24px", borderTop: "1px solid #e2e8f0" }} className="fade-in">
                    <div style={{ display: "inline-block", background: "white", padding: "20px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
                      <QRCode value={qrData.qr_token} size={220} level="H" />
                    </div>
                    <div style={{ marginTop: "16px" }}>
                      <span style={{ fontSize: "13px", color: "#f97316", background: "#fff7ed", padding: "6px 14px", borderRadius: "999px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px", border: "1px solid #ffedd5" }}>
                        <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        Refresh otomatis dalam {countdown} detik
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Attendance List */}
              <div className="card custom-scroll" style={{ padding: "32px", position: "sticky", top: "100px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ color: "#10b981" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>Daftar Kehadiran</h3>
                  </div>
                  <span style={{ background: "#10b981", color: "white", padding: "4px 12px", borderRadius: "999px", fontSize: "13px", fontWeight: 700 }}>
                    {kehadiran.length} Mahasiswa
                  </span>
                </div>

                <div style={{ overflowY: "auto", maxHeight: "60vh", minHeight: "200px" }} className="custom-scroll">
                  {kehadiran.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#94a3b8", padding: "60px 0" }}>
                      <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: "16px" }}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                      <p style={{ fontSize: "15px", fontWeight: 500 }}>Belum ada data kehadiran.</p>
                      <p style={{ fontSize: "13px" }}>Generate QR dan tunggu mahasiswa melakukan scan.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingRight: "8px" }}>
                      {kehadiran.map((item, i) => (
                        <div key={i} className="fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: "white", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: avatarColors[i % avatarColors.length], color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.1)" }}>
                              {getInitials(item.user_id)}
                            </div>
                            <div>
                              <p style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{item.user_id}</p>
                              <p style={{ fontSize: "12px", color: "#64748b" }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "4px", verticalAlign: "middle" }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                {new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                              </p>
                            </div>
                          </div>
                          <span style={{ color: "#10b981", background: "#ecfdf5", padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, border: "1px solid #d1fae5" }}>Terverifikasi ✓</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MAHASISWA VIEW */}
          {role === "mahasiswa" && (
            <div className="fade-in" style={{ maxWidth: "500px", margin: "0 auto" }}>
              <div className="card" style={{ padding: "32px" }}>
                <div style={{ textAlign: "center", marginBottom: "32px", paddingBottom: "20px", borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ width: "60px", height: "60px", borderRadius: "16px", background: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>Presensi Mahasiswa</h3>
                  <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>Arahkan kamera Anda ke QR Code yang valid</p>
                </div>

                {/* Scanner Container */}
                <div style={{ borderRadius: "20px", overflow: "hidden", background: "#f8fafc", marginBottom: "24px", border: "2px dashed #cbd5e1", position: "relative" }}>
                  {!scanResult ? (
                    <div id="reader" style={{ width: "100%" }}></div>
                  ) : (
                    <div style={{ padding: "30px 20px", textAlign: "center" }} className="fade-in">
                      <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                        <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <p style={{ color: "#059669", fontWeight: 700, fontSize: "15px" }}>QR Code Berhasil Di-scan!</p>
                      <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "12px" }}>Silakan lengkapi data NIM dan Nama Anda.</p>
                      <button onClick={() => setScanResult(null)} style={{ color: "#3b82f6", background: "#eff6ff", border: "1px solid #dbeafe", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Scan Ulang</button>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label className="field-label">Nomor Induk Mahasiswa (NIM)</label>
                    <input className="input-field" placeholder="Contoh: 220101001" value={nim} onChange={(e) => setNim(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <label className="field-label">Nama Lengkap</label>
                    <input className="input-field" placeholder="Masukkan nama sesuai KRS" value={nama} onChange={(e) => setNama(e.target.value)} />
                  </div>
                  
                  <button onClick={handleCheckIn} disabled={status === "loading"} className="btn-premium btn-green" style={{ width: "100%", padding: "16px", borderRadius: "16px", fontWeight: 700, fontSize: "15px" }}>
                    {status === "loading" ? (
                      <><svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg> Mengirim data...</>
                    ) : (
                      <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Kirim Presensi Sekarang</>
                    )}
                  </button>

                  {status && status !== "loading" && (
                    <div className="fade-in" style={{ padding: "16px", borderRadius: "14px", fontSize: "14px", fontWeight: 600, textAlign: "center", marginTop: "10px", background: status === "success" ? "#ecfdf5" : "#fef2f2", color: status === "success" ? "#059669" : "#dc2626", border: `1px solid ${status === "success" ? "#a7f3d0" : "#fecaca"}`, display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                      {status === "success" ? (
                        <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Berhasil! Presensi Anda tercatat.</>
                      ) : (
                        <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Gagal: {status.replace("error:", "")}</>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}