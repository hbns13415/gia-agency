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

      <main className="relative z-10 w-full max-w-5xl text-center px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-4">
          GIA — Growth Intelligence Agency
        </h1>
        <p className="text-gray-300 mb-10 text-lg md:text-xl">
          Generá campañas de marketing automatizadas con inteligencia artificial. Estrategias,
          copys, prompts y calendarios listos en minutos.
        </p>

        {/* 🌟 Beneficios */}
        <section className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: "Automatización total",
              text: "Creá campañas completas sin esfuerzo. GIA genera textos, prompts y calendarios en minutos.",
              icon: "⚙️",
            },
            {
              title: "Diseños profesionales",
              text: "Incluye plantillas editables de Canva listas para publicar en redes sociales.",
              icon: "🎨",
            },
            {
              title: "Optimización con IA",
              text: "Cada campaña se adapta a tu objetivo y público. Inteligencia real aplicada al marketing.",
              icon: "🤖",
            },
          ].map((b, i) => (
            <div
              key={i}
              className="bg-[#0a0f2a]/60 border border-blue-600/40 rounded-2xl p-6 shadow-lg hover:shadow-cyan-500/20 transition"
            >
              <div className="text-4xl mb-3">{b.icon}</div>
              <h3 className="text-xl font-semibold text-cyan-300 mb-2">{b.title}</h3>
              <p className="text-gray-400 text-sm">{b.text}</p>
            </div>
          ))}
        </section>

        {/* 🎥 Video explicativo */}
        <section className="my-16 text-center">
          <h2 className="text-3xl font-bold text-cyan-300 mb-4">
            Mirá cómo funciona GIA en 60 segundos
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Descubrí cómo GIA crea campañas completas con IA: estrategia, copys,
            calendario y diseño — todo automatizado y entregado directo a tu correo.
          </p>
          <div className="relative w-full max-w-3xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/20 border border-cyan-700/40">
            <video
              className="w-full h-full object-cover"
              src="/videos/gia-demo.mp4"
              controls
              playsInline
            />
          </div>
        </section>

        {/* 💬 Testimonios */}
        <h2 className="text-3xl font-bold text-cyan-300 mb-6">
          Opiniones de nuestros usuarios
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {[
            {
              name: "Carlos, Emprendedor",
              text: "Ahorré horas por semana. Literalmente GIA me generó 30 días de publicaciones automáticas.",
            },
            {
              name: "Lucía, Consultora",
              text: "El correo me llegó con todo: calendario, copys, prompts y diseño. Es como tener un equipo entero.",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="fade-in-up bg-[#0a0f2a]/60 border border-blue-600/30 rounded-2xl p-6 text-gray-300 shadow-md hover:shadow-cyan-500/20 transition"
            >
              <p className="italic mb-4 text-gray-200">“{t.text}”</p>
              <p className="text-sm text-cyan-400 font-semibold">— {t.name}</p>
            </div>
          ))}
        </div>

        {/* 🧠 Formulario */}
        <section>
          <h2 className="text-3xl font-bold text-cyan-300 mb-6">
            Generá tu campaña personalizada
          </h2>
          <p className="text-gray-400 mb-8">
            Completá los datos y realizá tu pago para recibir tu pack completo por correo.
          </p>

          <form
            onSubmit={handleSubmit}
            className="bg-[#0a0f2a]/60 border border-blue-600/50 rounded-2xl shadow-xl p-6 backdrop-blur-sm"
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

          {status && (
            <p className="mt-6 text-blue-300 text-sm animate-pulse">{status}</p>
          )}
        </section>
      </main>

      <footer className="relative z-10 mt-12 text-gray-500 text-sm">
        © {new Date().getFullYear()} GIA — Growth Intelligence Agency
      </footer>
    </div>
  );
}
