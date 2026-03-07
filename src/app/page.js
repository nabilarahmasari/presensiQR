import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-800 to-purple-700 px-6 py-16">

      {/* Header */}
      <div className="text-center mb-14">

        <h1 className="text-4xl font-bold text-white">
          Modul Praktikum
        </h1>

        <p className="text-gray-200 mt-3">
          Pilih modul untuk memulai praktikum komputasi awan
        </p>

      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

        {/* PRESENSI */}
        <Link href="/presensi">
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition cursor-pointer">

            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-xl">
              📷
            </div>

            <div className="flex justify-between items-center mb-3">

              <h2 className="text-xl font-semibold text-gray-800">
                Presensi QR
              </h2>

              <span className="text-sm text-gray-500">
                Modul 1
              </span>

            </div>

            <p className="text-gray-600 text-sm mb-5">
              QR Code dinamis untuk presensi real-time. Generate token,
              scan, dan check-in dengan mudah.
            </p>

            <ul className="text-gray-600 text-sm space-y-2">

              <li>• Generate QR Token</li>
              <li>• Check-in Real-time</li>
              <li>• Status Tracking</li>

            </ul>

          </div>
        </Link>

        {/* ACCELEROMETER */}
        <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition">

          <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-xl">
            📈
          </div>

          <div className="flex justify-between items-center mb-3">

            <h2 className="text-xl font-semibold text-gray-800">
              Accelerometer
            </h2>

            <span className="text-sm text-gray-500">
              Modul 2
            </span>

          </div>

          <p className="text-gray-600 text-sm mb-5">
            Kirim data sensor accelerometer secara batch dan pantau data
            terbaru dari perangkat.
          </p>

          <ul className="text-gray-600 text-sm space-y-2">

            <li>• Batch Telemetry</li>
            <li>• Latest Data</li>
            <li>• Real-time Graph</li>

          </ul>

        </div>

        {/* GPS */}
        <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition">

          <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-xl">
            📍
          </div>

          <div className="flex justify-between items-center mb-3">

            <h2 className="text-xl font-semibold text-gray-800">
              GPS + Peta
            </h2>

            <span className="text-sm text-gray-500">
              Modul 3
            </span>

          </div>

          <p className="text-gray-600 text-sm mb-5">
            Tracking lokasi GPS dengan visualisasi marker dan polyline
            pada peta interaktif.
          </p>

          <ul className="text-gray-600 text-sm space-y-2">

            <li>• Location Logging</li>
            <li>• Live Marker</li>
            <li>• History Polyline</li>

          </ul>

        </div>

      </div>

    </main>
  );
}