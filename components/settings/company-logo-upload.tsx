"use client";

import { useMutation } from "@apollo/client";
import { ImagePlus, Loader2 } from "lucide-react";
import { useRef } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/components/ui/toast";
import { UPDATE_COMPANY_LOGO } from "@/lib/graphql/companies";
import type { Company } from "@/lib/graphql/types";

export function CompanyLogoUpload({ company }: { company: Company }) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useImageUpload();
  const [updateLogo, { loading: saving }] = useMutation(UPDATE_COMPANY_LOGO);

  const busy = uploading || saving;

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const key = await upload(file);
    if (!key) {
      toast("No se pudo subir la imagen", "error");
      return;
    }
    try {
      const { data } = await updateLogo({ variables: { companyId: company.id, picture: key } });
      if (data?.updateCompanyLogo?.success) {
        toast("Logo actualizado");
      } else {
        toast(data?.updateCompanyLogo?.message ?? "No se pudo actualizar el logo", "error");
      }
    } catch {
      toast("No se pudo actualizar el logo", "error");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar size="xl" name={company.name} url={company.logo?.url} />
      <div className="space-y-1.5">
        <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? (
            <Loader2 size={14} strokeWidth={2} className="animate-spin" />
          ) : (
            <ImagePlus size={14} strokeWidth={1.75} />
          )}
          {busy ? "Subiendo…" : "Cambiar logo"}
        </Button>
        <p className="text-xs text-zinc-400">JPG o PNG cuadrado, se muestra en la app</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
