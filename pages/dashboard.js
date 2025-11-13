// pages/dashboard.js
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [status, setStatus] = useState("loading");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("no-token");
      return;
    }

    async function verify() {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (data.valid) {
          setUserData(data.data);
          setStatus("valid");
        } else {
          setStatus("expired");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }

    verify();
  }, []);

  if (status === "loading")
    return (
      <div className="flex h-screen items-center justify-center text-white bg-[#030014]">
        Verificando token...
      </div>
    );

  if (status === "no-token")
    return (
      <div className="flex h-screen items-center justify-center flex-col text-white bg-[#030014]">
        <p>❌ No se encontró un token válido en el enlace.</p>
        <a href="/" className="text-cyan-400 mt-4 underline">
          Volver al inicio
        </a>
      </div>
    );

  if (status === "expired")
    return (
      <div className="flex h-screen items-center justify-center flex-col text-white bg-[#030014]">
        <p>⚠️ Este enlace expiró (más de 24 horas).</p>
        <a href="/" className="text-cyan-400 mt-4 underline">
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
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6">
        Bienvenido a tu Dashboard, {userData.email.split("@")[0]}
      </h1>
      <p className="text-gray-400 mb-6 text-center max-w-xl">
        Aquí verás tus campañas generadas por GIA. Tu acceso vence en 24 horas.
      </p>

      <div className="bg-[#0a0f2a]/70 border border-blue-600/30 rounded-2xl p-6 shadow-xl w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-cyan-300 mb-4">
          Campañas recientes
        </h2>
        <p className="text-gray-400">
          🔗 Pronto podrás visualizar y descargar tus campañas directamente aquí.
        </p>
      </div>
    </div>
  );
}
