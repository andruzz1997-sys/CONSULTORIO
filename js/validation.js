/* validation.js - validación de formulario */
function setErr(id, msg){
  var el = document.getElementById(id);
  if(!el) return;
  if(!msg){ el.classList.add("hidden"); el.textContent=""; }
  else { el.classList.remove("hidden"); el.textContent = msg; }
}
function validNombre(v){ return v.trim().length >= 3; }
function validTelefono(v){ return /^[0-9]{10}$/.test(v.replace(/[\s-]/g,"")); }
function validCorreo(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }
function validMotivo(v){ var t=v.trim(); return t.length>=10 && t.length<=300; }

function validateForm(d){
  var ok = true;
  if(!validNombre(d.nombre)){ setErr("err-nombre","Escribe tu nombre completo (mín. 3 letras)."); ok=false; } else setErr("err-nombre");
  if(!validTelefono(d.telefono)){ setErr("err-telefono","Teléfono inválido: 10 dígitos, ej. 3001234567."); ok=false; } else setErr("err-telefono");
  if(!validCorreo(d.correo)){ setErr("err-correo","Correo inválido."); ok=false; } else setErr("err-correo");
  if(!validMotivo(d.motivo)){ setErr("err-motivo","Motivo de 10 a 300 caracteres, sin detalles muy sensibles."); ok=false; } else setErr("err-motivo");
  if(!d.fecha){ ok=false; showToast("Elige una fecha válida (lun–sáb, no pasado)."); }
  if(!d.hora){ ok=false; showToast("Elige un horario disponible."); }
  return ok;
}
