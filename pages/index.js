// pages/index.js
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [form, setForm] = useState({ name: "", email: "", objective: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const canvasRef = useRef(null);

  // 🌌 Fondo animado
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

  // 📩 Form inputs
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 💳 Nuevo handleSubmit → generar preferencia de pago + redirección
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/mercadopago/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Pack de plantillas GIA",
          price: 29000,
          quantity: 1,
          metadata: {
            name: form.name,
            email: form.email,
            objective: form.objective,
          },
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        setStatus("⚠️ Error creando la orden de pago.");
        return;
      }

      // Redirige al checkout de Mercado Pago
      window.location.href = data.init_point;
    } catch (err) {
      console.error(err);
      setStatus("❌ Error conectando con Mercado Pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-[#030014] text-white overflow-hidden">

      {/* Fondo animado */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-20" />

      <main className="relative z-10 max-w-4xl w-full text-center px-6">

        {/* Título */}
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mt-20">
          GIA — Growth Intelligence Agency
        </h1>

        <p className="text-gray-300 mt-4 mb-16 text-xl">
          Generá campañas de marketing automatizadas con inteligencia artificial.
          Estrategias, copys, prompts y calendarios listos en minutos.
        </p>

        {/* BENEFICIOS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            {
              title: "Automatización total",
              text:
                "GIA crea estrategias, posteos listos para publicarse y calendarios.",
              icon: "⚙️",
            },
            {
              title: "Diseños profesionales",
              text: "Incluye plantillas editables de Canva listas para redes.",
              icon: "🎨",
            },
            {
              title: "Optimización con IA",
              text: "Cada campaña se adapta a tu objetivo y público.",
              icon: "🤖",
            },
          ].map((b, i) => (
            <div
              key={i}
              className="bg-[#0a0f2a]/60 border border-blue-600/30 p-6 rounded-2xl shadow-md"
            >
              <div className="text-4xl mb-4">{b.icon}</div>
              <h3 className="text-xl font-semibold text-cyan-300">{b.title}</h3>
              <p className="text-gray-300 mt-2">{b.text}</p>
            </div>
          ))}
        </section>

        {/* TESTIMONIOS */}
        <h2 className="text-3xl font-bold text-cyan-300 mb-6">
          Opiniones de nuestros usuarios
        </h2>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {[
            {
              name: "Carlos, Emprendedor",
              text:
                "“Ahorré horas por semana. Literalmente GIA me generó 30 días de publicaciones automáticas.”",
            },
            {
              name: "Lucía, Consultora",
              text:
                "“El correo me llegó con todo: calendario, copys, prompts y diseño. Es como tener un equipo entero.”",
            },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-[#0a0f2a]/60 border border-blue-600/30 p-6 rounded-2xl shadow-md"
            >
              <p className="italic text-gray-200 mb-4">{t.text}</p>
              <p className="text-sm text-cyan-400 font-semibold">— {t.name}</p>
            </div>
          ))}
        </section>

        {/* VIDEO */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-cyan-300 mb-6">
            ¿Cómo funciona GIA?
          </h2>

          <video
            controls
            width="100%"
            className="rounded-2xl border border-cyan-500/30 shadow-lg"
          >
            <source src="/videos/gia-promo.mp4" type="video/mp4" />
            Tu navegador no soporta videos.
          </video>
        </section>

        {/* FORMULARIO → Ahora SOLO inicia el proceso de pago */}
        <section className="bg-[#0a0f2a]/60 border border-blue-600/40 p-8 rounded-2xl shadow-xl mb-20">
          <h2 className="text-3xl font-semibold mb-6">
            Generá tu campaña personalizada
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Tu nombre"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full mb-4 p-3 bg-[#06081a] border border-blue-700/40 rounded-xl text-white"
            />

            <input
              type="email"
              name="email"
              placeholder="Tu correo"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full mb-4 p-3 bg-[#06081a] border border-blue-700/40 rounded-xl text-white"
            />

            <textarea
              name="objective"
              placeholder="¿Cuál es tu objetivo de campaña?"
              value={form.objective}
              onChange={handleChange}
              required
              rows="4"
              className="w-full mb-6 p-3 bg-[#06081a] border border-blue-700/40 rounded-xl text-white"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-black rounded-xl font-semibold hover:opacity-90 transition"
            >
              {loading ? "Procesando pago..." : "Generar mi campaña — 29.000 ARS"}
            </button>
          </form>

          {status && (
            <p className="mt-4 text-blue-300 text-sm animate-pulse">{status}</p>
          )}
        </section>
      </main>

      <footer className="relative z-10 mb-10 text-gray-500 text-sm">
        © {new Date().getFullYear()} GIA — Growth Intelligence Agency
      </footer>
    </div>
  );
}
