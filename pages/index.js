// pages/index.js
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [form, setForm] = useState({ name: "", email: "", objective: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const canvasRef = useRef(null);

  // 🌌 Fondo de partículas animadas
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

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ffff";
      for (let p of particles) {
        p.move();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    draw();

    return () => window.removeEventListener("resize", resize);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 💳 Integración Mercado Pago
  const handlePayment = async (e) => {
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
        }),
      });
      const data = await res.json();
      if (data?.init_point) window.location.href = data.init_point;
      else setStatus("⚠️ Error al iniciar el pago. Intenta nuevamente.");
    } catch {
      setStatus("❌ Error al conectar con Mercado Pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start bg-[#030014] text-white overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-30" />

      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-16 text-center">
        {/* 🔹 Hero principal */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-6">
          GIA — Growth Intelligence Agency
        </h1>
        <p className="text-gray-300 mb-16 text-lg md:text-xl max-w-3xl mx-auto">
          Generá campañas de marketing automatizadas con inteligencia artificial.
          Estrategias, copys, prompts y calendarios listos en minutos.
        </p>

        {/* 💡 Beneficios: “Por qué elegir GIA” */}
        <section className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              title: "Automatización total",
              desc: "Creá campañas completas sin esfuerzo. GIA genera textos, prompts y calendarios en minutos.",
              icon: "⚙️",
            },
            {
              title: "Diseños profesionales",
              desc: "Incluye plantillas editables de Canva listas para publicar en redes sociales.",
              icon: "🎨",
            },
            {
              title: "Optimización con IA",
              desc: "Cada campaña se adapta a tu objetivo y público. Inteligencia real aplicada al marketing.",
              icon: "🤖",
            },
          ].map((b, i) => (
            <div
              key={i}
              className="p-6 bg-[#0a0f2a]/60 border border-blue-600/40 rounded-2xl shadow-md hover:shadow-cyan-500/20 transition"
            >
              <div className="text-4xl mb-3">{b.icon}</div>
              <h3 className="text-xl font-semibold text-cyan-300 mb-2">
                {b.title}
              </h3>
              <p className="text-gray-400 text-sm">{b.desc}</p>
            </div>
          ))}
        </section>

        {/* 💬 Testimonios */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-sky-400 mb-10">
            Opiniones de nuestros usuarios
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
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
                className="bg-[#0a0f2a]/60 border border-blue-600/30 rounded-2xl p-6 text-gray-300 shadow-md hover:shadow-cyan-500/20 transition"
              >
                <p className="italic mb-4 text-gray-200">“{t.text}”</p>
                <p className="text-sm text-cyan-400 font-semibold">— {t.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 🧾 Formulario y pago */}
        <section className="max-w-2xl mx-auto bg-[#0a0f2a]/60 border border-blue-600/50 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-cyan-300 mb-6">
            Generá tu campaña personalizada
          </h2>
          <form onSubmit={handlePayment}>
            <input
              type="text"
              name="name"
              placeholder="Tu nombre"
              value={form.name}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full mb-4 p-3 bg-[#06081a] border border-blue-700/40 rounded-xl text-white focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />
            <input
              type="email"
              name="email"
              placeholder="Tu correo"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full mb-4 p-3 bg-[#06081a] border border-blue-700/40 rounded-xl text-white focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />
            <textarea
              name="objective"
              placeholder="¿Cuál es tu objetivo de campaña?"
              value={form.objective}
              onChange={handleChange}
              required
              rows="4"
              disabled={loading}
              className="w-full mb-6 p-3 bg-[#06081a] border border-blue-700/40 rounded-xl text-white focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl font-semibold text-black hover:opacity-90 transition"
            >
              {loading ? "Procesando..." : "Comprar ahora — 29.000 ARS 💳"}
            </button>
          </form>
          {status && (
            <p className="mt-6 text-blue-300 text-sm animate-pulse">{status}</p>
          )}
        </section>
      </main>

      {/* 📜 Footer */}
      <footer className="relative z-10 mt-16 text-gray-500 text-sm pb-6">
        © {new Date().getFullYear()} GIA — Growth Intelligence Agency
      </footer>
    </div>
  );
}
