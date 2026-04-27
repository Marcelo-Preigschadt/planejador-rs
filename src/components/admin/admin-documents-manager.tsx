"use client";

import { useMemo, useState } from "react";
import { FileArchive, FileSpreadsheet, FileText, FileType2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DocumentActions } from "@/components/documents/document-actions";
import { adminDocumentTypes, formatBytes } from "@/components/documents/document-form-util";
import type { DocumentRecord, School } from "@/lib/types";

type Props = {
  initialDocuments: DocumentRecord[];
  schools: School[];
  currentUserId: string;
};

type FormState = {
  title: string;
  document_type: string;
  visibility: "official" | "school";
  school_id: string;
  notes: string;
  usable_by_ai: boolean;
};

const initialForm: FormState = {
  title: "",
  document_type: "curriculum",
  visibility: "official",
  school_id: "",
  notes: "",
  usable_by_ai: true,
};

export function AdminDocumentsManager({
  initialDocuments,
  schools,
  currentUserId,
}: Props) {
  const supabase = createClient();

  const [documents, setDocuments] = useState<DocumentRecord[]>(initialDocuments);
  const [form, setForm] = useState<FormState>(initialForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"idle" | "success" | "error">("idle");

  const sortedDocuments = useMemo(() => documents, [documents]);

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
    const input = document.getElementById("admin-document-file") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  async function reloadDocuments() {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .in("visibility", ["official", "school"])
      .order("created_at", { ascending: false });

    if (error) {
      showError(`Erro ao recarregar documentos: ${error.message}`);
      return;
    }

    setDocuments((data ?? []) as DocumentRecord[]);
  }

  function validateForm() {
    if (!form.title.trim()) {
      showError("Informe o título do documento.");
      return false;
    }

    if (!selectedFile) {
      showError("Selecione um arquivo.");
      return false;
    }

    if (form.visibility === "school" && !form.school_id) {
      showError("Selecione a escola para documento compartilhado.");
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
    const filePath = `admin/${form.document_type}/${timestamp}_${safeName}`;

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
      document_type: form.document_type,
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
      usable_by_ai: form.usable_by_ai,
      approved_by_admin: true,
      notes: form.notes.trim() || null,
    });

    setLoading(false);

    if (insert.error) {
      await supabase.storage.from("documents").remove([filePath]);
      showError(`Erro ao registrar documento: ${insert.error.message}`);
      return;
    }

    resetForm();
    showSuccess("Documento importado com sucesso.");
    await reloadDocuments();
  }

  function iconFor(doc: DocumentRecord) {
    const ext = doc.file_name.toLowerCase();

    if (doc.mime_type?.includes("spreadsheet") || ext.endsWith(".xlsx") || ext.endsWith(".csv")) {
      return <FileSpreadsheet size={18} className="text-slate-700" />;
    }
    if (doc.mime_type?.includes("word") || ext.endsWith(".docx")) {
      return <FileType2 size={18} className="text-slate-700" />;
    }
    if (doc.mime_type?.includes("pdf") || ext.endsWith(".pdf")) {
      return <FileArchive size={18} className="text-slate-700" />;
    }
    return <FileText size={18} className="text-slate-700" />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Novo documento oficial/escolar</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            placeholder="Título do documento"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
          />

          <select
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            value={form.document_type}
            onChange={(e) => updateField("document_type", e.target.value)}
          >
            {adminDocumentTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

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
            id="admin-document-file"
            type="file"
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />

          <label className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.usable_by_ai}
              onChange={(e) => updateField("usable_by_ai", e.target.checked)}
            />
            Disponível para IA
          </label>

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
            {loading ? "Enviando..." : "Importar documento"}
          </button>

          {message && (
            <p className={`text-sm ${messageType === "error" ? "text-red-600" : "text-slate-600"}`}>
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Documentos importados</h2>

        {sortedDocuments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Nenhum documento importado ainda.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {sortedDocuments.map((doc) => (
              <div key={doc.id} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-slate-100 p-3">{iconFor(doc)}</div>

                    <div>
                      <p className="font-semibold text-slate-900">{doc.title}</p>
                      <p className="mt-1 text-sm text-slate-500">Tipo: {doc.document_type}</p>
                      <p className="text-sm text-slate-500">Visibilidade: {doc.visibility}</p>
                      <p className="text-sm text-slate-500">Arquivo: {doc.file_name}</p>
                      <p className="text-sm text-slate-500">Tamanho: {formatBytes(doc.file_size)}</p>
                      <p className="text-sm text-slate-500">IA: {doc.usable_by_ai ? "Sim" : "Não"}</p>
                      {doc.notes && (
                        <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{doc.notes}</p>
                      )}
                    </div>
                  </div>

                  <DocumentActions doc={doc} onDeleted={reloadDocuments} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}