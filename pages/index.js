import Head from 'next/head'
import { useState } from 'react'

export default function Home() {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error creating checkout session')
      }
    } catch (e) {
      console.error(e)
      alert('Error: ' + (e.message || e))
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>GIA — Inteligencia artificial para tu emprendimiento</title>
        <meta name="description" content="GIA: agentes IA que crean y venden contenido para emprendedores. Pack de 30 posts editables en Canva." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full py-6 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center bg-gradient-to-br from-[#00d0ff] to-[#6a5cff] shadow-neon">
              <span className="font-bold text-gia-bg">G</span>
            </div>
            <h1 className="text-xl font-semibold gia-neon">GIA</h1>
          </div>
          <nav className="text-sm opacity-80">
            <a href="#product" className="mr-6 hover:underline">Pack</a>
            <a href="#how" className="mr-6 hover:underline">Cómo funciona</a>
            <a href="#about" className="hover:underline">Quiénes somos</a>
          </nav>
        </header>

        {/* Hero */}
        <section className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 gia-neon">
                Inteligencia artificial <span className="text-gia-accent">trabajando</span> para tu marca
              </h2>
              <p className="text-gray-300 mb-6">
                GIA combina agentes IA especializados que crean estrategia, diseño y contenido para emprendedores. Lanzá hoy tu presencia profesional con nuestro Pack de 30 posts editables en Canva.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="btn-gia px-6 py-3 rounded-lg font-semibold shadow-neon"
                >
                  {loading ? 'Redirigiendo...' : 'Comprar Pack — USD 19'}
                </button>
                <a href="#how" className="px-5 py-3 rounded-lg border border-white/10 text-sm flex items-center justify-center">
                  Cómo funciona
                </a>
              </div>

              <div className="mt-6 text-xs text-gray-400">
                <span className="mr-2">Prueba segura · Pago en USD · Entrega instantánea</span>
              </div>
            </div>

            <div className="gia-glass p-6 rounded-xl shadow-neon" id="product">
              <h3 className="text-lg font-semibold mb-3">Lo que recibís</h3>
              <ul className="space-y-3 text-gray-300">
                <li>• 30 diseños editables en Canva</li>
                <li>• Textos persuasivos por post</li>
                <li>• Calendario de 30 días de publicación</li>
                <li>• Guía rápida de optimización por tipo de publicación</li>
              </ul>

              <div className="gia-divider" />

              <h4 className="text-sm text-gray-300">Ideal para</h4>
              <p className="text-xs text-gray-400">
                Emprendedores, locales y pequeños negocios que necesitan presencia profesional sin invertir horas en diseño.
              </p>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
