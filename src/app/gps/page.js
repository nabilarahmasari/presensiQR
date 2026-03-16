"use client";

import { useEffect, useState } from "react";

import dynamic from "next/dynamic";

import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr:false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr:false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr:false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr:false }
);


export default function Page(){

const [deviceId,setDeviceId] = useState(null);
const [position,setPosition] = useState(null);
const [serverPos,setServerPos] = useState(null);
const [log,setLog] = useState("Menunggu GPS...");


/* ================= DEVICE ID ================= */

useEffect(()=>{

let id = localStorage.getItem("device_id");

if(!id){

id = "DEV-" + crypto.randomUUID().slice(0,8).toUpperCase();

localStorage.setItem("device_id",id);

}

setDeviceId(id);

},[]);


/* ================= GET GPS ================= */

function getLocation(){

if(!navigator.geolocation){

setLog("Browser tidak mendukung GPS");

return;

}

navigator.geolocation.getCurrentPosition(

(pos)=>{

console.log("GPS:",pos.coords);

const data = {
lat:pos.coords.latitude,
lng:pos.coords.longitude,
accuracy:pos.coords.accuracy
};

setPosition(data);

setLog("Lokasi berhasil diambil");

},

(err)=>{

console.log(err);

setLog("Gagal mengambil GPS");

}

);

}


/* ================= KIRIM GPS ================= */

async function sendGPS(){

if(!position || !deviceId) return;

const payload = {
device_id:deviceId,
lat:position.lat,
lng:position.lng,
accuracy:position.accuracy
};

await fetch("/api/checkin/gps",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(payload)
});

setLog("GPS terkirim ke server");

}


/* ================= AMBIL DATA SERVER ================= */

async function getLatest(){

if(!deviceId) return;

const res = await fetch(`/api/checkin/gps?device_id=${deviceId}`);

const json = await res.json();

if(!json.ok){

setLog("Data tidak ditemukan");

return;

}

setServerPos(json.data);

setLog("Data GPS server diterima");

}


/* ================= UI ================= */

return(

<div style={{padding:30,fontFamily:"Arial"}}>

<h1>📍 GPS Tracker</h1>

<p>Device : {deviceId}</p>

<button onClick={getLocation}>
Ambil Lokasi
</button>

<button onClick={sendGPS} style={{marginLeft:10}}>
Kirim ke Server
</button>

<button onClick={getLatest} style={{marginLeft:10}}>
Ambil dari Server
</button>

<p>{log}</p>

{position && (

<MapContainer
center={[position.lat,position.lng]}
zoom={16}
style={{height:"400px",marginTop:20}}
>

<TileLayer
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

<Marker position={[position.lat,position.lng]}>
<Popup>Lokasi Device</Popup>
</Marker>

{serverPos && serverPos.lat && serverPos.lng && (
  <Marker position={[serverPos.lat,serverPos.lng]}>
    <Popup>Data dari Server</Popup>
  </Marker>
)}

</MapContainer>

)}

</div>

);

}