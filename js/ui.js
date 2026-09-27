/* ui.js - toast, modal, panel médico */
var lastCita = null;

function showToast(msg){
  var t = document.getElementById("toast");
  t.textContent = msg; t.classList.remove("hidden"); t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(function(){ t.classList.add("hidden"); t.classList.remove("show"); }, 3200);
}
function openModal(cita){
  lastCita = cita;
  document.getElementById("modal-detalle").innerHTML =
    "<p><strong>👤</strong> "+escapeHtml(cita.nombre)+"</p>"+
    "<p><strong>📌</strong> "+escapeHtml(cita.servicio)+" · "+escapeHtml(cita.modalidad)+"</p>"+
    "<p><strong>📅</strong> "+escapeHtml(fechaLargaES(cita.fecha))+" · ⏰ "+escapeHtml(cita.hora)+"</p>"+
    "<p class='text-xs text-slate-500 mt-1'>🆔 "+cita.id+" · Se abrió WhatsApp con el resumen. Si no se abrió, usa el botón verde.</p>";
  document.getElementById("btn-gcal").href = buildGCalUrl(cita);
  document.getElementById("btn-wa-confirm").href = buildWhatsAppConfirmUrl(cita);
  var m = document.getElementById("modal");
  m.classList.remove("hidden"); m.classList.add("show");
}
function closeModal(){
  var m = document.getElementById("modal");
  m.classList.add("hidden"); m.classList.remove("show");
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

function renderAdminPanel(filter){
  var box = document.getElementById("panel-lista");
  var list = getAppointments().slice().sort(function(a,b){ return (a.fecha+a.hora) < (b.fecha+b.hora) ? -1 : 1; });
  if(filter){
    var f = filter.toLowerCase();
    list = list.filter(function(c){ return (c.nombre+c.servicio+c.fecha+c.hora+c.modalidad+c.telefono).toLowerCase().includes(f); });
  }
  if(!list.length){
    box.innerHTML = "<div class='border rounded-2xl p-6 text-center text-sm text-slate-500 bg-nube'>Aún no hay citas. Cuando agendes una, aparecerá aquí y podrás enviarle recordatorio por WhatsApp.</div>";
    return;
  }
  box.innerHTML = "";
  list.forEach(function(c){
    var div = document.createElement("div");
    div.className = "bg-nube border border-cyan-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3";
    div.innerHTML =
      "<div class='flex-1 text-sm'>"+
        "<p class='font-semibold text-mariposa-dark'>"+escapeHtml(c.nombre)+" <span class='text-xs font-normal text-slate-400'>"+c.id+"</span></p>"+
        "<p class='text-slate-600'>"+escapeHtml(c.servicio)+" · "+escapeHtml(c.modalidad)+" · "+escapeHtml(c.fecha)+" "+escapeHtml(c.hora)+"</p>"+
        "<p class='text-xs text-slate-500'>📞 "+escapeHtml(c.telefono)+" · ✉️ "+escapeHtml(c.correo)+"</p>"+
        (c.motivo ? "<p class='text-xs text-slate-500 italic'>“"+escapeHtml(c.motivo)+"”</p>" : "")+
      "</div>"+
      "<div class='flex flex-wrap gap-2'>"+
        "<button class='text-xs bg-[#25D366] text-white font-semibold px-4 py-2 rounded-full' data-act='rem'>📱 Enviar Recordatorio por WhatsApp</button>"+
        "<button class='text-xs border px-4 py-2 rounded-full' data-act='gcal'>📅 GCal</button>"+
        "<button class='text-xs border px-4 py-2 rounded-full' data-act='ics'>⬇ .ics</button>"+
        "<button class='text-xs border border-red-200 text-red-600 px-4 py-2 rounded-full' data-act='del'>Cancelar</button>"+
      "</div>";
    div.querySelector("[data-act='rem']").addEventListener("click", function(){
      window.open(buildPatientReminderUrl(c), "_blank");
      showToast("Abriendo WhatsApp para recordar a "+c.nombre);
    });
    div.querySelector("[data-act='gcal']").addEventListener("click", function(){ window.open(buildGCalUrl(c), "_blank"); });
    div.querySelector("[data-act='ics']").addEventListener("click", function(){ downloadICS(c); });
    div.querySelector("[data-act='del']").addEventListener("click", function(){
      if(confirm("¿Cancelar la cita de "+c.nombre+" ("+c.fecha+" "+c.hora+")?")){
        deleteAppointment(c.id); renderAdminPanel(document.getElementById("panel-buscar").value); renderSlots();
        showToast("Cita cancelada y horario liberado.");
      }
    });
    box.appendChild(div);
  });
}

function exportCSV(){
  var list = getAppointments();
  if(!list.length){ showToast("No hay citas para exportar."); return; }
  var csv = "id,nombre,servicio,modalidad,fecha,hora,telefono,correo,motivo\n" +
    list.map(function(c){ return [c.id,'"'+c.nombre+'"','"'+c.servicio+'"',c.modalidad,c.fecha,c.hora,c.telefono,'"'+c.correo+'"','"'+(c.motivo||"").replace(/"/g,"'")+'"'].join(","); }).join("\n");
  var a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
  a.download = "citas-dra-zuly.csv"; a.click();
}
