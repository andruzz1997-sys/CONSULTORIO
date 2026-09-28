/* faq.js - Acordeón interactivo. Aditivo. */
document.addEventListener("DOMContentLoaded", function(){
  document.querySelectorAll(".faq-item .faq-q").forEach(function(btn){
    btn.addEventListener("click", function(){
      var item = btn.closest(".faq-item");
      var open = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function(o){
        o.classList.remove("open");
        o.querySelector(".faq-q").setAttribute("aria-expanded","false");
      });
      if(!open){ item.classList.add("open"); btn.setAttribute("aria-expanded","true"); }
    });
  });
});
