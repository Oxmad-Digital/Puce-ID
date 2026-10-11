"use client";

import { useRouter } from "next/navigation";
import { addDocument } from "@/lib/actions/animals";
import { DocumentPicker } from "@/components/forms/file-upload";

export function DocumentsUploader({ animalId }: { animalId: string }) {
  const router = useRouter();
  return (
    <DocumentPicker
      onUploaded={async (file) => {
        await addDocument(animalId, file);
        router.refresh();
      }}
    />
  );
}
