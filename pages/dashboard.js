// pages/dashboard.js
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [status, setStatus] = useState("loading");
  const [campaigns, setCampaigns] = useState([]);
  const [user, setUser] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) return setStatus("no-token");

    async function loadData() {
      try {
        const verifyRes = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyData.valid) return setStatus("expired");

        setUser(verifyData.data.email);

        const res = await fetch("/api/dashboard/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (data.ok) {
          setCampaigns(data.campaigns);
          setStatus("ok");
        } else setStatus("no-data");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }

    loadData();
  }, []);

  if (status === "loading")
    return (
      <div className="flex h-screen items-center justify-center text-white bg-[#030014]">
        Verificando acceso...
      </div>
    );

  if (status === "no-token")
    return (
      <div className="flex h-screen flex-col items-center justify-center text-white bg-[#030014]">
        <p>❌ Enlace inválido o sin token.</p>
        <a href="/" className="mt-4 text-cyan-400 underline">
          Volver al inicio
        </a>
      </div>
    );

  if (status === "expired")
    return (
      <div className="flex h-screen flex-col items-center justify-center text-white bg-[#030014]">
        <p>⚠️ Este enlace expiró (más de 24h).</p>
        <a href="/" className="mt-4 text-cyan-400 underline">
          Solicitar nuevo acceso
        </a>
      </div>
    );

  if (status === "error")
    return (
      <div className="flex h-screen items-center justify-center text-white bg-[#030014]">
        Error interno, intenta nuevamente.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#030014] text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6">
        Panel de Campañas — {user}
      </h1>
      <p className="text-gray-400 mb-8 text-center max-w-2xl">
        Acceso temporal válido por 24 horas. Aquí están tus campañas generadas.
      </p>

      {campaigns.length === 0 ? (
        <p className="text-gray-500">No se encontraron campañas aún.</p>
      ) : (
        <div className="grid gap-4 w-full max-w-3xl">
          {campaigns.map((c, i) => (
            <div
              key={i}
              className="bg-[#0a0f2a]/70 border border-blue-600/30 rounded-2xl p-5 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-cyan-300 mb-2">
                🎯 {c.objetivo}
              </h3>
              <p className="text-gray-400 mb-3">📅 Fecha: {c.fecha}</p>
              <div className="flex gap-3 text-sm">
                <a
                  href={c.json}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  JSON
                </a>
                <a
                  href={c.csv}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  CSV
                </a>
                <a
                  href={c.zip}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  ZIP
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
