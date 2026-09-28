/* app.js - inicialización y flujo directo de WhatsApp */
document.addEventListener("DOMContentLoaded", function(){
  document.getElementById("year").textContent = new Date().getFullYear();

  // Header + menú móvil + reveal
  var header = document.getElementById("header");
  window.addEventListener("scroll", function(){ header.classList.toggle("scrolled", window.scrollY>10); });
  var btnMenu = document.getElementById("btn-menu"), menuM = document.getElementById("menu-movil");
  btnMenu.addEventListener("click", function(){
    var open = menuM.classList.contains("hidden");
    menuM.classList.toggle("hidden"); menuM.classList.toggle("flex");
    btnMenu.setAttribute("aria-expanded", open ? "true" : "false");
  });
  menuM.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", function(){ menuM.classList.add("hidden"); menuM.classList.remove("flex"); btnMenu.setAttribute("aria-expanded","false"); }); });

  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("visible"); io.unobserve(e.target); } }); }, {threshold:.12});
  document.querySelectorAll(".reveal").forEach(function(el){ io.observe(el); });

  // WhatsApp flotante + hero + footer
  var waSaludo = "https://wa.me/"+CONFIG.whatsappConsultorio+"?text="+encodeURIComponent(CONFIG.whatsappSaludo);
  document.getElementById("wa-float").href = waSaludo;
  document.getElementById("hero-wa").href = waSaludo;
  document.getElementById("footer-wa").textContent = "+"+CONFIG.whatsappConsultorio.slice(0,2)+" "+CONFIG.whatsappConsultorio.slice(2,5)+" "+CONFIG.whatsappConsultorio.slice(5,8)+" "+CONFIG.whatsappConsultorio.slice(8);
  document.getElementById("footer-mail").textContent = CONFIG.email;

  initMapsButtons();
  initBooking();
  renderAdminPanel("");

  // Preselección desde cards de servicios
  document.querySelectorAll(".btn-reservar").forEach(function(b){
    b.addEventListener("click", function(){
      document.getElementById("sel-servicio").value = b.dataset.service;
      if(b.dataset.modality){
        var r = document.querySelector('input[name="modalidad"][value="'+b.dataset.modality+'"]');
        if(r) r.checked = true;
      }
      if(typeof window.showView === "function"){ window.showView("agendar"); }
      else { document.getElementById("agendar").scrollIntoView({behavior:"smooth"}); }
      showToast("Servicio seleccionado: "+b.dataset.service);
    });
  });
  document.getElementById("sel-servicio").addEventListener("change", updateResumen);
  document.querySelectorAll('input[name="modalidad"]').forEach(function(r){ r.addEventListener("change", updateResumen); });

  // Confirmar: valida -> guarda -> modal + GCal/.ics -> REDIRECT automático a WhatsApp
  document.getElementById("btn-confirmar").addEventListener("click", function(){
    var data = {
      servicio: document.getElementById("sel-servicio").value,
      modalidad: getModalidad(),
      fecha: document.getElementById("inp-fecha").value,
      hora: selectedSlot,
      nombre: document.getElementById("inp-nombre").value,
      telefono: document.getElementById("inp-telefono").value.trim(),
      correo: document.getElementById("inp-correo").value.trim(),
      motivo: document.getElementById("inp-motivo").value
    };
    if(!validateForm(data)) return;
    var chk = document.getElementById("chk-habeas");
    var errH = document.getElementById("err-habeas");
    if(chk && !chk.checked){ if(errH) errH.classList.remove("hidden"); showToast("Debes aceptar el tratamiento de datos (Habeas Data)."); return; }
    else if(errH){ errH.classList.add("hidden"); }
    if(isSlotTaken(data.fecha, data.hora)){ showToast("Ese horario ya fue ocupado. Elige otro."); renderSlots(); return; }

    var medioSel = (typeof getMedioPago === "function") ? getMedioPago() : "";
    var cita = Object.assign({id: makeId(), estado:"confirmada", createdAt: new Date().toISOString(), medioPago: medioSel}, data);
    saveAppointment(cita);
    openModal(cita);
    renderAdminPanel(document.getElementById("panel-buscar").value);
    renderSlots();

    // 2. FLUJO DIRECTO: abrir WhatsApp del consultorio con resumen estructurado
    window.open(buildWhatsAppConfirmUrl(cita), "_blank");
    showToast("Cita guardada. Te redirigimos al WhatsApp del consultorio 🦋");

    // Limpiar datos sensibles del form
    document.getElementById("inp-nombre").value="";
    document.getElementById("inp-telefono").value="";
    document.getElementById("inp-correo").value="";
    document.getElementById("inp-motivo").value="";
  });

  // Modal botones
  document.getElementById("btn-ics").addEventListener("click", function(){ if(lastCita) downloadICS(lastCita); });
  document.getElementById("btn-cerrar-modal").addEventListener("click", closeModal);
  document.getElementById("modal").addEventListener("click", function(e){ if(e.target.id==="modal") closeModal(); });

  // Panel: buscar / exportar / limpiar
  document.getElementById("panel-buscar").addEventListener("input", function(e){ renderAdminPanel(e.target.value); });
  document.getElementById("panel-exportar").addEventListener("click", exportCSV);
  document.getElementById("panel-limpiar").addEventListener("click", function(){
    if(confirm("¿Borrar TODAS las citas guardadas en este dispositivo?")){ clearAppointments(); renderAdminPanel(""); renderSlots(); }
  });
});
