// ReformaCocina.jsx - Componente para planificar y analizar la rentabilidad de la reforma de la cocina

import React, { useState } from "react";
import "./ReformaCocina.css";

const createEmptyItem = () => ({
  id: crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random(),
  zona: "",
  material: "",
  color: "",
  metros: "",
  precioMetro: "",
});

const ReformaCocina = () => {
  const [partidas, setPartidas] = useState([
    {
      id: "encimera-inicial",
      zona: "Encimera",
      material: "",
      color: "",
      metros: "",
      precioMetro: "",
    },
  ]);

  const [valorViviendaActual, setValorViviendaActual] = useState("");
  const [valorViviendaPost, setValorViviendaPost] = useState("");
  const [alquilerActual, setAlquilerActual] = useState("");
  const [alquilerPost, setAlquilerPost] = useState("");
  const [horizonteAnios, setHorizonteAnios] = useState("5");
  const [otrosCostes, setOtrosCostes] = useState("");

  const handleChangePartida = (id, field, value) => {
    setPartidas((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              [field]:
                field === "metros" || field === "precioMetro"
                  ? value.replace(",", ".")
                  : value,
            }
          : p
      )
    );
  };

  const handleAddPartida = () => {
    setPartidas((prev) => [...prev, createEmptyItem()]);
  };

  const handleRemovePartida = (id) => {
    setPartidas((prev) => prev.filter((p) => p.id !== id));
  };

  const calcularCostePartida = (p) => {
    const metros = parseFloat(p.metros);
    const precioMetro = parseFloat(p.precioMetro);
    if (!Number.isFinite(metros) || !Number.isFinite(precioMetro)) return 0;
    return metros * precioMetro;
  };

  const costeMateriales = partidas.reduce(
    (acc, p) => acc + calcularCostePartida(p),
    0
  );

  const otrosCostesNum = parseFloat(
    (otrosCostes || "").toString().replace(",", ".")
  );
  const costeTotalReforma =
    costeMateriales + (Number.isFinite(otrosCostesNum) ? otrosCostesNum : 0);

  const valorActualNum = parseFloat(
    (valorViviendaActual || "").toString().replace(",", ".")
  );
  const valorPostNum = parseFloat(
    (valorViviendaPost || "").toString().replace(",", ".")
  );
  const alquilerActualNum = parseFloat(
    (alquilerActual || "").toString().replace(",", ".")
  );
  const alquilerPostNum = parseFloat(
    (alquilerPost || "").toString().replace(",", ".")
  );
  const horizonteNum = parseFloat(
    (horizonteAnios || "").toString().replace(",", ".")
  );

  // Rentabilidad por reventa (escenario base marcado por el usuario)
  let plusvaliaReforma = null;
  let roiReventa = null;
  if (
    Number.isFinite(valorActualNum) &&
    Number.isFinite(valorPostNum) &&
    costeTotalReforma > 0
  ) {
    plusvaliaReforma = valorPostNum - valorActualNum - costeTotalReforma;
    roiReventa = (plusvaliaReforma / costeTotalReforma) * 100;
  }

  // 🔹 NUEVO: Escenarios pesimista, base y optimista para la reventa
  // Usamos el incremento que tú marcas entre valor actual y valor post-reforma
  let escenariosReventa = null;
  if (
    Number.isFinite(valorActualNum) &&
    Number.isFinite(valorPostNum) &&
    costeTotalReforma > 0
  ) {
    const incrementoBruto = valorPostNum - valorActualNum;

    // Factores de cuánto "reconoce" el mercado ese incremento
    const factores = {
      pesimista: 0.7, // 70 % del incremento que tú has estimado
      base: 1.0,      // 100 % (tu estimación)
      optimista: 1.3, // 130 % del incremento
    };

    const calcEscenario = (factor) => {
      const incrementoEscenario = incrementoBruto * factor;
      const valorEscenario = valorActualNum + incrementoEscenario;
      const plusvaliaEscenario =
        valorEscenario - valorActualNum - costeTotalReforma;
      const roiEscenario =
        costeTotalReforma > 0
          ? (plusvaliaEscenario / costeTotalReforma) * 100
          : null;

      return {
        valor: valorEscenario,
        plusvalia: plusvaliaEscenario,
        roi: roiEscenario,
      };
    };

    escenariosReventa = {
      pesimista: calcEscenario(factores.pesimista),
      base: calcEscenario(factores.base),
      optimista: calcEscenario(factores.optimista),
    };
  }

  // Rentabilidad por alquiler
  let beneficioAlquiler = null;
  let roiAlquiler = null;
  if (
    Number.isFinite(alquilerActualNum) &&
    Number.isFinite(alquilerPostNum) &&
    Number.isFinite(horizonteNum) &&
    horizonteNum > 0 &&
    costeTotalReforma > 0
  ) {
    const incrementoMensual = alquilerPostNum - alquilerActualNum;
    beneficioAlquiler = incrementoMensual * 12 * horizonteNum;
    roiAlquiler = (beneficioAlquiler / costeTotalReforma) * 100;
  }

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value || 0);

  const formatPercent = (value) =>
    `${value.toFixed(1).replace(".", ",")} %`;

  return (
    <div className="reforma-root">
      <div className="reforma-container">
        <header className="reforma-header">
          <h1 className="reforma-title">
            Reforma de cocina – Análisis de costes y rentabilidad
          </h1>
          <p className="reforma-subtitle">
            Usa este panel para comparar materiales, colores y metros de la
            reforma de la cocina y estimar si compensa económicamente (reventa o
            alquiler).
          </p>
        </header>

        {/* Partidas de la reforma */}
        <section className="reforma-card">
          <div className="reforma-card-header">
            <h2 className="reforma-card-title">Partidas de la reforma</h2>
            <button
              type="button"
              onClick={handleAddPartida}
              className="reforma-button-secondary"
            >
              + Añadir partida
            </button>
          </div>

          <div className="reforma-table-wrapper">
            <table className="reforma-table">
              <thead>
                <tr>
                  <th>Zona</th>
                  <th>Material</th>
                  <th>Color</th>
                  <th className="reforma-text-right">m²</th>
                  <th className="reforma-text-right">€/m²</th>
                  <th className="reforma-text-right">Coste total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {partidas.map((p) => {
                  const coste = calcularCostePartida(p);
                  return (
                    <tr key={p.id}>
                      <td>
                        <input
                          type="text"
                          value={p.zona}
                          onChange={(e) =>
                            handleChangePartida(p.id, "zona", e.target.value)
                          }
                          placeholder="Encimera, suelo, muebles..."
                          className="reforma-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={p.material}
                          onChange={(e) =>
                            handleChangePartida(
                              p.id,
                              "material",
                              e.target.value
                            )
                          }
                          placeholder="Porcelánico, laminado..."
                          className="reforma-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={p.color}
                          onChange={(e) =>
                            handleChangePartida(p.id, "color", e.target.value)
                          }
                          placeholder="Blanco roto, madera clara..."
                          className="reforma-input"
                        />
                      </td>
                      <td className="reforma-text-right">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={p.metros}
                          onChange={(e) =>
                            handleChangePartida(p.id, "metros", e.target.value)
                          }
                          className="reforma-input-number"
                        />
                      </td>
                      <td className="reforma-text-right">
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={p.precioMetro}
                          onChange={(e) =>
                            handleChangePartida(
                              p.id,
                              "precioMetro",
                              e.target.value
                            )
                          }
                          className="reforma-input-number"
                        />
                      </td>
                      <td className="reforma-text-right reforma-cell-strong">
                        {formatCurrency(coste)}
                      </td>
                      <td className="reforma-text-right">
                        {partidas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePartida(p.id)}
                            className="reforma-link-danger"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="reforma-row-footer">
                  <td colSpan={5}>Total materiales</td>
                  <td className="reforma-text-right">
                    {formatCurrency(costeMateriales)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="reforma-footer-row">
            <div className="reforma-hint">
              Consejo: usa una partida por cada cambio importante (muebles altos,
              muebles bajos, suelo, encimera, iluminación…).
            </div>
            <div className="reforma-other-costs">
              <span>Otros costes (mano de obra, permisos…)</span>
              <input
                type="number"
                min="0"
                step="100"
                value={otrosCostes}
                onChange={(e) => setOtrosCostes(e.target.value)}
                className="reforma-input-number"
              />
            </div>
          </div>
        </section>

        {/* Resumen y rentabilidad */}
        <section className="reforma-grid">
          <div className="reforma-card">
            <h2 className="reforma-card-title">Resumen económico</h2>

            <dl className="reforma-summary-list">
              <div className="reforma-summary-row">
                <dt>Coste materiales</dt>
                <dd>{formatCurrency(costeMateriales)}</dd>
              </div>
              <div className="reforma-summary-row">
                <dt>Otros costes</dt>
                <dd>
                  {formatCurrency(
                    Number.isFinite(otrosCostesNum) ? otrosCostesNum : 0
                  )}
                </dd>
              </div>
              <div className="reforma-summary-row reforma-summary-row-total">
                <dt>Coste total reforma</dt>
                <dd>{formatCurrency(costeTotalReforma)}</dd>
              </div>
            </dl>

            <p className="reforma-note">
              No se incluyen impuestos ni otros gastos que no hayas introducido
              aquí. Puedes sumar electrodomésticos, decoración o arquitecto en
              “Otros costes”.
            </p>
          </div>

          <div className="reforma-card">
            <h2 className="reforma-card-title">Rentabilidad estimada</h2>

            {/* Reventa */}
            <div className="reforma-block">
              <h3 className="reforma-block-title">Escenario reventa</h3>
              <div className="reforma-grid-2">
                <label className="reforma-label">
                  Valor vivienda actual
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={valorViviendaActual}
                    onChange={(e) => setValorViviendaActual(e.target.value)}
                    className="reforma-input-number"
                  />
                </label>
                <label className="reforma-label">
                  Valor estimado tras reforma
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={valorViviendaPost}
                    onChange={(e) => setValorViviendaPost(e.target.value)}
                    className="reforma-input-number"
                  />
                </label>
              </div>

              <div className="reforma-highlight-box">
                <div className="reforma-summary-row">
                  <span>Plusvalía atribuible a la reforma (base)</span>
                  <span>
                    {plusvaliaReforma !== null
                      ? formatCurrency(plusvaliaReforma)
                      : "—"}
                  </span>
                </div>
                <div className="reforma-summary-row">
                  <span>ROI reventa (base)</span>
                  <span>
                    {roiReventa !== null ? formatPercent(roiReventa) : "—"}
                  </span>
                </div>
              </div>

              {/* NUEVO: tabla de escenarios pesimista / base / optimista */}
              {escenariosReventa && (
                <div className="reforma-highlight-box" style={{ marginTop: 6 }}>
                  <div className="reforma-summary-row">
                    <span>Pesimista (70 % del incremento)</span>
                    <span>
                      {formatCurrency(escenariosReventa.pesimista.plusvalia)} ·{" "}
                      {formatPercent(escenariosReventa.pesimista.roi)}
                    </span>
                  </div>
                  <div className="reforma-summary-row">
                    <span>Base (100 % del incremento)</span>
                    <span>
                      {formatCurrency(escenariosReventa.base.plusvalia)} ·{" "}
                      {formatPercent(escenariosReventa.base.roi)}
                    </span>
                  </div>
                  <div className="reforma-summary-row">
                    <span>Optimista (130 % del incremento)</span>
                    <span>
                      {formatCurrency(escenariosReventa.optimista.plusvalia)} ·{" "}
                      {formatPercent(escenariosReventa.optimista.roi)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Alquiler */}
            <div className="reforma-block">
              <h3 className="reforma-block-title">Escenario alquiler</h3>
              <div className="reforma-grid-2">
                <label className="reforma-label">
                  Alquiler mensual actual
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={alquilerActual}
                    onChange={(e) => setAlquilerActual(e.target.value)}
                    className="reforma-input-number"
                  />
                </label>
                <label className="reforma-label">
                  Alquiler mensual tras reforma
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={alquilerPost}
                    onChange={(e) => setAlquilerPost(e.target.value)}
                    className="reforma-input-number"
                  />
                </label>
                <label className="reforma-label">
                  Horizonte (años)
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={horizonteAnios}
                    onChange={(e) => setHorizonteAnios(e.target.value)}
                    className="reforma-input-number"
                  />
                </label>
              </div>

              <div className="reforma-highlight-box">
                <div className="reforma-summary-row">
                  <span>Beneficio adicional por alquiler</span>
                  <span>
                    {beneficioAlquiler !== null
                      ? formatCurrency(beneficioAlquiler)
                      : "—"}
                  </span>
                </div>
                <div className="reforma-summary-row">
                  <span>ROI alquiler</span>
                  <span>
                    {roiAlquiler !== null ? formatPercent(roiAlquiler) : "—"}
                  </span>
                </div>
              </div>
            </div>

            <p className="reforma-note">
              La rentabilidad es orientativa y no incluye impuestos, vacíos de
              alquiler ni gastos de compraventa. Te sirve como herramienta
              interna para decidir si la reforma compensa.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReformaCocina;
