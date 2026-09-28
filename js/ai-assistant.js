/* ai-assistant.js - Asistente virtual contextual. Sin backend: reglas locales + hook futuro a API generativa vía CONFIG.ai */
var AIAssistant = (function(){
  var RULES = [
    { k: ["crisis","suicidio","emergencia","urgencia","autolesion","quiero morir","106","192","123"],
      a: "Lamento que estés pasando por esto. No estás sola/o. Para urgencias inmediatas en Colombia llama a la Línea 106 (apoyo emocional), 123 (emergencias) o 192. Este chat no reemplaza atención en crisis. ¿Quieres que te lleve a agendar una cita prioritaria?" },
    { k: ["metodologia","metodología","enfoque","como trabajas","cómo trabajas","clinico","clínico"],
      a: "Trabajo con un enfoque clínico integral: sesiones seguras, confidenciales y estructuradas según tus objetivos terapéuticos, con escucha sin juicios y herramientas prácticas para tu día a día." },
    { k: ["infantil","niño","niña","niños","hijo","hija"],
      a: "Acompaño procesos de niños y sus familias con lenguaje acorde a su edad y trabajo conjunto con cuidadores. Cuéntame la edad y el motivo por WhatsApp y te oriento." },
    { k: ["pareja","matrimonio","esposo","esposa","novio","novia","vinculo","vínculo"],
      a: "La terapia de pareja (60 min) trabaja comunicación, confianza y vínculo con acuerdos claros. Pueden asistir juntos de forma presencial o virtual." },
    { k: ["adolescente","joven","hijo adolescente","hija adolescente"],
      a: "Acompaño a adolescentes (50 min) en emociones, autoestima y familia, con consentimiento informado del acudiente y espacio propio para el joven." },
    { k: ["primera","preparar","preparo","esperar","que llevo","qué llevo","duracion","duración","cuanto dura","cuánto dura"],
      a: "Tu primera consulta dura 50-60 min: bienvenida, escucha de tu motivo, definición de objetivos y plan. Ven con 10 min de antelación, trae tu documento y una idea de lo que quieres lograr." },
    { k: ["presencial","donde","dónde","direccion","dirección","ubicacion","ubicación","llegar"],
      a: "La consulta presencial es en el consultorio (ver sección Ubicación con ruta en Google Maps y Waze). Llega 10 min antes. La teleconsulta es por videollamada segura con el mismo rigor." },
    { k: ["teleconsulta","virtual","linea","línea","online","videollamada"],
      a: "La teleconsulta en línea dura 50 min por videollamada: necesitas internet estable, audífonos y un lugar privado. Recibes el enlace por WhatsApp tras confirmar." },
    { k: ["pago","pagar","precio","valor","costo","nequi","daviplata","transfiya","pse","tarjeta","efectivo","qr","comprobante"],
      a: "Puedes pagar por Nequi, Daviplata, Transfiya, tarjeta/PSE en línea o efectivo solo presencial. Tras pagar, usa el botón 'Enviar Comprobante de Pago por WhatsApp' y adjunta tu captura." },
    { k: ["cita","agenda","reservar","reserva","horario","disponible","cancelar","reprogramar"],
      a: "Puedo guiarte: ve a Agendar, elige servicio, modalidad, fecha y hora (lun–vie 8–12 y 2–6, sáb 8–12). Para cancelar/reprogramar avisa por WhatsApp con 24h de anticipación." },
    { k: ["hola","buenas","buenos dias","buenos días","buenas tardes","gracias"],
      a: "¡Hola! Soy la asistente del consultorio de la Dra. Zuly 🦋. Pregúntame por servicios, primera consulta, modalidades, pagos o cómo agendar." }
  ];
  var FALLBACK = "Gracias por escribir. Puedo orientarte sobre servicios, primera consulta (50-60 min), modalidad presencial o en línea, pagos (Nequi, Daviplata, Transfiya, PSE, efectivo solo presencial) y cómo agendar. ¿Sobre qué tema quieres saber más?";

  // Hook futuro: si CONFIG.ai.endpoint + apiKey existen, delega; si no, usa reglas locales.
  function remoteAnswer(text){
    try {
      if(CONFIG && CONFIG.ai && CONFIG.ai.endpoint && CONFIG.ai.apiKey){
        return fetch(CONFIG.ai.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + CONFIG.ai.apiKey },
          body: JSON.stringify({ input: text })
        }).then(function(r){ return r.json(); }).then(function(j){ return j.reply || FALLBACK; })
        .catch(function(){ return localAnswer(text); });
      }
    } catch(e){}
    return Promise.resolve(localAnswer(text));
  }
  function localAnswer(text){
    var t = (" " + (text||"").toLowerCase() + " ");
    var best = null, bestHits = 0;
    RULES.forEach(function(r){
      var hits = 0;
      r.k.forEach(function(k){ if(t.indexOf(k) >= 0) hits++; });
      if(hits > bestHits){ bestHits = hits; best = r; }
    });
    return best ? best.a : FALLBACK;
  }
  function addMsg(box, text, me){
    var d = document.createElement("div");
    d.className = "ai-msg" + (me ? " me" : "");
    d.textContent = text;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  }
  function mount(){
    var w = document.getElementById("ai-widget");
    if(!w || w.dataset.mounted) return;
    w.dataset.mounted = "1";
    var bubble = document.getElementById("ai-bubble");
    var panel = document.getElementById("ai-panel");
    var box = document.getElementById("ai-messages");
    var input = document.getElementById("ai-input");
    var send = document.getElementById("ai-send");
    var close = document.getElementById("ai-close");
    function toggle(force){
      var open = (typeof force === "boolean") ? force : !w.classList.contains("open");
      w.classList.toggle("open", open);
      if(bubble) bubble.setAttribute("aria-expanded", open ? "true" : "false");
      if(open && input) input.focus();
    }
    if(bubble) bubble.addEventListener("click", function(){ toggle(); });
    if(close) close.addEventListener("click", function(){ toggle(false); });
    function ask(){
      var v = (input.value || "").trim();
      if(!v) return;
      addMsg(box, v, true);
      input.value = "";
      addMsg(box, "Escribiendo…", false);
      remoteAnswer(v).then(function(r){
        box.removeChild(box.lastChild);
        addMsg(box, r, false);
      });
    }
    if(send) send.addEventListener("click", ask);
    if(input) input.addEventListener("keydown", function(e){ if(e.key === "Enter") ask(); });
    // Mensaje de bienvenida diferido (no bloquea hilo principal)
    requestAnimationFrame(function(){
      setTimeout(function(){ addMsg(box, "Hola, soy la asistente de la Dra. Zuly 🦋. ¿En qué te ayudo hoy? (servicios, primera cita, pagos, agendar)"); }, 600);
    });
  }
  return { mount: mount, answer: localAnswer, answerAsync: remoteAnswer };
})();
document.addEventListener("DOMContentLoaded", function(){ AIAssistant.mount(); });
