// Ganti seluruh isi file src/app/api/checkin/gps/backend/route.js dengan ini:

const GAS_URL = "https://script.google.com/macros/s/AKfycbxa2DD20hVIMol4-LRpOxdR5fN_kRjh4Itm-sADeDV8VDLRb8SgZHWcypS5luyzwOeS/exec";

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Kirim ke Google Apps Script
    const response = await fetch(`${GAS_URL}?path=telemetry/gps`, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("device_id");

    const response = await fetch(`${GAS_URL}?path=telemetry/gps/history&device_id=${deviceId}`);
    const data = await response.json();
    
    return Response.json(data);
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}