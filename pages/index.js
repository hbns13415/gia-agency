// pages/index.js
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    objective: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  // 🌌 Partículas de fondo
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

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }

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

  // 🔧 Manejador de cambios del formulario
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 🔵 Crear preferencia de pago y redirigir a MP (SDK v2)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      const res = await fetch("/api/mercadopago/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.ok || !data.init_point) {
        setStatus("⚠️ Error creando la orden de pago.");
        setLoading(false);
        return;
      }

      // 🔵 Redirigir al checkout
      window.location.href = data.init_point;

    } catch (error) {
      console.error("Frontend MP Error:", error);
      setStatus("⚠️ No se pudo iniciar el proceso de pago.");
    }

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-[#030014] text-white overflow-x-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-30" />

      {/* ---------------- HEADER ---------------- */}
      <header className="relative z-10 text-center pt-20 px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
          GIA — Growth Intelligence Agency
        </h1>

        <p className="mt-4 text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
          Generá campañas de marketing automatizadas con inteligencia artificial.
          Estrategias, posteos listos para publicar y calendarios completos en minutos.
        </p>
      </header>

      {/* ---------------- BENEFICIOS ---------------- */}
      <section className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16 px-6">
        <div className="bg-[#0a0f2a]/60 border border-blue-600/30 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-semibold text-cyan-300 mb-2">Automatización total</h3>
          <p className="text-gray-300 text-sm">
            GIA crea estrategias, posteos listos para publicarse y calendarios completos en minutos.
          </p>
        </div>

        <div className="bg-[#0a0f2a]/60 border border-blue-600/30 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-semibold text-cyan-300 mb-2">Diseños profesionales</h3>
          <p className="text-gray-300 text-sm">
            Plantillas editables de Canva listas para publicar en redes sociales.
          </p>
        </div>

        <div className="bg-[#0a0f2a]/60 border border-blue-600/30 rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-semibold text-cyan-300 mb-2">Optimización con IA</h3>
          <p className="text-gray-300 text-sm">
            Cada campaña se adapta al objetivo y público ideal.
          </p>
        </div>
      </section>

      {/* ---------------- TESTIMONIOS ---------------- */}
      <section className="relative z-10 max-w-4xl mx-auto mt-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-cyan-400 mb-8">
          Opiniones de nuestros usuarios
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0a0f2a]/60 p-6 rounded-2xl border border-blue-600/30">
            <p className="italic text-gray-300">
              “Ahorre horas por semana. GIA me generó 30 días de publicaciones automáticas.”
            </p>
            <p className="text-cyan-300 mt-4 text-sm">— Carlos, Emprendedor</p>
          </div>

          <div className="bg-[#0a0f2a]/60 p-6 rounded-2xl border border-blue-600/30">
            <p className="italic text-gray-300">
              “El correo me llegó con todo listo: calendario, posteos y prompts. Parece un equipo entero.”
            </p>
            <p className="text-cyan-300 mt-4 text-sm">— Lucía, Consultora</p>
          </div>
        </div>
      </section>

      {/* ---------------- VIDEO ---------------- */}
      <section className="relative z-10 max-w-4xl mx-auto mt-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400">¿Cómo funciona GIA?</h2>

        <video
          src="/videos/gia-promo.mp4"
          controls
          className="w-full rounded-2xl shadow-xl border border-blue-600/30"
        />
      </section>

      {/* ---------------- FORMULARIO + PAGO ---------------- */}
      <section className="relative z-10 max-w-3xl mx-auto mt-20 px-6 mb-20">
        <form
          onSubmit={handleSubmit}
          className="bg-[#0a0f2a]/60 border border-blue-600/50 rounded-2xl shadow-xl p-6 backdrop-blur-sm"
        >
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Tu nombre"
            required
            className="w-full mb-4 p-3 bg-[#06081a] border border-blue-700/40 rounded-xl text-white"
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Tu correo"
            required
            className="w-full mb-4 p-3 bg-[#06081a] border border-blue-700/40 rounded-xl text-white"
          />

          <textarea
            name="objective"
            value={form.objective}
            onChange={handleChange}
            placeholder="¿Cuál es tu objetivo de campaña?"
            rows={4}
            required
            className="w-full mb-6 p-3 bg-[#06081a] border border-blue-700/40 rounded-xl text-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl font-semibold text-black hover:opacity-90 transition"
          >
            {loading ? "Creando orden..." : "Generar mi campaña — 29.000 ARS"}
          </button>

          {status && (
            <p className="mt-4 text-yellow-300 text-center text-sm">{status}</p>
          )}
        </form>
      </section>
    </div>
  );
}
