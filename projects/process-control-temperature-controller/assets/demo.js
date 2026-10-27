(() => {
'use strict';
const $=id=>document.getElementById(id);
const chart=$('tempChart'),ctx=chart.getContext('2d');
const tempLabel=$('reading'),targetLabel=$('setpointLabel'),targetValue=$('targetValue'),setpointSlider=$('setpoint');
let temp=23, seconds=0, setpoint=29, ambient=22, heater=false, fan=false, running=false, switches=0;
let history=[{t:0,temp:23,target:29}], raf=0, last=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function reset(){running=false;last=0;temp=23;seconds=0;heater=false;fan=false;switches=0;history=[{t:0,temp,target:setpoint}];update();}
function tick(dt){
 seconds+=dt;
 // Two-threshold hysteresis policy for a conceptual ON/OFF heating controller.
 const nextHeater = temp <= setpoint-2 ? true : temp >= setpoint+2 ? false : heater;
 if(nextHeater!==heater)switches++;
 heater=nextHeater;
 fan=!heater && temp>setpoint+2;
 // Simplified illustrative dynamics: energy input, environmental loss, fan cooling.
 const heat=heater?0.75:0;
 const loss=0.045*(temp-ambient);
 const cooling=fan?0.42:0;
 temp=clamp(temp + (heat-loss-cooling)*dt,ambient-2,43);
 if(!Number.isFinite(temp)) {reset();return;}
 history.push({t:seconds,temp,target:setpoint});
 if(history.length>2500)history.shift();
 update();
}
function update(){
 tempLabel.textContent=temp.toFixed(1);
 targetLabel.textContent=setpoint.toFixed(1)+'°C';
 targetValue.textContent=setpoint+'°C';
 $('elapsed').textContent=seconds.toFixed(1)+' s';
 $('error').textContent=(setpoint-temp).toFixed(1)+'°C';
 $('switches').textContent=String(switches);
 $('heaterStatus').textContent=heater?'ON':'OFF';
 $('fanStatus').textContent=fan?'ON':'OFF';
 $('heaterLed').classList.toggle('on',heater);
 $('fanLed').classList.toggle('on',fan);
 $('runBtn').textContent=running?'Running…':'▶ Run simulation';
 draw();
}
function draw(){
 const W=chart.width,H=chart.height,l=53,r=19,t=20,b=36, iw=W-l-r, ih=H-t-b;
 ctx.clearRect(0,0,W,H);
 ctx.fillStyle='#f9fdfb';ctx.fillRect(0,0,W,H);
 const start=Math.max(0,seconds-100), span=100;
 const minY=16,maxY=44;
 const x=v=>l+(v-start)/span*iw;
 const y=v=>t+(maxY-v)/(maxY-minY)*ih;
 ctx.font='12px system-ui, sans-serif';ctx.textAlign='right';ctx.lineWidth=1;
 for(let v=20;v<=40;v+=5){const py=y(v);ctx.strokeStyle='#e4efe8';ctx.beginPath();ctx.moveTo(l,py);ctx.lineTo(W-r,py);ctx.stroke();ctx.fillStyle='#647b70';ctx.fillText(v+'°C',l-8,py+4);}
 ctx.textAlign='center';
 for(let i=0;i<=5;i++){let tt=start+20*i;let xx=x(tt);ctx.strokeStyle='#e4efe8';ctx.beginPath();ctx.moveTo(xx,t);ctx.lineTo(xx,H-b);ctx.stroke();ctx.fillStyle='#6c8177';ctx.fillText(tt.toFixed(0)+'s',xx,H-11);}
 let pts=history.filter(v=>v.t>=start);
 const paths=[{k:'target',c:'#d98744',dash:[6,5]},{k:'temp',c:'#0a8665',dash:[]}];
 for(const p of paths){ctx.strokeStyle=p.c;ctx.lineWidth=p.k==='temp'?3:2;ctx.setLineDash(p.dash);ctx.beginPath();pts.forEach((item,i)=>{const px=x(item.t),py=y(item[p.k]);if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)});ctx.stroke();ctx.setLineDash([]);}
}
function frame(now){if(!running)return;if(!last)last=now;let elapsed=clamp((now-last)/1000,0,0.2);last=now;
 // Small discrete integration steps preserve stable behaviour on fast mode.
 let duration=elapsed*Number($('speed').value);while(duration>0){const d=Math.min(0.05,duration);tick(d);duration-=d;}
 raf=requestAnimationFrame(frame);
}
$('runBtn').addEventListener('click',()=>{if(running)return;running=true;last=0;update();raf=requestAnimationFrame(frame)});
$('pauseBtn').addEventListener('click',()=>{running=false;cancelAnimationFrame(raf);update()});
$('resetBtn').addEventListener('click',()=>{cancelAnimationFrame(raf);reset()});
setpointSlider.addEventListener('input',()=>{setpoint=Number(setpointSlider.value);history.push({t:seconds,temp,target:setpoint});update()});
$('ambient').addEventListener('change',()=>{ambient=Number($('ambient').value);update()});
$('csvBtn').addEventListener('click',()=>{const lines=['simulated_time_s,simulated_temperature_C,target_C',...history.map(v=>[v.t.toFixed(3),v.temp.toFixed(3),v.target.toFixed(2)].join(','))];const blob=new Blob([lines.join('\n')],{type:'text/csv'}),url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='temperature_demo_simulated_data.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
update();
})();