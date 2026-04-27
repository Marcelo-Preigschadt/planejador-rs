"use client";

import { useMemo, useState } from "react";
import { Upload, WandSparkles, Database } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type {
  Component,
  CurriculumParsedJson,
  CurriculumParsedSkill,
  DocumentRecord,
} from "@/lib/types";

type Props = {
  currentUserId: string;
  components: Component[];
  curriculumDocuments: DocumentRecord[];
};

type FormState = {
  title: string;
  component_id: string;
  grade_level: string;
  term: string;
  stage: string;
  source_version: string;
  notes: string;
};

const initialForm: FormState = {
  title: "",
  component_id: "",
  grade_level: "",
  term: "Anual",
  stage: "Ensino Médio",
  source_version: "v1",
  notes: "",
};

export function AdminCurriculumImporter({
  currentUserId,
  components,
  curriculumDocuments,
}: Props) {
  const supabase = createClient();

  const [documents, setDocuments] = useState<DocumentRecord[]>(curriculumDocuments);
  const [form, setForm] = useState<FormState>(initialForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewSkills, setPreviewSkills] = useState<CurriculumParsedSkill[]>([]);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"idle" | "success" | "error">("idle");

  const selectedComponent = useMemo(
    () => components.find((item) => item.id === form.component_id),
    [components, form.component_id]
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function showSuccess(text: string) {
    setMessage(text);
    setMessageType("success");
  }

  function showError(text: string) {
    setMessage(text);
    setMessageType("error");
  }

  async function reloadDocuments() {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("document_type", "curriculum")
      .order("created_at", { ascending: false });

    if (error) {
      showError(`Erro ao recarregar documentos: ${error.message}`);
      return;
    }

    setDocuments((data ?? []) as DocumentRecord[]);
  }

  function validateUpload() {
    if (!form.title.trim()) {
      showError("Informe o título do documento.");
      return false;
    }
    if (!form.component_id) {
      showError("Selecione o componente.");
      return false;
    }
    if (!form.grade_level.trim()) {
      showError("Informe o ano/série.");
      return false;
    }
    if (!form.term.trim()) {
      showError("Informe o trimestre ou use Anual.");
      return false;
    }
    if (!selectedFile) {
      showError("Selecione o PDF.");
      return false;
    }
    if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      showError("Envie um PDF.");
      return false;
    }
    return true;
  }

  async function fileToBase64(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer).toString("base64");
  }

  async function handleUploadAndExtract() {
    if (!validateUpload() || !selectedFile || !selectedComponent) return;

    setLoading(true);
    setMessage("");

    const timestamp = Date.now();
    const safeName = selectedFile.name.replace(/\s+/g, "_");
    const filePath = `curriculum/${timestamp}_${safeName}`;

    const upload = await supabase.storage
      .from("documents")
      .upload(filePath, selectedFile, { upsert: false });

    if (upload.error) {
      setLoading(false);
      showError(`Erro no upload: ${upload.error.message}`);
      return;
    }

    const documentInsert = await supabase
      .from("documents")
      .insert({
        title: form.title.trim(),
        document_type: "curriculum",
        visibility: "official",
        source_kind: "manual_upload",
        school_id: null,
        owner_user_id: currentUserId,
        file_name: selectedFile.name,
        file_path: filePath,
        mime_type: selectedFile.type || "application/pdf",
        file_size: selectedFile.size,
        storage_bucket: "documents",
        status: "uploaded",
        usable_by_ai: true,
        approved_by_admin: true,
        notes: form.notes.trim() || null,
      })
      .select("*")
      .single();

    if (documentInsert.error || !documentInsert.data) {
      setLoading(false);
      await supabase.storage.from("documents").remove([filePath]);
      showError(`Erro ao registrar documento: ${documentInsert.error?.message ?? "sem retorno"}`);
      return;
    }

    const documentId = documentInsert.data.id;

    const response = await fetch("/api/curriculum/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileBase64: await fileToBase64(selectedFile),
        componentName: selectedComponent.name,
        gradeLevel: form.grade_level,
        term: form.term,
        stage: form.stage,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setLoading(false);
      showError(result.error ?? "Erro ao extrair PDF.");
      return;
    }

    const parsedJson: CurriculumParsedJson = {
      metadata: {
        component_id: form.component_id,
        grade_level: form.grade_level,
        term: form.term,
        stage: form.stage,
        source_version: form.source_version,
      },
      skills: result.skills ?? [],
    };

    const updateDoc = await supabase
      .from("documents")
      .update({
        extracted_text: result.extracted_text,
        parsed_json: parsedJson,
        status: "extracted",
      })
      .eq("id", documentId);

    setLoading(false);

    if (updateDoc.error) {
      showError(`Documento salvo, mas erro ao gravar extração: ${updateDoc.error.message}`);
      return;
    }

    setPreviewSkills((result.skills ?? []) as CurriculumParsedSkill[]);
    setPreviewDocumentId(documentId);
    showSuccess(`Extração concluída. Habilidades detectadas: ${(result.skills ?? []).length}`);
    await reloadDocuments();
  }

  async function handlePreviewFromDocument(doc: DocumentRecord) {
    const parsed = doc.parsed_json as CurriculumParsedJson;
    setPreviewSkills(parsed.skills ?? []);
    setPreviewDocumentId(doc.id);
  }

  async function handlePublish(doc: DocumentRecord) {
    const parsed = doc.parsed_json as CurriculumParsedJson;
    const metadata = parsed.metadata;
    const skills = parsed.skills ?? [];

    if (!metadata) {
      showError("Documento sem metadados de importação.");
      return;
    }

    if (skills.length === 0) {
      showError("Nenhuma habilidade extraída para publicar.");
      return;
    }

    setPublishingId(doc.id);
    setMessage("");

    const rows = skills.map((skill) => ({
      code: skill.code,
      description_literal: skill.description_literal,
      component_id: metadata.component_id,
      grade_level: metadata.grade_level,
      term: metadata.term,
      stage: metadata.stage || null,
      modality: null,
      active: true,
      support_text: skill.support_text,
      source_document_id: doc.id,
      source_version: metadata.source_version,
    }));

    const publish = await supabase
      .from("skills")
      .upsert(rows, {
        onConflict: "code,component_id,grade_level,term",
      });

    setPublishingId(null);

    if (publish.error) {
      showError(`Erro ao publicar habilidades: ${publish.error.message}`);
      return;
    }

    showSuccess("Habilidades publicadas no banco com sucesso.");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Novo importador curricular</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Título do documento"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
          />

          <select
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            value={form.component_id}
            onChange={(e) => updateField("component_id", e.target.value)}
          >
            <option value="">Selecione o componente</option>
            {components.map((component) => (
              <option key={component.id} value={component.id}>
                {component.name}
              </option>
            ))}
          </select>

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Ano/Série"
            value={form.grade_level}
            onChange={(e) => updateField("grade_level", e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Trimestre"
            value={form.term}
            onChange={(e) => updateField("term", e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Etapa"
            value={form.stage}
            onChange={(e) => updateField("stage", e.target.value)}
          />

          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Versão"
            value={form.source_version}
            onChange={(e) => updateField("source_version", e.target.value)}
          />

          <input
            type="file"
            accept=".pdf"
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm md:col-span-2 xl:col-span-3"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />

          <textarea
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500 md:col-span-2 xl:col-span-3"
            placeholder="Observações"
            rows={4}
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={handleUploadAndExtract}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            <Upload size={16} />
            {loading ? "Processando..." : "Enviar e extrair"}
          </button>

          {message && (
            <p className={`text-sm ${messageType === "error" ? "text-red-600" : "text-slate-600"}`}>
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Documentos curriculares importados</h2>

        <div className="mt-4 space-y-4">
          {documents.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum documento curricular importado ainda.</p>
          ) : (
            documents.map((doc) => {
              const parsed = doc.parsed_json as CurriculumParsedJson;
              const count = parsed.skills?.length ?? 0;

              return (
                <div key={doc.id} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{doc.title}</p>
                      <p className="mt-1 text-sm text-slate-500">Arquivo: {doc.file_name}</p>
                      <p className="text-sm text-slate-500">Status: {doc.status}</p>
                      <p className="text-sm text-slate-500">Habilidades detectadas: {count}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handlePreviewFromDocument(doc)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <WandSparkles size={16} />
                        Ver prévia
                      </button>

                      <button
                        onClick={() => handlePublish(doc)}
                        disabled={publishingId === doc.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                      >
                        <Database size={16} />
                        {publishingId === doc.id ? "Publicando..." : "Publicar no banco"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Prévia das habilidades extraídas</h2>

        {!previewDocumentId ? (
          <p className="mt-4 text-sm text-slate-500">
            Extraia um documento ou clique em “Ver prévia”.
          </p>
        ) : previewSkills.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            Nenhuma habilidade detectada neste documento.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {previewSkills.map((skill, index) => (
              <div key={`${skill.code}-${index}`} className="rounded-2xl border border-slate-200 p-5">
                <p className="font-semibold text-slate-900">{skill.code}</p>
                <p className="mt-2 text-sm text-slate-800">{skill.description_literal}</p>
                <p className="mt-2 text-xs text-slate-500">{skill.support_text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}