(()=>{
'use strict';
const SOURCES=[{name:'F1',m:.25,f:39.7887,v:2.42,g:.968,db:-.28},{name:'F2',m:.5,f:79.5775,v:2.23,g:.892,db:-.99},{name:'F3',m:1,f:159.1549,v:1.77,g:.708,db:-3.00},{name:'F4',m:1.5,f:238.7324,v:1.39,g:.556,db:-5.10},{name:'F5',m:2.5,f:397.8874,v:.93,g:.372,db:-8.59}];
const FC=159.15494309189535, VIN=2.5, DWELL=10000,GAP=300;
let selected=0, mode='manual', stage='dwell', remaining=DWELL, last=performance.now(), speed=1;
const $=id=>document.getElementById(id), buttons=[...document.querySelectorAll('[data-source]')];
const theo=f=>1/Math.sqrt(1+(f/FC)**2);
const db=f=>20*Math.log10(theo(f));
const showTime=n=>(n/1000).toFixed(1)+' s';
function addLog(str){let line=document.createElement('div');line.textContent=str; $('log').prepend(line);while($('log').children.length>10)$('log').lastElementChild.remove();}
function currentSource(){return selected>=0?SOURCES[selected]:null;}
function update(){let s=currentSource(),off=stage==='gap'&&mode==='auto';
 buttons.forEach((b,i)=>{b.classList.toggle('active',!off&&selected===i);b.disabled=mode==='auto';b.setAttribute('aria-pressed',String(!off&&selected===i));});
 $('runBadge').textContent=mode==='auto'?'AUTO CYCLING':mode==='pause'?'PAUSED':'MANUAL MODE';
 $('status').textContent=off?'All relays disconnected':s?.name+' selected';$('pin').textContent=off?'D2–D6 LOW':s?('D'+(selected+2)+' HIGH'):'—';
 $('countdown').textContent=mode==='auto'?showTime(remaining):'—';
 const sh=s??SOURCES[0],gain=theo(sh.f),gdb=db(sh.f);
 $('sourceName').textContent=off?'None':sh.name;
 $('frequency').textContent=off?'—':sh.f.toFixed(2)+' Hz';
 $('gain').textContent=off?'—':gain.toFixed(3);$('gainDb').textContent=off?'—':gdb.toFixed(2)+' dB';
 $('measured').textContent=off?'—':sh.g.toFixed(3);$('output').textContent=off?'—':sh.v.toFixed(2)+' Vpk';
 $('phase').textContent=off?'—':(Math.atan(sh.f/FC)*180/Math.PI).toFixed(2)+'°';
 drawChart(); }
function setManual(i){mode='manual';stage='dwell';selected=i;remaining=DWELL;addLog(SOURCES[i].name+' selected manually (D'+(i+2)+' HIGH)');update();}
buttons.forEach(b=>b.addEventListener('click',()=>setManual(Number(b.dataset.source))));
$('start').addEventListener('click',()=>{mode='auto';stage='gap';remaining=GAP;selected=-1;addLog('Auto started; all relays OFF for 0.3 s');update();});
$('pause').addEventListener('click',()=>{if(mode==='auto'){mode='pause';addLog('Sequence paused.');}else if(mode==='pause'){mode='auto';addLog('Sequence resumed.');}else{mode='pause';addLog('Manual source held; timer paused.');}update();});
$('next').addEventListener('click',()=>setManual(((selected<0? -1:selected)+1)%5));
$('reset').addEventListener('click',()=>setManual(0));
$('speed').addEventListener('change',()=>{speed=Number($('speed').value)||1;addLog('Playback speed: '+speed+'×');});
function advance(ms){if(mode!=='auto')return;remaining-=ms*speed;
 while(remaining<=0){if(stage==='gap'){
 selected=(selected+1)%5;stage='dwell';remaining+=DWELL;addLog('Selected '+SOURCES[selected].name+', relay D'+(selected+2)+' HIGH');
 }else{stage='gap';remaining+=GAP;addLog('All relays OFF (break-before-make)');}}
 update();}
function canvasFrame(canvas){const rect=canvas.getBoundingClientRect(),w=Math.max(260,rect.width),h=Math.max(140,rect.height),dpi=Math.min(2,window.devicePixelRatio||1);if(canvas.width!==Math.round(w*dpi)||canvas.height!==Math.round(h*dpi)){canvas.width=Math.round(w*dpi);canvas.height=Math.round(h*dpi);}const c=canvas.getContext('2d');c.setTransform(dpi,0,0,dpi,0,0);return {c,w,h};}
function drawScope(t){const {c,w,h}=canvasFrame($('scope'));c.clearRect(0,0,w,h);const pad=33;
 c.strokeStyle='#25473d';c.lineWidth=1;for(let i=0;i<=8;i++){let x=pad+(w-pad*1.4)*i/8;c.beginPath();c.moveTo(x,10);c.lineTo(x,h-26);c.stroke();}for(let i=0;i<=6;i++){let y=13+(h-41)*i/6;c.beginPath();c.moveTo(pad,y);c.lineTo(w-11,y);c.stroke();}
 let off=mode==='auto'&&stage==='gap', s=currentSource();if(!s||off){c.fillStyle='#a8d6c6';c.font='bold 16px sans-serif';c.textAlign='center';c.fillText('All relays disconnected',w/2,h/2);return;}
 const m=theo(s.f),ph=-Math.atan(s.f/FC),left=pad,right=w-13,mid=h*.52,A=(h-57)*.38;
 function drawWave(color,scale,phase){c.strokeStyle=color;c.lineWidth=2.2;c.beginPath();for(let x=left;x<right;x++){let p=(x-left)/(right-left)*Math.PI*6 + t*.001*2.2;let y=mid-A*scale*Math.sin(p+phase);if(x===left)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();}
 drawWave('#49a1f2',1,0);drawWave('#44e39c',m,ph);
 c.textAlign='left';c.font='12px sans-serif';c.fillStyle='#b0e0d0';c.fillText('Calculated  •  3 visible cycles',pad,16);
 c.fillText(s.name+' · '+s.f.toFixed(2)+' Hz',pad,h-8);
}
function drawChart(){const {c,w,h}=canvasFrame($('chart'));c.clearRect(0,0,w,h);const L=53,R=16,T=18,B=42,ww=w-L-R,hh=h-T-B;const fx=f=>L+Math.log10(f/10)/Math.log10(2000/10)*ww, fy=d=>T+(0.7-d)/13.7*hh;
 c.fillStyle='#fff';c.fillRect(0,0,w,h);c.strokeStyle='#e0eee6';c.lineWidth=1;
 [-12,-9,-6,-3,0].forEach(v=>{let y=fy(v);c.beginPath();c.moveTo(L,y);c.lineTo(w-R,y);c.stroke();c.fillStyle='#536b60';c.font='11px sans-serif';c.textAlign='right';c.fillText(v+' dB',L-8,y+4);});
 [10,20,50,100,200,500,1000,2000].forEach(v=>{let x=fx(v);c.beginPath();c.moveTo(x,T);c.lineTo(x,h-B);c.stroke();c.fillStyle='#526f61';c.textAlign='center';c.fillText(String(v),x,h-B+17);});
 c.fillText('Frequency (Hz) — log scale',L+ww/2,h-7);
 c.setLineDash([4,4]);c.strokeStyle='#a3b9ae';let x=fx(FC);c.beginPath();c.moveTo(x,T);c.lineTo(x,h-B);c.stroke();c.setLineDash([]);
 c.beginPath();for(let i=0;i<=320;i++){const f=10*Math.pow(200,i/320);let x=fx(f),y=fy(db(f));i?c.lineTo(x,y):c.moveTo(x,y);}c.lineWidth=2.5;c.strokeStyle='#168466';c.stroke();
 SOURCES.forEach((s,i)=>{c.fillStyle=i===selected?'#d35a55':'#de8574';c.beginPath();c.arc(fx(s.f),fy(s.db),i===selected?6:4.5,0,Math.PI*2);c.fill();});
 if(selected>=0&&!(mode==='auto'&&stage==='gap')){let s=SOURCES[selected];c.fillStyle='#234c41';c.font='bold 11px sans-serif';c.textAlign='center';c.fillText(s.name,fx(s.f),Math.max(14,fy(s.db)-12));}
}
let lastFrame=performance.now();function loop(now){let dt=Math.min(200,now-lastFrame);lastFrame=now;if(mode==='auto')advance(dt);drawScope(now);requestAnimationFrame(loop);}window.addEventListener('resize',()=>{drawChart();drawScope(performance.now());});
update();requestAnimationFrame(loop);
})();
