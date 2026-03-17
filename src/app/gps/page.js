"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { MapPin, Send, History } from "lucide-react";

// Import Map Components secara Dynamic untuk menghindari error "window is not defined"
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((m) => m.Polyline), { ssr: false });

export default function GPSPage() {
  const [deviceId, setDeviceId] = useState("");
  const [position, setPosition] = useState(null); 
  const [history, setHistory] = useState([]);     
  const [log, setLog] = useState("Siap.");
  const [L, setL] = useState(null); // State untuk menyimpan instance Leaflet

  useEffect(() => {
    // 1. Inisialisasi Device ID
    let id = localStorage.getItem("device_id");
    if (!id) {
      id = "DEV-" + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem("device_id", id);
    }
    setDeviceId(id);

    // 2. Load Leaflet hanya di sisi Client
    const initLeaflet = async () => {
      const leaflet = await import('leaflet');
      // Perbaikan Error 404 Ikon Marker Leaflet
      delete leaflet.Icon.Default.prototype._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      setL(leaflet);
    };
    initLeaflet();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) return setLog("GPS tidak didukung");
    setLog("Mencari lokasi...");
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy });
      setLog("Lokasi didapatkan.");
    }, (err) => setLog("Gagal akses GPS: " + err.message));
  };

  const sendGPS = async () => {
    if (!position) return setLog("Ambil lokasi dulu!");
    setLog("Sedang mengirim...");
    try {
      // Alamat API diarahkan ke folder backend sesuai struktur Anda
      const res = await fetch("/api/checkin/gps/backend", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: "telemetry/gps",
          device_id: deviceId,
          lat: position.lat,
          lng: position.lng,
          accuracy_m: position.acc
        }),
      });
      const json = await res.json();
      if (json.ok) setLog("GPS Terkirim!");
      else setLog("Gagal: Respon server negatif.");
    } catch (e) { 
      setLog("Gagal kirim data."); 
    }
  };

  const fetchHistory = async () => {
    setLog("Memuat history...");
    try {
      const res = await fetch(`/api/checkin/gps/backend?path=telemetry/gps/history&device_id=${deviceId}`);
      const json = await res.json();
      if (json.ok && json.data?.items) {
        const path = json.data.items.map(i => [i.lat, i.lng]);
        setHistory(path);
        setLog("History dimuat.");
      } else {
        setLog("History masih kosong.");
      }
    } catch (e) { 
      setLog("Gagal ambil history."); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4">
            <MapPin className="text-blue-500" /> GPS Tracking
          </h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="bg-gray-100 px-3 py-1 rounded-md font-mono text-gray-600">ID: {deviceId}</span>
            <span className={`px-3 py-1 rounded-md font-medium ${log.includes('Gagal') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              Status: {log}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={getLocation} className="flex items-center justify-center gap-2 bg-white p-3 rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all shadow-sm font-semibold">
            <MapPin size={18} className="text-blue-500" /> 1. Get GPS
          </button>
          <button onClick={sendGPS} className="flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md font-semibold">
            <Send size={18} /> 2. Send Server
          </button>
          <button onClick={fetchHistory} className="flex items-center justify-center gap-2 bg-white p-3 rounded-xl border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all shadow-sm font-semibold">
            <History size={18} className="text-green-500" /> 3. Load History
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 h-[450px]">
          {position && L ? (
            <MapContainer center={[position.lat, position.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[position.lat, position.lng]}>
                <Popup>Lokasi Anda saat ini</Popup>
              </Marker>
              {history.length > 0 && <Polyline positions={history} color="#3b82f6" weight={4} />}
            </MapContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 italic bg-gray-50">
               <MapPin size={48} className="opacity-20 mb-2" />
               <p>Klik "Get GPS" untuk menampilkan peta</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}