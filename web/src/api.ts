export type Severity = "low" | "medium" | "high";

export type Finding = {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  suggestion?: string | null;
};

export type AnalyzeResponse = {
  provider: string;
  summary: string;
  findings: Finding[];
};

export async function analyze(
  apiBase: string,
  text: string,
  mode: "requirements" | "general",
  provider?: string,
) {
  const res = await fetch(`${apiBase}/v1/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, mode, provider }),
  });

  const bodyText = await res.text();
  if (!res.ok) throw new Error(bodyText);
  return JSON.parse(bodyText) as AnalyzeResponse;
}
