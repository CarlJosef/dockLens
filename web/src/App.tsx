import React, { useMemo, useState } from "react";
import { analyze, AnalyzeResponse } from "./api";

const sampleText = `The system should be user-friendly and robust.
We should implement this as soon as possible.
Security must be strong.
`;

export default function App() {
  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE ?? "http://localhost:8000",
    [],
  );
  const [mode, setMode] = useState<"requirements" | "general">("requirements");
  const [text, setText] = useState(sampleText);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onAnalyze() {
    setError(null);
    setResult(null);
    try {
      const out = await analyze(apiBase, text, mode);
      setResult(out);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  }

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: 16,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>DocLens</h1>
      <p>
        Paste text, run an AI-style review (currently heuristic), get structured
        findings.
      </p>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <label>
          Mode:&nbsp;
          <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
            <option value="requirements">requirements</option>
            <option value="general">general</option>
          </select>
        </label>

        <button onClick={onAnalyze} style={{ padding: "10px 14px" }}>
          Analyze
        </button>

        <span style={{ opacity: 0.7 }}>API (browser): {apiBase}</span>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}
      >
        <div>
          <h3>Input</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: "100%", height: 420 }}
          />
        </div>

        <div>
          <h3>Output</h3>

          {error && (
            <pre
              style={{
                padding: 12,
                background: "#fff3f3",
                border: "1px solid #ffd1d1",
              }}
            >
              {error}
            </pre>
          )}

          {!error && !result && (
            <div
              style={{
                padding: 12,
                background: "#f6f6f6",
                border: "1px solid #ddd",
              }}
            >
              Click <b>Analyze</b> to see results.
            </div>
          )}

          {result && (
            <div style={{ display: "grid", gap: 10 }}>
              <div
                style={{
                  padding: 12,
                  background: "#f6f6f6",
                  border: "1px solid #ddd",
                }}
              >
                <b>Summary:</b> {result.summary}
                <div
                  style={{
                    padding: 12,
                    background: "#f6f6f6",
                    border: "1px solid #ddd",
                  }}
                >
                  <b>Provider:</b> {result.provider}
                </div>
              </div>

              {result.findings.length === 0 ? (
                <div
                  style={{
                    padding: 12,
                    background: "#f6f6f6",
                    border: "1px solid #ddd",
                  }}
                >
                  No findings.
                </div>
              ) : (
                result.findings.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      padding: 12,
                      background: "#f6f6f6",
                      border: "1px solid #ddd",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <b>{f.title}</b>
                      <span>{f.severity.toUpperCase()}</span>
                    </div>
                    <div style={{ marginTop: 6 }}>{f.detail}</div>
                    {f.suggestion && (
                      <div style={{ marginTop: 6 }}>
                        <b>Suggestion:</b> {f.suggestion}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
