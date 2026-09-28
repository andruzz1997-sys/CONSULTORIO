/* CONFIG central - EDITA AQUÍ tus datos reales */
var CONFIG = {
  whatsappConsultorio: "573001234567", // <-- cambia por el WhatsApp real, solo dígitos con código país
  whatsappSaludo: "Hola Dra. Zuly, quiero información sobre una cita de psicología 🦋",
  direccion: "Calle 123 #45-67, Bogotá, Colombia",
  lat: "4.7110",
  lng: "-74.0721",
  email: "contacto@drazuly.example.com",
  siteUrl: "https://dra-zuly-alvarez.example.com/",
  // Módulo de pagos (reemplaza con datos reales, sin tocar claves)
  pagos: {
    nequi: "300 000 0000",
    daviplata: "300 000 0000",
    transfiya: "al número del consultorio",
    pagoOnlineUrl: "https://link-wompi-o-mercadopago.example.com/pagar",
    valorSesion: "$ ___ (a convenir)"
  },
  // Acceso profesional (solo disuasorio front-end; para datos sensibles usar backend)
  admin: { usuario: "dra.zuly", clave: "Zuly2026*" },
  // Asistente IA: deja listo el hook para API generativa futura
  ai: { endpoint: "", apiKey: "" },
  duracionPorServicio: {
    "Terapia Individual": 50,
    "Terapia de Pareja": 60,
    "Terapia Adolescentes": 50,
    "Teleconsulta en línea": 50
  },
  // Lun-Vie 8-12 y 14-18, Sáb 8-12, Dom cerrado
  slotsManana: ["08:00","09:00","10:00","11:00"],
  slotsTarde: ["14:00","15:00","16:00","17:00"]
};
