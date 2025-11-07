// pages/success.js
import { useEffect, useRef } from "react";

export default function Success() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2 + 1,
    }));

    const draw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ffff";
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };
    draw();
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#030014] text-white overflow-hidden text-center px-6">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-30" />
      <div className="relative z-10">
        <h1 className="text-4xl font-bold text-green-400 mb-4">¡Pago exitoso!</h1>
        <p className="text-gray-300 mb-8">
          Gracias por tu compra. En pocos minutos recibirás tu pack de campaña personalizado en tu correo electrónico.
        </p>
        <a
          href="/"
          className="bg-gradient-to-r from-blue-500 to-cyan-400 text-black font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
