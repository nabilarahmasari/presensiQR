import Link from "next/link";

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        * { font-family: 'Plus Jakarta Sans', sans-serif; }

        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(255, 255, 255, 0.8);
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.1);
        }

        .bg-mesh {
          background-color: #f8fafc;
          background-image: 
            radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%),
            radial-gradient(at 50% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%);
        }

        .blob {
          position: absolute;
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2));
          filter: blur(80px);
          border-radius: 50%;
          z-index: 0;
          animation: float 20s infinite alternate;
        }

        @keyframes float {
          from { transform: translate(0, 0); }
          to { transform: translate(100px, 50px); }
        }
      `}</style>

      <main className="min-h-screen bg-mesh relative overflow-hidden px-6 py-16">
        {/* Animated Background Elements */}
        <div className="blob top-[-100px] left-[-100px]"></div>
        <div className="blob bottom-[-100px] right-[-100px]" style={{ animationDelay: '-5s', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))' }}></div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-100 rounded-full">
              Cloud Computing Lab
            </div>
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Modul Praktikum
            </h1>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Silakan pilih salah satu modul di bawah ini untuk memulai sesi praktikum Anda hari ini.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            
            {/* MODUL 1: PRESENSI */}
            <Link href="/presensi" className="group">
              <div className="glass-card rounded-3xl p-8 h-full flex flex-col">
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 text-white group-hover:scale-110 transition-transform">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/><path d="M12 12h.01"/></svg>
                </div>
                
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-slate-800">Presensi QR</h2>
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg uppercase tracking-wider">Modul 1</span>
                </div>

                <p className="text-slate-600 leading-relaxed mb-6 flex-grow">
                  QR Code dinamis untuk presensi real-time. Generate token, scan, dan check-in dengan mudah.
                </p>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                  {['Generate QR Token', 'Check-in Real-time', 'Status Tracking'].map((item) => (
                    <div key={item} className="flex items-center text-sm text-slate-500">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Link>

            {/* MODUL 2: ACCELEROMETER */}
            <Link href="/accelerometer" className="group">
              <div className="glass-card rounded-3xl p-8 h-full flex flex-col">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200 text-white group-hover:scale-110 transition-transform">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                </div>

                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-slate-800">Accelerometer</h2>
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg uppercase tracking-wider">Modul 2</span>
                </div>

                <p className="text-slate-600 leading-relaxed mb-6 flex-grow">
                  Kirim data sensor accelerometer secara batch dan pantau data terbaru dari perangkat secara presisi.
                </p>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                  {['Batch Telemetry', 'Latest Data', 'Real-time Graph'].map((item) => (
                    <div key={item} className="flex items-center text-sm text-slate-500">
                      <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Link>

            {/* MODUL 3: GPS */}
            <Link href="/gps" className="group"> {/* Ubah href jika perlu */}
              <div className="glass-card rounded-3xl p-8 h-full flex flex-col">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200 text-white group-hover:scale-110 transition-transform">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>

                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-slate-800">GPS + Peta</h2>
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg uppercase tracking-wider">Modul 3</span>
                </div>

                <p className="text-slate-600 leading-relaxed mb-6 flex-grow">
                  Tracking lokasi GPS dengan visualisasi marker dan polyline pada peta interaktif yang responsif.
                </p>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                  {['Location Logging', 'Live Marker', 'History Polyline'].map((item) => (
                    <div key={item} className="flex items-center text-sm text-slate-500">
                      <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Link>

          </div>
        </div>
      </main>
    </>
  );
}