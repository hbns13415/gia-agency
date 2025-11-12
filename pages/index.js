// pages/index.js
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [form, setForm] = useState({ name: "", email: "", objective: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const canvasRef = useRef(null);

  // 🌌 Efecto de partículas IA
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

  // 🚀 Envío de formulario
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/gia/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("✅ ¡Tu campaña fue enviada! Revisá tu correo para descargar los archivos.");
        setForm({ name: "", email: "", objective: "" });
      } else setStatus("⚠️ Ocurrió un error al procesar tu solicitud.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#030014] text-white overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-30" />
      <main className="relative z-10 max-w-2xl w-full text-center px-6">
        
        {/* 🧠 Título principal */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-4">
          GIA — Growth Intelligence Agency
        </h1>

        <p className="text-gray-300 mb-8 text-lg">
          Automatizá tu marketing con inteligencia artificial.  
          Generá estrategias, posteos listos para publicarse y calendarios de contenido.
        </p>

        {/* 🎬 Video explicativo */}
        <section className="relative w-full flex flex-col items-center my-10">
          <h2 className="text-2xl md:text-3xl font-bold text-cyan-300 mb-4">
            🎬 Conocé GIA en acción
          </h2>
          <video
            src="/videos/gia-promo.mp4"
            controls
            muted
            playsInline
            preload="metadata"
            className="rounded-2xl shadow-lg w-full max-w-3xl border border-cyan-400/20 cursor-pointer"
          >
            Tu navegador no soporta video.
          </video>
        </section>

        {/* 💡 Por qué elegir GIA */}
        <section className="mt-12 text-gray-300">
          <h3 className="text-2xl font-semibold text-cyan-400 mb-4">¿Por qué elegir GIA?</h3>
          <ul className="space-y-3 text-left">
            <li>⚡ Estrategias automáticas adaptadas a tu negocio.</li>
            <li>🧩 Plantillas profesionales listas para publicar.</li>
            <li>💬 Copys optimizados por IA.</li>
            <li>📅 Calendarios de contenido inteligentes.</li>
          </ul>
        </section>

        {/* 💬 Testimonios */}
        <section className="mt-12">
          <h3 className="text-2xl font-semibold text-cyan-400 mb-6">Opiniones reales</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                name: "Lucía, Consultora",
                text: "El correo me llegó con todo: calendario, copys, prompts y diseño. Es como tener un equipo entero.",
              },
              {
                name: "Martín, Emprendedor",
                text: "Ahorré horas por semana. Literalmente GIA me generó 30 días de publicaciones automáticas.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-[#0a0f2a]/60 border border-blue-600/30 rounded-2xl p-6 text-gray-300 shadow-md hover:shadow-cyan-500/20 transition"
              >
                <p className="italic mb-4 text-gray-200">“{t.text}”</p>
                <p className="text-sm text-cyan-400 font-semibold">— {t.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 🧾 Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#0a0f2a]/60 border border-blue-600/50 rounded-2xl shadow-xl p-6 backdrop-blur-sm mt-16"
        >
          <input
            type="text"
            name="name"
            placeholder="Tu nombre"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full mb-4 p-3 bg-[#06081a] border border-blue-700/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Tu correo"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full mb-4 p-3 bg-[#06081a] border border-blue-700/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            name="objective"
            placeholder="¿Cuál es tu objetivo de campaña?"
            value={form.objective}
            onChange={handleChange}
            required
            rows="4"
            className="w-full mb-6 p-3 bg-[#06081a] border border-blue-700/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl font-semibold text-black hover:opacity-90 transition"
          >
            {loading ? "Generando..." : "Generar mi campaña — 29.000 ARS"}
          </button>
        </form>

        {status && <p className="mt-6 text-blue-300 text-sm animate-pulse">{status}</p>}
      </main>

      <footer className="relative z-10 mt-12 text-gray-500 text-sm">
        © {new Date().getFullYear()} GIA — Growth Intelligence Agency
      </footer>
    </div>
  );
}
