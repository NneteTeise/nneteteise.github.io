"use strict";
// Truth table transcribed from the provided Electronics 7-segment academic report.
// Index 0..9, output segment order a b c d e f g, 1 means segment illuminated.
const truth = ["1111110", "0110000", "1101101", "1111001", "0110011", "1011011", "1011111", "1110000", "1111111", "1111011"];
let value = 0;
let timer = null;
const $ = (id) => document.getElementById(id);
function stopAuto() {
  if (timer !== null) { clearInterval(timer); timer = null; }
  $("auto").textContent = "▶ Auto count";
  $("auto").setAttribute("aria-pressed", "false");
  $("auto-state").textContent = "Manual selection";
}
function render() {
  const valid = value <= 9;
  const bits = value.toString(2).padStart(4, "0");
  $("binary").textContent = bits;
  $("decimal").textContent = valid ? String(value) : String(value) + " · invalid BCD";
  document.querySelectorAll("[data-bit]").forEach(button => {
    const on = Boolean(value & Number(button.dataset.bit));
    button.classList.toggle("on", on);
    button.setAttribute("aria-pressed", String(on));
  });
  document.querySelectorAll(".digit-btn").forEach(button => {
    button.classList.toggle("selected", valid && Number(button.dataset.digit) === value);
    button.setAttribute("aria-pressed", String(valid && Number(button.dataset.digit) === value));
  });
  const pattern = valid ? truth[value] : "0000000";
  "abcdefg".split("").forEach((segment,i) => {
    const on = pattern[i] === "1";
    $("seg-"+segment).classList.toggle("on", on);
    $("led-"+segment).classList.toggle("active",on);
    $("led-"+segment).textContent=segment+" "+(on ? "1" : "0");
  });
  $("display-desc").textContent = valid ? "Showing digit "+value : "Invalid BCD input — display blanked";
  document.querySelector(".seven-display").setAttribute("aria-label",valid ? "Seven segment display showing digit "+value : "Invalid BCD input, display blanked");
  document.querySelectorAll("#truth-table tr").forEach(row=>row.classList.toggle("chosen", valid && Number(row.dataset.digit)===value));
}
function setValue(next) { value = Number(next) & 15; render(); }
document.querySelectorAll("[data-bit]").forEach(button=>button.addEventListener("click",()=>{stopAuto();setValue(value ^ Number(button.dataset.bit));}));
document.querySelectorAll("[data-digit]").forEach(button=>button.addEventListener("click",()=>{stopAuto();setValue(Number(button.dataset.digit));}));
$("next").addEventListener("click",()=>{stopAuto();setValue(value < 9 ? value+1 : 0);});
$("reset").addEventListener("click",()=>{stopAuto();setValue(0);});
$("auto").addEventListener("click",()=>{
  if (timer !== null) {stopAuto();return;}
  if (value>9) setValue(0);
  $("auto").textContent = "■ Stop auto count";
  $("auto").setAttribute("aria-pressed", "true");
  $("auto-state").textContent = "Automatic count running — 1 digit per second";
  timer=setInterval(()=>setValue((value+1)%10),1000);
});
document.addEventListener("visibilitychange",()=>{if(document.hidden) stopAuto();});
render();
