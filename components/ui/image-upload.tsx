"use client";

import { useApolloClient } from "@apollo/client";
import { useState } from "react";

import { GET_PRESIGNED_URL } from "@/lib/graphql/uploads";

type PresignedData = {
  getPresignedUrl: {
    success: boolean;
    message: string;
    presignedUrl: string;
    key: string;
  } | null;
};

/**
 * Sube una imagen a S3 con el mismo flujo que la app móvil:
 * getPresignedUrl → PUT del fichero → devuelve la key para pasarla a
 * updateUserPicture / updateCompanyLogo. El presigned se firma con
 * Content-Type image/jpeg, así que el PUT debe enviar esa cabecera.
 */
export function useImageUpload() {
  const client = useApolloClient();
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const { data } = await client.query<PresignedData>({
        query: GET_PRESIGNED_URL,
        fetchPolicy: "no-cache",
      });
      const presigned = data?.getPresignedUrl;
      if (!presigned?.success) return null;

      const response = await fetch(presigned.presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "image/jpeg" },
      });
      return response.ok ? presigned.key : null;
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
}
