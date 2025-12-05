import React, { useState } from 'react';
import './EvaluaGPT.css';

function pretty(v) {
  if (v === null || v === undefined) return '-';
  if (typeof v === 'number') return v.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  try {
    return JSON.stringify(v, null, 2);
  } catch (e) {
    return String(v);
  }
}

export default function EvaluaGPT({ data = {} }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const buildPrompt = () => {
    const lines = [];
    lines.push('EVALÚA INFORME DE VIVIENDA');
    lines.push('Contexto: Soy un usuario que quiere decidir entre vender o alquilar una vivienda.');
    lines.push('A continuación tienes los valores de entrada y los resultados calculados:');

    // inputs
    lines.push('\n-- ENTRADAS --');
    const inputs = [
      'precioCompra', 'valorMercadoActual', 'entrada', 'interes', 'añosHipoteca', 'añosFijo', 'euribor', 'margen', 'gastosNotaria', 'gestorHipotecario', 'mejoras', 'impuestoCompraPercent', 'anioVenta', 'porcentajeRevalorizacion', 'alquilerActual', 'alquilerPosible', 'ibiBasura', 'comunidad'
    ];
    inputs.forEach((k) => {
      if (k in data) lines.push(`${k}: ${typeof data[k] === 'object' ? JSON.stringify(data[k]) : String(data[k])}`);
    });

    lines.push('\n-- RESULTADOS CALCULADOS --');
    const results = ['importeFinanciado','cuotaMensual','totalInteresesEstimados','interesesPagadosHastaVenta','saldoRestanteHipoteca','impuestosCompra','plusvaliaBruta','impuestoPlusvaliaVenta','impuestoHipoteticoNoViviendaHabitual','plusvaliaNeta','dineroNetoEnCuenta','inversionEfectivo','roi','alquilerEquilibrio','alquilerPara3Porciento','alquilerPara5Porciento'];
    results.forEach((k) => {
      if (k in data) lines.push(`${k}: ${typeof data[k] === 'object' ? JSON.stringify(data[k]) : String(data[k])}`);
    });

    lines.push('\n-- ESCENARIOS POR AÑO (resumen) --');
    if (Array.isArray(data.escenariosPorAño) && data.escenariosPorAño.length > 0) {
      data.escenariosPorAño.slice(0, 20).forEach((e) => {
        // prefer explicit fields but fall back to the whole object so nothing is lost
        const precio = e.precio ?? e.precioVenta ?? e.price ?? null;
        const roi = e.roi ?? e.Roi ?? null;
        const nivel = e.nivel ?? null;
        if (precio !== null || roi !== null || nivel !== null) {
          lines.push(`Año ${e.año ?? '-'}: precio: ${precio ?? '-'}, ROI: ${roi ?? '-'}${nivel ? `, nivel: ${nivel}` : ''}`);
        } else {
          // stringify fallback to include any other available fields
          try {
            lines.push(`Año ${e.año ?? '-'}: ${JSON.stringify(e)}`);
          } catch (err) {
            lines.push(`Año ${e.año ?? '-'}: [datos no serializables]`);
          }
        }
      });
    }

    // include saved scenarios if present
    if (Array.isArray(data.escenariosGuardados) && data.escenariosGuardados.length > 0) {
      lines.push('\n-- ESCENARIOS GUARDADOS --');
      data.escenariosGuardados.slice(0, 10).forEach((s, idx) => {
        const d = s.data || {};
        const date = s.timestamp ? new Date(s.timestamp).toLocaleString() : '-';
        lines.push(`\nEscenario ${idx + 1}: ${s.name || '-'} (guardado: ${date})`);
        lines.push(`  Precio compra: ${d.precioCompra ?? '-'}, Valor mercado: ${d.valorMercadoActual ?? '-'}, Entrada: ${d.entrada ?? '-'} `);
        if (typeof d.impuestoCompraPercent === 'number') lines.push(`  Impuesto compra: ${d.impuestoCompraPercent}% (${d.impuestosCompra ? d.impuestosCompra : '-'})`);
        if (typeof d.mejoras === 'number') lines.push(`  Reformas/mejoras: ${d.mejoras}`);
        if (typeof d.totalInteresesEstimados === 'number') lines.push(`  Total intereses estimados: ${d.totalInteresesEstimados}`);
        // include any notable overrides
        if (d.precioVentaManual) lines.push(`  Precio venta manual: ${d.precioVentaManual}`);
      });
    }

    // include price evolution summary (cambio de precio)
    if (Array.isArray(data.evolucionPrecio)) {
      lines.push('\n-- EVOLUCIÓN DEL PRECIO (resumen) --');
      const ev = data.evolucionPrecio;
      const first = ev[0];
      const last = ev[ev.length - 1];
      if (first && last) {
        const start = first.precio ?? first.price ?? '-';
        const end = last.precio ?? last.price ?? '-';
        lines.push(`Valor inicial: ${start} → Valor final (t=${ev.length - 1}): ${end}`);
      }
      // list a few points
      ev.slice(0, 6).forEach((f) => lines.push(`  Año ${f.año}: ${f.precio}`));
    }

    lines.push('\nInstrucción:\nAnaliza los resultados, explica paso a paso cómo se han calculado los principales números, identifica riesgos fiscales y financieros, sugiere 3 recomendaciones accionables para mejorar la rentabilidad (o reducir pérdidas) y resume en 5 bullet points claros si conviene vender o alquilar con los datos proporcionados. Señala supuestos importantes y sensibilidad a cambios de euribor y revalorización.');

    return lines.join('\n');
  };

  const prompt = buildPrompt();

  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('No se pudo copiar', e);
    }
  };

  return (
    <div className="evalua-gpt">
      <button className="eval-btn" onClick={() => setOpen(true)}>Evalúa todo con GPT</button>

      {open && (
        <div className="eg-modal">
          <div className="eg-backdrop" onClick={() => setOpen(false)} />
          <div className="eg-panel">
            <h3>Prompt generado para GPT</h3>
            <textarea className="eg-textarea" value={prompt} readOnly rows={18} />
            <div className="eg-actions">
              <button onClick={doCopy} className="eg-action">{copied ? 'Copiado' : 'Copiar prompt'}</button>
              <a className="eg-action" target="_blank" rel="noreferrer" href="https://chat.openai.com/">Abrir ChatGPT</a>
              <button onClick={() => setOpen(false)} className="eg-action eg-close">Cerrar</button>
            </div>
            <div className="eg-note">Nota: Si quieres que lo envíe automáticamente a una API, crea un endpoint '/api/gpt/evaluate' y te lo conecto.</div>
          </div>
        </div>
      )}
    </div>
  );
}
