/* auth.js - Guardia del panel privado. Aditivo: no toca reservas ni IDs inviolables. */
var AUTH_KEY = "draZulyAuth";
function isAuthed(){ try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch(e){ return false; } }
function openLogin(next){
  var m = document.getElementById("login-modal");
  if(!m) return;
  m.dataset.next = next || "#/panel";
  var e = document.getElementById("login-error");
  if(e){ e.classList.add("hidden"); e.textContent = ""; }
  m.classList.remove("hidden"); m.classList.add("show");
  setTimeout(function(){ var u = document.getElementById("login-user"); if(u) u.focus(); }, 50);
}
function closeLogin(){
  var m = document.getElementById("login-modal");
  if(!m) return;
  m.classList.add("hidden"); m.classList.remove("show");
  var p = document.getElementById("login-pass"); if(p) p.value = "";
}
function logoutProfesional(){
  try { sessionStorage.removeItem(AUTH_KEY); } catch(e){}
  if(typeof showToast === "function") showToast("Sesión profesional cerrada.");
  if(location.hash === "#/panel") location.hash = "#/inicio";
  renderAdminPanel("");
}
document.addEventListener("DOMContentLoaded", function(){
  var form = document.getElementById("login-form");
  if(form) form.addEventListener("submit", function(ev){
    ev.preventDefault();
    var u = (document.getElementById("login-user").value || "").trim();
    var p = document.getElementById("login-pass").value || "";
    var e = document.getElementById("login-error");
    if(u === CONFIG.admin.usuario && p === CONFIG.admin.clave){
      try { sessionStorage.setItem(AUTH_KEY, "1"); } catch(err){}
      closeLogin();
      if(typeof showToast === "function") showToast("Bienvenida, Dra. Zuly 🦋");
      var m = document.getElementById("login-modal");
      var next = (m && m.dataset.next) || "#/panel";
      if(location.hash === next && typeof window.showView === "function") window.showView("panel");
      else location.hash = next;
      renderAdminPanel("");
    } else {
      if(e){ e.textContent = "Usuario o contraseña incorrectos. Inténtalo de nuevo."; e.classList.remove("hidden"); }
    }
  });
  var c = document.getElementById("login-close");
  if(c) c.addEventListener("click", function(){ closeLogin(); if(location.hash === "#/panel") location.hash = "#/inicio"; });
  var lm = document.getElementById("login-modal");
  if(lm) lm.addEventListener("click", function(ev){ if(ev.target.id === "login-modal"){ closeLogin(); if(location.hash === "#/panel") location.hash = "#/inicio"; } });
  var out = document.getElementById("btn-logout");
  if(out) out.addEventListener("click", logoutProfesional);

  // Intercepta accesos al panel (footer Portal Dra. y cualquier data-nav=panel futuro)
  document.addEventListener("click", function(ev){
    var a = ev.target.closest ? ev.target.closest('a[data-nav="panel"]') : null;
    if(!a) return;
    if(isAuthed()) return; // deja pasar
    ev.preventDefault();
    openLogin(a.getAttribute("href") || "#/panel");
  }, true);
  // Si llega por hash directo sin sesión, rebota al login
  window.addEventListener("hashchange", function(){
    if(location.hash.indexOf("#/panel") === 0 && !isAuthed()){
      openLogin("#/panel");
    }
  });
});
