// src/App.jsx
// Layout principal con navegación + rutas

import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useMatch } from "react-router-dom";
import DecisionVivienda from "./pages/Vivienda/DecisionVivienda";
import ContadorReps from "./pages/Ejercicio/ContadorReps";

function Home() {
  const CLIENTS_KEY = "cr_clients_v1";
  const STORAGE_KEY = "cr_state_v1";
  const [clients, setClients] = useState([]);
  const [volumes, setVolumes] = useState({});

  const reloadClientsAndVolumes = () => {
    try {
      const raw = localStorage.getItem(CLIENTS_KEY);
      if (raw) setClients(JSON.parse(raw));
    } catch (e) {
      console.warn("No se pudieron cargar clientes en Home", e);
    }

    try {
      const rawState = localStorage.getItem(STORAGE_KEY);
      if (rawState) {
        const parsed = JSON.parse(rawState);
        const hist = Array.isArray(parsed.sessionHistory)
          ? parsed.sessionHistory
          : [];
        const m = {};
        hist.forEach((h) => {
          const cid = h.clientId || null;
          const vol = Number(h.volume) || 0;
          if (!cid) return;
          m[cid] = (m[cid] || 0) + vol;
        });
        setVolumes(m);
      }
    } catch (e) {
      console.warn("No se pudieron calcular volúmenes enHome", e);
    }
  };

  useEffect(() => {
    reloadClientsAndVolumes();
  }, []);
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa, #e4ecf5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          width: "100%",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 18px 45px rgba(15, 23, 42, 0.12)",
          padding: "24px 24px 32px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>
          Panel de decisiones sobre vivienda
        </h1>
        <p
          style={{
            color: "#6b7280",
            fontSize: "0.95rem",
            marginBottom: "24px",
          }}
        >
          Aquí podrás comparar si te compensa más vender o alquilar tu vivienda,
          simulando cuotas, gastos e impuestos.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          {/* Botón que abre la calculadora */}
          <Link
            to="/calculadora"
            style={{
              padding: "10px 18px",
              borderRadius: "999px",
              border: "none",
              background:
                "linear-gradient(135deg, #2563eb, #1d4ed8)", // azul suave
              color: "white",
              fontWeight: 600,
              fontSize: "0.95rem",
              textDecoration: "none",
              boxShadow: "0 10px 25px rgba(37, 99, 235, 0.35)",
            }}
          >
            Ir a la calculadora
          </Link>

          {/* Botón que abre el contador de repeticiones */}
          <Link
            to="/contador-reps"
            style={{
              padding: "10px 18px",
              borderRadius: "999px",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#374151",
              fontWeight: 600,
              fontSize: "0.95rem",
              textDecoration: "none",
            }}
          >
            Contador de repeticiones
          </Link>

          {/* Quick links per cliente (if any) */}
          {clients && clients.length > 0 && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {clients.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  to={`/contadorreps/${encodeURIComponent(c.id)}`}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                    color: "#374151",
                    fontSize: "0.85rem",
                    textDecoration: "none",
                  }}
                >
                  {c.nombre}
                  <span style={{ marginLeft: 8, color: "#6b7280", fontSize: "0.8rem" }}>
                    ({(volumes[c.id] || 0).toFixed(0)} vol)
                  </span>
                </Link>
              ))}

              <button
                type="button"
                onClick={reloadClientsAndVolumes}
                style={{ padding: "8px 10px", borderRadius: 999, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer" }}
              >
                Recargar
              </button>
            </div>
          )}

          {/* Botón secundario (lo puedes usar luego para otra página) */}
          <button
            type="button"
            style={{
              padding: "10px 18px",
              borderRadius: "999px",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#374151",
              fontSize: "0.9rem",
              cursor: "default",
            }}
          >
            Próximamente: análisis de mercado
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const isPatientPublicView = Boolean(useMatch("/contadorreps/:clientId"));
  return (
    <div>
      {/* Barra superior de navegación */}
      <nav
        style={{
          width: "100%",
          padding: "10px 18px",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {!isPatientPublicView && (
          <Link
            to="/"
            style={{
              fontWeight: 700,
              fontSize: "1rem",
              color: "#111827",
              textDecoration: "none",
            }}
          >
            🏡 
          </Link>
        )}
      </nav>

      {/* Zona donde se cargan las páginas */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calculadora" element={<DecisionVivienda />} />
        <Route path="/contador-reps" element={<ContadorReps />} />
        {/* New routes: support per-client views and alternate path */}
        <Route path="/contadorreps" element={<ContadorReps />} />
        <Route path="/contadorreps/:clientId" element={<ContadorReps />} />
      </Routes>
    </div>
  );
}

export default App;
