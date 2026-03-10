const GAS_URL =
"https://script.google.com/macros/s/AKfycbyxBEvPexUYkHe5vz_h6Rha3MrrET97N8m9kckx9t05HllAvUvT-kCoP6ZGsEk8q0IN/exec";

/* =========================
   POST TELEMETRY
========================= */

export async function POST(req){

  const body = await req.json();

  const response = await fetch(`${GAS_URL}?path=telemetry/accel`,{

    method:"POST",

    headers:{
      "Content-Type":"text/plain"
    },

    body:JSON.stringify(body)

  });

  const data = await response.json();

  return Response.json(data);

}


/* =========================
   GET LATEST DATA
========================= */

export async function GET(req){

  const {searchParams} = new URL(req.url);

  const device_id = searchParams.get("device_id");

  const response = await fetch(
    `${GAS_URL}?path=telemetry/accel/latest&device_id=${device_id}`
  );

  const data = await response.json();

  return Response.json(data);

}