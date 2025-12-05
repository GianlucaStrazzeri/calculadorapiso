import React, { useState } from 'react';
import './EscenariosHipotecas.css';

function formatMoney(v) {
  return Number(v || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

export default function EscenariosHipotecas({ scenarios = [], onLoad = () => {}, onDelete = () => {}, onUpdateName = () => {} }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  const list = Array.isArray(scenarios) ? scenarios : [];

  function startEdit(i) {
    setEditingIndex(i);
    setEditValue(list[i]?.name || '');
  }

  function saveEdit(i) {
    onUpdateName(i, editValue.trim() || list[i]?.name || 'Escenario');
    setEditingIndex(null);
  }

  if (list.length === 0) return null;

  return (
    <div className="escenarios-hipotecas">
      <h3>Escenarios hipotecarios guardados</h3>
      <div className="cards">
        {list.map((s, i) => (
          <div className="card" key={s.timestamp || i}>
            <div className="card-header">
              {editingIndex === i ? (
                <div className="edit-row">
                  <input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                  <button onClick={() => saveEdit(i)}>Guardar</button>
                  <button onClick={() => { setEditingIndex(null); }}>Cancelar</button>
                </div>
              ) : (
                <>
                  <div className="title">{s.name}</div>
                  <div className="actions">
                    <button onClick={() => startEdit(i)} title="Editar título">✏️</button>
                    <button onClick={() => onLoad(i)} title="Cargar escenario">📂</button>
                    <button onClick={() => onDelete(i)} title="Borrar escenario">🗑️</button>
                  </div>
                </>
              )}
            </div>

            <div className="card-body">
              <div className="kv"><span>Importe financiado</span><strong>{formatMoney(s.data?.importeFinanciado)}</strong></div>
              <div className="kv"><span>Cuota mensual estimada</span><strong>{formatMoney(s.data?.cuotaMensual)}</strong></div>
              <div className="kv"><span>Total interés estimado</span><strong>{
                (() => {
                  const cuota = Number(s.data?.cuotaMensual || 0);
                  const años = Number(s.data?.añosHipoteca || s.data?.añosHipoteca === 0 ? s.data?.añosHipoteca : 0);
                  const importe = Number(s.data?.importeFinanciado || 0);
                  const meses = (Number.isFinite(años) ? años : 0) * 12;
                  if (!cuota || meses <= 0) return '-';
                  const totalPagado = cuota * meses;
                  const intereses = totalPagado - importe;
                  return Number.isFinite(intereses) ? formatMoney(Math.max(0, intereses)) : '-';
                })()
              }</strong></div>
              <div className="kv small"><span>Precio compra</span><span>{formatMoney(s.data?.precioCompra)}</span></div>
              <div className="kv small"><span>Años hipoteca</span><span>{s.data?.añosHipoteca || '-'}</span></div>
              <div className="kv small"><span>Imp. compra</span><span>{typeof s.data?.impuestoCompraPercent === 'number' ? s.data.impuestoCompraPercent + '%' : '-'}</span></div>
              <div className="kv small"><span>Imp. compra (€)</span><span>{
                (typeof s.data?.impuestosCompra === 'number')
                  ? formatMoney(s.data.impuestosCompra)
                  : (typeof s.data?.precioCompra === 'number' && typeof s.data?.impuestoCompraPercent === 'number')
                    ? formatMoney(s.data.precioCompra * (s.data.impuestoCompraPercent/100))
                    : '-'
              }</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
