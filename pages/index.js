// pages/index.js
import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/mercadopago/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Pack de plantillas GIA",
          price: 29000,
          quantity: 1,
        }),
      });
      const data = await response.json();
      if (data?.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("Error al iniciar el pago, intenta nuevamente.");
      }
    } catch (error) {
      console.error(error);
      alert("Hubo un problema con el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050a1f] text-white">
      <Head>
        <title>GIA — Growth Intelligence Agency</title>
      </Head>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Título principal */}
        <h1 className="text-5xl font-extrabold text-center text-sky-400 mb-4">
          GIA — Growth Intelligence Agency
        </h1>
        <p className="text-center text-gray-300 text-lg mb-12">
          Generá campañas de marketing automatizadas con IA. Estrategias, copys,
          prompts y diseño en minutos.
        </p>

        {/* Opiniones */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-sky-400 mb-6 text-center">
            Opiniones de nuestros usuarios
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
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
        </section>

        {/* Generar campaña */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-sky-400 mb-2">
            Generá tu campaña personalizada
          </h2>
          <p className="text-gray-400 mb-8">
            Completá los datos y realizá tu pago para recibir tu pack completo
            por correo.
          </p>

          {/* Botón de pago */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition disabled:opacity-60"
          >
            {loading ? "Generando orden..." : "Comprar ahora — 29.000 ARS 💳"}
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-500 text-sm border-t border-gray-800 pt-6">
        © {new Date().getFullYear()} GIA — Growth Intelligence Agency. Todos los derechos reservados.
      </footer>
    </div>
  );
}
