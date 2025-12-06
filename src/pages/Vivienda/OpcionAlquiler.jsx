import React, { useMemo, useState } from 'react';
import './OpcionAlquiler.css';

function taxOnCapitalGain(gain) {
  if (gain <= 0) return 0;
  let remaining = gain;
  let tax = 0;
  const brackets = [
    { limit: 6000, rate: 0.19 },
    { limit: 50000, rate: 0.21 },
    { limit: 200000, rate: 0.23 },
    { limit: 300000, rate: 0.27 },
    { limit: Infinity, rate: 0.28 },
  ];

  let lower = 0;
  for (const b of brackets) {
    const upper = b.limit;
    const slice = Math.max(0, Math.min(remaining, upper - lower));
    if (slice > 0) {
      tax += slice * b.rate;
      remaining -= slice;
    }
    lower = upper;
    if (remaining <= 0) break;
  }
  return tax;
}

export default function OpcionAlquiler(props = {}) {
  // accept several optional initial values from parent to avoid repeating inputs
  const {
    precioCompra: initPrecioCompra = 200000,
    gastosCompra: initGastosCompra = 6000,
    precioVenta: initPrecioVenta = 260000,
    gastosVenta: initGastosVenta = 6000,
    valorConstruccion: initValorConstruccion = 100000,
    anosAlquiler: initAnosAlquiler = 5,
    rentaMensualP1: initRentaMensualP1 = 400,
    rentaMensualP2: initRentaMensualP2 = 400,
    entrada: initEntrada = 20000,
    añosHipoteca: initAniosHipoteca = 30,
    interesHipoteca: initInteresHipoteca = 2.5,
    ingresoBrutoP1: initIngresoBrutoP1 = 18000,
    ingresoBrutoP2: initIngresoBrutoP2 = 18000,
    porcPerdidaFiscalAnual: initPorcPerdidaFiscalAnual = 2,
    perdidaExencion: initPerdidaExencion = 0,
  } = props;

  const [precioCompra, setPrecioCompra] = useState(initPrecioCompra);
  const [gastosCompra, setGastosCompra] = useState(initGastosCompra);
  const [precioVenta, setPrecioVenta] = useState(initPrecioVenta);
  const [gastosVenta, setGastosVenta] = useState(initGastosVenta);
  const [valorConstruccion, setValorConstruccion] = useState(initValorConstruccion);
  const [anosAlquiler, setAnosAlquiler] = useState(initAnosAlquiler);
  const [rentaMensualP1, setRentaMensualP1] = useState(initRentaMensualP1);
  const [rentaMensualP2, setRentaMensualP2] = useState(initRentaMensualP2);
  const [entrada, setEntrada] = useState(initEntrada);
  const [añosHipoteca, setAniosHipoteca] = useState(initAniosHipoteca);
  const [interesHipoteca, setInteresHipoteca] = useState(initInteresHipoteca);
  const [ingresoBrutoP1, setIngresoBrutoP1] = useState(initIngresoBrutoP1);
  const [ingresoBrutoP2, setIngresoBrutoP2] = useState(initIngresoBrutoP2);
  const [porcPerdidaFiscalAnual, setPorcPerdidaFiscalAnual] = useState(initPorcPerdidaFiscalAnual);
  const [perdidaExencion, setPerdidaExencion] = useState(initPerdidaExencion);

  const rentaMensualTotal = Number(rentaMensualP1 || 0) + Number(rentaMensualP2 || 0);

  const amortizacionAnual = useMemo(() => (valorConstruccion * 0.03), [valorConstruccion]);
  const amortizacionAcumulada = useMemo(() => amortizacionAnual * anosAlquiler, [amortizacionAnual, anosAlquiler]);

  const adquisicionAjustada = useMemo(() => (precioCompra - amortizacionAcumulada), [precioCompra, amortizacionAcumulada]);

  const gananciaSinAmort = useMemo(() => {
    const g = precioVenta - precioCompra - (Number(gastosCompra || 0) + Number(gastosVenta || 0));
    return Math.max(0, g);
  }, [precioVenta, precioCompra, gastosCompra, gastosVenta]);

  const gananciaConAmort = useMemo(() => {
    const g = precioVenta - adquisicionAjustada - (Number(gastosCompra || 0) + Number(gastosVenta || 0));
    return Math.max(0, g);
  }, [precioVenta, adquisicionAjustada, gastosCompra, gastosVenta]);

  const impuestoSinAmort = useMemo(() => taxOnCapitalGain(gananciaSinAmort), [gananciaSinAmort]);
  const impuestoConAmort = useMemo(() => taxOnCapitalGain(gananciaConAmort), [gananciaConAmort]);

  const incrementoImpuestoPorAmort = useMemo(() => Math.max(0, impuestoConAmort - impuestoSinAmort), [impuestoConAmort, impuestoSinAmort]);

  const perdidaFiscalEstim = useMemo(() => (precioCompra * (Number(porcPerdidaFiscalAnual || 0) / 100) * anosAlquiler), [precioCompra, porcPerdidaFiscalAnual, anosAlquiler]);

  const totalRentasRecibidas = useMemo(() => rentaMensualTotal * 12 * anosAlquiler, [rentaMensualTotal, anosAlquiler]);

  // Hipoteca: método francés (anualidad)
  const importeFinanciado = useMemo(() => Math.max(0, precioCompra - (Number(entrada) || 0)), [precioCompra, entrada]);
  const cuotaHipotecaMensual = useMemo(() => {
    const P = Number(importeFinanciado || 0);
    const n = Math.max(1, Number(añosHipoteca || 0)) * 12;
    const r = (Number(interesHipoteca) || 0) / 100 / 12;
    if (P <= 0 || n <= 0) return 0;
    if (r === 0) return P / n;
    return (P * r) / (1 - Math.pow(1 + r, -n));
  }, [importeFinanciado, añosHipoteca, interesHipoteca]);

  // Simular intereses pagados hasta anosAlquiler y saldo restante
  const { interesesPagadosHipotecaHasta, saldoHipotecaRestante } = useMemo(() => {
    const P = Number(importeFinanciado || 0);
    const nTotal = Math.max(1, Number(añosHipoteca || 0)) * 12;
    const mesesHasta = Math.min(nTotal, Math.max(0, Number(anosAlquiler || 0)) * 12);
    const r = (Number(interesHipoteca) || 0) / 100 / 12;
    let saldo = P;
    let interesesAcum = 0;
    const cuota = cuotaHipotecaMensual;
    for (let m = 0; m < mesesHasta && saldo > 0; m++) {
      const interesMes = saldo * r;
      const amortizacion = cuota - interesMes;
      // defensiva
      if (!isFinite(amortizacion)) break;
      saldo = Math.max(0, saldo - amortizacion);
      interesesAcum += interesMes;
    }
    return { interesesPagadosHipotecaHasta: interesesAcum, saldoHipotecaRestante: saldo };
  }, [importeFinanciado, añosHipoteca, interesHipoteca, anosAlquiler, cuotaHipotecaMensual]);

  // Break-even monthly rent (total per month, both partners) to cover the extra tax + fiscal losses + exencion loss
  const breakEvenMonthlyTotal = useMemo(() => {
    const need = incrementoImpuestoPorAmort + perdidaFiscalEstim + Number(perdidaExencion || 0);
    const denom = Math.max(1, 12 * Math.max(anosAlquiler, 1));
    return need / denom;
  }, [incrementoImpuestoPorAmort, perdidaFiscalEstim, perdidaExencion, anosAlquiler]);

  function handlePresetP1(amount) { setRentaMensualP1(amount); }
  function handlePresetP2(amount) { setRentaMensualP2(amount); }

  return (
    <div className="opcion-alquiler">
      <h2>Opción: Alquilar vs Vender (estimador)</h2>

      <section className="inputs">
        <label>Precio de compra (€)
          <input type="number" value={precioCompra} onChange={e => setPrecioCompra(Number(e.target.value))} />
        </label>

        <label>Gastos compra (€)
          <input type="number" value={gastosCompra} onChange={e => setGastosCompra(Number(e.target.value))} />
        </label>

        <label>Precio estimado de venta (€)
          <input type="number" value={precioVenta} onChange={e => setPrecioVenta(Number(e.target.value))} />
        </label>

        <label>Gastos venta (€)
          <input type="number" value={gastosVenta} onChange={e => setGastosVenta(Number(e.target.value))} />
        </label>

        <label>Valor de construcción (base amortización) (€)
          <input type="number" value={valorConstruccion} onChange={e => setValorConstruccion(Number(e.target.value))} />
        </label>

        <label>Entrada (€)
          <input type="number" value={entrada} onChange={e => setEntrada(Number(e.target.value))} />
        </label>

        <label>Años hipoteca
          <input type="number" min="1" value={añosHipoteca} onChange={e => setAniosHipoteca(Number(e.target.value))} />
        </label>

        <label>Interés hipoteca anual (%)
          <input type="number" step="0.01" value={interesHipoteca} onChange={e => setInteresHipoteca(Number(e.target.value))} />
        </label>

        <label>Años de alquiler
          <input type="number" min="0" value={anosAlquiler} onChange={e => setAnosAlquiler(Number(e.target.value))} />
        </label>
      </section>

      <section className="rentas">
        <h3>Estimado de renta / pareja (somos 2)</h3>
        <div className="renta-row">
          <div>
            <div className="label">Renta mensual - Persona 1 (€)</div>
            <input type="number" value={rentaMensualP1} onChange={e => setRentaMensualP1(Number(e.target.value))} />
            <div className="presets">
              <button type="button" onClick={() => handlePresetP1(0)}>0</button>
              <button type="button" onClick={() => handlePresetP1(300)}>300</button>
              <button type="button" onClick={() => handlePresetP1(500)}>500</button>
              <button type="button" onClick={() => handlePresetP1(700)}>700</button>
            </div>
          </div>

          <div>
            <div className="label">Renta mensual - Persona 2 (€)</div>
            <input type="number" value={rentaMensualP2} onChange={e => setRentaMensualP2(Number(e.target.value))} />
            <div className="presets">
              <button type="button" onClick={() => handlePresetP2(0)}>0</button>
              <button type="button" onClick={() => handlePresetP2(300)}>300</button>
              <button type="button" onClick={() => handlePresetP2(500)}>500</button>
              <button type="button" onClick={() => handlePresetP2(700)}>700</button>
            </div>
          </div>
        </div>
      </section>

      <section className="assumptions">
        <h4>Asunciones y ajustes</h4>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <label>Ingreso bruto anual - Persona 1 (€)
            <input type="number" value={ingresoBrutoP1} onChange={e => setIngresoBrutoP1(Number(e.target.value))} />
          </label>

          <label>Ingreso bruto anual - Persona 2 (€)
            <input type="number" value={ingresoBrutoP2} onChange={e => setIngresoBrutoP2(Number(e.target.value))} />
          </label>
        </div>
        <label>Porcentaje anual perdido por cambio fiscal (%)
          <input type="number" value={porcPerdidaFiscalAnual} onChange={e => setPorcPerdidaFiscalAnual(Number(e.target.value))} />
        </label>
        <label>Estimación pérdida exención por reinversión (€)
          <input type="number" value={perdidaExencion} onChange={e => setPerdidaExencion(Number(e.target.value))} />
        </label>
        <p className="note">Nota: la amortización anual se fija en 3% del valor de construcción. Al vender, la amortización acumulada reduce el valor de adquisición y por tanto puede aumentar la ganancia patrimonial sujeta a IRPF.</p>
      </section>

      <section className="results">
        <h3>Resultados</h3>
        <div className="results-grid">
          <div className="result-item">
            <div><strong>Renta mensual total:</strong> € {rentaMensualTotal.toFixed(2)}</div>
            <div className="formula">Fórmula: renta1 + renta2 = {Number(rentaMensualP1).toLocaleString()} + {Number(rentaMensualP2).toLocaleString()} = {rentaMensualTotal.toLocaleString()}</div>
          </div>

          <div className="result-item">
            <div><strong>Total rentas recibidas (periodo):</strong> € {totalRentasRecibidas.toFixed(2)}</div>
            <div className="formula">Fórmula: renta mensual total × 12 × años = {rentaMensualTotal.toLocaleString()} × 12 × {anosAlquiler} = {totalRentasRecibidas.toLocaleString()}</div>
          </div>

          <div className="result-item">
            <div><strong>Amortización anual (3% construcción):</strong> € {amortizacionAnual.toFixed(2)}</div>
            <div className="formula">Fórmula: 3% × valor construcción = 0.03 × {valorConstruccion.toLocaleString()} = {amortizacionAnual.toLocaleString()}</div>
          </div>

          <div className="result-item">
            <div><strong>Amortización acumulada ({anosAlquiler} años):</strong> € {amortizacionAcumulada.toFixed(2)}</div>
            <div className="formula">Fórmula: amortización anual × años = {amortizacionAnual.toLocaleString()} × {anosAlquiler} = {amortizacionAcumulada.toLocaleString()}</div>
          </div>

          <div className="result-item">
            <div><strong>Adquisición ajustada tras amortización:</strong> € {adquisicionAjustada.toFixed(2)}</div>
            <div className="formula">Fórmula: precio compra − amortización acumulada = {precioCompra.toLocaleString()} − {amortizacionAcumulada.toLocaleString()} = {adquisicionAjustada.toLocaleString()}</div>
          </div>

          <div className="result-item">
            <div><strong>Ganancia patrimonial sin amortización:</strong> € {gananciaSinAmort.toFixed(2)}</div>
            <div className="formula">Fórmula: venta − compra − gastos compra/venta = {precioVenta.toLocaleString()} − {precioCompra.toLocaleString()} − ({gastosCompra.toLocaleString()} + {gastosVenta.toLocaleString()}) = {gananciaSinAmort.toLocaleString()}</div>
          </div>

          <div className="result-item">
            <div><strong>Impuesto estimado sin amortización:</strong> € {impuestoSinAmort.toFixed(2)}</div>
            <div className="formula">Fórmula: aplicar tramos marginales (19%/21%/23%/27%/28%) sobre la ganancia. Ejemplo: taxOnCapitalGain({gananciaSinAmort.toLocaleString()}) = {impuestoSinAmort.toLocaleString()}</div>
          </div>

          <div className="result-item">
            <div><strong>Ganancia patrimonial con amortización:</strong> € {gananciaConAmort.toFixed(2)}</div>
            <div className="formula">Fórmula: venta − (compra − amort. acumulada) − gastos = {precioVenta.toLocaleString()} − ({precioCompra.toLocaleString()} − {amortizacionAcumulada.toLocaleString()}) − ({gastosCompra.toLocaleString()} + {gastosVenta.toLocaleString()}) = {gananciaConAmort.toLocaleString()}</div>
          </div>

          <div className="result-item">
            <div><strong>Impuesto estimado con amortización:</strong> € {impuestoConAmort.toFixed(2)}</div>
            <div className="formula">Fórmula: aplicar tramos marginales sobre la ganancia con amortización. taxOnCapitalGain({gananciaConAmort.toLocaleString()}) = {impuestoConAmort.toLocaleString()}</div>
          </div>

          <div className="result-item">
            <div><strong>Aumento de impuesto por amortización:</strong> € {incrementoImpuestoPorAmort.toFixed(2)}</div>
            <div className="formula">Fórmula: impuesto con amortización − impuesto sin amortización = {impuestoConAmort.toLocaleString()} − {impuestoSinAmort.toLocaleString()} = {incrementoImpuestoPorAmort.toLocaleString()}</div>
          </div>

          <div className="result-item">
            <div><strong>Pérdida fiscal estimada (porcentaje):</strong> € {perdidaFiscalEstim.toFixed(2)}</div>
            <div className="formula">Fórmula (estimada): precio compra × (porcentaje/100) × años = {precioCompra.toLocaleString()} × ({porcPerdidaFiscalAnual} ÷ 100) × {anosAlquiler} = {perdidaFiscalEstim.toLocaleString()}</div>
          </div>

          <div className="result-item">
            <div><strong>Break-even renta mensual total (ambos):</strong> € {breakEvenMonthlyTotal.toFixed(2)} / mes</div>
            <div className="formula">Fórmula: (incremento impuesto + pérdida fiscal estimada + pérdida exención) ÷ (12 × años) = ({incrementoImpuestoPorAmort.toLocaleString()} + {perdidaFiscalEstim.toLocaleString()} + {Number(perdidaExencion || 0).toLocaleString()}) ÷ (12 × {anosAlquiler}) = {breakEvenMonthlyTotal.toLocaleString()}</div>
          </div>

          <div className="result-item">
            <div><strong>Break-even por persona (50/50):</strong> € {(breakEvenMonthlyTotal/2).toFixed(2)} / mes</div>
            <div className="formula">Fórmula: break-even total ÷ 2 = {breakEvenMonthlyTotal.toLocaleString()} ÷ 2 = {(breakEvenMonthlyTotal/2).toLocaleString()}</div>
          </div>

          <div className="result-item">
            <div><strong>Importe financiado (hipoteca):</strong> {importeFinanciado.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
            <div className="formula">Fórmula: precio compra − entrada = {precioCompra.toLocaleString()} − {entrada.toLocaleString()} = {importeFinanciado.toLocaleString()}</div>
          </div>

          <div className="result-item">
            <div><strong>Cuota mensual (método francés):</strong> {cuotaHipotecaMensual.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
            <div className="formula">Fórmula: cuota = P·r / (1 − (1+r)^−n) donde r = interés anual/12, n = meses totales</div>
          </div>

          <div className="result-item">
            <div><strong>Intereses pagados hasta {anosAlquiler} años:</strong> {interesesPagadosHipotecaHasta.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
            <div className="formula">Suma de intereses mensuales pagados durante {anosAlquiler} años según cuota y saldo pendiente (simulación mes a mes)</div>
          </div>

          <div className="result-item">
            <div><strong>Saldo pendiente tras {anosAlquiler} años:</strong> {saldoHipotecaRestante.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
            <div className="formula">Saldo restante calculado tras aplicar amortizaciones mensuales según método francés.</div>
          </div>

          <div className="result-item">
            <div><strong>Ingreso bruto anual (Persona 1):</strong> {ingresoBrutoP1.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
            <div className="formula">Ingresos brutos anuales utilizados para estimar impacto fiscal.</div>
          </div>

          <div className="result-item">
            <div><strong>Ingreso bruto anual (Persona 2):</strong> {ingresoBrutoP2.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
            <div className="formula">Ingresos brutos anuales utilizados para estimar impacto fiscal.</div>
          </div>

          <div className="result-item">
            <div><strong>Impuesto estimado sobre ganancia (con amortización):</strong> € {impuestoConAmort.toFixed(2)}</div>
            <div className="formula">Se muestra también el reparto hipotético 50/50 por persona abajo.</div>
          </div>

          <div className="result-item">
            <div><strong>Impuesto por persona (50/50)</strong></div>
            <strong>{(impuestoConAmort/2).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</strong>
            <div className="formula">Fórmula: impuesto total ÷ 2 = {impuestoConAmort.toLocaleString()} ÷ 2 = {(impuestoConAmort/2).toLocaleString()}</div>
          </div>

          <div className="result-item">
            <div><strong>% del impuesto (por persona) respecto a su ingreso bruto</strong></div>
            <strong>{
              (() => {
                const p = ingresoBrutoP1 || 0;
                return p > 0 ? ((impuestoConAmort/2)/p*100).toFixed(2) + '%' : '-';
              })()
            }</strong>
            <div className="formula">Persona 1: impuesto/ingreso bruto anual × 100</div>
          </div>

          <div className="result-item">
            <div><strong>% del impuesto (por persona) respecto a su ingreso bruto</strong></div>
            <strong>{
              (() => {
                const p = ingresoBrutoP2 || 0;
                return p > 0 ? ((impuestoConAmort/2)/p*100).toFixed(2) + '%' : '-';
              })()
            }</strong>
            <div className="formula">Persona 2: impuesto/ingreso bruto anual × 100</div>
          </div>
        </div>

        <div className="explain">
          <h4>Interpretación</h4>
          <p>El <em>break-even</em> mostrado indica la renta mensual total (suma de ambos) necesaria para que los ingresos por alquiler acumulados cubran el incremento de impuesto por amortizaciones acumuladas más la estimación de pérdida fiscal y la pérdida de exención que hayas introducido.</p>
          <p>Detalles fiscales: la función de impuesto aplica los tramos marginales siguientes (2025): 19% hasta 6.000 €, 21% desde 6.000 a 50.000 €, 23% 50.000–200.000 €, 27% 200.000–300.000 €, 28% &gt; 300.000 €. El cálculo es progresivo por tramos.</p>
          <p>Advertencia: estos cálculos son aproximaciones. No sustituyen asesoría fiscal. Si quieres, puedo añadir el cálculo del IRPF anual sobre rendimientos de alquiler y el impacto por tipo marginal personal.</p>
        </div>
      </section>
    </div>
  );
}
