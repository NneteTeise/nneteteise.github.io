(()=>{
'use strict';
const $=id=>document.getElementById(id);
const labNumber=Math.min(4,Math.max(1,parseInt(new URLSearchParams(location.search).get('lab')||'1',10)||1));
let s={running:false,phase:'IDLE',count:0,elapsed:0,stage:0,tripped:false,lastPulse:-20,startMs:0,phaseMs:0,boxProgress:0,lastTime:performance.now()};
const labels=['','Start/Stop Latching Circuit','Conveyor Object Counter','Star–Delta Motor Timer','Conveyor Motor & Box Counter'];
$('simTitle').textContent=`LAB 0${labNumber} · ${labels[labNumber]}`;
$('labHeading').textContent=`LAB 0${labNumber} · ${labels[labNumber]}`;
for(let i=1;i<=4;i++)document.querySelector(`[data-switch="${i}"]`).classList.toggle('dark',i===labNumber);
$('latchViz').classList.toggle('active',labNumber===1);
$('timerViz').classList.toggle('active',labNumber===3);
$('conveyorViz').classList.toggle('active',labNumber===2||labNumber===4);
$('countState').style.display=labNumber===2||labNumber===4?'':'none';
$('phaseState').style.display=labNumber===3?'':'none';
$('btnPulse').style.display=labNumber===2||labNumber===4?'':'none';
$('targetControl').style.display=labNumber===2?'':'none';
$('tipline').textContent=['','START latches the RUN state; STOP releases it.','The proximity sensor increments the counter while RUN is active. At preset 10, motor stops.','STAR operates for 10 seconds, then DELTA. The 20-second overload timer is represented after transfer.','The conveyor is simulated with a motor lamp, timer and box counter.'][labNumber];
const entries=[];
function log(text){entries.unshift(`${new Date().toLocaleTimeString()}: ${text}`);$('eventLog').textContent=entries.slice(0,12).join('\n');}
function reset(){s={running:false,phase:'IDLE',count:0,elapsed:0,stage:0,tripped:false,lastPulse:-20,startMs:0,phaseMs:0,boxProgress:0,lastTime:performance.now()};log('Reset to safe stopped state.');render();}
function stop(reason='STOP pressed'){s.running=false;s.phase=s.tripped?'TRIPPED':'STOPPED';s.boxProgress=0;log(reason);render();}
function start(){if(s.running){log('START ignored: system already running.');return}if(s.tripped){log('Overload latched. RESET required.');return}s.running=true;s.phase=labNumber===3?'STAR':'RUN';s.stage=0;s.elapsed=0;s.startMs=performance.now();s.phaseMs=s.startMs;log('START accepted, run state latched.');render();}
function pulse(isAuto=false){if(!s.running){if(!isAuto)log('Sensor ignored: system stopped.');return}if(labNumber!==2&&labNumber!==4)return;s.count+=1;log(`Object detected — count ${s.count}${isAuto?' (automatic)':''}.`);if(labNumber===2&&s.count>=getTarget())stop(`Target ${getTarget()} reached; counter stop active.`);render();}
function getTarget(){const input=$('target');return Math.max(1,Math.min(100,parseInt(input.value,10)||10))}
$('btnStart').addEventListener('click',start);
$('btnStop').addEventListener('click',()=>stop());
$('btnReset').addEventListener('click',reset);
$('btnPulse').addEventListener('click',()=>pulse());
$('target').addEventListener('change',()=>{let v=getTarget();$('target').value=v;log(`Demonstration preset set to ${v}.`);if(s.count>=v&&s.running)stop('Counter reached revised target.');render()});
function render(){
 $('runText').textContent=s.running?'ON':'OFF';$('runState').classList.toggle('on',s.running);
 $('countText').textContent=String(s.count);
 $('phaseText').textContent=s.phase;
 $('rung').classList.toggle('on',s.running);$('latchMotor').classList.toggle('on',s.running);$('latchLamp').classList.toggle('on',s.running);$('latchCaption').textContent=s.running?'RUN output energised — seal-in maintained':'Output de-energised';
 $('belt').classList.toggle('running',s.running);$('motorLamp').classList.toggle('on',s.running);$('motorOffLamp').classList.toggle('on',!s.running);
 $('movingBox').classList.toggle('hidden',!s.running);
 $('conveyorCaption').textContent=s.running?`Motor running · elapsed ${s.elapsed.toFixed(1)} s · detected ${s.count} box(es)`:`Motor stopped · total detected ${s.count} box(es)`;
 $('timerMotor').classList.toggle('on',s.running);
 for(const x of ['Star','Delta','Trip'])$('step'+x).className='step';
 if(s.phase==='STAR')$('stepStar').classList.add('live');
 if(s.phase==='DELTA')$('stepDelta').classList.add('live');
 if(s.tripped)$('stepTrip').classList.add('tripped');
 $('timerCaption').textContent=s.phase==='STAR'?'STAR contactor ON · DELTA OFF':s.phase==='DELTA'?'DELTA contactor ON · STAR OFF':s.tripped?'Timer-triggered overload stop':'Motor is stopped';
 let frac=s.phase==='STAR'?(s.stage/10):s.phase==='DELTA'?(s.stage/20):s.tripped?1:0;
 $('timerProgress').style.width=`${Math.max(0,Math.min(100,frac*100))}%`;
 $('timerProgressDesc').textContent=s.phase==='STAR'?`${s.stage.toFixed(1)} / 10 s — star starting period`:s.phase==='DELTA'?`${s.stage.toFixed(1)} / 20 s — overload timer`:s.tripped?'Timed switch reached. Press RESET before START.':'Start to begin the sequence.';
 $('btnStart').disabled=s.running||s.tripped;
}
function animate(now){let dt=Math.max(0,Math.min(.1,(now-s.lastTime)/1000));s.lastTime=now;if(s.running){s.elapsed+=dt;if(labNumber===3){s.stage+=dt;if(s.phase==='STAR'&&s.stage>=10){s.stage=0;s.phase='DELTA';log('Star period complete (10 s) — DELTA active; STAR released.')}else if(s.phase==='DELTA'&&s.stage>=20){s.tripped=true;stop('20-second delta overload timer expired — output dropped.')}}else if(labNumber===2||labNumber===4){s.boxProgress+=dt/2.75;if(s.boxProgress>=1){s.boxProgress%=1;pulse(true);}const box=$('movingBox');box.style.left=`${8+75*s.boxProgress}%`;}}
render();requestAnimationFrame(animate)}
log('Demonstration loaded. Ready for operator input.');render();requestAnimationFrame(animate);
})();