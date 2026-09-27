/* storage.js - persistencia en localStorage */
var STORAGE_KEY = "draZuly_appointments_v1";

function getAppointments(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch(e){ return []; }
}
function saveAppointment(cita){
  var list = getAppointments();
  list.push(cita);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return cita;
}
function deleteAppointment(id){
  var list = getAppointments().filter(function(c){ return c.id !== id; });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function clearAppointments(){ localStorage.removeItem(STORAGE_KEY); }
function isSlotTaken(fecha, hora){
  return getAppointments().some(function(c){ return c.fecha === fecha && c.hora === hora && c.estado !== "cancelada"; });
}
function makeId(){ return "ZA-" + Math.random().toString(36).slice(2,8).toUpperCase(); }
