import React, { useState, useEffect, useRef } from 'react';

export default function CreadorDeEscenariosHipotecarios({ onCreate, onClose }) {
  const [name, setName] = useState('');

  const [precioCompra, setPrecioCompra] = useState(145000);
  const [impuestoCompraPercent, setImpuestoCompraPercent] = useState(8);
  const [valorMercadoActual, setValorMercadoActual] = useState(200000);
  const [entrada, setEntrada] = useState(14500);
  const [interes, setInteres] = useState(2.5);
  const [añosHipoteca, setAniosHipoteca] = useState(30);
  const [añosFijo, setAniosFijo] = useState(5);
  const [euribor, setEuribor] = useState(3.5);
  const [margen, setMargen] = useState(1.5);
  const [gestorHipotecario, setGestorHipotecario] = useState(3000);
  const [gastosNotaria, setGastosNotaria] = useState(700);
  const [alquilerActual, setAlquilerActual] = useState(850);
  const [ibiBasura, setIbiBasura] = useState(400);
  const [comunidad, setComunidad] = useState(230);

  const SCENARIOS_KEY = 'dv_escenarios_vivienda';

  // navegación por secciones para ocupar menos espacio
  const [section, setSection] = useState(0);
  const sections = ['Identidad', 'Compra', 'Hipoteca', 'Gastos', 'Revisión'];
  const modalRef = useRef(null);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        if (typeof onClose === 'function') onClose();
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        setSection((s) => Math.min(s + 1, sections.length - 1));
      }
      if (e.key === 'ArrowLeft') {
        setSection((s) => Math.max(s - 1, 0));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function createPayload() {
    const impuestosCompra = (Number(precioCompra || 0) * Number(impuestoCompraPercent || 0)) / 100;
    const importeFinanciado = Math.max(Number(precioCompra || 0) - Number(entrada || 0), 0);

    return {
      name: name || `Escenario ${new Date().toLocaleString()}`,
      timestamp: Date.now(),
      data: {
        precioCompra: Number(precioCompra || 0),
        impuestoCompraPercent: Number(impuestoCompraPercent || 0),
        impuestosCompra: impuestosCompra,
        valorMercadoActual: Number(valorMercadoActual || 0),
        entrada: Number(entrada || 0),
        interes: Number(interes || 0),
        añosHipoteca: Number(añosHipoteca || 0),
        añosFijo: Number(añosFijo || 0),
        euribor: Number(euribor || 0),
        margen: Number(margen || 0),
        gestorHipotecario: Number(gestorHipotecario || 0),
        gastosNotaria: Number(gastosNotaria || 0),
        alquilerActual: Number(alquilerActual || 0),
        ibiBasura: Number(ibiBasura || 0),
        comunidad: Number(comunidad || 0),
        importeFinanciado,
      },
    };
  }

  function handleSave() {
    const payload = createPayload();

    if (typeof onCreate === 'function') {
      try {
        onCreate(payload);
      } catch (e) {
        console.warn('Error calling onCreate', e);
      }
    } else {
      try {
        const raw = localStorage.getItem(SCENARIOS_KEY);
        const prev = raw ? (Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : []) : [];
        const next = [payload, ...prev].slice(0, 50);
        localStorage.setItem(SCENARIOS_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('No se pudo guardar el escenario en localStorage', e);
      }
    }

    if (typeof onClose === 'function') onClose();
  }

  function onOverlayClick(e) {
    if (e.target === modalRef.current) {
      if (typeof onClose === 'function') onClose();
    }
  }

  const rowStyle = { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 };
  const labelStyle = { width: 160, fontSize: 14, color: '#374151' };
  const inputStyle = { padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db' };

  return (
    <div
      ref={modalRef}
      onClick={onOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(12, 18, 28, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%',
          maxWidth: 880,
          maxHeight: '85vh',
          overflow: 'auto',
          background: '#fff',
          borderRadius: 12,
          padding: 18,
          boxShadow: '0 20px 50px rgba(2,6,23,0.35)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Crear escenario hipotecario</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setSection(0)} style={{ padding: '6px 8px', borderRadius: 8 }}>Inicio</button>
            <button onClick={() => typeof onClose === 'function' ? onClose() : null} style={{ padding: '6px 8px', borderRadius: 8 }}>Cerrar ✕</button>
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {sections.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, background: i === section ? '#2563eb' : '#e6eefc', color: i === section ? '#fff' : '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{i + 1}</div>
              <div style={{ fontSize: 13, color: i === section ? '#111827' : '#6b7280' }}>{s}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          {/* Secciones plegables: mostramos sólo la sección activa */}

          {section === 0 && (
            <div>
              <div style={rowStyle}>
                <label style={labelStyle}>Nombre del escenario</label>
                <input style={{ ...inputStyle, flex: 1 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (opcional)" />
              </div>
            </div>
          )}

          {section === 1 && (
            <div>
              <div style={rowStyle}>
                <label style={labelStyle}>Precio de compra (€)</label>
                <input style={inputStyle} type="number" value={precioCompra} onChange={(e) => setPrecioCompra(Number(e.target.value) || 0)} />
              </div>

              <div style={rowStyle}>
                <label style={labelStyle}>Imp. compra (%)</label>
                <select style={inputStyle} value={impuestoCompraPercent} onChange={(e) => setImpuestoCompraPercent(Number(e.target.value) || 0)}>
                  <option value={0}>0%</option>
                  <option value={6}>6%</option>
                  <option value={8}>8%</option>
                  <option value={10}>10%</option>
                </select>
                <div style={{ marginLeft: 12, color: '#6b7280' }}>
                  {((precioCompra * impuestoCompraPercent) / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </div>
              </div>

              <div style={rowStyle}>
                <label style={labelStyle}>Valor mercado actual (€)</label>
                <input style={inputStyle} type="number" value={valorMercadoActual} onChange={(e) => setValorMercadoActual(Number(e.target.value) || 0)} />
              </div>

              <div style={rowStyle}>
                <label style={labelStyle}>Entrada (€)</label>
                <input style={inputStyle} type="number" value={entrada} onChange={(e) => setEntrada(Number(e.target.value) || 0)} />
              </div>
            </div>
          )}

          {section === 2 && (
            <div>
              <div style={rowStyle}>
                <label style={labelStyle}>Interés hipoteca (%)</label>
                <input style={inputStyle} type="number" step="0.1" value={interes} onChange={(e) => setInteres(Number(e.target.value) || 0)} />
              </div>

              <div style={rowStyle}>
                <label style={labelStyle}>Años hipoteca</label>
                <input style={inputStyle} type="number" value={añosHipoteca} onChange={(e) => setAniosHipoteca(Number(e.target.value) || 0)} />
              </div>

              <div style={rowStyle}>
                <label style={labelStyle}>Años fijo</label>
                <input style={inputStyle} type="number" value={añosFijo} onChange={(e) => setAniosFijo(Number(e.target.value) || 0)} />
              </div>

              <div style={rowStyle}>
                <label style={labelStyle}>Euribor (%)</label>
                <input style={inputStyle} type="number" step="0.1" value={euribor} onChange={(e) => setEuribor(Number(e.target.value) || 0)} />
              </div>

              <div style={rowStyle}>
                <label style={labelStyle}>Margen (%)</label>
                <input style={inputStyle} type="number" step="0.1" value={margen} onChange={(e) => setMargen(Number(e.target.value) || 0)} />
              </div>

              <div style={rowStyle}>
                <label style={labelStyle}>Gasto gestor (€)</label>
                <input style={inputStyle} type="number" value={gestorHipotecario} onChange={(e) => setGestorHipotecario(Number(e.target.value) || 0)} />
              </div>

              <div style={rowStyle}>
                <label style={labelStyle}>Gastos de notaría (€)</label>
                <input style={inputStyle} type="number" value={gastosNotaria} onChange={(e) => setGastosNotaria(Number(e.target.value) || 0)} />
              </div>
            </div>
          )}

          {section === 3 && (
            <div>
              <div style={rowStyle}>
                <label style={labelStyle}>Alquiler actual (€/mes)</label>
                <input style={inputStyle} type="number" value={alquilerActual} onChange={(e) => setAlquilerActual(Number(e.target.value) || 0)} />
              </div>

              <div style={rowStyle}>
                <label style={labelStyle}>IBI + basura (€/año)</label>
                <input style={inputStyle} type="number" value={ibiBasura} onChange={(e) => setIbiBasura(Number(e.target.value) || 0)} />
              </div>

              <div style={rowStyle}>
                <label style={labelStyle}>Comunidad (€/mes)</label>
                <input style={inputStyle} type="number" value={comunidad} onChange={(e) => setComunidad(Number(e.target.value) || 0)} />
              </div>
            </div>
          )}

          {section === 4 && (
            <div>
              <h4>Revisión rápida</h4>
              <div style={{ marginBottom: 8 }}><strong>Nombre:</strong> {name || '(sin nombre)'}</div>
              <div style={{ marginBottom: 8 }}><strong>Precio compra:</strong> {Number(precioCompra).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
              <div style={{ marginBottom: 8 }}><strong>Imp. compra:</strong> {impuestoCompraPercent}% → {((precioCompra * impuestoCompraPercent) / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
              <div style={{ marginBottom: 8 }}><strong>Importe financiado:</strong> {Math.max(precioCompra - entrada, 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
            </div>
          )}

        </div>

        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button onClick={() => setSection((s) => Math.max(s - 1, 0))} disabled={section === 0} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', marginRight: 8 }}>◀ Anterior</button>
            <button onClick={() => setSection((s) => Math.min(s + 1, sections.length - 1))} disabled={section === sections.length - 1} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #2563eb', background: '#eff6ff' }}>Siguiente ▶</button>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}>Guardar escenario</button>
            <button onClick={() => typeof onClose === 'function' ? onClose() : null} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff' }}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
