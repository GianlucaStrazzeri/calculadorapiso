import React, { useState, useEffect, useMemo } from 'react';
import CreadorDeEscenariosHipotecarios from './CreadorDeEscenariosHipotecarios';
import EvolucionDelPrecio from './EvolucionDelPrecio';
import EscenariosHipotecas from './EscenariosHipotecas';
import ReformaCocina from './ReformaCocina';
import OpcionAlquiler from './OpcionAlquiler';
import EvaluaGPT from './EvaluaGPT';
import ViviendaDashboard from './ViviendaDashboard';
import WebPageGptModal from '../FetchWeb/WebPageGptModal';

function DecisionVivienda() {

  // --- Estado inicial (valores por defecto razonables) ---
  const [precioCompra, setPrecioCompra] = useState(130000);
  const [valorMercadoActual, setValorMercadoActual] = useState(0);
  const [entrada, setEntrada] = useState(0);
  const [interes, setInteres] = useState(2.5);
  const [añosHipoteca, setAniosHipoteca] = useState(30);
  const [añosFijo, setAniosFijo] = useState(0);
  const [euribor, setEuribor] = useState(3.0);
  const [margen, setMargen] = useState(1.0);
  const [gestorHipotecario, setGestorHipotecario] = useState(0);
  const [gastosNotaria, setGastosNotaria] = useState(1500);
  const [alquilerActual, setAlquilerActual] = useState(0);
  const [ibiBasura, setIbiBasura] = useState(0);
  const [comunidad, setComunidad] = useState(0);
  const [porcentajeRevalorizacion, setPorcentajeRevalorizacion] = useState(2);
  const [anioVenta, setAnioVenta] = useState(5);
  const [mejoras, setMejoras] = useState(0);
  const [precioVentaManual, setPrecioVentaManual] = useState(0);
  const [alquilerPosible, setAlquilerPosible] = useState(0);
  const [tipoHipoteca, setTipoHipoteca] = useState('variable');
  // Extra inputs used in the "Mercado del alquiler" modal
  const [comunidadMercado, setComunidadMercado] = useState(Number(comunidad) || 0);
  const [ibiAnualMercado, setIbiAnualMercado] = useState(Number(ibiBasura) || 0);
  const [basuraAnualMercado, setBasuraAnualMercado] = useState(0);
  const [seguroAnualMercado, setSeguroAnualMercado] = useState(0);
  const [perdidaDeduccionesAnualMercado, setPerdidaDeduccionesAnualMercado] = useState(3000);
  const [intereses3AniosMercado, setIntereses3AniosMercado] = useState(0);
  const [useSimulatedInteresesMercado, setUseSimulatedInteresesMercado] = useState(true);

  // Derived simple values
  const importeFinanciado = Math.max((Number(precioCompra) || 0) - (Number(entrada) || 0), 0);
  const mesesTotales = Math.max(Number(añosHipoteca) || 0, 0) * 12;
  const fixedMonthlyRate = ((Number(interes) || 0) / 100) / 12;
  const variableMonthlyRate = ((Number(euribor) || 0) + (Number(margen) || 0)) / 100 / 12;

  // helper: annuity payment
  function annuity(principal, monthlyRate, months) {
    if (!principal || months <= 0) return 0;
    if (!monthlyRate) return principal / months;
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }

  // compute initial (fixed) monthly payment based on fixed rate over full term
  const cuotaInicial = annuity(importeFinanciado, fixedMonthlyRate, mesesTotales);

  // simulate amortization through fixed period to compute remaining principal
  const fixedMonths = Math.min(Math.max(Number(añosFijo) || 0, 0) * 12, mesesTotales);
  let saldoAfterFixed = importeFinanciado;
  if (cuotaInicial > 0 && fixedMonths > 0) {
    for (let m = 0; m < fixedMonths && saldoAfterFixed > 0; m++) {
      const interesMes = saldoAfterFixed * fixedMonthlyRate;
      const amort = cuotaInicial - interesMes;
      saldoAfterFixed = Math.max(saldoAfterFixed - amort, 0);
    }
  }

  const variableMonths = Math.max(mesesTotales - fixedMonths, 0);
  const cuotaAfterFixed = variableMonths > 0 ? annuity(saldoAfterFixed, variableMonthlyRate, variableMonths) : 0;

  // cuotaMensual shown is cuotaInicial if there's a fixed period, else cuotaAfterFixed
  const cuotaMensual = fixedMonths > 0 ? cuotaInicial : cuotaAfterFixed;

  // total estimated interest across the full term (fixed + variable)
  const totalInteresesEstimados = useMemo(() => {
    if (!importeFinanciado || mesesTotales <= 0) return 0;
    const fm = Math.min(Math.max(Number(añosFijo) || 0, 0) * 12, mesesTotales);
    const vm = Math.max(mesesTotales - fm, 0);
    let saldoSim = importeFinanciado;
    let interesesSum = 0;
    const cuotaIniLocal = cuotaInicial;
    const cuotaAfterLocal = cuotaAfterFixed;

    for (let m = 0; m < mesesTotales && saldoSim > 0; m++) {
      const isFixed = m < fm;
      const rate = isFixed ? fixedMonthlyRate : variableMonthlyRate;
      const cuota = isFixed ? cuotaIniLocal : cuotaAfterLocal;
      const interesMes = saldoSim * rate;
      const amort = cuota - interesMes;
      saldoSim = Math.max(saldoSim - amort, 0);
      interesesSum += interesMes;
    }
    return interesesSum;
  }, [importeFinanciado, cuotaInicial, cuotaAfterFixed, fixedMonthlyRate, variableMonthlyRate, mesesTotales, añosFijo]);

  // Gastos anuales fijos de la vivienda (solo IBI+basura + comunidad)
  const gastosAnualesVivienda = (Number(ibiBasura) || 0) + (Number(comunidad) || 0) * 12;

  // Modal / UI visibility flags
  const [showCreator, setShowCreator] = useState(false);
  const [showAlicanteChart, setShowAlicanteChart] = useState(false);
  const [showEvolucionVentaModal, setShowEvolucionVentaModal] = useState(false);
  const [showDashboardEconomico, setShowDashboardEconomico] = useState(false);
  const [showAlquilarModal, setShowAlquilarModal] = useState(false);
  const [showROIModal, setShowROIModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showReforma, setShowReforma] = useState(false);
  const [showAlicanteInfo, setShowAlicanteInfo] = useState(false);

  // Section hide toggles — start hidden so the page shows only header buttons
  const [hideDatosTabla, setHideDatosTabla] = useState(true);
  const [hideSection1, setHideSection1] = useState(true);
  const [hideSection2, setHideSection2] = useState(true);
  const [hideSection3, setHideSection3] = useState(true);
  const [hideSection4, setHideSection4] = useState(true);
  const [hideSection5, setHideSection5] = useState(true);
  const [showAlquilerMercadoModal, setShowAlquilerMercadoModal] = useState(false);

  // Evolución del precio de la vivienda según revalorización anual,
  // usando como base el valor de mercado que tú estimes (no el precio de compra)
  const añosSimulacion = 10;
  const baseValor =
    valorMercadoActual && valorMercadoActual > 0
      ? valorMercadoActual
      : precioCompra;

  const evolucionPrecio = useMemo(
    () =>
      Array.from({ length: añosSimulacion + 1 }, (_, i) => {
        const precioAño =
          baseValor * Math.pow(1 + porcentajeRevalorizacion / 100, i);
        return { año: i, precio: precioAño };
      }),
    [baseValor, porcentajeRevalorizacion]
  );

  // Precio estimado de venta en el año seleccionado según la tabla
  const filaVenta =
    evolucionPrecio.find((f) => f.año === anioVenta) ||
    evolucionPrecio[evolucionPrecio.length - 1];

  const precioVentaEstimadoTabla = filaVenta?.precio ?? baseValor;

  // Precio de venta usado en cálculos:
  // - Si has escrito un precio manual > 0 -> usamos ese
  // - Si no, usamos el de la tabla
  const precioVentaUsado =
    precioVentaManual && precioVentaManual > 0
      ? precioVentaManual
      : precioVentaEstimadoTabla;

  // Impuestos de compra según año de venta:
  // Impuesto de compra: permite seleccionar manualmente (valores frecuentes: 0, 6, 8, 10)
  const defaultImpuestoCompra = anioVenta < 3 ? 10 : 8;
  const [impuestoCompraPercent, setImpuestoCompraPercent] = useState(defaultImpuestoCompra);
  const impuestosCompra = (precioCompra * (impuestoCompraPercent || 0)) / 100;

  // Intereses pagados hasta el año de venta + saldo restante de hipoteca en ese momento
  const {
    interesesPagadosHastaVenta,
    saldoRestanteHipoteca,
    mesesHastaVenta,
  } = useMemo(() => {
    if (importeFinanciado <= 0 || cuotaMensual <= 0) {
      return {
        interesesPagadosHastaVenta: 0,
        saldoRestanteHipoteca: 0,
        mesesHastaVenta: 0,
      };
    }

    const mesesHasta = Math.min(anioVenta * 12, mesesTotales);
    let saldo = importeFinanciado;
    let interesesAcumulados = 0;

    const fixedMonths = Math.min(Math.max(Number(añosFijo) || 0, 0) * 12, mesesTotales);
    const cuotaIni = cuotaInicial;
    const cuotaAfter = cuotaAfterFixed;

    for (let i = 0; i < mesesHasta && saldo > 0; i++) {
      const isFixed = i < fixedMonths;
      const rate = isFixed ? fixedMonthlyRate : variableMonthlyRate;
      const cuota = isFixed ? cuotaIni : cuotaAfter;
      const interesMes = saldo * rate;
      interesesAcumulados += interesMes;
      const amortizacion = cuota - interesMes;
      saldo = Math.max(saldo - amortizacion, 0);
    }

    return {
      interesesPagadosHastaVenta: interesesAcumulados,
      saldoRestanteHipoteca: saldo,
      mesesHastaVenta: mesesHasta,
    };
  }, [
    importeFinanciado,
    cuotaMensual,
    cuotaInicial,
    cuotaAfterFixed,
    fixedMonthlyRate,
    variableMonthlyRate,
    añosFijo,
    anioVenta,
    mesesTotales,
  ]);

  // Coste de seguir de alquiler (escenario alternativo)
  const gastoAlquilerAnual = alquilerActual * 12;
  const gastoAlquilerAcumulado = gastoAlquilerAnual * anioVenta;

  // PLUSVALÍA (concepto fiscal) - explicada:
  // baseImponible = precioCompra + impuestosCompra + interesesPagadosHastaVenta + mejoras
  // plusvalía bruta = precioVentaUsado - baseImponible
  const baseImponible =
    precioCompra + impuestosCompra + interesesPagadosHastaVenta + mejoras + gestorHipotecario;

  const plusvaliaBruta = precioVentaUsado - baseImponible;

  // Impuesto al vender: 10% de la plusvalía (si es positiva)
  const impuestoPlusvaliaVenta = plusvaliaBruta > 0 ? plusvaliaBruta * 0.1 : 0;

  // Impuesto hipotético adicional del 2% si vendes antes del año 3
  // (por dejar de ser vivienda habitual según el escenario que planteas)
  const impuestoHipoteticoNoViviendaHabitual = anioVenta < 3 ? precioVentaUsado * 0.02 : 0;

  // plusvalía neta después de impuestos aplicables
  const plusvaliaNeta =
    plusvaliaBruta - impuestoPlusvaliaVenta - impuestoHipoteticoNoViviendaHabitual;

  // Dinero que te queda "en la cuenta" al vender:
  // Dinero neto tras vender = precioVentaUsado - hipoteca restante - impuestos de venta
  const impuestosVentaTotales =
    impuestoPlusvaliaVenta + impuestoHipoteticoNoViviendaHabitual;

  const dineroNetoEnCuenta =
    precioVentaUsado - saldoRestanteHipoteca - impuestosVentaTotales;

  // Inversión de dinero propio en la operación (cash que has puesto):
  // entrada + notaría + impuestos de compra + mejoras
  const inversionEfectivo =
    entrada + gastosNotaria + impuestosCompra + mejoras + gestorHipotecario;

  // ROI de la operación (solo sobre la plusvalía neta vs efectivo invertido)
  const roi =
    inversionEfectivo > 0 ? (plusvaliaNeta / inversionEfectivo) * 100 : 0;

  // ---- ESCENARIOS POR AÑO PARA EL GRÁFICO DE RENTABILIDAD ----
  // Importante: el gráfico usa SIEMPRE la estimación por revalorización (no el precio manual),
  // para ver cómo se comporta el escenario año a año de forma coherente.
  const escenariosPorAño = useMemo(() => {
    // Si no hay hipoteca financiada, simplificamos los cálculos
    if (importeFinanciado <= 0) {
      return Array.from({ length: añosSimulacion }, (_, idx) => {
        const año = idx + 1;
        const fila = evolucionPrecio.find((f) => f.año === año);
        const precioVenta = fila ? fila.precio : baseValor;
        const tipoImp = año < 3 ? 10 : 8;
        const impCompraEsc = (precioCompra * tipoImp) / 100;
        const plusBrutaEsc =
          precioVenta - (precioCompra + impCompraEsc + mejoras);
        const impPlusEsc = plusBrutaEsc > 0 ? plusBrutaEsc * 0.1 : 0;
        const impHipoteticoEsc = año < 3 ? precioVenta * 0.02 : 0;
        const plusNetaEsc =
          plusBrutaEsc - impPlusEsc - impHipoteticoEsc;
        const inversionEsc =
          entrada + gastosNotaria + impCompraEsc + mejoras;
        const roiEsc =
          inversionEsc > 0 ? (plusNetaEsc / inversionEsc) * 100 : 0;

        return {
          año,
          precioVenta,
          roi: roiEsc,
        };
      });
    }

    const escenarios = [];

    for (let año = 1; año <= añosSimulacion; año++) {
      const mesesHasta = Math.min(año * 12, mesesTotales);
      let saldo = importeFinanciado;
      let interesesAcumulados = 0;

      const fixedMonths = Math.min(Math.max(Number(añosFijo) || 0, 0) * 12, mesesTotales);
      const cuotaIni = cuotaInicial;
      const cuotaAfter = cuotaAfterFixed;

      for (let i = 0; i < mesesHasta && saldo > 0; i++) {
        const isFixed = i < fixedMonths;
        const rate = isFixed ? fixedMonthlyRate : variableMonthlyRate;
        const cuota = isFixed ? cuotaIni : cuotaAfter;
        const interesMes = saldo * rate;
        interesesAcumulados += interesMes;
        const amortizacion = cuota - interesMes;
        saldo = Math.max(saldo - amortizacion, 0);
      }

      const fila = evolucionPrecio.find((f) => f.año === año);
      const precioVentaEsc = fila ? fila.precio : baseValor;
      const tipoImp = año < 3 ? 10 : 8;
      const impCompraEsc = (precioCompra * tipoImp) / 100;

      const plusBrutaEsc =
        precioVentaEsc -
        (precioCompra + impCompraEsc + interesesAcumulados + mejoras);

      const impPlusEsc = plusBrutaEsc > 0 ? plusBrutaEsc * 0.1 : 0;
      const impHipoteticoEsc = año < 3 ? precioVentaEsc * 0.02 : 0;

      const plusNetaEsc =
        plusBrutaEsc - impPlusEsc - impHipoteticoEsc;

      const inversionEsc =
        entrada + gastosNotaria + impCompraEsc + mejoras;

      const roiEsc =
        inversionEsc > 0 ? (plusNetaEsc / inversionEsc) * 100 : 0;

      escenarios.push({
        año,
        precioVenta: precioVentaEsc,
        roi: roiEsc,
      });
    }

    return escenarios;
  }, [
    añosSimulacion,
    evolucionPrecio,
    baseValor,
    importeFinanciado,
    cuotaInicial,
    cuotaAfterFixed,
    fixedMonthlyRate,
    variableMonthlyRate,
    añosFijo,
    mesesTotales,
    precioCompra,
    mejoras,
    entrada,
    gastosNotaria,
  ]);

  // Persistencia de escenarios y etiquetas de escenarios
  const SCENARIOS_KEY = "dv_escenarios_vivienda";
  const LABELS_KEY = "dv_labels_vivienda";

  const [scenarioName, setScenarioName] = useState("");
  const [escenariosGuardados, setEscenariosGuardados] = useState([]);
  const [scenarioLabels, setScenarioLabels] = useState([
    "muy muy positivo",
    "positivo",
    "neutro",
    "negativo",
    "muy negativo",
  ]);

  const [editarLabels, setEditarLabels] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SCENARIOS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setEscenariosGuardados(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      console.warn("No se pudieron cargar escenarios guardados", e);
    }

    try {
      const rawLabels = localStorage.getItem(LABELS_KEY);
      if (rawLabels) setScenarioLabels(JSON.parse(rawLabels));
    } catch (e) {
      console.warn("No se pudieron cargar etiquetas de escenarios", e);
    }
  }, []);

  function saveScenario() {
    const payload = {
      name: scenarioName || `Escenario ${new Date().toLocaleString()}`,
      timestamp: Date.now(),
      data: {
        precioCompra,
        valorMercadoActual,
        entrada,
        interes,
        gastosNotaria,
        alquilerActual,
        ibiBasura,
        comunidad,
        porcentajeRevalorizacion,
        anioVenta,
        mejoras,
        precioVentaManual,
        alquilerPosible,
        añosHipoteca,
        importeFinanciado,
        cuotaMensual,
        añosFijo,
        euribor,
        margen,
        totalInteresesEstimados,
        impuestoCompraPercent,
        impuestosCompra,
        // labels también como parte del escenario
        scenarioLabels,
      },
    };

    const prev = Array.isArray(escenariosGuardados) ? escenariosGuardados : [];
    const next = [payload, ...prev].slice(0, 50);
    setEscenariosGuardados(next);
    try {
      localStorage.setItem(SCENARIOS_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("No se pudo guardar escenario", e);
    }
    setScenarioName("");
  }

  function updateScenarioName(idx, newName) {
    const prev = Array.isArray(escenariosGuardados) ? escenariosGuardados : [];
    const next = [...prev];
    if (!next[idx]) return;
    next[idx] = { ...next[idx], name: newName };
    setEscenariosGuardados(next);
    try {
      localStorage.setItem(SCENARIOS_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("No se pudo actualizar nombre del escenario", e);
    }
  }

  function loadScenario(idx) {
    const s = escenariosGuardados[idx];
    if (!s) return;
    const d = s.data || {};
    setPrecioCompraFromSaved(d.precioCompra);
    setValorMercadoActualFromSaved(d.valorMercadoActual);
    setEntradaFromSaved(d.entrada);
    setInteresFromSaved(d.interes);
    setGastosNotariaFromSaved(d.gastosNotaria);
    setAlquilerActualFromSaved(d.alquilerActual);
    setIbiBasuraFromSaved(d.ibiBasura);
    setComunidadFromSaved(d.comunidad);
    setPorcentajeRevalorizacionFromSaved(d.porcentajeRevalorizacion);
    setAnioVentaFromSaved(d.anioVenta);
    setMejorasFromSaved(d.mejoras);
    setPrecioVentaManualFromSaved(d.precioVentaManual);
    setAlquilerPosibleFromSaved(d.alquilerPosible);
    setAniosHipoteca(d.añosHipoteca || añosHipoteca);
    if (typeof d.añosFijo === 'number') setAniosFijoFromSaved(d.añosFijo);
    if (typeof d.euribor === 'number') setEuriborFromSaved(d.euribor);
    if (typeof d.margen === 'number') setMargenFromSaved(d.margen);
    if (typeof d.impuestoCompraPercent === 'number') setImpuestoCompraPercentFromSaved(d.impuestoCompraPercent);
    if (d.scenarioLabels) setScenarioLabels(d.scenarioLabels);
  }

  function deleteScenario(idx) {
    const prev = Array.isArray(escenariosGuardados) ? escenariosGuardados : [];
    const next = prev.filter((_, i) => i !== idx);
    setEscenariosGuardados(next);
    try {
      localStorage.setItem(SCENARIOS_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("No se pudo borrar escenario", e);
    }
  }

  // pequeñas funciones puente para evitar linter sobre reordenar hooks/consts
  function setPrecioCompraFromSaved(v) {
    if (typeof v === "number") setPrecioCompra(v);
  }
  function setValorMercadoActualFromSaved(v) {
    if (typeof v === "number") setValorMercadoActual(v);
  }
  function setEntradaFromSaved(v) {
    if (typeof v === "number") setEntrada(v);
  }
  function setInteresFromSaved(v) {
    if (typeof v === "number") setInteres(v);
  }
  function setGastosNotariaFromSaved(v) {
    if (typeof v === "number") setGastosNotaria(v);
  }
  function setAlquilerActualFromSaved(v) {
    if (typeof v === "number") setAlquilerActual(v);
  }
  function setIbiBasuraFromSaved(v) {
    if (typeof v === "number") setIbiBasura(v);
  }
  function setComunidadFromSaved(v) {
    if (typeof v === "number") setComunidad(v);
  }
  function setPorcentajeRevalorizacionFromSaved(v) {
    if (typeof v === "number") setPorcentajeRevalorizacion(v);
  }
  function setAnioVentaFromSaved(v) {
    if (typeof v === "number") setAnioVenta(v);
  }
  function setMejorasFromSaved(v) {
    if (typeof v === "number") setMejoras(v);
  }
  function setPrecioVentaManualFromSaved(v) {
    if (typeof v === "number") setPrecioVentaManual(v);
  }
  function setAlquilerPosibleFromSaved(v) {
    if (typeof v === "number") setAlquilerPosible(v);
  }

  function setAniosFijoFromSaved(v) {
    if (typeof v === 'number') setAniosFijo(v);
  }
  function setEuriborFromSaved(v) {
    if (typeof v === 'number') setEuribor(v);
  }
  function setMargenFromSaved(v) {
    if (typeof v === 'number') setMargen(v);
  }

  function setImpuestoCompraPercentFromSaved(v) {
    if (typeof v === 'number') setImpuestoCompraPercent(v);
  }

  function saveLabelsToStorage() {
    try {
      localStorage.setItem(LABELS_KEY, JSON.stringify(scenarioLabels));
      setEditarLabels(false);
    } catch (e) {
      console.warn("No se pudo guardar labels", e);
    }
  }

  // Clasificar nivel de rentabilidad por año según ROI
  function clasificarNivelRentabilidad(roiValor) {
    if (!isFinite(roiValor)) return "neutro";
    if (roiValor >= 15) return "muy muy positivo";
    if (roiValor >= 7) return "positivo";
    if (roiValor >= -2) return "neutro";
    if (roiValor >= -10) return "negativo";
    return "muy negativo";
  }

  const escenariosConNivel = escenariosPorAño.map((esc) => ({
    ...esc,
    nivel: clasificarNivelRentabilidad(esc.roi),
  }));

  const maxAbsRoi =
    escenariosConNivel.length > 0
      ? Math.max(
          ...escenariosConNivel.map((esc) => Math.abs(esc.roi) || 0),
          10
        )
      : 10;

  const primerAñoPositivo = escenariosConNivel.find(
    (esc) => esc.roi >= 0
  )?.año;

  // ---- ESCENARIO ALQUILAR TU PROPIA VIVIENDA DESDE EL MINUTO 1 ----
  // compute interests paid in the first 3 years (36 months) for use in the mercado modal
  const interesesPagadosPrimeros3AniosMV = useMemo(() => {
    const P = Math.max(0, importeFinanciado || 0);
    const nTotal = Math.max(1, Number(añosHipoteca || 0)) * 12;
    const meses = Math.min(nTotal, 36);
    const r = fixedMonthlyRate || 0; // using fixedMonthlyRate as representative
    let saldo = P;
    let interesesAcum = 0;
    const cuota = cuotaMensual;
    for (let m = 0; m < meses && saldo > 0; m++) {
      const interesMes = saldo * r;
      const amortizacion = cuota - interesMes;
      if (!isFinite(amortizacion)) break;
      saldo = Math.max(0, saldo - amortizacion);
      interesesAcum += interesMes;
    }
    return interesesAcum;
  }, [importeFinanciado, añosHipoteca, fixedMonthlyRate, cuotaMensual]);

  // Aggregate monthly extras per user's requested items
  const gastosMensualesMercado = useMemo(() => {
    const cuota = Number(cuotaMensual || 0);
    const comunidadM = Number(comunidadMercado || 0);
    const ibi = Number(ibiAnualMercado || 0) / 12;
    const basura = Number(basuraAnualMercado || 0) / 12;
    const seguro = Number(seguroAnualMercado || 0) / 12;
    const perdidaDeduccionesMensual = Number(perdidaDeduccionesAnualMercado || 0) / 12;
    const interesesTotal = useSimulatedInteresesMercado ? Number(interesesPagadosPrimeros3AniosMV || 0) : Number(intereses3AniosMercado || 0);
    // spread intereses 3 años over 36 months
    const interesesMensual = interesesTotal / 36;
    return cuota + comunidadM + ibi + basura + seguro + perdidaDeduccionesMensual + interesesMensual;
  }, [cuotaMensual, comunidadMercado, ibiAnualMercado, basuraAnualMercado, seguroAnualMercado, perdidaDeduccionesAnualMercado, intereses3AniosMercado, useSimulatedInteresesMercado, interesesPagadosPrimeros3AniosMV]);

  // Gross rent needed to cover the monthly costs after accounting for 21% tax on rent
  const alquilerEquilibrio = useMemo(() => {
    const netFactor = Math.max(0.01, 1 - 0.21);
    return gastosMensualesMercado / netFactor;
  }, [gastosMensualesMercado]);

  // Alquiler necesario para tener una rentabilidad anual del 3% y 5% sobre el efectivo invertido
  const alquilerPara3Porciento =
    inversionEfectivo > 0
      ? alquilerEquilibrio + (inversionEfectivo * 0.03) / 12
      : alquilerEquilibrio;

  const alquilerPara5Porciento =
    inversionEfectivo > 0
      ? alquilerEquilibrio + (inversionEfectivo * 0.05) / 12
      : alquilerEquilibrio;

  const ingresoAlquilerAnual = alquilerPosible * 12;
  const ingresoAlquilerNetoAnual =
    ingresoAlquilerAnual - gastosAnualesVivienda;

  const rentabilidadAlquilerSobreEfectivo =
    inversionEfectivo > 0
      ? (ingresoAlquilerNetoAnual / inversionEfectivo) * 100
      : 0;

  const rentabilidadAlquilerSobrePrecioCompra =
    precioCompra > 0
      ? (ingresoAlquilerAnual / precioCompra) * 100
      : 0;

  // Colores del gráfico según nivel
  function colorPorNivel(nivel) {
    switch (nivel) {
      case "muy muy positivo":
        return "#166534"; // verde muy fuerte
      case "positivo":
        return "#22c55e"; // verde
      case "neutro":
        return "#9ca3af"; // gris
      case "negativo":
        return "#f97316"; // naranja
      case "muy negativo":
        return "#b91c1c"; // rojo
      default:
        return "#6b7280";
    }
  }

  // Recolectar datos en un objeto antes del JSX para evitar problemas de parseo
  const evaluaData = {
    precioCompra,
    valorMercadoActual,
    entrada,
    interes,
    añosHipoteca,
    añosFijo,
    euribor,
    margen,
    gastosNotaria,
    gestorHipotecario,
    mejoras,
    impuestoCompraPercent,
    impuestosCompra,
    anioVenta,
    porcentajeRevalorizacion,
    alquilerActual,
    alquilerPosible,
    ibiBasura,
    comunidad,
    importeFinanciado,
    cuotaMensual,
    totalInteresesEstimados,
    interesesPagadosHastaVenta,
    saldoRestanteHipoteca,
    plusvaliaBruta,
    impuestoPlusvaliaVenta,
    impuestoHipoteticoNoViviendaHabitual,
    plusvaliaNeta,
    dineroNetoEnCuenta,
    inversionEfectivo,
    roi,
    alquilerEquilibrio,
    alquilerPara3Porciento,
    alquilerPara5Porciento,
    escenariosPorAño,
    escenariosConNivel,
    escenariosGuardados,
    evolucionPrecio,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa, #e4ecf5)",
        padding: "32px 16px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          background: 'var(--card-bg)',
          borderRadius: "20px",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)",
          padding: "24px 24px 32px",
        }}
      >
        <header
          style={{
            marginBottom: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Calculadora: ¿vender o alquilar la vivienda?
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
            Ve paso a paso qué gastos son de{" "}
            <strong>comprar</strong>, cuáles son de{" "}
            <strong>alquiler</strong>, qué parte son{" "}
            <strong>impuestos</strong> (incluyendo los hipotéticos si vendes
            antes de 3 años), cuánto te quedaría al vender, en qué año
            empieza a salirte rentable y qué alquiler debería cubrir el piso
            y darte rentabilidad.
          </p>
        </header>

        {/* Botón para abrir el creador de escenarios hipotecarios */}
        <div style={{ marginBottom: 18, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowCreator((s) => !s)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #2563eb', background: showCreator ? '#eef6ff' : '#fff' }}
          >
            {showCreator ? 'Cerrar creación de escenario' : 'Crea escenario hipotecario'}
          </button>

          <button
            onClick={() => setShowAlicanteChart(true)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff' }}
          >
            Gráfico precios vivienda en Alicante
          </button>

          <button
            onClick={() => setShowDashboardEconomico(true)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff' }}
          >
            dashboard economico
          </button>

          <button
            onClick={() => setShowAlquilarModal(true)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff' }}
          >
            Alquilar o vender?
          </button>

          <button
            onClick={() => setShowAlquilerMercadoModal(true)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff' }}
          >
            Mercado alquiler
          </button>

          {/* Moved: WebPage GPT modal (botón que abre el asistente web) */}
          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
            <WebPageGptModal />
          </div>

          <button
            onClick={() => setShowROIModal(true)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff' }}
          >
            Return of Investment
          </button>

          <button
            onClick={() => setShowReforma((s) => !s)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: showReforma ? '#eef6ff' : '#fff' }}
          >
            Reforma – Análisis de costes y rentabilidad
          </button>
        </div>

        {showCreator && (
          <div style={{ marginBottom: 18 }}>
            <CreadorDeEscenariosHipotecarios
              onCreate={(payload) => {
                try {
                  const prev = Array.isArray(escenariosGuardados) ? escenariosGuardados : [];
                  const next = [payload, ...prev].slice(0, 50);
                  setEscenariosGuardados(next);
                  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(next));
                } catch (e) {
                  console.warn('No se pudo guardar escenario desde creador', e);
                }
                setShowCreator(false);
              }}
              onClose={() => setShowCreator(false)}
            />
          </div>
        )}

        {showAlicanteChart && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setShowAlicanteChart(false); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }}
          >
            <div style={{ width: 'min(980px, 96%)', maxHeight: '90vh', overflow: 'auto', background: '#fff', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Gráfico precios vivienda en Alicante</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={() => setShowAlicanteInfo((s) => !s)} style={{ padding: '6px 8px', borderRadius: 8 }}>?</button>
                  <button onClick={() => setShowEvolucionVentaModal(true)} style={{ padding: '6px 8px', borderRadius: 8 }}>Abrir evolución venta</button>
                  <button onClick={() => setShowAlicanteChart(false)} style={{ padding: '6px 8px', borderRadius: 8 }}>Cerrar</button>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <EvolucionDelPrecio />
              </div>

              {showAlicanteInfo && (
                <div style={{ marginTop: 12, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb' }}>
                  <strong>Información:</strong>
                  <div style={{ marginTop: 6, color: '#374151' }}>
                    Este gráfico muestra una estimación ilustrativa de la evolución del precio según presets. No es una predicción financiera.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {showEvolucionVentaModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowEvolucionVentaModal(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400 }}
        >
          <div style={{ width: 'min(900px, 96%)', maxHeight: '90vh', overflow: 'auto', background: '#fff', borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Evolución del posible precio de venta</h3>
              <div>
                <button onClick={() => setShowEvolucionVentaModal(false)} style={{ padding: '6px 8px', borderRadius: 8 }}>Cerrar</button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.9rem', color: '#374151' }}>
                  Revalorización anual:
                </span>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setPorcentajeRevalorizacion(2)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: porcentajeRevalorizacion === 2 ? '2px solid #2563eb' : '1px solid #d1d5db',
                      background: porcentajeRevalorizacion === 2 ? '#eff6ff' : '#fff',
                    }}
                  >
                    Pesimista (2%)
                  </button>
                  <button
                    onClick={() => setPorcentajeRevalorizacion(4)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: porcentajeRevalorizacion === 4 ? '2px solid #2563eb' : '1px solid #d1d5db',
                      background: porcentajeRevalorizacion === 4 ? '#eff6ff' : '#fff',
                    }}
                  >
                    Base (4%)
                  </button>
                  <button
                    onClick={() => setPorcentajeRevalorizacion(6)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: porcentajeRevalorizacion === 6 ? '2px solid #2563eb' : '1px solid #d1d5db',
                      background: porcentajeRevalorizacion === 6 ? '#eff6ff' : '#fff',
                    }}
                  >
                    Positivo (6%)
                  </button>

                  <div style={{ fontWeight: 700, marginLeft: 8 }}>{porcentajeRevalorizacion}%</div>
                </div>

                <select
                  value={porcentajeRevalorizacion}
                  onChange={(e) => setPorcentajeRevalorizacion(Number(e.target.value))}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '999px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value={0}>0% (precio se mantiene)</option>
                  <option value={2}>+2% anual</option>
                  <option value={4}>+4% anual</option>
                  <option value={6}>+6% anual</option>
                </select>
              </div>

              <div
                style={{
                  overflowX: 'auto',
                  borderRadius: '14px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '400px',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#f9fafb',
                        textAlign: 'left',
                      }}
                    >
                      <th style={thStyle}>Año</th>
                      <th style={thStyle}>Precio estimado (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evolucionPrecio.map((fila) => (
                      <tr key={fila.año}>
                        <td style={tdStyle}>
                          {fila.año === 0
                            ? 'Año 0 (valor actual de mercado)'
                            : `Año ${fila.año}`}
                        </td>
                        <td style={tdStyle}>
                          {fila.precio.toLocaleString('es-ES', {
                            style: 'currency',
                            currency: 'EUR',
                            maximumFractionDigits: 0,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* 1. Datos de compra, hipoteca y gastos */}
        { !hideSection1 && (
        <section>
          <h2
            style={{
              fontSize: "1.1rem",
              marginBottom: "12px",
              color: "#111827",
            }}
          >
            1. Datos de compra, hipoteca y gastos
          </h2>

          { !hideDatosTabla && (
            <div
              style={{
                overflowX: "auto",
                borderRadius: "14px",
                border: "1px solid #e5e7eb",
              }}
            >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "900px",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f9fafb",
                    textAlign: "left",
                  }}
                >
                  <th style={thStyle}>Precio de compra (€)</th>
                  <th style={thStyle}>Imp. compra (%)</th>
                  <th style={thStyle}>Imp. compra (€)</th>
                  <th style={thStyle}>Valor mercado actual (€)</th>
                  <th style={thStyle}>Entrada (€)</th>
                  <th style={thStyle}>Interés hipoteca (%)</th>
                  <th style={thStyle}>Años hipoteca</th>
                  <th style={thStyle}>Años fijo</th>
                  <th style={thStyle}>Euribor (%)</th>
                  <th style={thStyle}>Margen (%)</th>
                  <th style={thStyle}>Gasto gestor (€)</th>
                  <th style={thStyle}>Gastos de notaría (€)</th>
                  <th style={thStyle}>Alquiler actual (€/mes)</th>
                  <th style={thStyle}>IBI + basura (€/año)</th>
                  <th style={thStyle}>Comunidad (€/mes)</th>
                </tr>
              </thead>
              {!hideDatosTabla && (
                <tbody>
                  <tr>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={precioCompra}
                        onChange={(e) =>
                          setPrecioCompra(Number(e.target.value))
                        }
                        min={0}
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <label style={{ fontSize: '0.85rem' }}>
                        Imp. compra (%)
                        <select value={impuestoCompraPercent} onChange={(e) => setImpuestoCompraPercent(Number(e.target.value))} style={{ ...inputStyle, marginTop: 6 }}>
                          <option value={0}>0%</option>
                          <option value={6}>6%</option>
                          <option value={8}>8%</option>
                          <option value={10}>10%</option>
                        </select>
                      </label>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: '0.95rem', paddingTop: 8 }}>
                        <strong>{impuestosCompra.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</strong>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={valorMercadoActual}
                        onChange={(e) =>
                          setValorMercadoActual(Number(e.target.value))
                        }
                        min={0}
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={entrada}
                        onChange={(e) => setEntrada(Number(e.target.value))}
                        min={0}
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={interes}
                        onChange={(e) => setInteres(Number(e.target.value))}
                        step="0.1"
                        min={0}
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={añosHipoteca}
                        onChange={(e) => setAniosHipoteca(Math.max(1, Number(e.target.value) || 0))}
                        min={1}
                        style={{ ...inputStyle, width: "80px" }}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={añosFijo}
                        onChange={(e) => setAniosFijo(Math.max(0, Number(e.target.value) || 0))}
                        min={0}
                        style={{ ...inputStyle, width: "80px" }}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={euribor}
                        onChange={(e) => setEuribor(Number(e.target.value) || 0)}
                        step="0.1"
                        style={{ ...inputStyle, width: "100px" }}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={margen}
                        onChange={(e) => setMargen(Number(e.target.value) || 0)}
                        step="0.1"
                        style={{ ...inputStyle, width: "100px" }}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={gestorHipotecario}
                        onChange={(e) => setGestorHipotecario(Number(e.target.value) || 0)}
                        min={0}
                        style={{ ...inputStyle, width: "120px" }}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={gastosNotaria}
                        onChange={(e) =>
                          setGastosNotaria(Number(e.target.value))
                        }
                        min={0}
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={alquilerActual}
                        onChange={(e) =>
                          setAlquilerActual(Number(e.target.value))
                        }
                        min={0}
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={ibiBasura}
                        onChange={(e) => setIbiBasura(Number(e.target.value))}
                        min={0}
                        style={inputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="number"
                        value={comunidad}
                        onChange={(e) => setComunidad(Number(e.target.value))}
                        min={0}
                        style={inputStyle}
                      />
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
            </div>
          )}

          {/* Escenarios hipotecarios (cards) - aparecen cuando haya escenarios guardados */}
          <EscenariosHipotecas
            scenarios={escenariosGuardados}
            onLoad={loadScenario}
            onDelete={deleteScenario}
            onUpdateName={updateScenarioName}
          />

          {/* Panel: guardar / cargar escenarios */}
          <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Nombre del escenario (opcional)"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              style={{ ...inputStyle, width: 260 }}
            />
            <button onClick={saveScenario} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#f3f4f6" }}>
              Guardar escenario
            </button>
            {/* Integración: botón/modal para FetchWeb GPT (movido arriba) */}

            {escenariosGuardados.length > 0 && (
              <div style={{ marginTop: 6, width: "100%" }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>Escenarios guardados:</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {escenariosGuardados.map((s, i) => (
                    <div key={s.timestamp} style={{ border: "1px solid #e5e7eb", padding: 8, borderRadius: 8, background: "#fff" }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{new Date(s.timestamp).toLocaleString()}</div>
                      <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                        <button onClick={() => loadScenario(i)} style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #d1d5db", background: "#eef2ff" }}>Cargar</button>
                        <button onClick={() => deleteScenario(i)} style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fff1f2" }}>Borrar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
        )}

        {/* Reforma: ahora mostrada como modal overlay */}
        {showReforma && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setShowReforma(false); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500 }}
          >
            <div style={{ width: 'min(920px, 96%)', maxHeight: '90vh', overflow: 'auto', background: '#fff', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Reforma — Análisis de costes y rentabilidad</h3>
                <div>
                  <button onClick={() => setShowReforma(false)} style={{ padding: '6px 8px', borderRadius: 8 }}>Cerrar</button>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <ReformaCocina />
              </div>
            </div>
          </div>
        )}

        {/* Resumen rápido de hipoteca, alquiler y gastos */}
        <section
          style={{
            marginTop: "24px",
            display: "grid",
            gap: "12px",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          {/* GASTOS/ESCENARIO DE COMPRA */}
          <div style={cardMini}>
            <span style={labelMini}>Importe financiado (hipoteca)</span>
            <strong style={valueMini}>
              {importeFinanciado.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
              })}
            </strong>
          </div>

          <div style={cardMini}>
            <span style={labelMini}>Cuota mensual estimada</span>
            <strong style={valueMini}>
              {isFinite(cuotaMensual)
                ? cuotaMensual.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })
                : "-"}
            </strong>
            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              Hipoteca a {añosHipoteca} años · Tipo: {tipoHipoteca}
            </span>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button onClick={() => setTipoHipoteca("fija")} style={{ padding: "6px 8px", borderRadius: 6, border: tipoHipoteca === "fija" ? "2px solid #2563eb" : "1px solid #d1d5db", background: tipoHipoteca === "fija" ? "#eff6ff" : "#fff" }}>Fija</button>
              <button onClick={() => setTipoHipoteca("variable")} style={{ padding: "6px 8px", borderRadius: 6, border: tipoHipoteca === "variable" ? "2px solid #2563eb" : "1px solid #d1d5db", background: tipoHipoteca === "variable" ? "#eff6ff" : "#fff" }}>Variable</button>
            </div>
          </div>

          {/* GASTOS/ESCENARIO ALQUILER (no compras la vivienda) */}
          <div style={cardMini}>
            <span style={labelMini}>Alquiler actual (alternativa)</span>
            <strong style={valueMini}>
              {alquilerActual.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
              })}{" "}
              / mes
            </strong>
            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
              Gasto en alquiler si NO compras:{" "}
              {gastoAlquilerAnual.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
              })}{" "}
              / año
            </span>
          </div>

          {/* GASTOS RECURRENTES ASOCIADOS A TENER LA VIVIENDA */}
          <div style={cardMini}>
            <span style={labelMini}>
              Gastos fijos anuales vivienda (IBI + basura + comunidad)
            </span>
            <strong style={valueMini}>
              {gastosAnualesVivienda.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
              })}{" "}
              / año
            </strong>
          </div>
        </section>

        {/* 2. Evolución del posible precio de venta (sobre valor de mercado) */}
        { !hideSection2 && (
        <section style={{ marginTop: "32px" }}>
          <h2
            style={{
              fontSize: "1.1rem",
              marginBottom: "8px",
              color: "#111827",
            }}
          >
            2. Evolución del posible precio de venta (sobre valor de mercado)
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#6b7280",
              marginBottom: "10px",
            }}
          >
            La revalorización se calcula sobre el valor de mercado que has
            indicado, no sobre el precio al que compraste.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "10px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "0.9rem", color: "#374151" }}>
              Revalorización anual:
            </span>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => setPorcentajeRevalorizacion(2)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: porcentajeRevalorizacion === 2 ? "2px solid #2563eb" : "1px solid #d1d5db",
                  background: porcentajeRevalorizacion === 2 ? "#eff6ff" : "#fff",
                }}
              >
                Pesimista (2%)
              </button>
              <button
                onClick={() => setPorcentajeRevalorizacion(4)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: porcentajeRevalorizacion === 4 ? "2px solid #2563eb" : "1px solid #d1d5db",
                  background: porcentajeRevalorizacion === 4 ? "#eff6ff" : "#fff",
                }}
              >
                Base (4%)
              </button>
              <button
                onClick={() => setPorcentajeRevalorizacion(6)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: porcentajeRevalorizacion === 6 ? "2px solid #2563eb" : "1px solid #d1d5db",
                  background: porcentajeRevalorizacion === 6 ? "#eff6ff" : "#fff",
                }}
              >
                Positivo (6%)
              </button>

              <div style={{ fontWeight: 700, marginLeft: 8 }}>{porcentajeRevalorizacion}%</div>
            </div>

            <select
              value={porcentajeRevalorizacion}
              onChange={(e) => setPorcentajeRevalorizacion(Number(e.target.value))}
              style={{
                padding: "6px 10px",
                borderRadius: "999px",
                border: "1px solid #d1d5db",
                fontSize: "0.9rem",
              }}
            >
              <option value={0}>0% (precio se mantiene)</option>
              <option value={2}>+2% anual</option>
              <option value={4}>+4% anual</option>
              <option value={6}>+6% anual</option>
            </select>
          </div>

          <div
            style={{
              overflowX: "auto",
              borderRadius: "14px",
              border: "1px solid #e5e7eb",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "400px",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f9fafb",
                    textAlign: "left",
                  }}
                >
                  <th style={thStyle}>Año</th>
                  <th style={thStyle}>Precio estimado (€)</th>
                </tr>
              </thead>
              <tbody>
                {evolucionPrecio.map((fila) => (
                  <tr key={fila.año}>
                    <td style={tdStyle}>
                      {fila.año === 0
                        ? "Año 0 (valor actual de mercado)"
                        : `Año ${fila.año}`}
                    </td>
                    <td style={tdStyle}>
                      {fila.precio.toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        )}

        {/* 3. Escenario de venta, dinero neto y origen de los gastos */}
        { !hideSection3 && (
        <section style={{ marginTop: "32px" }}>
          <h2
            style={{
              fontSize: "1.1rem",
              marginBottom: "8px",
              color: "#111827",
            }}
          >
            3. Venta, dinero neto que te quedaría, ROI y origen de los gastos
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div style={cardMini}>
              <span style={labelMini}>Año estimado de venta</span>
              <select
                value={anioVenta}
                onChange={(e) => setAnioVenta(Number(e.target.value))}
                style={{
                  marginTop: "4px",
                  padding: "6px 10px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                }}
              >
                {Array.from({ length: añosSimulacion }, (_, i) => i + 1).map(
                  (a) => (
                    <option key={a} value={a}>
                      Año {a}
                    </option>
                  )
                )}
              </select>
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                Antes de 3 años → impuestos compra 10% · Desde año 3 → 8%
              </span>
            </div>

            <div style={cardMini}>
              <span style={labelMini}>Mejoras realizadas en la vivienda</span>
              <input
                type="number"
                value={mejoras}
                onChange={(e) => setMejoras(Number(e.target.value))}
                min={0}
                style={{
                  ...inputStyle,
                  marginTop: "4px",
                }}
              />
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                Reformas, mejoras, etc.
              </span>
            </div>

            <div style={cardMini}>
              <span style={labelMini}>
                Precio de venta que TÚ estimas (opcional)
              </span>
              <input
                type="number"
                value={precioVentaManual}
                onChange={(e) =>
                  setPrecioVentaManual(Number(e.target.value))
                }
                min={0}
                style={{
                  ...inputStyle,
                  marginTop: "4px",
                }}
              />
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                Si lo dejas en 0, se usa la estimación por revalorización.
              </span>
            </div>
          </div>

          {/* Bloque: resumen de cifras clave */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "12px",
            }}
          >
            <div style={cardMini}>
              <span style={labelMini}>Precio usado en el cálculo</span>
              <strong style={valueMini}>
                {precioVentaUsado.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                })}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                {precioVentaManual > 0
                  ? "Usando tu precio manual."
                  : "Usando el precio estimado sobre valor de mercado."}
              </span>
            </div>

            {/* GASTOS ASOCIADOS A COMPRAR */}
            <div style={cardMini}>
              <span style={labelMini}>
                Impuestos de compra ({impuestoCompraPercent}%)
              </span>
              <strong style={valueMini}>
                {impuestosCompra.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                })}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                <strong>Origen:</strong> gasto de compra de vivienda.
              </span>
            </div>

            <div style={cardMini}>
              <span style={labelMini}>
                Intereses pagados hasta el año {anioVenta}
              </span>
              <strong style={valueMini}>
                {interesesPagadosHastaVenta.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                })}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                <strong>Origen:</strong> coste financiero de la hipoteca.
                Meses pagados: {mesesHastaVenta}
              </span>
            </div>

            <div style={cardMini}>
              <span style={labelMini}>Hipoteca pendiente al vender</span>
              <strong style={valueMini}>
                {saldoRestanteHipoteca.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                })}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                <strong>Origen:</strong> capital pendiente de amortizar.
              </span>
            </div>

            <div style={cardMini}>
              <span style={labelMini}>Mejoras descontadas</span>
              <strong style={valueMini}>
                {mejoras.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                })}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                <strong>Origen:</strong> reformas/improvements.
              </span>
            </div>

            <div style={cardMini}>
              <span style={labelMini}>Gasto gestor hipotecario</span>
              <strong style={valueMini}>
                {gestorHipotecario.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                <strong>Origen:</strong> gasto de gestor (deducible en base imponible al vender).
              </span>
            </div>

            {/* IMPUESTOS ASOCIADOS A LA VENTA */}
            <div style={cardMini}>
              <span style={labelMini}>Plusvalía bruta estimada</span>
              <strong
                style={{
                  ...valueMini,
                  color: plusvaliaBruta >= 0 ? "#15803d" : "#b91c1c",
                }}
              >
                {plusvaliaBruta.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                })}
              </strong>
              <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: 8 }}>
                <div>
                  Fórmula: <strong>plusvalía bruta</strong> = precio venta usado - base imponible
                </div>
                <div style={{ marginTop: 6 }}>
                  Base imponible = {precioCompra.toLocaleString("es-ES", {style: "currency", currency: "EUR"})} (precio compra) + {impuestosCompra.toLocaleString("es-ES", {style: "currency", currency: "EUR"})} (impuestos compra) + {interesesPagadosHastaVenta.toLocaleString("es-ES", {style: "currency", currency: "EUR"})} (intereses pagados) + {mejoras.toLocaleString("es-ES", {style: "currency", currency: "EUR"})} (mejoras)
                </div>
                <div style={{ marginTop: 6 }}>
                  Precio venta usado = {precioVentaUsado.toLocaleString("es-ES", {style: "currency", currency: "EUR"})}
                </div>
              </div>
            </div>

            <div style={cardMini}>
              <span style={labelMini}>Impuesto plusvalía (10%)</span>
              <strong style={valueMini}>
                {impuestoPlusvaliaVenta.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                })}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                <strong>Origen:</strong> impuesto sobre la ganancia.
              </span>
            </div>

            <div style={cardMini}>
              <span style={labelMini}>
                Impuesto hipotético 2% (venta &lt; 3 años)
              </span>
              <strong style={valueMini}>
                {impuestoHipoteticoNoViviendaHabitual.toLocaleString(
                  "es-ES",
                  {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }
                )}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                <strong>Origen:</strong> pérdida condición de vivienda
                habitual si vendes antes de 3 años (escenario hipotético).
              </span>
            </div>

            <div style={cardMini}>
              <span style={labelMini}>
                Plusvalía neta después de impuestos
              </span>
              <strong
                style={{
                  ...valueMini,
                  color: plusvaliaNeta >= 0 ? "#15803d" : "#b91c1c",
                }}
              >
                {plusvaliaNeta.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                })}
              </strong>
              <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: 8 }}>
                <div>Desglose de impuestos:</div>
                <div style={{ marginTop: 6 }}>
                  Impuesto plusvalía (10% sobre ganancia positiva): {impuestoPlusvaliaVenta.toLocaleString("es-ES", {style: "currency", currency: "EUR"})}
                </div>
                <div style={{ marginTop: 6 }}>
                  Impuesto hipotético (2% si venta &lt; 3 años): {impuestoHipoteticoNoViviendaHabitual.toLocaleString("es-ES", {style: "currency", currency: "EUR"})}
                </div>
                <div style={{ marginTop: 6 }}>
                  Fórmula: plusvalía neta = plusvalía bruta - impuesto plusvalía - impuesto hipotético
                </div>
              </div>
            </div>

            {/* DINERO NETO VENTA VS SEGUIR DE ALQUILER */}
            <div style={cardMini}>
              <span style={labelMini}>
                Dinero que te quedaría en la cuenta al vender
              </span>
              <strong
                style={{
                  ...valueMini,
                  color: dineroNetoEnCuenta >= 0 ? "#15803d" : "#b91c1c",
                }}
              >
                {dineroNetoEnCuenta.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                })}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                Precio venta - hipoteca pendiente - impuestos de venta (10%
                plusvalía + 2% hipotético si aplica).
              </span>
            </div>

            <div style={cardMini}>
              <span style={labelMini}>
                Gasto acumulado si hubieras seguido de alquiler
              </span>
              <strong style={valueMini}>
                {gastoAlquilerAcumulado.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                })}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                {anioVenta} años × alquiler anual (escenario NO compra).
              </span>
            </div>

            <div style={cardMini}>
              <span style={labelMini}>
                ROI de la operación (sobre efectivo invertido)
              </span>
              <strong
                style={{
                  ...valueMini,
                  color: roi >= 0 ? "#15803d" : "#b91c1c",
                }}
              >
                {isFinite(roi) ? roi.toFixed(1) : "-"}%
              </strong>
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                ROI ≈ plusvalía neta / (entrada + notaría + impuestos
                compra + mejoras)
              </span>
            </div>
          </div>
        </section>
        )}

        {/* 4. Gráfico: ¿cuándo empieza a salirte rentable? */}
        { !hideSection4 && (
        <section style={{ marginTop: "32px" }}>
          <h2
            style={{
              fontSize: "1.1rem",
              marginBottom: "8px",
              color: "#111827",
            }}
          >
            4. ¿Cuándo empieza a salirte rentable la operación?
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#6b7280",
              marginBottom: "10px",
            }}
          >
            El gráfico clasifica cada año según el ROI estimado:{" "}
            <strong>muy muy positivo</strong>, <strong>positivo</strong>,{" "}
            <strong>neutro</strong>, <strong>negativo</strong> o{" "}
            <strong>muy negativo</strong>. Usa sólo la estimación de
            revalorización (no el precio manual) para ver la tendencia.
          </p>

          {/* Leyenda del gráfico */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "12px",
              fontSize: "0.8rem",
              color: "#4b5563",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => setEditarLabels(!editarLabels)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff" }}>
                {editarLabels ? "Cancelar edición" : "Editar etiquetas"}
              </button>
              {editarLabels ? (
                <>
                  {scenarioLabels.map((lab, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: colorPorNivel(lab) }} />
                      <input value={lab} onChange={(e)=>{
                        const next = [...scenarioLabels]; next[idx]=e.target.value; setScenarioLabels(next);
                      }} style={{ ...inputStyle, width: 160 }} />
                    </div>
                  ))}
                  <button onClick={saveLabelsToStorage} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d5db", background: "#ecfccb" }}>Guardar etiquetas</button>
                </>
              ) : (
                scenarioLabels.map((nivel, i) => (
                  <div key={nivel} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "999px",
                        backgroundColor: colorPorNivel(nivel),
                      }}
                    />
                    <span>{nivel}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Gráfico tipo barras verticales sencillo en CSS */}
          <div
            style={{
              borderRadius: "14px",
              border: "1px solid #e5e7eb",
              padding: "14px 16px",
              background: "#f9fafb",
              overflowX: "auto",
            }}
          >
            <div
              style={{
                minWidth: "600px",
                display: "flex",
                alignItems: "flex-end",
                gap: "12px",
                height: "180px",
              }}
            >
              {escenariosConNivel.map((esc) => {
                const altura =
                  (Math.min(Math.abs(esc.roi), maxAbsRoi) / maxAbsRoi) *
                  120;

                return (
                  <div
                    key={esc.año}
                    style={{
                      flex: "1 0 0",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "40px",
                        height: `${altura}px`,
                        borderRadius: "999px",
                        backgroundColor: colorPorNivel(esc.nivel),
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        transition: "height 0.3s ease",
                      }}
                      title={`Año ${esc.año} · ROI: ${
                        isFinite(esc.roi) ? esc.roi.toFixed(1) : "-"
                      }% · ${esc.nivel}`}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          color: "#ffffff",
                          marginBottom: "4px",
                        }}
                      >
                        {isFinite(esc.roi) ? esc.roi.toFixed(0) + "%" : "-"}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#374151",
                        textAlign: "center",
                      }}
                    >
                      Año {esc.año}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p
            style={{
              marginTop: "10px",
              fontSize: "0.85rem",
              color: "#4b5563",
            }}
          >
            {primerAñoPositivo ? (
              <>
                Con tus números actuales, la operación pasa a ser al menos{" "}
                <strong>neutra/positiva</strong> a partir del{" "}
                <strong>año {primerAñoPositivo}</strong>.
              </>
            ) : (
              <>
                Con tus números actuales, la rentabilidad no llega a ser
                positiva dentro de los primeros {añosSimulacion} años.
              </>
            )}
          </p>
        </section>
        )}

        {showROIModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowROIModal(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400 }}
        >
          <div style={{ width: 'min(920px, 96%)', maxHeight: '90vh', overflow: 'auto', background: '#fff', borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Return of Investment</h3>
              <div>
                <button onClick={() => setShowROIModal(false)} style={{ padding: '6px 8px', borderRadius: 8 }}>Cerrar</button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '10px' }}>
                El gráfico clasifica cada año según el ROI estimado: <strong>muy muy positivo</strong>, <strong>positivo</strong>, <strong>neutro</strong>, <strong>negativo</strong> o <strong>muy negativo</strong>. Usa sólo la estimación de revalorización (no el precio manual) para ver la tendencia.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px', fontSize: '0.8rem', color: '#4b5563' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => setEditarLabels(!editarLabels)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff' }}>
                    {editarLabels ? 'Cancelar edición' : 'Editar etiquetas'}
                  </button>
                  {editarLabels ? (
                    <>
                      {scenarioLabels.map((lab, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: colorPorNivel(lab) }} />
                          <input value={lab} onChange={(e)=>{ const next = [...scenarioLabels]; next[idx]=e.target.value; setScenarioLabels(next); }} style={{ ...inputStyle, width: 160 }} />
                        </div>
                      ))}
                      <button onClick={saveLabelsToStorage} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #d1d5db', background: '#ecfccb' }}>Guardar etiquetas</button>
                    </>
                  ) : (
                    scenarioLabels.map((nivel, i) => (
                      <div key={nivel} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '999px', backgroundColor: colorPorNivel(nivel) }} />
                        <span>{nivel}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ borderRadius: '14px', border: '1px solid #e5e7eb', padding: '14px 16px', background: '#f9fafb', overflowX: 'auto' }}>
                <div style={{ minWidth: '600px', display: 'flex', alignItems: 'flex-end', gap: '12px', height: '180px' }}>
                  {escenariosConNivel.map((esc) => {
                    const altura = (Math.min(Math.abs(esc.roi), maxAbsRoi) / maxAbsRoi) * 120;
                    return (
                      <div key={esc.año} style={{ flex: '1 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <div style={{ width: '100%', maxWidth: '40px', height: `${altura}px`, borderRadius: '999px', backgroundColor: colorPorNivel(esc.nivel), display: 'flex', alignItems: 'flex-end', justifyContent: 'center', transition: 'height 0.3s ease' }} title={`Año ${esc.año} · ROI: ${isFinite(esc.roi) ? esc.roi.toFixed(1) : '-'}% · ${esc.nivel}`}>
                          <span style={{ fontSize: '0.7rem', color: '#ffffff', marginBottom: '4px' }}>{isFinite(esc.roi) ? esc.roi.toFixed(0) + '%' : '-'}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#374151', textAlign: 'center' }}>Año {esc.año}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#4b5563' }}>
                {primerAñoPositivo ? (
                  <>
                    Con tus números actuales, la operación pasa a ser al menos <strong>neutra/positiva</strong> a partir del <strong>año {primerAñoPositivo}</strong>.
                  </>
                ) : (
                  <>
                    Con tus números actuales, la rentabilidad no llega a ser positiva dentro de los primeros {añosSimulacion} años.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {showDashboardEconomico && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowDashboardEconomico(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1400 }}
        >
          <div style={{ width: 'min(980px, 96%)', maxHeight: '90vh', overflow: 'auto', background: '#fff', borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Dashboard económico</h3>
              <div>
                <button onClick={() => setShowDashboardEconomico(false)} style={{ padding: '6px 8px', borderRadius: 8 }}>Cerrar</button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              {/* Sección 1 (Datos de compra, hipoteca y gastos) */}
              <section>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '12px', color: '#111827' }}>1. Datos de compra, hipoteca y gastos</h2>

                  <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f9fafb', textAlign: 'left' }}>
                          <th style={thStyle}>Precio de compra (€)</th>
                          <th style={thStyle}>Imp. compra (%)</th>
                          <th style={thStyle}>Imp. compra (€)</th>
                          <th style={thStyle}>Valor mercado actual (€)</th>
                          <th style={thStyle}>Entrada (€)</th>
                          <th style={thStyle}>Interés hipoteca (%)</th>
                          <th style={thStyle}>Años hipoteca</th>
                          <th style={thStyle}>Años fijo</th>
                          <th style={thStyle}>Euribor (%)</th>
                          <th style={thStyle}>Margen (%)</th>
                          <th style={thStyle}>Gasto gestor (€)</th>
                          <th style={thStyle}>Gastos de notaría (€)</th>
                          <th style={thStyle}>Alquiler actual (€/mes)</th>
                          <th style={thStyle}>IBI + basura (€/año)</th>
                          <th style={thStyle}>Comunidad (€/mes)</th>
                        </tr>
                      </thead>
                      <tbody>
                          <tr>
                            <td style={tdStyle}>
                              <input type="number" value={precioCompra} onChange={(e)=>setPrecioCompra(Number(e.target.value))} min={0} style={inputStyle} />
                            </td>
                            <td style={tdStyle}>
                              <label style={{ fontSize: '0.85rem' }}>
                                Imp. compra (%)
                                <select value={impuestoCompraPercent} onChange={(e) => setImpuestoCompraPercent(Number(e.target.value))} style={{ ...inputStyle, marginTop: 6 }}>
                                  <option value={0}>0%</option>
                                  <option value={6}>6%</option>
                                  <option value={8}>8%</option>
                                  <option value={10}>10%</option>
                                </select>
                              </label>
                            </td>
                            <td style={tdStyle}>
                              <div style={{ fontSize: '0.95rem', paddingTop: 8 }}>
                                <strong>{impuestosCompra.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</strong>
                              </div>
                            </td>
                            <td style={tdStyle}>
                              <input type="number" value={valorMercadoActual} onChange={(e)=>setValorMercadoActual(Number(e.target.value))} min={0} style={inputStyle} />
                            </td>
                            <td style={tdStyle}>
                              <input type="number" value={entrada} onChange={(e)=>setEntrada(Number(e.target.value))} min={0} style={inputStyle} />
                            </td>
                            <td style={tdStyle}>
                              <input type="number" value={interes} onChange={(e)=>setInteres(Number(e.target.value))} step="0.1" min={0} style={inputStyle} />
                            </td>
                            <td style={tdStyle}>
                              <input type="number" value={añosHipoteca} onChange={(e)=>setAniosHipoteca(Math.max(1, Number(e.target.value) || 0))} min={1} style={{ ...inputStyle, width: '80px' }} />
                            </td>
                            <td style={tdStyle}>
                              <input type="number" value={añosFijo} onChange={(e)=>setAniosFijo(Math.max(0, Number(e.target.value) || 0))} min={0} style={{ ...inputStyle, width: '80px' }} />
                            </td>
                            <td style={tdStyle}>
                              <input type="number" value={euribor} onChange={(e)=>setEuribor(Number(e.target.value) || 0)} step="0.1" style={{ ...inputStyle, width: '100px' }} />
                            </td>
                            <td style={tdStyle}>
                              <input type="number" value={margen} onChange={(e)=>setMargen(Number(e.target.value) || 0)} step="0.1" style={{ ...inputStyle, width: '100px' }} />
                            </td>
                            <td style={tdStyle}>
                              <input type="number" value={gestorHipotecario} onChange={(e)=>setGestorHipotecario(Number(e.target.value) || 0)} min={0} style={{ ...inputStyle, width: '120px' }} />
                            </td>
                            <td style={tdStyle}>
                              <input type="number" value={gastosNotaria} onChange={(e)=>setGastosNotaria(Number(e.target.value))} min={0} style={inputStyle} />
                            </td>
                            <td style={tdStyle}>
                              <input type="number" value={alquilerActual} onChange={(e)=>setAlquilerActual(Number(e.target.value))} min={0} style={inputStyle} />
                            </td>
                            <td style={tdStyle}>
                              <input type="number" value={ibiBasura} onChange={(e)=>setIbiBasura(Number(e.target.value))} min={0} style={inputStyle} />
                            </td>
                            <td style={tdStyle}>
                              <input type="number" value={comunidad} onChange={(e)=>setComunidad(Number(e.target.value))} min={0} style={inputStyle} />
                            </td>
                          </tr>
                        </tbody>
                    </table>
                  </div>

                <EscenariosHipotecas scenarios={escenariosGuardados} onLoad={loadScenario} onDelete={deleteScenario} onUpdateName={updateScenarioName} />

                <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Nombre del escenario (opcional)" value={scenarioName} onChange={(e)=>setScenarioName(e.target.value)} style={{ ...inputStyle, width: 260 }} />
                  <button onClick={saveScenario} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: '#f3f4f6' }}>Guardar escenario</button>
                </div>
              </section>

              {/* Sección 3 (Venta, dinero neto...) */}
              <section style={{ marginTop: '18px' }}>
                <h2 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#111827' }}>3. Venta, dinero neto que te quedaría, ROI y origen de los gastos</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div style={cardMini}>
                    <span style={labelMini}>Año estimado de venta</span>
                    <select value={anioVenta} onChange={(e)=>setAnioVenta(Number(e.target.value))} style={{ marginTop: '4px', padding: '6px 10px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}>
                      {Array.from({ length: añosSimulacion }, (_, i) => i+1).map(a => <option key={a} value={a}>Año {a}</option>)}
                    </select>
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Antes de 3 años → impuestos compra 10% · Desde año 3 → 8%</span>
                  </div>

                  <div style={cardMini}>
                    <span style={labelMini}>Mejoras realizadas en la vivienda</span>
                    <input type="number" value={mejoras} onChange={(e)=>setMejoras(Number(e.target.value))} min={0} style={{ ...inputStyle, marginTop: '4px' }} />
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Reformas, mejoras, etc.</span>
                  </div>

                  <div style={cardMini}>
                    <span style={labelMini}>Precio de venta que TÚ estimas (opcional)</span>
                    <input type="number" value={precioVentaManual} onChange={(e)=>setPrecioVentaManual(Number(e.target.value))} min={0} style={{ ...inputStyle, marginTop: '4px' }} />
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Si lo dejas en 0, se usa la estimación por revalorización.</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div style={cardMini}>
                    <span style={labelMini}>Precio usado en el cálculo</span>
                    <strong style={valueMini}>{precioVentaUsado.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{precioVentaManual>0 ? 'Usando tu precio manual.' : 'Usando el precio estimado sobre valor de mercado.'}</span>
                  </div>

                  <div style={cardMini}><span style={labelMini}>Impuestos de compra ({impuestoCompraPercent}%)</span><strong style={valueMini}>{impuestosCompra.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</strong><span style={{ fontSize: '0.8rem', color: '#9ca3af' }}><strong>Origen:</strong> gasto de compra de vivienda.</span></div>

                  <div style={cardMini}><span style={labelMini}>Intereses pagados hasta el año {anioVenta}</span><strong style={valueMini}>{interesesPagadosHastaVenta.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits:0 })}</strong><span style={{ fontSize: '0.8rem', color: '#9ca3af' }}><strong>Origen:</strong> coste financiero de la hipoteca. Meses pagados: {mesesHastaVenta}</span></div>

                  <div style={cardMini}><span style={labelMini}>Hipoteca pendiente al vender</span><strong style={valueMini}>{saldoRestanteHipoteca.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits:0 })}</strong><span style={{ fontSize: '0.8rem', color: '#9ca3af' }}><strong>Origen:</strong> capital pendiente de amortizar.</span></div>

                  <div style={cardMini}><span style={labelMini}>Mejoras descontadas</span><strong style={valueMini}>{mejoras.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</strong><span style={{ fontSize: '0.8rem', color: '#9ca3af' }}><strong>Origen:</strong> reformas/improvements.</span></div>

                  <div style={cardMini}><span style={labelMini}>Gasto gestor hipotecario</span><strong style={valueMini}>{gestorHipotecario.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</strong><span style={{ fontSize: '0.8rem', color: '#9ca3af' }}><strong>Origen:</strong> gasto de gestor (deducible en base imponible al vender).</span></div>

                  <div style={cardMini}><span style={labelMini}>Plusvalía bruta estimada</span><strong style={{ ...valueMini, color: plusvaliaBruta>=0? '#15803d':'#b91c1c' }}>{plusvaliaBruta.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits:0 })}</strong><div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 8 }}>{/* formula info omitted for brevity */}</div></div>

                  <div style={cardMini}><span style={labelMini}>Impuesto plusvalía (10%)</span><strong style={valueMini}>{impuestoPlusvaliaVenta.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits:0 })}</strong><span style={{ fontSize: '0.8rem', color: '#9ca3af' }}><strong>Origen:</strong> impuesto sobre la ganancia.</span></div>

                  <div style={cardMini}><span style={labelMini}>Impuesto hipotético 2% (venta &lt; 3 años)</span><strong style={valueMini}>{impuestoHipoteticoNoViviendaHabitual.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits:0 })}</strong><span style={{ fontSize: '0.8rem', color: '#9ca3af' }}><strong>Origen:</strong> pérdida condición de vivienda habitual si vendes antes de 3 años (escenario hipotético).</span></div>

                  <div style={cardMini}><span style={labelMini}>Plusvalía neta después de impuestos</span><strong style={{ ...valueMini, color: plusvaliaNeta>=0? '#15803d':'#b91c1c' }}>{plusvaliaNeta.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits:0 })}</strong></div>

                  <div style={cardMini}><span style={labelMini}>Dinero que te quedaría en la cuenta al vender</span><strong style={{ ...valueMini, color: dineroNetoEnCuenta>=0? '#15803d':'#b91c1c' }}>{dineroNetoEnCuenta.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits:0 })}</strong><span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Precio venta - hipoteca pendiente - impuestos de venta.</span></div>

                  <div style={cardMini}><span style={labelMini}>Gasto acumulado si hubieras seguido de alquiler</span><strong style={valueMini}>{gastoAlquilerAcumulado.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits:0 })}</strong><span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{anioVenta} años × alquiler anual.</span></div>

                  <div style={cardMini}><span style={labelMini}>ROI de la operación (sobre efectivo invertido)</span><strong style={{ ...valueMini, color: roi>=0? '#15803d':'#b91c1c' }}>{isFinite(roi)? roi.toFixed(1): '-' }%</strong><span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>ROI ≈ plusvalía neta / (entrada + notaría + impuestos compra + mejoras)</span></div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {showAlquilarModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowAlquilarModal(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500 }}
        >
          <div style={{ width: 'min(980px, 96%)', maxHeight: '90vh', overflow: 'auto', background: '#fff', borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Alquilar o vender?</h3>
              <div>
                <button onClick={() => setShowAlquilarModal(false)} style={{ padding: '6px 8px', borderRadius: 8 }}>Cerrar</button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <OpcionAlquiler
                precioCompra={precioCompra}
                gastosCompra={gastosNotaria}
                precioVenta={precioVentaUsado}
                gastosVenta={gastosNotaria}
                entrada={entrada}
                añosHipoteca={añosHipoteca}
                interesHipoteca={interes}
                rentaMensualP1={Math.round(alquilerPosible/2)}
                rentaMensualP2={Math.round(alquilerPosible/2)}
              />
            </div>
          </div>
        </div>
      )}

        {/* 5. Mercado del alquiler: ¿a cuánto deberías alquilar tu piso para que se pague solo? */}

        {showAlquilerMercadoModal && (
          <div
            onClick={(e) => { if (e.target === e.currentTarget) setShowAlquilerMercadoModal(false); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500 }}
          >
            <div style={{ width: 'min(920px, 96%)', maxHeight: '90vh', overflow: 'auto', background: '#fff', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Mercado del alquiler: ¿a cuánto debería alquilarse tu piso?</h3>
                <div>
                  <button onClick={() => setShowAlquilerMercadoModal(false)} style={{ padding: '6px 8px', borderRadius: 8 }}>Cerrar</button>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <section style={{ marginTop: "24px" }}>
                  <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "10px" }}>
                    Aquí estimas la posibilidad de <strong>alquilar tu propia vivienda desde el minuto 1</strong>:
                    cuánto debería cobrarse de alquiler para cubrir hipoteca + gastos fijos y, además, darte una rentabilidad sobre el dinero que has puesto.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1.8fr)", gap: "16px", alignItems: "flex-start" }}>
                    <div style={cardMini}>
                      <span style={labelMini}>Alquiler que crees que podrías cobrar por TU vivienda</span>
                      <input type="number" value={alquilerPosible} onChange={(e) => setAlquilerPosible(Number(e.target.value))} min={0} style={{ ...inputStyle, marginTop: "4px" }} />
                      <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Este dato viene del mercado del alquiler de la zona (ideal: portales inmobiliarios, comparables, etc.).</span>
                    </div>

                    <div style={{ ...cardMini, padding: 12 }}>
                      <strong style={{ display: 'block', marginBottom: 8 }}>Ajustes para cálculo (Mercado)</strong>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6 }}>Comunidad (mensual)
                        <input type="number" value={comunidadMercado} onChange={(e) => setComunidadMercado(Number(e.target.value))} style={{ ...inputStyle, marginTop: 4 }} />
                      </label>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6 }}>IBI anual
                        <input type="number" value={ibiAnualMercado} onChange={(e) => setIbiAnualMercado(Number(e.target.value))} style={{ ...inputStyle, marginTop: 4 }} />
                      </label>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6 }}>Basura anual
                        <input type="number" value={basuraAnualMercado} onChange={(e) => setBasuraAnualMercado(Number(e.target.value))} style={{ ...inputStyle, marginTop: 4 }} />
                      </label>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6 }}>Seguro anual
                        <input type="number" value={seguroAnualMercado} onChange={(e) => setSeguroAnualMercado(Number(e.target.value))} style={{ ...inputStyle, marginTop: 4 }} />
                      </label>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6 }}>Pérdida de deducciones (anual)
                        <input type="number" value={perdidaDeduccionesAnualMercado} onChange={(e) => setPerdidaDeduccionesAnualMercado(Number(e.target.value))} style={{ ...inputStyle, marginTop: 4 }} />
                      </label>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 6 }}>Intereses (3 años) — total
                        <input type="number" value={intereses3AniosMercado} onChange={(e) => setIntereses3AniosMercado(Number(e.target.value))} style={{ ...inputStyle, marginTop: 4 }} />
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <input type="checkbox" checked={useSimulatedInteresesMercado} onChange={(e) => setUseSimulatedInteresesMercado(e.target.checked)} />
                        <span style={{ fontSize: '0.85rem' }}>Usar intereses simulados de la hipoteca (primeros 3 años)</span>
                      </label>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                      <div style={cardMini}>
                        <span style={labelMini}>Alquiler mínimo para “pagarse solo”</span>
                        <strong style={valueMini}>{alquilerEquilibrio.toLocaleString("es-ES", { style: "currency", currency: "EUR" })} / mes</strong>
                      </div>
                      <div style={cardMini}>
                        <span style={labelMini}>Renta estimada que propones</span>
                        <strong style={valueMini}>{alquilerPosible.toLocaleString("es-ES", { style: "currency", currency: "EUR" })} / mes</strong>
                      </div>
                      <div style={cardMini}>
                        <span style={labelMini}>Rentabilidad sobre efectivo</span>
                        <strong style={valueMini}>{rentabilidadAlquilerSobreEfectivo.toFixed(2)}%</strong>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        { !hideSection5 && (
        <section style={{ marginTop: "32px" }}>
          <h2
            style={{
              fontSize: "1.1rem",
              marginBottom: "8px",
              color: "#111827",
            }}
          >
            5. Mercado del alquiler: ¿a cuánto debería alquilarse tu piso?
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#6b7280",
              marginBottom: "10px",
            }}
          >
            Aquí estimas la posibilidad de{" "}
            <strong>alquilar tu propia vivienda desde el minuto 1</strong>:
            cuánto debería cobrarse de alquiler para cubrir hipoteca +
            gastos fijos y, además, darte una rentabilidad sobre el
            dinero que has puesto.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1.8fr)",
              gap: "16px",
              alignItems: "flex-start",
            }}
          >
            {/* Input de alquiler posible */}
            <div style={cardMini}>
              <span style={labelMini}>
                Alquiler que crees que podrías cobrar por TU vivienda
              </span>
              <input
                type="number"
                value={alquilerPosible}
                onChange={(e) =>
                  setAlquilerPosible(Number(e.target.value))
                }
                min={0}
                style={{ ...inputStyle, marginTop: "4px" }}
              />
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                Este dato viene del mercado del alquiler de la zona (ideal:
                portales inmobiliarios, comparables, etc.).
              </span>
            </div>

            {/* Resultados del escenario de alquiler de tu piso */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "12px",
              }}
            >
              <div style={cardMini}>
                <span style={labelMini}>
                  Alquiler mínimo para “pagarse solo”
                </span>
                <strong style={valueMini}>
                  {alquilerEquilibrio.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}{" "}
                  / mes
                </strong>
                <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                  Cubre cuota hipoteca + IBI/basura + comunidad.
                </span>
              </div>

              <div style={cardMini}>
                <span style={labelMini}>
                  Alquiler para ~3% rentabilidad sobre tu efectivo
                </span>
                <strong style={valueMini}>
                  {alquilerPara3Porciento.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}{" "}
                  / mes
                </strong>
              </div>

              <div style={cardMini}>
                <span style={labelMini}>
                  Alquiler para ~5% rentabilidad sobre tu efectivo
                </span>
                <strong style={valueMini}>
                  {alquilerPara5Porciento.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                  })}{" "}
                  / mes
                </strong>
              </div>

              <div style={cardMini}>
                <span style={labelMini}>
                  Rentabilidad de tu alquiler estimado
                </span>
                <strong style={valueMini}>
                  {isFinite(rentabilidadAlquilerSobreEfectivo)
                    ? rentabilidadAlquilerSobreEfectivo.toFixed(1)
                    : "-"}
                  %
                </strong>
                <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                  Sobre efectivo invertido. Rendimiento bruto sobre precio
                  compra:{" "}
                  {isFinite(rentabilidadAlquilerSobrePrecioCompra)
                    ? rentabilidadAlquilerSobrePrecioCompra.toFixed(1)
                    : "-"}
                  %/año.
                </span>
              </div>
            </div>
          </div>
        </section>

        )}

        {/* 6. Estimador detallado de alquiler (componente separado). Ahora se abre desde modal para evitar repetir inputs. */}

        {/* Botón: evaluar todo con GPT */}
        <section style={{ marginTop: 20 }}>
          <EvaluaGPT data={evaluaData} />
        </section>
        {/* Dashboard compacto: ocultable con botón */}
        <section style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setShowDashboard((s) => !s)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                background: showDashboard ? '#eef2ff' : '#fff',
              }}
            >
              {showDashboard ? 'Ocultar panel resumen' : 'Mostrar panel resumen'}
            </button>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Muestra un panel compacto con los cálculos clave (sin salir de la página).
            </div>
          </div>

          {showDashboard && (
            <div style={{ marginTop: 12 }}>
              <ViviendaDashboard />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Estilos reutilizables
const thStyle = {
  padding: "10px 12px",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#4b5563",
  borderBottom: "1px solid #e5e7eb",
};

const tdStyle = {
  padding: "10px 12px",
  borderBottom: "1px solid #f3f4f6",
};

const inputStyle = {
  width: "100%",
  padding: "6px 8px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "0.9rem",
  outline: "none",
};

const cardMini = {
  borderRadius: "14px",
  padding: "12px 14px",
  background:
    "radial-gradient(circle at top left, #eff6ff, var(--card-bg) 45%, #f9fafb)",
  border: "1px solid var(--card-border)",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const labelMini = {
  fontSize: "0.8rem",
  color: "#6b7280",
};

const valueMini = {
  fontSize: "1.05rem",
  color: "#111827",
};

export default DecisionVivienda;
