
"use client";
import { useState } from "react";

export default function Home() {
  const [token, setToken] = useState(null);
  const [expires, setExpires] = useState(null);

  const generateQR = async () => {
    const res = await fetch(
      "https://script.google.com/macros/s/AKfycbwg4SESdJg9Z8H02adL8IDNDehmkXlBowfn1zXE2KKykB4_BmLvGigqYr7veUzFF5Mn/exec",
      {
        method: "POST",
        body: JSON.stringify({
          course_id: "cloud-101",
          session_id: "sesi-01",
          ts: new Date().toISOString(),
        }),
      }
    );

    const data = await res.json();

    if (data.ok) {
      setToken(data.data.qr_token);
      setExpires(data.data.expires_at);
    } else {
      alert("Gagal generate QR");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Presensi QR Dinamis</h1>

      <button onClick={generateQR}>Generate QR</button>

      {token && (
        <div style={{ marginTop: 20 }}>
          <p><strong>Token:</strong> {token}</p>
          <p><strong>Expired:</strong> {expires}</p>
        </div>
      )}
    </div>
  );
}
