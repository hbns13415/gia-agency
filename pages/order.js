// pages/order.js
import { useState } from "react";

export default function Order() {
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [form, setForm] = useState({ name:"", email:"", objective:"" });

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResp(null);
    const r = await fetch("/api/gia/execute", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(form)
    });
    const j = await r.json();
    setResp(j);
    setLoading(false);
  }

  return (
    <div style={{maxWidth:640, margin:"40px auto", fontFamily:"system-ui, Arial"}}>
      <h1>Solicitar campaña GIA</h1>
      <form onSubmit={onSubmit}>
        <label>Nombre<br/>
          <input required value={form.name}
            onChange={e=>setForm({...form, name:e.target.value})}
            style={{width:"100%", padding:8, margin:"6px 0 16px"}}/>
        </label>
        <label>Email<br/>
          <input required type="email" value={form.email}
            onChange={e=>setForm({...form, email:e.target.value})}
            style={{width:"100%", padding:8, margin:"6px 0 16px"}}/>
        </label>
        <label>Objetivo de campaña<br/>
          <textarea required rows={5} value={form.objective}
            onChange={e=>setForm({...form, objective:e.target.value})}
            style={{width:"100%", padding:8, margin:"6px 0 16px"}}/>
        </label>
        <button disabled={loading} type="submit" style={{padding:"10px 16px"}}>
          {loading ? "Generando..." : "Crear campaña"}
        </button>
      </form>

      {resp && (
        <div style={{marginTop:24}}>
          {resp.ok ? (
            <>
              <h3>Links de descarga</h3>
              <ul>
                <li><a href={resp.links.json}>JSON maestro</a></li>
                <li><a href={resp.links.csv}>Calendario (CSV)</a></li>
                <li><a href={resp.links.html}>Informe (HTML)</a></li>
                <li><a href={resp.links.zip}>ZIP completo</a></li>
              </ul>
            </>
          ) : (
            <pre style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(resp, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}
