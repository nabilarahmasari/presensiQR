export async function POST(req) {
  const body = await req.json();

  const GAS_URL = "https://script.google.com/macros/s/AKfycbwg4SESdJg9Z8H02adL8IDNDehmkXlBowfn1zXE2KKykB4_BmLvGigqYr7veUzFF5Mn/exec?path=presence/checkin";

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