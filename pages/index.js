import Head from 'next/head';

export default function Home() {
  const handleCheckout = async () => {
    const res = await fetch('/api/checkout', { method: 'POST' });
    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <Head>
        <title>GIA Agency - Pack de 30 Posts</title>
      </Head>
      <h1 className="text-4xl font-bold mb-4">Pack de 30 Posts para tu Emprendimiento</h1>
      <p className="text-lg mb-6">Diseños editables en Canva, listos para impulsar tu marca.</p>
      <button onClick={handleCheckout} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Comprar ahora (USD 19)
      </button>
    </div>
  );
}