export async function POST(req) {
  const body = await req.json();

  const GAS_URL = "https://script.google.com/macros/s/AKfycbxa2DD20hVIMol4-LRpOxdR5fN_kRjh4Itm-sADeDV8VDLRb8SgZHWcypS5luyzwOeS/exec?path=presence/checkin";

  const response = await fetch(GAS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return Response.json(data);
}