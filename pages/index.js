import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({ name: "", email: "", objective: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    setLoading(true);
    setStatus("Creando preferencia de pago...");
    try {
      const res = await fetch("/api/mercadopago/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.ok && data.init_point) {
        setStatus("Redirigiendo a Mercado Pago...");
        window.location.href = data.init_point;
      } else {
        setStatus("Error al iniciar el pago.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error al conectar con Mercado Pago.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#05071a] text-white px-6 py-12 flex flex-col items-center relative">
      <header className="text-center mb-16 relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
          GIA — Growth Intelligence Agency
        </h1>
        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
          Generá campañas de marketing automatizadas con IA. Estrategias, copys,
          prompts y diseño en minutos.
        </p>
      </header>

      {/* 🧩 Bloque de testimonios */}
      <section className="max-w-4xl w-full mb-20">
        <h2 className="text-2xl font-semibold mb-6 text-center text-cyan-300">
          Opiniones de nuestros usuarios
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              name: "Carlos, Emprendedor",
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
          ))}
        </div>
      </section>

      {/* 🧩 Formulario + Pago */}
      <section className="mt-8 text-center max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
          Generá tu campaña personalizada
        </h2>
        <p className="text-gray-400 mb-8">
          Completá los datos y realizá tu pago para recibir tu pack completo por
          correo.
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
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
            type="button"
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl font-semibold text-black hover:opacity-90 transition"
          >
            {loading ? "Procesando..." : "Pagar con Mercado Pago (9 USD)"}
          </button>
        </form>

        {status && (
          <p className="mt-6 text-blue-300 text-sm animate-pulse">{status}</p>
        )}
      </section>

      <footer className="relative z-10 mt-16 mb-4 text-gray-500 text-sm">
        © {new Date().getFullYear()} GIA — Growth Intelligence Agency
      </footer>
    </div>
  );
}
