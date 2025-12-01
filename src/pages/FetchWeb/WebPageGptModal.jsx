// WebPageGptModal.jsx
// Botón + modal para: descargar una página web, enviarla a GPT
// y mostrar el HTML procesado según tu prompt.

import React, { useState } from "react";
import "./WebPageGptModal.css";

export default function WebPageGptModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState(
    "Resume el contenido de la página en formato HTML limpio."
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultHtml, setResultHtml] = useState("");

  const openModal = () => {
    setIsOpen(true);
    setError("");
  };

  const closeModal = () => {
    setIsOpen(false);
    setError("");
    setResultHtml("");
  };

  const handleRun = async (e) => {
    e.preventDefault();
    setError("");
    setResultHtml("");

    if (!url || !apiKey || !prompt) {
      setError("Faltan datos: URL, API key o prompt.");
      return;
    }

    setLoading(true);
    try {
      // 1) Descargar la página usando el proxy del servidor para evitar CORS
      const proxyUrl = `/api/fetch?url=${encodeURIComponent(url)}`;
      const pageRes = await fetch(proxyUrl);
      if (!pageRes.ok) {
        // try to parse JSON error, otherwise text
        const ct = pageRes.headers.get('content-type') || '';
        let body = '';
        try {
          if (ct.includes('application/json')) {
            const j = await pageRes.json();
            body = JSON.stringify(j);
          } else {
            body = await pageRes.text();
          }
        } catch (e) {
          body = '<no body available>';
        }
        throw new Error(
          `Error al descargar la página via proxy (${pageRes.status}) ${body}`
        );
      }
      const pageHtml = await pageRes.text();

      // 2) Llamar a OpenAI
      const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini", // cambia el modelo si quieres
          messages: [
            {
              role: "system",
              content:
                "Eres un asistente que recibe el HTML completo de una página web y devuelve solo el HTML final que se debe mostrar dentro de un visor embebido. Respeta estrictamente las instrucciones del usuario. No incluyas etiquetas <html>, <head> ni <body>.",
            },
            {
              role: "user",
              content:
                `Instrucciones del usuario:\n${prompt}\n\n` +
                "A continuación tienes el HTML original de la página entre líneas ---:\n\n" +
                "---\n" +
                pageHtml +
                "\n---",
            },
          ],
          temperature: 0.2,
        }),
      });

      if (!gptRes.ok) {
        const text = await gptRes.text();
        throw new Error(
          `Error en la respuesta de OpenAI: ${gptRes.status} ${gptRes.statusText} - ${text}`
        );
      }

      const data = await gptRes.json();
      const content = data.choices?.[0]?.message?.content || "";

      setResultHtml(content);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BOTÓN QUE ABRE EL MODAL */}
      <button
        type="button"
        className="wpg-open-btn"
        onClick={openModal}
      >
        Abrir asistente web (GPT)
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="wpg-backdrop">
          <div className="wpg-modal">
            {/* CABECERA */}
            <div className="wpg-header">
              <h2 className="wpg-title">Fetch visual con GPT</h2>
              <button
                type="button"
                className="wpg-close-btn"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            {/* FORMULARIO */}
            <form className="wpg-form" onSubmit={handleRun}>
              <label className="wpg-field">
                <span>URL de la página</span>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://ejemplo.com"
                  className="wpg-input"
                />
              </label>

              <label className="wpg-field">
                <span>API Key de OpenAI (solo para pruebas)</span>
                <input
                  type="password"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="wpg-input"
                />
              </label>

              <label className="wpg-field wpg-field-full">
                <span>Prompt para GPT</span>
                <textarea
                  required
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="wpg-textarea"
                />
              </label>

              {error && (
                <div className="wpg-error">
                  ⚠️ {error}
                </div>
              )}

              <div className="wpg-actions">
                <button
                  type="button"
                  className="wpg-btn wpg-btn-ghost"
                  onClick={closeModal}
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="wpg-btn wpg-btn-primary"
                  disabled={loading}
                >
                  {loading ? "Procesando..." : "Fetch + GPT"}
                </button>
              </div>
            </form>

            {/* RESULTADO */}
            <div className="wpg-result">
              <h3 className="wpg-result-title">Resultado</h3>
              {!resultHtml && !loading && (
                <p className="wpg-muted">
                  Aquí aparecerá el HTML generado por GPT según tu prompt.
                </p>
              )}

              {resultHtml && (
                <div
                  className="wpg-result-box"
                  dangerouslySetInnerHTML={{ __html: resultHtml }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
