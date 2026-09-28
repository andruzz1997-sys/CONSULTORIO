/* pagos.js - Módulo de pagos unificado. Aditivo: no modifica reservas ni mapas. */
function getMedioPago(){
  var r = document.querySelector('input[name="pago"]:checked');
  return r ? r.value : "";
}
function buildPagoComprobanteUrl(cita, medio){
  var fecha = (cita.fecha && cita.fecha.indexOf("-")>0 && typeof fechaLargaES==="function")
    ? fechaLargaES(cita.fecha) : (cita.fecha||"");
  var msg = "Hola Dra. Zuly, he realizado el agendamiento y pago de mi cita.\n" +
    "👤 Paciente: " + (cita.nombre||"") + "\n" +
    "📅 Fecha/Hora: " + fecha + " a las " + (cita.hora||"") + "\n" +
    "💻 Modalidad: " + (cita.modalidad||"") + "\n" +
    "💳 Medio de pago seleccionado: " + (medio||"pendiente") + "\n" +
    "Adjunto mi comprobante de pago.";
  return "https://wa.me/" + CONFIG.whatsappConsultorio + "?text=" + encodeURIComponent(msg);
}
function refreshPagoDetalle(){
  var box = document.getElementById("pago-detalle");
  var online = document.getElementById("btn-pago-online");
  if(!box) return;
  var medio = getMedioPago();
  var modal = (typeof getModalidad==="function") ? getModalidad() : "Presencial";
  // Efectivo solo presencial
  var eff = document.querySelector('input[name="pago"][value="Efectivo en Sitio"]');
  if(eff){
    eff.disabled = (modal !== "Presencial");
    var wrap = document.getElementById("pago-efectivo-wrap");
    if(wrap) wrap.style.opacity = eff.disabled ? ".45" : "1";
    if(eff.disabled && eff.checked){ eff.checked = false; medio = getMedioPago(); }
  }
  if(!medio){ box.classList.add("hidden"); if(online) online.classList.add("hidden"); return; }
  box.classList.remove("hidden");
  if(medio === "PSE / Tarjeta"){
    box.innerHTML = "💳 Pagarás en línea con tarjeta o PSE ("+CONFIG.pagos.valorSesion+"). Usa el botón <strong>Pagar con tarjeta / PSE</strong> y luego envía tu comprobante por WhatsApp.";
    if(online){ online.classList.remove("hidden"); online.href = CONFIG.pagos.pagoOnlineUrl; }
  } else if(medio === "Efectivo en Sitio"){
    box.innerHTML = "💵 Pagarás <strong>en efectivo en recepción</strong> el día de tu cita presencial. Llega 10 min antes.";
    if(online) online.classList.add("hidden");
  } else {
    var num = medio==="Nequi" ? CONFIG.pagos.nequi : (medio==="Daviplata" ? CONFIG.pagos.daviplata : CONFIG.pagos.transfiya);
    box.innerHTML = "📲 Transfiere por <strong>"+medio+"</strong> al <strong>"+num+"</strong> ("+CONFIG.pagos.valorSesion+") y luego pulsa <strong>Enviar Comprobante por WhatsApp</strong> adjuntando tu captura.";
    if(online) online.classList.add("hidden");
  }
}
document.addEventListener("DOMContentLoaded", function(){
  document.querySelectorAll('input[name="pago"]').forEach(function(r){ r.addEventListener("change", refreshPagoDetalle); });
  document.querySelectorAll('input[name="modalidad"]').forEach(function(r){ r.addEventListener("change", refreshPagoDetalle); });
  var online2 = document.getElementById("btn-pago-online-2");
  if(online2) online2.href = CONFIG.pagos.pagoOnlineUrl;
  var nequi = document.getElementById("pay-nequi-num");
  if(nequi) nequi.textContent = CONFIG.pagos.nequi;
  var davi = document.getElementById("pay-davi-num");
  if(davi) davi.textContent = CONFIG.pagos.daviplata;
  document.querySelectorAll(".copy-btn").forEach(function(b){
    b.addEventListener("click", function(){
      var el = document.getElementById(b.getAttribute("data-copy"));
      if(!el) return;
      var t = el.textContent;
      if(navigator.clipboard) navigator.clipboard.writeText(t);
      if(typeof showToast==="function") showToast("Copiado: "+t);
    });
  });
  var btnWa = document.getElementById("btn-pago-wa");
  if(btnWa) btnWa.addEventListener("click", function(){
    var cita = {
      nombre: (document.getElementById("inp-nombre")||{}).value || "",
      fecha: (document.getElementById("inp-fecha")||{}).value || "",
      hora: (typeof selectedSlot!=="undefined" ? selectedSlot : ""),
      modalidad: (typeof getModalidad==="function" ? getModalidad() : "")
    };
    // Si ya hay última cita confirmada, úsala para mensaje exacto
    if(typeof lastCita!=="undefined" && lastCita) cita = lastCita;
    window.open(buildPagoComprobanteUrl(cita, getMedioPago()||"pendiente"), "_blank");
  });
  refreshPagoDetalle();
});
