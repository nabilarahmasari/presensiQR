export async function POST(req) {
  const body = await req.json();

  const GAS_URL = "https://script.google.com/macros/s/AKfycbyxBEvPexUYkHe5vz_h6Rha3MrrET97N8m9kckx9t05HllAvUvT-kCoP6ZGsEk8q0IN/exec?path=presence/checkin";

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