/* booking.js - calendario y slots mañana/tarde */
var selectedSlot = "";

function todayISO(){
  var d = new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function maxISO(){
  var d = new Date(); d.setDate(d.getDate()+60);
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function isSunday(fecha){
  var p = fecha.split("-"); return new Date(+p[0],+p[1]-1,+p[2]).getDay()===0;
}
function isSaturday(fecha){
  var p = fecha.split("-"); return new Date(+p[0],+p[1]-1,+p[2]).getDay()===6;
}
function initBooking(){
  var inp = document.getElementById("inp-fecha");
  inp.min = todayISO(); inp.max = maxISO(); inp.value = todayISO();
  inp.addEventListener("change", renderSlots);
  renderSlots();
}
function renderSlots(){
  var fecha = document.getElementById("inp-fecha").value;
  var aviso = document.getElementById("fecha-aviso");
  var boxM = document.getElementById("slots-manana");
  var boxT = document.getElementById("slots-tarde");
  boxM.innerHTML=""; boxT.innerHTML=""; selectedSlot="";
  updateResumen();

  if(!fecha){ aviso.textContent="Elige una fecha."; return; }
  if(fecha < todayISO()){ aviso.textContent="⛔ No puedes agendar en el pasado."; return; }
  if(isSunday(fecha)){ aviso.textContent="⛔ Domingos cerrado. Elige lun–sáb."; return; }

  var sab = isSaturday(fecha);
  aviso.textContent = sab ? "Sábado: solo jornada mañana (8am–12m)." : "Disponible: mañana 8–12 y tarde 2–6.";

  function btn(hora, box){
    var b = document.createElement("button");
    b.type="button"; b.className="slot"; b.textContent=hora;
    var taken = isSlotTaken(fecha, hora);
    // Bloquear horas ya pasadas si es hoy
    if(fecha===todayISO()){
      var now=new Date(); var p=hora.split(":");
      var h=new Date(); h.setHours(+p[0],+p[1],0,0);
      if(h<=now) taken=true;
    }
    if(taken) b.disabled=true;
    b.addEventListener("click", function(){
      document.querySelectorAll(".slot").forEach(function(s){s.classList.remove("selected");});
      b.classList.add("selected"); selectedSlot=hora; updateResumen();
    });
    box.appendChild(b);
  }
  CONFIG.slotsManana.forEach(function(h){ btn(h, boxM); });
  if(sab){
    var p=document.createElement("p"); p.className="text-xs text-slate-400"; p.textContent="Tarde no disponible los sábados.";
    boxT.appendChild(p);
  } else {
    CONFIG.slotsTarde.forEach(function(h){ btn(h, boxT); });
  }
}
function getModalidad(){
  var r = document.querySelector('input[name="modalidad"]:checked');
  return r ? r.value : "Presencial";
}
function updateResumen(){
  var box = document.getElementById("resumen-cita");
  var fecha = document.getElementById("inp-fecha").value;
  var serv = document.getElementById("sel-servicio").value;
  if(!fecha || !selectedSlot){ box.classList.add("hidden"); return; }
  box.classList.remove("hidden");
  box.innerHTML = "📋 <strong>Tu selección:</strong> "+serv+" · "+getModalidad()+" · "+fechaLargaES(fecha)+" · "+selectedSlot;
}
