/* maps.js - Google Maps + Waze API */
function buildMapsUrl(){
  return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(CONFIG.direccion);
}
function buildWazeUrl(){
  return "https://waze.com/ul?ll=" + CONFIG.lat + "," + CONFIG.lng + "&navigate=yes";
}
function buildEmbedUrl(){
  return "https://www.google.com/maps?q=" + CONFIG.lat + "," + CONFIG.lng + "&output=embed";
}
function initMapsButtons(){
  var m = document.getElementById("btn-maps");
  var w = document.getElementById("btn-waze");
  var emb = document.getElementById("mapa-embed");
  var dir = document.getElementById("direccion-texto");
  if(m) m.href = buildMapsUrl();
  if(w) w.href = buildWazeUrl();
  if(emb) emb.src = buildEmbedUrl();
  if(dir) dir.textContent = CONFIG.direccion;
  var fd = document.getElementById("footer-dir");
  if(fd) fd.textContent = CONFIG.direccion;
}
