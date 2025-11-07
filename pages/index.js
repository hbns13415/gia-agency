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

  // 📬 Manejo de inputs
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
      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        setStatus("⚠️ Error al iniciar el pago, intenta nuevamente.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Error al conectar con Mercado Pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#030014] text-white overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-30" />

      <main className="relative z-10 max-w-2xl w-full text-center px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-4">
          GIA — Growth Intelligence Agency
        </h1>
        <p className="text-gray-300 mb-8 text-lg">
          Automatizá tu marketing con inteligencia artificial.  
          Generá estrategias, copys y calendarios de contenido listos para usar.
        </p>

        <form
          onSubmit={handlePayment}
          className="bg-[#0a0f2a]/60 border border-blue-600/50 rounded-2xl shadow-xl p-6 backdrop-blur-sm"
        >
          <input
            type="text"
            name="name"
            placeholder="Tu nombre"
            value={form.name}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full mb-4 p-3 bg-[#06081a] border border-blue-700/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          />
          <input
            type="email"
            name="email"
            placeholder="Tu correo"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full mb-4 p-3 bg-[#06081a] border border-blue-700/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          />
          <textarea
            name="objective"
            placeholder="¿Cuál es tu objetivo de campaña?"
            value={form.objective}
            onChange={handleChange}
            required
            rows="4"
            disabled={loading}
            className="w-full mb-6 p-3 bg-[#06081a] border border-blue-700/40 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
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
      </main>

      <footer className="relative z-10 mt-12 text-gray-500 text-sm">
        © {new Date().getFullYear()} GIA — Growth Intelligence Agency
      </footer>
    </div>
  );
}
