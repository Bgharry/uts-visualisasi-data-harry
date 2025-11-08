
/* menu navigation */
const buttons = document.querySelectorAll('.menu button');
const panes = document.querySelectorAll('.pane');
let initialized = {home:true,line:false,bar:false,pie:false,hist:false,scatter:false,map:false};

buttons.forEach(b => b.addEventListener('click', ()=>{
  buttons.forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  const target = b.getAttribute('data-target');
  panes.forEach(p=>p.classList.remove('active'));
  document.getElementById(target).classList.add('active');
  if(!initialized[target]){
    initialized[target]=true;
    if(target==='line') initLine();
    if(target==='bar') initBar();
    if(target==='pie') initPie();
    if(target==='hist') initHist();
    if(target==='scatter') initScatter();
    if(target==='map') initMap();
  }
}));

/* prepare year select */
const yearBar = document.getElementById('yearBar');
DATA.years.forEach((y,i)=>{ const o=document.createElement('option'); o.value=i; o.text=y; yearBar.appendChild(o); });
yearBar.value = DATA.years.length-1;

/* helpers */
function totalsPerYearArray(){ return DATA.years.map((y, idx)=>{ let s=0; for(const p of Object.keys(DATA.platforms)) s+=DATA.platforms[p][idx]; return s; }); }
function makeBins(data, binCount=6){ const min=Math.min(...data), max=Math.max(...data); const step=(max-min)/binCount; const bins=Array(binCount).fill(0); const labels=[]; for(let i=0;i<binCount;i++) labels.push(Math.round(min + i*step) + '-' + Math.round(min + (i+1)*step)); data.forEach(v=>{ const idx = Math.min(binCount-1, Math.floor((v-min)/step)); bins[idx]++; }); return {labels:labels, counts:bins}; }
function computeGrowthPercent(arr){ const res=[0]; for(let i=1;i<arr.length;i++){ res.push(((arr[i]-arr[i-1])/arr[i-1])*100); } return res; }

/* init functions */
function initLine(){ const ctx=document.getElementById('lineChart').getContext('2d'); const totals=totalsPerYearArray(); window._line = new Chart(ctx,{type:'line',data:{labels:DATA.years,datasets:[{label:'Total Pengguna (juta)',data:totals,borderColor:'#0b3d91',backgroundColor:'rgba(11,61,145,0.08)',fill:true,tension:0.3}]},options:{responsive:true,plugins:{title:{display:true,text:'Pertumbuhan Total Pengguna (2015–2024)'}}}}); }
let barChart,pieChart,histChart,scatterChart;
function initBar(){ const d=dataForYear(DATA.years.length-1); const ctx=document.getElementById('barChart').getContext('2d'); barChart=new Chart(ctx,{type:'bar',data:{labels:d.labels,datasets:[{label:'Juta Pengguna',data:d.values,backgroundColor:['#0b3d91','#2b9d44','#f1a51b','#e04b3c','#6a5acd']}]},options:{responsive:true,plugins:{title:{display:true,text:'Jumlah Pengguna per Platform'}}}}); yearBar.addEventListener('change',()=>{ updateBarAndPie(parseInt(yearBar.value)); }); }
function initPie(){ const d=dataForYear(DATA.years.length-1); const ctx=document.getElementById('pieChart').getContext('2d'); pieChart=new Chart(ctx,{type:'pie',data:{labels:d.labels,datasets:[{data:d.values,backgroundColor:['#0b3d91','#2b9d44','#f1a51b','#e04b3c','#6a5acd']}]},options:{responsive:true,plugins:{title:{display:true,text:'Proporsi Pengguna per Platform'}}}}); }
function initHist(){ const totals=totalsPerYearArray(); const h=makeBins(totals,6); const ctx=document.getElementById('histChart').getContext('2d'); histChart=new Chart(ctx,{type:'bar',data:{labels:h.labels,datasets:[{label:'Frekuensi Tahun',data:h.counts,backgroundColor:'#0b3d91'}]},options:{responsive:true,plugins:{title:{display:true,text:'Histogram: Distribusi Total Pengguna'}}}}); }
function initScatter(){ const totals=totalsPerYearArray(); const growth=computeGrowthPercent(totals); const data=totals.map((t,i)=>({x:t,y:growth[i],label:DATA.years[i]})); const ctx=document.getElementById('scatterChart').getContext('2d'); scatterChart=new Chart(ctx,{type:'scatter',data:{datasets:[{label:'Tahun',data:data,backgroundColor:'#2b9d44'}]},options:{responsive:true,plugins:{title:{display:true,text:'Scatter: Total Pengguna vs Pertumbuhan (%)'}},scales:{x:{title:{display:true,text:'Total Pengguna (juta)'}},y:{title:{display:true,text:'Pertumbuhan (%)'}}}}); }

function initMap(){ google.charts.load('current',{'packages':['geochart']}); google.charts.setOnLoadCallback(()=>{ const data=google.visualization.arrayToDataTable(prepareAsiaData(DATA.years.length-1)); const options={region:'002',displayMode:'regions',colorAxis:{colors:['#e6f7ff','#a9d9ff','#0b3d91']},resolution:'countries',backgroundColor:'#ffffff00',datalessRegionColor:'#f3f6fb'}; const chart=new google.visualization.GeoChart(document.getElementById('asia_map')); chart.draw(data,options); }); }

/* helpers used by inits */
function dataForYear(idx){ const keys=Object.keys(DATA.platforms); return {labels:keys, values:keys.map(k=>DATA.platforms[k][idx])}; }
function prepareAsiaData(yearIdx){ const rows=[['Country','Users (juta)']]; for(const country of Object.keys(DATA.asia)){ rows.push([country, DATA.asia[country][yearIdx]]); } return rows; }
function updateBarAndPie(idx){ const d=dataForYear(idx); if(barChart){ barChart.data.labels=d.labels; barChart.data.datasets[0].data=d.values; barChart.update(); } if(pieChart){ pieChart.data.labels=d.labels; pieChart.data.datasets[0].data=d.values; pieChart.update(); } }

/* activate default home tab */
document.addEventListener('DOMContentLoaded', ()=>{ document.querySelector('.menu button.active').click(); });
