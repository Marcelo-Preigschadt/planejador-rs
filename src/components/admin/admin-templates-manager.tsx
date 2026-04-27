"use client";

import { useMemo, useState } from "react";
import { FileCog, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DocumentActions } from "@/components/documents/document-actions";
import { formatBytes } from "@/components/documents/document-form-util";
import type { DocumentRecord, School } from "@/lib/types";

type Props = {
  initialTemplates: DocumentRecord[];
  schools: School[];
  currentUserId: string;
};

type FormState = {
  title: string;
  visibility: "official" | "school";
  school_id: string;
  notes: string;
};

const initialForm: FormState = {
  title: "",
  visibility: "official",
  school_id: "",
  notes: "",
};

export function AdminTemplatesManager({
  initialTemplates,
  schools,
  currentUserId,
}: Props) {
  const supabase = createClient();

  const [templates, setTemplates] = useState<DocumentRecord[]>(initialTemplates);
  const [form, setForm] = useState<FormState>(initialForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"idle" | "success" | "error">("idle");

  const sortedTemplates = useMemo(() => templates, [templates]);

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

  function resetForm() {
    setForm(initialForm);
    setSelectedFile(null);
    const input = document.getElementById("template-file-input") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  async function reloadTemplates() {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("document_type", "template")
      .order("created_at", { ascending: false });

    if (error) {
      showError(`Erro ao recarregar templates: ${error.message}`);
      return;
    }

    setTemplates((data ?? []) as DocumentRecord[]);
  }

  function validateForm() {
    if (!form.title.trim()) {
      showError("Informe o título do template.");
      return false;
    }

    if (!selectedFile) {
      showError("Selecione um arquivo DOCX ou XLSX.");
      return false;
    }

    const lower = selectedFile.name.toLowerCase();
    const valid = lower.endsWith(".docx") || lower.endsWith(".xlsx");

    if (!valid) {
      showError("Envie apenas DOCX ou XLSX.");
      return false;
    }

    if (form.visibility === "school" && !form.school_id) {
      showError("Selecione a escola para template compartilhado.");
      return false;
    }

    return true;
  }

  async function handleUpload() {
    if (!validateForm() || !selectedFile) return;

    setLoading(true);
    setMessage("");

    const timestamp = Date.now();
    const safeName = selectedFile.name.replace(/\s+/g, "_");
    const filePath = `templates/${timestamp}_${safeName}`;

    const upload = await supabase.storage
      .from("documents")
      .upload(filePath, selectedFile, { upsert: false });

    if (upload.error) {
      setLoading(false);
      showError(`Erro no upload: ${upload.error.message}`);
      return;
    }

    const insert = await supabase.from("documents").insert({
      title: form.title.trim(),
      document_type: "template",
      visibility: form.visibility,
      source_kind: "manual_upload",
      school_id: form.visibility === "school" ? form.school_id : null,
      owner_user_id: currentUserId,
      file_name: selectedFile.name,
      file_path: filePath,
      mime_type: selectedFile.type || null,
      file_size: selectedFile.size,
      storage_bucket: "documents",
      status: "uploaded",
      usable_by_ai: false,
      approved_by_admin: true,
      notes: form.notes.trim() || null,
    });

    setLoading(false);

    if (insert.error) {
      await supabase.storage.from("documents").remove([filePath]);
      showError(`Erro ao registrar template: ${insert.error.message}`);
      return;
    }

    resetForm();
    showSuccess("Template enviado com sucesso.");
    await reloadTemplates();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Novo template</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Título do template"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
          />

          <select
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            value={form.visibility}
            onChange={(e) => updateField("visibility", e.target.value as "official" | "school")}
          >
            <option value="official">Oficial</option>
            <option value="school">Compartilhado da escola</option>
          </select>

          {form.visibility === "school" && (
            <select
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
              value={form.school_id}
              onChange={(e) => updateField("school_id", e.target.value)}
            >
              <option value="">Selecione a escola</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          )}

          <input
            id="template-file-input"
            type="file"
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm"
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
            onClick={handleUpload}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            <Upload size={16} />
            {loading ? "Enviando..." : "Enviar template"}
          </button>

          {message && (
            <p className={`text-sm ${messageType === "error" ? "text-red-600" : "text-slate-600"}`}>
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Templates cadastrados</h2>

        {sortedTemplates.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Nenhum template enviado ainda.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {sortedTemplates.map((doc) => (
              <div key={doc.id} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-slate-100 p-3">
                      <FileCog size={18} className="text-slate-700" />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">{doc.title}</p>
                      <p className="mt-1 text-sm text-slate-500">Visibilidade: {doc.visibility}</p>
                      <p className="text-sm text-slate-500">Arquivo: {doc.file_name}</p>
                      <p className="text-sm text-slate-500">Tamanho: {formatBytes(doc.file_size)}</p>
                      {doc.notes && (
                        <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{doc.notes}</p>
                      )}
                    </div>
                  </div>

                  <DocumentActions doc={doc} onDeleted={reloadTemplates} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}