"use client";

import { Download, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DocumentRecord } from "@/lib/types";

type Props = {
  doc: DocumentRecord;
  onDeleted: () => Promise<void>;
  bucketOverride?: string;
};

export function DocumentActions({ doc, onDeleted, bucketOverride }: Props) {
  const supabase = createClient();

  async function handleDownload() {
    const { data, error } = await supabase.storage
      .from(bucketOverride ?? doc.storage_bucket)
      .createSignedUrl(doc.file_path, 60);

    if (error || !data?.signedUrl) {
      alert(error?.message ?? "Erro ao gerar link.");
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  async function handleDelete() {
    const confirmed = window.confirm("Deseja excluir este arquivo?");
    if (!confirmed) return;

    const removeStorage = await supabase.storage
      .from(bucketOverride ?? doc.storage_bucket)
      .remove([doc.file_path]);

    if (removeStorage.error) {
      alert(removeStorage.error.message);
      return;
    }

    const deleteRow = await supabase
      .from("documents")
      .delete()
      .eq("id", doc.id);

    if (deleteRow.error) {
      alert(deleteRow.error.message);
      return;
    }

    await onDeleted();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDownload}
        className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
        title="Abrir arquivo"
      >
        <Download size={16} />
      </button>

      <button
        onClick={handleDelete}
        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
        title="Excluir arquivo"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}