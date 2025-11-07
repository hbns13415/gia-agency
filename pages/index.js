// pages/index.js
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [form, setForm] = useState({ name: "", email: "", objective: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const canvasRef = useRef(null);

  // 🌌 Fondo animado IA
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
    const numParticles = 60;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 2 + 0.5;
      }
      move() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
    }

    for (let i = 0; i < numParticles; i++) particles.push(new Particle());

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ffff";
      for (let p of particles) {
        p.move();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    draw();

    return () => window.removeEventListener("resize", resize);
  }, []);

  // 🧠 Handlers
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // 🪙 Integración Mercado Pago
  const handlePayment = async () => {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/mercadopago/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        setStatus("Error al generar link de pago.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error al conectar con Mercado Pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#030014] text-white overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-30" />
      <main className="relative z-10 max-w-3xl w-full text-center px-6">
        {/* 🔷 Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/gia-logo.svg"
            alt="GIA Logo"
            className="w-32 md:w-40 drop-shadow-[0_0_12px_#00eaffaa] animate-pulse-slow"
          />
        </div>

        {/* 🧠 Encabezado */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-4">
          GIA — Growth Intelligence Agency
        </h1>
        <p className="text-gray-300 mb-10 text-lg">
          Automatizá tu marketing con inteligencia artificial.  
          Generá estrategias, copys y calendarios de contenido listos para usar.
        </p>

        {/* 🚀 Beneficios */}
        <section className="mt-10 grid md:grid-cols-3 gap-8 text-center">
          {[
            {
              title: "Estrategia Inteligente",
              desc: "GIA analiza tu objetivo y genera una estrategia completa con copys, prompts y calendario IA.",
              icon: "🤖",
            },
            {
              title: "Diseño Automático",
              desc: "Obtené un pack editable en Canva con contenido visual optimizado para redes sociales.",
              icon: "🎨",
            },
            {
              title: "Resultados Reales",
              desc: "Probado con emprendedores que aumentaron su alcance y ventas en menos de 7 días.",
              icon: "📈",
            },
          ].map((b, i) => (
            <div
              key={i}
              className="fade-in-up bg-[#0a0f2a]/60 border border-blue-700/30 p-6 rounded-2xl backdrop-blur-md shadow-md hover:shadow-blue-500/30 transition"
            >
              <div className="text-4xl mb-3">{b.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-cyan-300">{b.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </section>

        {/* 💬 Testimonios */}
        <section className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            Lo que dicen quienes ya usan GIA
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Carolina, Tienda Online",
                text: "“GIA me dio un plan completo y el pack de Canva listo para publicar. Un antes y un después.”",
              },
              {
                name: "Martín, Emprendedor Local",
                text: "“Ahorré horas por semana. Literalmente GIA me generó 30 días de publicaciones automáticas.”",
              },
              {
                name: "Lucía, Consultora",
                text: "“El correo me llegó con todo: calendario, copys, prompts y diseño. Es como tener un equipo entero.”",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="fade-in-up bg-[#0a0f2a]/60 border border-blue-600/30 rounded-2xl p-6 text-gray-300 shadow-md hover:shadow-cyan-500/20 transition"
              >
                <p className="italic mb-4 text-gray-200">“{t.text}”</p>
                <p className="text-sm text-cyan-400 font-semibold">— {t.name}</p>
              </div>
