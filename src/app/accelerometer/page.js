"use client";

import { useEffect, useState } from "react";

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

const DEVICE_ID = "dev-001";

export default function Page(){

const [samples,setSamples] = useState([]);
const [x,setX] = useState(0);
const [y,setY] = useState(0);
const [z,setZ] = useState(0);

const [chartData,setChartData] = useState({
labels:[],
datasets:[
{label:"X",data:[],borderColor:"#ff4d4f"},
{label:"Y",data:[],borderColor:"#1677ff"},
{label:"Z",data:[],borderColor:"#52c41a"}
]
});


// membaca accelerometer
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

setSamples(prev => [...prev,sample]);

setChartData(prev=>{

const newLabels=[...prev.labels,new Date().toLocaleTimeString()].slice(-20);

const newX=[...prev.datasets[0].data,sample.x].slice(-20);
const newY=[...prev.datasets[1].data,sample.y].slice(-20);
const newZ=[...prev.datasets[2].data,sample.z].slice(-20);

return{
labels:newLabels,
datasets:[
{...prev.datasets[0],data:newX},
{...prev.datasets[1],data:newY},
{...prev.datasets[2],data:newZ}
]
};

});

}

window.addEventListener("devicemotion",handleMotion);

return ()=>window.removeEventListener("devicemotion",handleMotion);

},[]);


// kirim batch ke server
useEffect(()=>{

const interval=setInterval(async()=>{

if(samples.length===0) return;

const batch=[...samples];

setSamples([]);

await fetch("/api/accel",{
method:"POST",
body:JSON.stringify({
device_id:DEVICE_ID,
ts:new Date().toISOString(),
samples:batch
})
});

},3000);

return ()=>clearInterval(interval);

},[samples]);

return(

<div className="container">

<h1 className="title">
📱 Accelerometer Dashboard
</h1>

<p className="device">
Device ID : <b>{DEVICE_ID}</b>
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
margin-bottom:30px;
color:#555;
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