/* links.js - WhatsApp, Google Calendar, .ics con 2 alarmas */
function pad(n){ return String(n).padStart(2,"0"); }
function citaDate(fecha, hora){
  var p = fecha.split("-"), h = hora.split(":");
  return new Date(+p[0], +p[1]-1, +p[2], +h[0], +h[1], 0);
}
function fmtGCal(d){ return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+"T"+pad(d.getHours())+pad(d.getMinutes())+"00"; }
function fmtICS(d){
  // Formato local flotante para máxima compatibilidad Apple/Outlook
  return fmtGCal(d);
}
function fechaLargaES(fecha){
  var dias=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  var meses=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  var p=fecha.split("-"); var d=new Date(+p[0],+p[1]-1,+p[2]);
  return dias[d.getDay()]+", "+(+p[2])+" de "+meses[+p[1]-1]+" de "+p[0];
}

// Resumen que se envía al WhatsApp DEL CONSULTORIO al confirmar
function buildWhatsAppConfirmUrl(cita){
  var maps = buildMapsUrl();
  var texto =
    "Hola Dra. Zuly 🦋, quiero confirmar mi cita:%0A"+
    "———————————%0A"+
    "👤 Nombre: "+encodeURIComponent(cita.nombre)+"%0A"+
    "📌 Servicio: "+encodeURIComponent(cita.servicio)+"%0A"+
    "🏢 Modalidad: "+encodeURIComponent(cita.modalidad)+"%0A"+
    "📅 Fecha: "+encodeURIComponent(fechaLargaES(cita.fecha))+"%0A"+
    "⏰ Hora: "+encodeURIComponent(cita.hora)+"%0A"+
    "📞 Tel: "+encodeURIComponent(cita.telefono)+"%0A"+
    "✉️ Correo: "+encodeURIComponent(cita.correo)+"%0A"+
    "💬 Motivo: "+encodeURIComponent(cita.motivo)+"%0A"+
    "🆔 Código: "+cita.id+"%0A"+
    "———————————%0A"+
    "📍 "+encodeURIComponent(CONFIG.direccion)+"%0A"+encodeURIComponent(maps);
  return "https://wa.me/"+CONFIG.whatsappConsultorio+"?text="+texto;
}

// Google Calendar TEMPLATE
function buildGCalUrl(cita){
  var dur = CONFIG.duracionPorServicio[cita.servicio] || 50;
  var start = citaDate(cita.fecha, cita.hora);
  var end = new Date(start.getTime() + dur*60000);
  var maps = buildMapsUrl();
  var text = encodeURIComponent("Cita psicología - "+cita.servicio+" - Dra. Zuly Álvarez Castro");
  var dates = fmtGCal(start)+"/"+fmtGCal(end);
  var details = encodeURIComponent("Código "+cita.id+" | Modalidad: "+cita.modalidad+" | Paciente: "+cita.nombre+" | Motivo: "+cita.motivo+" | Cómo llegar: "+maps);
  var location = encodeURIComponent(CONFIG.direccion+" | "+maps);
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+text+"&dates="+dates+"&details="+details+"&location="+location;
}

// .ics con 2 VALARM: 24h y 2h antes + dirección y navegación
function buildICSContent(cita){
  var dur = CONFIG.duracionPorServicio[cita.servicio] || 50;
  var start = citaDate(cita.fecha, cita.hora);
  var end = new Date(start.getTime() + dur*60000);
  var maps = buildMapsUrl();
  var uid = cita.id+"@drazuly";
  var stamp = fmtGCal(new Date());
  function esc(s){ return String(s).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n"); }
  var lines = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//DraZuly//Citas//ES","CALSCALE:GREGORIAN","METHOD:PUBLISH","BEGIN:VEVENT",
    "UID:"+uid,"DTSTAMP:"+stamp,"DTSTART:"+fmtICS(start),"DTEND:"+fmtICS(end),
    "SUMMARY:"+esc("Cita psicología - "+cita.servicio+" - Dra. Zuly Álvarez Castro"),
    "DESCRIPTION:"+esc("Código "+cita.id+" | Modalidad: "+cita.modalidad+" | Motivo: "+cita.motivo+" | Cómo llegar: "+maps),
    "LOCATION:"+esc(CONFIG.direccion+" | "+maps),
    "URL:"+CONFIG.siteUrl,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM","TRIGGER:-P1D","ACTION:DISPLAY","DESCRIPTION:Recordatorio: tu cita es mañana a las "+cita.hora,"END:VALARM",
    "BEGIN:VALARM","TRIGGER:-PT2H","ACTION:DISPLAY","DESCRIPTION:Recordatorio: tu cita es en 2 horas ("+cita.modalidad+")","END:VALARM",
    "END:VEVENT","END:VCALENDAR"
  ];
  return lines.join("\r\n");
}
function downloadICS(cita){
  var blob = new Blob([buildICSContent(cita)], {type:"text/calendar;charset=utf-8"});
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "cita-"+cita.id+".ics";
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

// Mensaje pre-redactado DOCTORA -> PACIENTE (botón 📱 del panel)
function buildPatientReminderUrl(cita){
  var maps = buildMapsUrl();
  var msg = "Hola "+cita.nombre+", te recordamos tu cita de psicología con la Dra. Zuly Álvarez Castro para el día "+fechaLargaES(cita.fecha)+" a las "+cita.hora+" (Modalidad: "+cita.modalidad+"). 📍 Ubicación del consultorio: "+maps+" Por favor confirma tu asistencia respondiendo a este mensaje.";
  var tel = (cita.telefono||"").replace(/\D/g,"");
  // Si el teléfono ya trae 57, no duplicar; si son 10 dígitos, anteponer 57
  if(/^\d{10}$/.test(tel)) tel = "57"+tel;
  return "https://wa.me/"+tel+"?text="+encodeURIComponent(msg);
}
