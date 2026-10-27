document.addEventListener('DOMContentLoaded',()=>{
 const rows=[...document.querySelectorAll('tr[data-budget-row]')];
 const money=n=>'R'+n.toLocaleString('en-ZA',{minimumFractionDigits:2,maximumFractionDigits:2});
 const totalEl=document.querySelector('#scenario-total');
 const subtotalEl=document.querySelector('#scenario-subtotal');
 const deltaEl=document.querySelector('#scenario-delta');
 const noteEl=document.querySelector('#scenario-status');
 function recalc(){let subtotal=0;rows.forEach(tr=>{const n=Number(tr.querySelector('.qty').value),u=Number(tr.querySelector('.unit').value),el=tr.querySelector('.line-total');if(!Number.isFinite(n)||!Number.isFinite(u)||n<0||u<0){el.textContent='Invalid';return;}const value=n*u;subtotal+=value;el.textContent=money(value)}); const contingency=Number(document.querySelector('#contingency').value);const valid=Number.isFinite(contingency)&&contingency>=0;const total=subtotal+(valid?contingency:0);subtotalEl.textContent=money(subtotal);totalEl.textContent=valid?money(total):'Invalid';deltaEl.textContent=valid?money(total-426):'Invalid';noteEl.textContent=valid?'Scenario calculation only — not a new measured/project cost.':'Enter non-negative contingency.';}
 document.querySelectorAll('.qty,.unit,#contingency').forEach(x=>x.addEventListener('input',recalc));
 document.querySelector('#restore-budget').addEventListener('click',()=>{rows.forEach(tr=>{tr.querySelector('.qty').value=tr.dataset.qty;tr.querySelector('.unit').value=tr.dataset.unit;});document.querySelector('#contingency').value='40';recalc();});
 recalc();
});