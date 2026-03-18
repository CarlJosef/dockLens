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
  const [useAi, setUseAi] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const severityColor: Record<"low" | "medium" | "high", string> = {
    low: "#e7f6ec",
    medium: "#fff7e6",
    high: "#ffecec",
  };

  const severityBorder: Record<"low" | "medium" | "high", string> = {
    low: "#bfe6c9",
    medium: "#ffd79a",
    high: "#ffb3b3",
  };

  async function onAnalyze() {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const out = await analyze(apiBase, text, mode);
      setResult(out);
    } catch (e: any) {
      const msg =
        e?.detail ?? e?.response?.data?.detail ?? e?.message ?? String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const cardStyle: React.CSSProperties = {
    padding: 12,
    background: "#f6f6f6",
    border: "1px solid #ddd",
    borderRadius: 10,
  };

  const subtleText: React.CSSProperties = { opacity: 0.75, fontSize: 13 };

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
          flexWrap: "wrap",
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

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={useAi}
            onChange={(e) => setUseAi(e.target.checked)}
          />
          Use AI (Ollama)
        </label>

        <button
          onClick={onAnalyze}
          disabled={loading}
          style={{
            padding: "10px 14px",
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        <span style={{ opacity: 0.7 }}>API (browser): {apiBase}</span>

        <span style={{ opacity: 0.7 }}>
          {useAi ? (
            <>
              Start stack with <code>docker-compose.llm.yml</code> • LLM may
              take 1–3 minutes on CPU
            </>
          ) : (
            <>Heuristic is fast and offline</>
          )}
        </span>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}
      >
        <div>
          <h3>Input</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: "100%",
              height: 420,
              padding: 12,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              fontSize: 14,
              lineHeight: 1.4,
            }}
          />
        </div>

        <div>
          <h3>Output</h3>

          {error && (
            <div
              style={{
                ...cardStyle,
                background: "#fff3f3",
                borderColor: "#ffd1d1",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Error</div>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{error}</pre>
              {/(ReadTimeout|timed out|timeout)/i.test(error) && (
                <div style={{ marginTop: 8, ...subtleText }}>
                  Try increasing <code>OLLAMA_TIMEOUT_S</code>.
                </div>
              )}
            </div>
          )}

          {loading && (
            <div style={cardStyle}>
              Running analysis...
              <div style={subtleText}>
                If AI is enabled (llm:*), this may take longer on CPU.
              </div>
            </div>
          )}

          {!loading && !error && !result && (
            <div style={cardStyle}>
              Click <b>Analyze</b> to see results.
            </div>
          )}

          {result && (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={cardStyle}>
                <div>
                  <b>Provider:</b> {result.provider}
                </div>
                <div style={{ marginTop: 6 }}>
                  <b>Summary:</b> {result.summary}
                </div>
                {result.provider.startsWith("llm:") && (
                  <div style={{ marginTop: 6, ...subtleText }}>
                    Local LLM analysis can be slow on CPU. Use heuristic mode
                    for fast demos.
                  </div>
                )}
              </div>

              {result.findings.length === 0 ? (
                <div style={cardStyle}>No findings.</div>
              ) : (
                result.findings.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      ...cardStyle,
                      background: "#fff",
                      borderColor: severityBorder[f.severity],
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
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          border: `1px solid ${severityBorder[f.severity]}`,
                          background: severityColor[f.severity],
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {f.severity.toUpperCase()}
                      </span>
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
