/* spa.js - Vistas independientes con fundido + hash routing. Aditivo, no altera IDs ni lógica de reservas. */
(function(){
  var VIEWS = ["inicio","perfil","servicios","esperar","agendar","pagos","ubicacion","faq","panel"];
  function views(){ return Array.prototype.slice.call(document.querySelectorAll(".view")); }
  function normalize(hash){
    var v = (hash||"").replace(/^#\/?/,"").split("?")[0].split("/")[0];
    return VIEWS.indexOf(v) >= 0 ? v : "inicio";
  }
  window.showView = function(name){
    if(VIEWS.indexOf(name) < 0) name = "inicio";
    views().forEach(function(s){
      var on = s.getAttribute("data-view") === name;
      s.classList.toggle("view-active", on);
    });
    document.querySelectorAll("[data-nav]").forEach(function(a){
      a.classList.toggle("active", a.getAttribute("data-nav") === name);
    });
    var panel = document.getElementById("menu-movil");
    if(panel){ panel.classList.add("hidden"); panel.classList.remove("flex"); }
    window.scrollTo({top:0, behavior:"smooth"});
    // Re-dispara animaciones reveal dentro de la vista
    document.querySelectorAll('.view-active .reveal').forEach(function(el){ el.classList.add("visible"); });
  };
  function fromHash(){ window.showView(normalize(location.hash)); }
  window.addEventListener("hashchange", fromHash);
  document.addEventListener("DOMContentLoaded", function(){
    // Estado inicial sin pelear con app.js
    if(!location.hash) history.replaceState(null,"","#/inicio");
    fromHash();
  });
})();
