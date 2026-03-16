const GAS_URL =
"https://script.google.com/macros/s/AKfycbxa2DD20hVIMol4-LRpOxdR5fN_kRjh4Itm-sADeDV8VDLRb8SgZHWcypS5luyzwOeS/exec";


/* =========================
   POST GPS
========================= */

export async function POST(req){

  const body = await req.json();

  const response = await fetch(`${GAS_URL}?path=telemetry/gps`,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(body)
  });

  const data = await response.json();

  return Response.json(data);

}


/* =========================
   GET GPS LATEST
========================= */

export async function GET(req){

  const {searchParams} = new URL(req.url);

  const device_id = searchParams.get("device_id");

  const response = await fetch(
    `${GAS_URL}?path=telemetry/gps/latest&device_id=${device_id}`
  );

  const data = await response.json();

  return Response.json(data);

}