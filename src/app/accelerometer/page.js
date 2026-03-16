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


/* ================= BATCH UPLOAD ================= */

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

},3000);

return ()=>{

clearInterval(intervalRef.current);

};

},[deviceId,isRecording]);


/* ================= GET SERVER ================= */

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


/* ================= START STOP ================= */

async function toggleRecording(){

if(!isRecording){

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
<p>Accelerometer Monitoring</p>
</header>


<div className="grid">

<div className="card">

<h2>Status Perangkat</h2>

<div className="deviceBox">
<div className="device">{deviceId}</div>
<div className="device">
Sensor : {isRecording ? "Aktif" : "Nonaktif"}
</div>
</div>

<div className="axisRow">

<div className="axis">
<span>X</span>
<p>{x.toFixed(2)}</p>
</div>

<div className="axis">
<span>Y</span>
<p>{y.toFixed(2)}</p>
</div>

<div className="axis">
<span>Z</span>
<p>{z.toFixed(2)}</p>
</div>

</div>

<button className="mainBtn" onClick={toggleRecording}>
{isRecording ? "Stop Sensor" : "Mulai Sensor"}
</button>

<p className="status">Upload Status : {status}</p>

</div>


<div className="card">

<h2>Grafik Real Time</h2>

<div className="chartWrap">
<Line data={chartData}/>
</div>

</div>


<div className="card">

<h2>Riwayat Aktivitas</h2>
<p>{log}</p>

</div>


<div className="card">

<h2>Data Server</h2>

<button className="serverBtn" onClick={getLatest}>
Cek Data Terbaru
</button>

<div className="chartWrap">
<Line data={serverChart}/>
</div>

</div>

</div>


<style jsx>{`

.container{
background:linear-gradient(180deg,#FFF6CC,#F5DEB3);
min-height:100vh;
padding:30px;
font-family:Arial;
color:#333;
}

.header{
background:#8B4513;
color:white;
padding:25px;
border-radius:14px;
text-align:center;
margin-bottom:25px;
}

.grid{
display:grid;
grid-template-columns:1fr 1fr;
gap:25px;
}

.card{
background:white;
border-radius:14px;
padding:20px;
box-shadow:0 8px 25px rgba(0,0,0,0.1);
}

.deviceBox{
display:flex;
gap:10px;
flex-wrap:wrap;
margin-bottom:15px;
}

.device{
background:#FFF6CC;
padding:8px 12px;
border-radius:8px;
font-weight:500;
}

.axisRow{
display:flex;
gap:12px;
margin-bottom:20px;
}

.axis{
flex:1;
background:#FFF6CC;
border-radius:10px;
padding:12px;
text-align:center;
}

.axis span{
font-size:13px;
color:#555;
}

.axis p{
font-size:22px;
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
transition:0.2s;
}

.mainBtn:hover{
background:#8B4513;
}

.serverBtn{
background:#DAA520;
border:none;
padding:10px 18px;
border-radius:10px;
color:white;
cursor:pointer;
margin-bottom:15px;
}

.status{
margin-top:10px;
font-size:14px;
color:#555;
}

.chartWrap{
width:100%;
overflow-x:auto;
}


/* ================= MOBILE ================= */

@media(max-width:768px){

.container{
padding:15px;
}

.grid{
grid-template-columns:1fr;
}

.axisRow{
flex-direction:column;
}

.axis{
padding:15px;
}

.header h1{
font-size:22px;
}

}

`}</style>

</div>

);

}