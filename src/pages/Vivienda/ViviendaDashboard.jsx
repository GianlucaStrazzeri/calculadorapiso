import React, { useState, useMemo } from 'react';
import './ViviendaDashboard.css';

/**
 * Calcula el valor de venta tras `anios` años según revalorización anual.
 * @param {number} valorMercadoActual
 * @param {number} revalorizacion  (% anual)
 * @param {number} anios
 * @returns {number}
 */
function calcularValorVenta(valorMercadoActual, revalorizacion, anios) {
  const factor = Math.pow(1 + (Number(revalorizacion) || 0) / 100, Number(anios) || 0);
  return Number(valorMercadoActual || 0) * factor;
}

/**
 * Calcula la cuota mensual por el método francés (anualidad)
 * @param {number} capital  // principal financiado
 * @param {number} tipoAnual  // % anual (ej. 3.5)
 * @param {number} años
 * @returns {number} cuota mensual
 */
function calcularCuotaHipoteca(capital, tipoAnual, años) {
  const P = Number(capital || 0);
  const r = (Number(tipoAnual || 0) / 100) / 12; // tipo mensual
  const n = Math.max(1, Number(años || 0)) * 12;
  if (P <= 0 || n <= 0) return 0;
  if (r === 0) return P / n;
  return (P * r) / (1 - Math.pow(1 + r, -n));
}

