export default function Success() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#030014] text-white">
      <h1 className="text-3xl font-bold text-green-400">¡El pago falló!</h1>
      <p className="mt-4">Reintentá abonar con otro método de pago. Recibirás tu campaña por correo en minutos.</p>
    </div>
  );
}
