// src/App.jsx
// Layout principal con navegación + rutas

import { Routes, Route, Link } from "react-router-dom";
import DecisionVivienda from "./pages/DecisionVivienda";
import ContadorReps from "./pages/Ejercicio/ContadorReps";

function Home() {
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
      </nav>

      {/* Zona donde se cargan las páginas */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calculadora" element={<DecisionVivienda />} />
        <Route path="/contador-reps" element={<ContadorReps />} />
      </Routes>
    </div>
  );
}

export default App;
