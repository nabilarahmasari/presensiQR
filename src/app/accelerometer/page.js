"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";

import {
Chart as ChartJS,
LineElement,
PointElement,
LinearScale,
CategoryScale,
Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
LineElement,
PointElement,
LinearScale,
CategoryScale,
Legend
);

export default function Page(){

/* ================= STATE ================= */

const bufferRef = useRef([]);
const intervalRef = useRef(null);

const [deviceId,setDeviceId] = useState(null);

const [x,setX] = useState(0);
const [y,setY] = useState(0);
const [z,setZ] = useState(0);

const [status,setStatus] = useState("idle");
const [log,setLog] = useState("Menunggu instruksi...");

const [isRecording,setIsRecording] = useState(false);


/* ================= CHART REALTIME ================= */

const [chartData,setChartData] = useState({
labels:[],
datasets:[
{label:"Sumbu X",data:[],borderColor:"#8B4513"},
{label:"Sumbu Y",data:[],borderColor:"#DAA520"},
{label:"Sumbu Z",data:[],borderColor:"#A0522D"}
]
});


/* ================= CHART SERVER ================= */

const [serverChart,setServerChart] = useState({
labels:["Sumbu X","Sumbu Y","Sumbu Z"],
datasets:[
{
label:"Server Data",
data:[0,0,0],
backgroundColor:["#8B4513","#DAA520","#A0522D"]
}
]
});


/* ================= DEVICE ID ================= */

useEffect(()=>{

let id = localStorage.getItem("device_id");

if(!id){

id = "DEV-" + crypto.randomUUID().slice(0,8).toUpperCase();

localStorage.setItem("device_id",id);

}

setDeviceId(id);

},[]);


/* ================= ACCELEROMETER ================= */

useEffect(()=>{

if(!isRecording) return;

function handleMotion(event){

const acc = event.accelerationIncludingGravity;

if(!acc) return;

const sample = {
t:new Date().toISOString(),
x:acc.x || 0,
y:acc.y || 0,
z:acc.z || 0
};

setX(sample.x);
setY(sample.y);
setZ(sample.z);

bufferRef.current.push(sample);

setChartData(prev=>{

const labels=[...prev.labels,new Date().toLocaleTimeString()].slice(-20);

const xData=[...prev.datasets[0].data,sample.x].slice(-20);
const yData=[...prev.datasets[1].data,sample.y].slice(-20);
const zData=[...prev.datasets[2].data,sample.z].slice(-20);

return{
labels,
datasets:[
{...prev.datasets[0],data:xData},
{...prev.datasets[1],data:yData},
{...prev.datasets[2],data:zData}
]
};

});

}

window.addEventListener("devicemotion",handleMotion);

return ()=>{

window.removeEventListener("devicemotion",handleMotion);

};

},[isRecording]);


/* ================= BATCH UPLOAD (3 DETIK) ================= */

useEffect(()=>{

if(!isRecording || !deviceId) return;

intervalRef.current = setInterval(async()=>{

const buffer = bufferRef.current;

if(buffer.length===0) return;

setStatus("uploading");

const batch=[...buffer];

bufferRef.current=[];

try{

await fetch("/api/checkin/accel",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
device_id:deviceId,
ts:new Date().toISOString(),
samples:batch
})
});

setStatus("uploaded");

setLog(`Batch ${batch.length} data terkirim`);

}catch{

setStatus("error");

setLog("Upload gagal");

}

},3000); // 3 DETIK

return ()=>{

clearInterval(intervalRef.current);

};

},[deviceId,isRecording]);


/* ================= GET LATEST ================= */

async function getLatest(){

if(!deviceId) return;

setLog("Mengambil data terbaru dari server...");

try{

const res = await fetch(`/api/checkin/accel?device_id=${deviceId}`);

const json = await res.json();

if(!json.ok){

setLog("Data tidak ditemukan");

return;

}

const d = json.data;

setServerChart({
labels:["Sumbu X","Sumbu Y","Sumbu Z"],
datasets:[
{
label:"Server Data",
data:[d.x,d.y,d.z],
backgroundColor:["#8B4513","#DAA520","#A0522D"]
}
]
});

setLog(`Data terbaru diterima (${d.t})`);

}catch{

setLog("Gagal mengambil data");

}

}


/* ================= PERMISSION ================= */

async function requestPermission(){

if(typeof DeviceMotionEvent !== "undefined" &&
typeof DeviceMotionEvent.requestPermission === "function"){

await DeviceMotionEvent.requestPermission();

}

}


/* ================= START / STOP ================= */

async function toggleRecording(){

if(!isRecording){

await requestPermission();

bufferRef.current=[];

setIsRecording(true);

setLog("Sensor mulai merekam");

}else{

setIsRecording(false);

bufferRef.current=[];

clearInterval(intervalRef.current);

setStatus("idle");

setLog("Sensor dihentikan");

}

}


/* ================= UI ================= */

return(

<div className="container">

<header className="header">

<h1>📡 Telemetri Sensor</h1>
<p>Modul Accelerometer</p>

</header>


<div className="card">

<h2>Status Perangkat</h2>

<div className="deviceBox">

<div className="device">{deviceId}</div>
<div className="device">Sensor Aktif : {isRecording ? "YA" : "TIDAK"}</div>

</div>

<div className="axisRow">

<div className="axis">
<span>Sumbu X</span>
<p>{x.toFixed(2)}</p>
</div>

<div className="axis">
<span>Sumbu Y</span>
<p>{y.toFixed(2)}</p>
</div>

<div className="axis">
<span>Sumbu Z</span>
<p>{z.toFixed(2)}</p>
</div>

</div>

<button className="mainBtn" onClick={toggleRecording}>
{isRecording ? "⏹ Stop Sensor" : "▶ Mulai Sensor"}
</button>

<p className="status">Upload Status : {status}</p>

</div>


<div className="card">

<h2>Grafik Real-Time</h2>

<Line data={chartData}/>

</div>


<div className="card">

<h2>Riwayat Aktivitas</h2>

<p>{log}</p>

</div>


<div className="card">

<h2>Tarik Data Server</h2>

<button className="serverBtn" onClick={getLatest}>
🔄 Cek Data Terbaru
</button>

<Line data={serverChart}/>

</div>


<style jsx>{`

.container{
background:linear-gradient(180deg,#FFF8DC,#F5DEB3);
min-height:100vh;
padding:40px;
font-family:Arial;
}

.header{
background:#8B4513;
color:white;
padding:20px;
border-radius:15px;
text-align:center;
margin-bottom:30px;
}

.card{
background:white;
border-radius:15px;
padding:25px;
margin-bottom:25px;
box-shadow:0 6px 20px rgba(0,0,0,0.1);
}

.deviceBox{
display:flex;
gap:20px;
margin-bottom:20px;
}

.device{
background:#FFF8DC;
padding:10px 15px;
border-radius:8px;
}

.axisRow{
display:flex;
gap:20px;
margin-bottom:20px;
}

.axis{
flex:1;
background:#FFF8DC;
padding:15px;
border-radius:10px;
text-align:center;
}

.axis span{
font-size:14px;
color:#777;
}

.axis p{
font-size:24px;
font-weight:bold;
color:#8B4513;
}

.mainBtn{
width:100%;
background:#A0522D;
color:white;
border:none;
padding:12px;
border-radius:10px;
cursor:pointer;
font-weight:bold;
}

.serverBtn{
background:#DAA520;
border:none;
padding:10px 20px;
border-radius:10px;
color:white;
cursor:pointer;
margin-bottom:20px;
}

.status{
margin-top:10px;
color:#555;
}

`}</style>

</div>

);

}