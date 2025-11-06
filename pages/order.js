// pages/order.js
import { useState } from "react";

export default function Order() {
  const [form, setForm] = useState({ name: "", email: "", objective: "" });
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const canSubmit = form.name && form.email && form.objective;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setResp(null);
    try {
      const r = await fetch("/api/gia/execute", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(form)
      });
      const j = await r.json();
      setResp(j);
    } catch (err) {
      setResp({ ok:false, error: String(err?.message || err) });
    } finally {
      setLoading(false);
    }
  }

  const wrap = { maxWidth: 720, margin: "40px auto", fontFamily: "system-ui, Arial", color:"#e6ecff" };
  const card = { background:"#0f1630", border:"1px solid #23306b", borderRadius:14, padding:18 };
  const h1 = { margin:0, marginBottom:10, color:"#a5b8ff" };
  const label = { display:"block", margin:"12px 0 6px" };
  const input = { width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #2a3a7a", background:"#0b1020", color:"#e6ecff" };
  const btn = { marginTop:14, padding:"10px 16px", borderRadius:12, border:"1px solid #2a3a7a", background:"#101a3d", color:"#9ecbff", cursor:"pointer" };

  return (
    <div style={{...wrap}}>
      <div style={{...card}}>
        <h1 style={h1}>Solicitar campaña — GIA</h1>
        <p style={{opacity:.8, marginTop:4}}>Estrategia, copys, prompts, análisis y calendario de 30 días.</p>
        <form onSubmit={onSubmit}>
          <label style={label}>Nombre</label>
          <input style={input} required value={form.name}
            onChange={e=>setForm({...form, name:e.target.value})} />

          <label style={label}>Email</label>
          <input style={input} required type="email" value={form.email}
            onChange={e=>setForm({...form, email:e.target.value})} />

          <label style={label}>Objetivo de campaña</label>
          <textarea style={{...input, minHeight:120}} required value={form.objective}
            onChange={e=>setForm({...form, objective:e.target.value})} />

          <button type="submit" style={btn} disabled={!canSubmit || loading}>
            {loading ? "GIA está trabajando…" : "Lanzar campaña"}
          </button>
        </form>
      </div>

      {resp && (
        <div style={{...card, marginTop:16}}>
          {resp.ok ? (
            <>
              <h3 style={{marginTop:0, color:"#a5b8ff"}}>¡Listo! Enviamos tu campaña por email</h3>
              <p>También podés descargarla acá:</p>
              <ul>
                <li><a href={resp.links.json} target="_blank" rel="noreferrer">JSON maestro</a></li>
                <li><a href={resp.links.csv}  target="_blank" rel="noreferrer">Calendario (CSV)</a></li>
                <li><a href={resp.links.html} target="_blank" rel="noreferrer">Informe (HTML)</a></li>
                <li><a href={resp.links.zip}  target="_blank" rel="noreferrer">ZIP completo</a></li>
              </ul>
            </>
          ) : (
            <>
              <h3 style={{marginTop:0, color:"#ffb4b4"}}>Ocurrió un problema</h3>
              <pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(resp, null, 2)}</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
