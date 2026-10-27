(()=>{
'use strict';
const $=id=>document.getElementById(id);
const modes={calls:{label:'Call duration',desc:'Enter call durations in minutes; fixed rate R2.50 per minute.',unit:'minutes',entry:'Call',rate:2.5,samples:[7,3],choice:1},data:{label:'Data usage',desc:'Enter usage for each session in MB; fixed rate R0.10 per MB.',unit:'MB',entry:'Session',rate:0.10,samples:[57.10,32.60,40],choice:2}};
let mode='calls';let values=[7,3];let ended=false;
function money(n){return 'R'+n.toFixed(2)}
function num(n){return n.toFixed(2)}
function setText(id,value){$(id).textContent=value}
function menu(){return '--- Telecom Network Monitoring System ---\n1. Simulate Call Traffic\n2. Calculate Total Data Usage\n3. Exit\nEnter your choice: '}
function select(which){
 if(which==='exit'){
  ended=true;document.querySelectorAll('.tele-switches button').forEach(x=>x.setAttribute('aria-pressed',String(x.id==='exitBtn')));
  setText('terminal',menu()+'3\nExiting system...');setText('modeTitle','Program exited');setText('modeDesc','Use Restart to begin another run.');setText('total','—');setText('cost','—');setText('validation','');
  $('inputs').replaceChildren();$('addBtn').disabled=true;$('calculateBtn').disabled=true;
  $('sampleBtn').disabled=true;$('resetBtn').textContent='Restart';return;
 }
 ended=false;mode=which;values=modes[mode].samples.slice();
 document.querySelectorAll('.tele-switches button').forEach(x=>x.setAttribute('aria-pressed',String((mode==='calls'?'callsBtn':'dataBtn')===x.id)));
 setText('modeTitle',modes[mode].label);setText('modeDesc',modes[mode].desc);setText('totalLabel',mode==='calls'?'Total call duration':'Total data usage');
 $('addBtn').disabled=false;$('calculateBtn').disabled=false;$('sampleBtn').disabled=false;$('resetBtn').textContent='Reset';
 setText('terminal',menu());render();clearOutput();
}
function clearOutput(){setText('total','—');setText('cost','—');setText('validation','')}
function sync(){values=Array.from($('inputs').querySelectorAll('input[type=number]')).map(i=>i.value)}
function render(){
 const inputs=$('inputs');inputs.replaceChildren();
 values.forEach((value,i)=>{
  const row=document.createElement('div');row.className='tele-inputrow';
  const label=document.createElement('label');label.setAttribute('for','value'+i);
  const name=document.createElement('span');name.textContent=modes[mode].entry+' '+(i+1);
  const field=document.createElement('input');field.type='number';field.step='0.01';field.min='0';field.id='value'+i;field.value=String(value);field.setAttribute('aria-label',modes[mode].entry+' '+(i+1)+' '+modes[mode].unit);
  field.addEventListener('input',()=>{clearOutput();});label.append(name,field);
  const del=document.createElement('button');del.type='button';del.textContent='Remove';del.setAttribute('aria-label','Remove '+modes[mode].entry+' '+(i+1));del.disabled=values.length<=1;
  del.addEventListener('click',()=>{sync();values.splice(i,1);render();clearOutput();});row.append(label,del);inputs.append(row);
 });
}
function calculate(){
 sync();const nums=values.map(x=>Number(x));
 if(nums.length===0||values.some(v=>String(v).trim()===''||!Number.isFinite(Number(v))||Number(v)<0)||nums.some(n=>n>1000000)){
  setText('validation','Enter a valid non-negative number up to 1,000,000 for each field.');clearMeasurements();return;
 }
 const total=nums.reduce((a,b)=>a+b,0),cost=total*modes[mode].rate;
 if(!Number.isFinite(total)||total>10000000){setText('validation','The total is too large for the demonstration.');clearMeasurements();return;}
 setText('validation','Calculated from '+nums.length+' entered value'+(nums.length===1?'':'s')+'.');
 setText('total',num(total)+' '+modes[mode].unit);setText('cost',money(cost));
 let result=menu()+modes[mode].choice+'\n';
 result+=mode==='calls'?'Enter number of calls: '+nums.length+'\n':'Enter number of data sessions: '+nums.length+'\n';
 nums.forEach((v,i)=>{result+=(mode==='calls'?'Enter duration of call ':'Enter data used in session ')+(i+1)+(mode==='calls'?' (minutes): ':' (MB): ')+num(v)+'\n'});
 result+=(mode==='calls'?'Total Call Duration: '+num(total)+' minutes\nTotal Call Cost: ':'Total Data Usage: '+num(total)+' MB\nTotal Data Cost: ')+money(cost)+'\n';
 setText('terminal',result);
}
function clearMeasurements(){setText('total','—');setText('cost','—');}
$('callsBtn').addEventListener('click',()=>select('calls'));
$('dataBtn').addEventListener('click',()=>select('data'));
$('exitBtn').addEventListener('click',()=>select('exit'));
$('addBtn').addEventListener('click',()=>{sync();if(values.length>=30){setText('validation','The demo accepts a maximum of 30 entries.');return;}values.push(0);render();clearOutput();});
$('sampleBtn').addEventListener('click',()=>{values=modes[mode].samples.slice();render();clearOutput();});
$('calculateBtn').addEventListener('click',calculate);
$('resetBtn').addEventListener('click',()=>select(ended?'calls':mode));
select('calls');
})();
