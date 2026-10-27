'use strict';
(() => {
  const $ = (id) => document.getElementById(id);
  const modeBtns = [...document.querySelectorAll('[data-mode]')];
  const scope = $('scope'), ctx=scope.getContext('2d');
  const modes={
    am:{title:'Amplitude Modulation (AM)',intro:'A lower-frequency message changes the envelope of a carrier. An ideal envelope detector can recover the message.',formula:'s(t) = [1 + μm(t)] cos(2πfct)',hint:'Observe how the carrier grows and shrinks in amplitude as the message varies.'},
    fm:{title:'Frequency Modulation (FM)',intro:'The message varies instantaneous carrier frequency. The amplitude remains fixed in this example.',formula:'s(t) = cos[2πfct + β sin(2πfmt)]',hint:'Compare the spacing of carrier cycles. Closely spaced cycles represent higher instantaneous frequency.'},
    ask:{title:'Amplitude Shift Keying (ASK)',intro:'Binary data switches the carrier amplitude. In this ideal on-off keying example, 1 transmits a carrier and 0 switches it off.',formula:'s(t) = b(t) × cos(2πfct)',hint:'Notice that amplitude vanishes in every zero-bit interval. The bottom row is ideal bit recovery.'},
    psk:{title:'Binary Phase Shift Keying (BPSK)',intro:'Binary data changes the phase of the carrier, typically switching between 0° and 180° in a basic model.',formula:'s(t) = cos[2πfct + π(1 − b(t))]',hint:'See phase reversals at changes in the bit value, while signal magnitude stays constant.'},
    fsk:{title:'Binary Frequency Shift Keying (BFSK)',intro:'The two binary symbols select two different carrier frequencies.',formula:'f(t) = f₀ when b(t)=0; f₁ when b(t)=1',hint:'The modulated waveform has faster oscillations during 1-bits than 0-bits.'},
    pcm:{title:'Pulse Code Modulation (PCM)',intro:'An analogue waveform is sampled and quantised into a finite number of amplitude levels. Each quantised value becomes a binary codeword.',formula:'Nlevels = 2^n;  Δ = (Vmax − Vmin)/Nlevels',hint:'Compare the continuous input with the sampled and quantised values. Increasing bits improves the quantisation resolution.'}
  };
  const params = new URLSearchParams(location.search);
  let mode = modes[params.get('mode')]?params.get('mode'):'am';
  let running = true, cursor = 0, last=0;
  const getbits=()=>($('bitPattern').value.replace(/[^01]/g,'').slice(0,12)||'10110010');
  const cm = () => +$('messageHz').value;
  const cc = () => +$('carrierHz').value;
  const depth=()=>+$('depth').value;
  const tau=Math.PI*2;
  const m=(x)=>Math.sin(tau*cm()*x);
  const bits=()=>getbits().split('').map(Number);
  const bit=(x)=>{const v=bits();return v[Math.min(v.length-1, Math.floor(Math.min(.999999,x)*v.length))];};
  const digital=(x)=>2*bit(x)-1;
  const sampleCount=16;
  const quant=(val,n)=>{const levels=(1<<n);const k=Math.min(levels-1,Math.max(0,Math.round(((val+1)/2)*(levels-1))));return {v:-1+2*k/(levels-1),code:k.toString(2).padStart(n,'0')};};
  const pcmValues=()=>Array.from({length:sampleCount},(_,i)=>quant(m(i/(sampleCount-1)),+$('quantBits').value));
  function signal(row,x){
    let ph = tau*cc()*x, v=0;
    if (mode==='pcm'){
      const vals=pcmValues(); const i=Math.min(vals.length-1,Math.floor(x*vals.length));
      if(row===0)return m(x);
      if(row===1)return (Math.abs(x*sampleCount-Math.round(x*sampleCount))<.025)?m(x):0;
      if(row===2)return vals[i].v;
      return vals[i].v;
    }
    const dig=(mode==='ask'||mode==='psk'||mode==='fsk');
    if(row===0) return dig?digital(x):m(x);
    if(row===1)return Math.cos(ph);
    if(row===3)return dig?digital(x):m(x);
    if(mode==='am')return (.65+.62*depth()*m(x))*Math.cos(ph)/1.9;
    if(mode==='fm')return Math.cos(ph+depth()*2.6*Math.sin(tau*cm()*x));
    if(mode==='ask')return bit(x)?Math.cos(ph):0;
    if(mode==='psk')return Math.cos(ph+(bit(x)?0:Math.PI));
    if(mode==='fsk'){
      const seq=bits(), n=seq.length;
      const idx=Math.min(n-1,Math.floor(Math.min(.999999,x)*n));
      const local=x*n-idx;
      const c0=cc()/5,c1=cc()/2.7;let cycles=0;
      for(let j=0;j<idx;j++)cycles+=seq[j]?c1:c0;
      cycles+=(seq[idx]?c1:c0)*local;
      return Math.cos(tau*cycles);
    }
    return v;
  }
  function refresh(){
    $('messageOut').textContent=cm();$('carrierOut').textContent=cc();$('depthOut').textContent=depth().toFixed(2);$('quantOut').textContent=$('quantBits').value+' bits';
    const dig=['ask','psk','fsk'].includes(mode);
    $('bit-options').hidden=!dig;$('analog-options').hidden=dig;$('pcm-options').hidden=mode!=='pcm';$('carrier-options').hidden=mode==='pcm';$('depth-options').hidden=!['am','fm'].includes(mode);
    $('bitPattern').value=getbits();
    for(const btn of modeBtns)btn.setAttribute('aria-pressed',String(btn.dataset.mode===mode));
    $('screenTitle').textContent=modes[mode].title;
    $('explainerTitle').textContent=modes[mode].title;
    $('explainer').textContent=modes[mode].intro;
    $('formula').textContent=modes[mode].formula;
    $('graphHelp').textContent=modes[mode].hint+' The four panels show input, reference carrier or samples, encoded/modulated result, and idealised recovered output.';
    $('config').textContent=mode.toUpperCase()+' · '+(dig?bits().length+' input bits':mode==='pcm'?'16 samples':'analogue');
    $('pcmCode').hidden=mode!=='pcm';
    if(mode==='pcm'){$('pcmCode').textContent='Encoded 16-sample sequence ('+$('quantBits').value+' bits/sample): '+pcmValues().map(x=>x.code).join('  ');}
    try{const u=new URL(location.href);u.searchParams.set('mode',mode);history.replaceState(null,'',u);}catch(e){}
    draw();
  }
  function draw(){
    if(!ctx)return;
    const w=scope.width,h=scope.height;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#092825';ctx.fillRect(0,0,w,h);
    const left=75,right=w-27,top=34, rowH=123,sep=12, middle=rowH/2;
    const rowName=['ask','psk','fsk'].includes(mode)?['Digital bits','Carrier','Transmitted signal','Ideal recovered bits']:(mode==='pcm'?['Analogue input','Sampling pulses','Quantised levels','Reconstructed output']:['Message','Carrier','Modulated signal','Ideal recovered message']);
    for(let row=0;row<4;row++){
      const y=top+row*(rowH+sep)+middle;
      ctx.fillStyle=row%2?'#0f3330':'#0d2e2a';ctx.fillRect(left-8,y-middle,right-left+16,rowH);
      ctx.lineWidth=1;
      for(let j=0;j<=4;j++){
        let yy=y+(j-2)*rowH/5;ctx.strokeStyle='#275148';ctx.beginPath();ctx.moveTo(left,yy);ctx.lineTo(right,yy);ctx.stroke();
      }
      for(let j=0;j<=10;j++){
        let xx=left+(right-left)*j/10;ctx.strokeStyle='#1e4942';ctx.beginPath();ctx.moveTo(xx,y-middle+2);ctx.lineTo(xx,y+middle-2);ctx.stroke();
      }
      ctx.fillStyle='#a5d6c5';ctx.font='600 12px sans-serif';ctx.fillText(rowName[row],left,y-middle-11);
      ctx.strokeStyle=row===0?'#81ecd0':row===1?'#a3b8fc':row===2?'#52d98e':'#ffbf76';ctx.lineWidth=2;ctx.beginPath();
      const count=1000;
      for(let j=0;j<=count;j++){
        const x=j/count;const yy=y-signal(row,x)*(rowH*.29);const xx=left+x*(right-left);if(j===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);
      }
      ctx.stroke();
      // mark PCM samples explicitly
      if(mode==='pcm'&&[1,2].includes(row)){
        for(let i=0;i<sampleCount;i++){
          const x=i/(sampleCount-1);const val=row===1?m(x):pcmValues()[i].v;
          ctx.beginPath();ctx.fillStyle='#a8ffe1';ctx.arc(left+x*(right-left),y-val*(rowH*.29),3.4,0,tau);ctx.fill();
        }
      }
      ctx.font='11px sans-serif';ctx.fillStyle='#7eaa9b';ctx.fillText('+1',15,y-rowH*.25);ctx.fillText(' 0',19,y+4);ctx.fillText('−1',15,y+rowH*.28);
    }
    let xx=left+cursor*(right-left);
    ctx.strokeStyle='#fcd97d';ctx.lineWidth=1.5;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(xx,top);ctx.lineTo(xx,top+3*(rowH+sep)+rowH);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#ebc86f';ctx.font='12px sans-serif';ctx.fillText('SCAN',Math.min(w-66,xx+6),23);
    ctx.fillStyle='#add2c6';ctx.font='11px sans-serif';ctx.fillText('Normalised time →',right-100,h-8);
  }
  modeBtns.forEach(btn=>btn.addEventListener('click',()=>{mode=btn.dataset.mode;cursor=0;refresh();}));
  ['messageHz','carrierHz','depth','quantBits','bitPattern'].forEach(x=>$(x).addEventListener('input',refresh));
  $('run').addEventListener('click',()=>{running=!running;$('run').textContent=running?'❚❚ Pause':'▶ Run';$('status').textContent=running?'Running · visual scan':'Paused · waveforms stay interactive';});
  $('reset').addEventListener('click',()=>{cursor=0;running=true;$('run').textContent='❚❚ Pause';$('status').textContent='Running · visual scan';refresh();});
  function anim(ts){if(running&&last){cursor=(cursor+(ts-last)*.00013)%1;draw();}last=ts;requestAnimationFrame(anim);}
  refresh();requestAnimationFrame(anim);
})();
