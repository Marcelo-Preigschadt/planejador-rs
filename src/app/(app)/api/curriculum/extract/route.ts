import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

type ExtractRow = {
  code: string;
  description_literal: string;
  support_text: string;
};

type Payload = {
  fileBase64: string;
  componentName: string;
  gradeLevel: string;
  term: string;
  stage: string;
};

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function cleanChunk(chunk: string) {
  return chunk
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^\W+/, "")
    .replace(/\s+\d+\s*$/, "")
    .trim();
}

function extractSkillsFromText(
  text: string,
  componentName: string,
  gradeLevel: string,
  term: string,
  stage: string
): ExtractRow[] {
  const normalized = normalizeText(text);

  const codeRegex = /\b([A-Z]{2}\d{2}[A-Z]{2,4}\d{2,3})\b/g;
  const matches = [...normalized.matchAll(codeRegex)];

  const rows: ExtractRow[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];

    const code = current[1];
    const start = (current.index ?? 0) + code.length;
    const end = next?.index ?? normalized.length;

    const rawChunk = normalized.slice(start, end);
    const description = cleanChunk(rawChunk);

    if (!description) continue;
    if (description.length < 20) continue;

    const key = `${code}::${description}`;
    if (seen.has(key)) continue;
    seen.add(key);

    rows.push({
      code,
      description_literal: description,
      support_text: `Componente: ${componentName} • Ano/Série: ${gradeLevel} • Trimestre: ${term} • Etapa: ${stage}`,
    });
  }

  return rows;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;

    if (!body.fileBase64) {
      return NextResponse.json(
        { error: "Arquivo não enviado." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(body.fileBase64, "base64");

    const parsed = await pdfParse(buffer);

    const text = parsed.text ?? "";

    const rows = extractSkillsFromText(
      text,
      body.componentName,
      body.gradeLevel,
      body.term,
      body.stage
    );

    return NextResponse.json({
      extracted_text: text,
      skills: rows,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao extrair PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}