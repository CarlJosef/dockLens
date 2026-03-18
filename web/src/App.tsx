import React, { useMemo, useState } from "react";
import { analyze, AnalyzeResponse } from "./api";

const theme = {
  bg: "linear-gradient(180deg, #f6f8ff 0%, #ffffff 55%)",
  border: "#e7eaf3",
  text: "#111827",
  muted: "#4b5563",
  cardBg: "#ffffff",
  shadow: "0 8px 30px rgba(17, 24, 39, 0.08)",
  softShadow: "0 1px 2px rgba(17, 24, 39, 0.06)",
  primary: "#1f2a44",
};

function Card({
  title,
  right,
  children,
  style,
}: {
  title?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        boxShadow: theme.softShadow,
        padding: 14,
        ...style,
      }}
    >
      {(title || right) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div style={{ fontWeight: 800, color: theme.text }}>{title}</div>
          <div>{right}</div>
        </div>
      )}
      {children}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${theme.border}`,
        background: "rgba(255,255,255,0.9)",
        boxShadow: "0 1px 2px rgba(17, 24, 39, 0.04)",
        color: theme.muted,
        fontSize: 13,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
function SeverityBadge({ severity }: { severity: "low" | "medium" | "high" }) {
  const map = {
    low: { bg: "#e7f6ec", border: "#bfe6c9", text: "#14532d" },
    medium: { bg: "#fff7e6", border: "#ffd79a", text: "#7c4a00" },
    high: { bg: "#ffecec", border: "#ffb3b3", text: "#7f1d1d" },
  } as const;

  const s = map[severity];
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        border: `1px solid ${s.border}`,
        background: s.bg,
        color: s.text,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0.2,
        whiteSpace: "nowrap",
      }}
    >
      {severity.toUpperCase()}
    </span>
  );
}

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
      const out = await analyze(
        apiBase,
        text,
        mode,
        useAi ? "llm:ollama" : "heuristic",
      );
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
    padding: 14,
    background: "#ffffff",
    border: "1px solid #e7e7e7",
    borderRadius: 12,
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  };

  const subtleText: React.CSSProperties = { opacity: 0.75, fontSize: 13 };

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: 20,
        fontFamily: "system-ui, sans-serif",
        background: "#fafafa",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: 42,
          letterSpacing: -0.6,
          color: "#111827",
        }}
      >
        DocLens
      </h1>
      <p
        style={{
          marginTop: 8,
          marginBottom: 18,
          color: "#4b5563",
          lineHeight: 1.5,
        }}
      >
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
        <Pill>
          <b style={{ color: theme.text }}>Mode</b>
          <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
            <option value="requirements">requirements</option>
            <option value="general">general</option>
          </select>
        </Pill>

        <Pill>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
            />
            <b style={{ color: theme.text }}>Use AI (Ollama)</b>
          </label>
        </Pill>

        <button
          onClick={onAnalyze}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontWeight: 700,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        <Pill>
          <b style={{ color: theme.text }}>API</b>
          <span>{apiBase}</span>
        </Pill>

        <Pill>
          {useAi ? (
            <>
              <b style={{ color: theme.text }}>AI</b>
              <span>
                Start with <code>docker-compose.llm.yml</code> • 1–3 min on CPU
              </span>
            </>
          ) : (
            <>
              <b style={{ color: theme.text }}>Heuristic</b>
              <span>Fast and offline</span>
            </>
          )}
        </Pill>
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
