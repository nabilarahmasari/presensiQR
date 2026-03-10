"use client";

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

function getDeviceId(){

let id = localStorage.getItem("device_id");

if(!id){

id = "dev-" + crypto.randomUUID();

localStorage.setItem("device_id", id);

}

return id;

}

const DEVICE_ID = getDeviceId();

export default function Page(){

const bufferRef = useRef([]);

const [x,setX] = useState(0);
const [y,setY] = useState(0);
const [z,setZ] = useState(0);

const [status,setStatus] = useState("idle");

const [chartData,setChartData] = useState({
labels:[],
datasets:[
{label:"X",data:[],borderColor:"#ff4d4f"},
{label:"Y",data:[],borderColor:"#1677ff"},
{label:"Z",data:[],borderColor:"#52c41a"}
]
});


/* =============================
   ACCELEROMETER READER
============================= */

useEffect(()=>{

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

/* simpan ke buffer */

bufferRef.current.push(sample);

/* update chart */

setChartData(prev=>{

const labels=[...prev.labels,new Date().toLocaleTimeString()].slice(-30);

const xData=[...prev.datasets[0].data,sample.x].slice(-30);
const yData=[...prev.datasets[1].data,sample.y].slice(-30);
const zData=[...prev.datasets[2].data,sample.z].slice(-30);

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

return ()=>window.removeEventListener("devicemotion",handleMotion);

},[]);


/* =============================
   BATCH UPLOAD
============================= */

useEffect(()=>{

const interval=setInterval(async()=>{

const buffer=bufferRef.current;

if(buffer.length===0) return;

setStatus("uploading");

/* ambil batch */

const batch=[...buffer];

/* reset buffer */

bufferRef.current=[];

try{

await fetch("/api/checkin/accel",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
device_id:DEVICE_ID,
ts:new Date().toISOString(),
samples:batch
})
});

setStatus("uploaded");

}catch(e){

setStatus("error");

}

},3000);

return ()=>clearInterval(interval);

},[]);


/* =============================
   IOS PERMISSION
============================= */

async function requestPermission(){

if(typeof DeviceMotionEvent !== "undefined" &&
typeof DeviceMotionEvent.requestPermission === "function"){

await DeviceMotionEvent.requestPermission();

}

}


/* =============================
   UI
============================= */

return(

<div className="container">

<h1 className="title">
📱 Accelerometer Dashboard
</h1>

<p className="device">
Device ID : <b>{DEVICE_ID}</b>
</p>


<button className="btn" onClick={requestPermission}>
Enable Sensor
</button>


<p className="status">
Upload Status : {status}
</p>


<div className="cards">

<div className="card">
<h3>X Axis</h3>
<p>{x.toFixed(2)}</p>
</div>

<div className="card">
<h3>Y Axis</h3>
<p>{y.toFixed(2)}</p>
</div>

<div className="card">
<h3>Z Axis</h3>
<p>{z.toFixed(2)}</p>
</div>

</div>


<div className="chartCard">
<h2>Realtime Accelerometer</h2>
<Line data={chartData}/>
</div>


<style jsx>{`

.container{
padding:40px;
font-family:Arial;
background:#f4f6f8;
min-height:100vh;
}

.title{
text-align:center;
margin-bottom:10px;
}

.device{
text-align:center;
margin-bottom:20px;
color:#555;
}

.btn{
display:block;
margin:10px auto 20px;
padding:10px 20px;
border:none;
background:#1677ff;
color:white;
border-radius:8px;
cursor:pointer;
}

.status{
text-align:center;
margin-bottom:20px;
color:#666;
}

.cards{
display:flex;
gap:20px;
justify-content:center;
margin-bottom:30px;
flex-wrap:wrap;
}

.card{
background:white;
padding:20px;
width:150px;
border-radius:10px;
box-shadow:0 4px 10px rgba(0,0,0,0.1);
text-align:center;
}

.card h3{
margin:0;
font-size:16px;
color:#777;
}

.card p{
font-size:28px;
font-weight:bold;
margin-top:10px;
}

.chartCard{
background:white;
padding:30px;
border-radius:10px;
box-shadow:0 4px 10px rgba(0,0,0,0.1);
}

`}</style>

</div>

);

}