export default function ViviendaDashboard() {
  // requisitos mínimos solicitados
  const [euribor, setEuribor] = useState(3.5);
  const [revalorizacion, setRevalorizacion] = useState(2);
  const [alquiler, setAlquiler] = useState(850);

  // parámetros internos (valores por defecto; cámbialos aquí si quieres)
  const valorMercadoActual = 200000; // € (valor de mercado hoy)
  const precioCompra = 145000; // €
  const impuestoCompraPercent = 8; // % (si necesitas, lo puedes cambiar)
  const impuestosCompra = (precioCompra * (impuestoCompraPercent || 0)) / 100;
  const gastosNotaria = 700; // €
  const gestorHipotecario = 3000; // €
  const interesesPagadosHastaVenta = 0; // € (si quieres que incluya intereses hasta la venta)
  const saldoRestanteHipoteca = 90000; // € saldo pendiente al vender (aprox.)
  const entrada = 14500; // €
  const mejoras = 0; // €
  const inversionEfectivo = entrada + gastosNotaria + impuestosCompra + mejoras + gestorHipotecario; // €
  const anosVentaEscenario = 5; // fijo: escenario venta en 5 años

  // datos hipoteca para escenario alquiler
  const margen = 1.5; // % margen bancario
  const añosHipoteca = 30; // años totales
  const importeFinanciado = Math.max(0, precioCompra - entrada); // capital prestado

  // gastos fijos
  const ibiBasura = 400; // €/año
  const comunidad = 230; // €/mes

  // --- Cálculos VENTA (año = 5) ---
  const valorVenta = useMemo(
    () => calcularValorVenta(valorMercadoActual, revalorizacion, anosVentaEscenario),
    [valorMercadoActual, revalorizacion, anosVentaEscenario]
  );

  const plusvaliaBruta = useMemo(() => {
    return (
      Number(valorVenta || 0) -
      Number(precioCompra || 0) -
      Number(impuestosCompra || 0) -
      Number(gastosNotaria || 0) -
      Number(gestorHipotecario || 0) -
      Number(interesesPagadosHastaVenta || 0)
    );
  }, [valorVenta, precioCompra, impuestosCompra, gastosNotaria, gestorHipotecario, interesesPagadosHastaVenta]);

  const impuestoPlusvaliaMunicipal = Math.max(0, plusvaliaBruta * 0.10); // 10%
  const plusvaliaNeta = plusvaliaBruta - impuestoPlusvaliaMunicipal;
  const dineroNetoEnCuenta = Number(valorVenta || 0) - Number(saldoRestanteHipoteca || 0) - impuestoPlusvaliaMunicipal;
  const roi = inversionEfectivo > 0 ? (plusvaliaNeta / inversionEfectivo) * 100 : 0;

  // --- Cálculos ALQUILER ---
  const tipoAnual = useMemo(() => (Number(euribor || 0) + Number(margen || 0)), [euribor, margen]);
  const cuotaHipoteca = useMemo(
    () => calcularCuotaHipoteca(importeFinanciado, tipoAnual, añosHipoteca),
    [importeFinanciado, tipoAnual, añosHipoteca]
  );

  const gastosFijosMensuales = (Number(ibiBasura || 0) + Number(comunidad || 0)) / 12;
  const cashflowMensual = Number(alquiler || 0) - cuotaHipoteca - gastosFijosMensuales;
  const rentabilidadBrutaAlquiler = (Number(alquiler || 0) * 12 / Number(valorMercadoActual || 1)) * 100;

  // --- Mensaje de recomendación simple ---
  let recomendacion = 'Resultado inconcluso: revisa los parámetros.';
  const roiThreshold = 100; // si roi > 100% (según tu petición)
  if (roi > roiThreshold && cashflowMensual <= 0) {
    recomendacion = 'ROI alto pero cashflow bajo/negativo → vender puede ser más interesante.';
  } else if (cashflowMensual > 0 && rentabilidadBrutaAlquiler >= 3) {
    recomendacion = 'Cashflow positivo y rentabilidad bruta ≥ 3% → alquilar puede ser interesante.';
  } else {
    recomendacion = 'Ninguna opción claramente dominante: considera detalles fiscales y objetivos personales.';
  }

  // util: formateo seguro
  const fPrice = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(0) : '-';
  };
  const fPct = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(2) : '-';
  };

  return (
    <div className="dashboard">
      <div className="panel">
        <h2 className="card-title">Panel de controles</h2>
        <div className="inputs-row">
          <label>
            Euríbor (%)
            <input
              type="number"
              step="0.01"
              value={euribor}
              onChange={(e) => setEuribor(Number(e.target.value))}
            />
          </label>

          <label>
            Revalorización anual (%)
            <input
              type="number"
              step="0.01"
              value={revalorizacion}
              onChange={(e) => setRevalorizacion(Number(e.target.value))}
            />
          </label>

          <label>
            Alquiler mensual (€)
            <input
              type="number"
              step="1"
              value={alquiler}
              onChange={(e) => setAlquiler(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Venta en año {anosVentaEscenario}</h3>
        <div>
          <div>Valor estimado de venta: <strong>€ {fPrice(valorVenta)}</strong></div>
          <div>Plusvalía bruta estimada: <strong>€ {fPrice(plusvaliaBruta)}</strong></div>
          <div>Impuesto plusvalía municipal (10%): <strong>€ {fPrice(impuestoPlusvaliaMunicipal)}</strong></div>
          <div>Plusvalía neta: <strong>€ {fPrice(plusvaliaNeta)}</strong></div>
          <div>Dinero neto en cuenta tras venta: <strong>€ {fPrice(dineroNetoEnCuenta)}</strong></div>
          <div>ROI estimado: <strong>{fPct(roi)}%</strong></div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Alquiler</h3>
        <div>
          <div>Tipo anual usado (Euríbor + margen): <strong>{fPct(tipoAnual)}%</strong></div>
          <div>Cuota hipotecaria mensual (método francés): <strong>€ {fPrice(cuotaHipoteca)}</strong></div>
          <div>Gastos fijos mensuales (IBI + comunidad): <strong>€ {fPrice(gastosFijosMensuales)}</strong></div>
          <div>Cashflow mensual estimado: <strong>€ {fPrice(cashflowMensual)}</strong></div>
          <div>Rentabilidad bruta alquiler: <strong>{fPct(rentabilidadBrutaAlquiler)}%</strong></div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Resumen y recomendación</h3>
        <div>
          <div>{recomendacion}</div>
          <div style={{ marginTop: 8, color: '#6b7280' }}>
            {"Nota: reglas simples aplicadas — ROI > "}
            {roiThreshold}
            {"% y cashflow <= 0 → vender. Cashflow > 0 y rentabilidad bruta >= 3% → alquilar."}
          </div>
        </div>
      </div>
    </div>
  );
}