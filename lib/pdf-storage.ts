import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';
import { createClient } from '@/lib/supabase/server';
import { PDF_BUCKET } from '@/lib/constants';

// 1 hora: de sobra incluso en una conexión lenta subiendo 300+ MB.
const UPLOAD_URL_EXPIRES_SECONDS = 60 * 60;

/** Genera la URL firmada para subir un PDF directo a Cloudflare R2. */
export async function createPdfUploadTicket(path: string) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: path,
    ContentType: 'application/pdf',
  });

  const signedUrl = await getSignedUrl(r2Client, command, {
    expiresIn: UPLOAD_URL_EXPIRES_SECONDS,
  });

  return {
    signedUrl,
    path,
    bucket: PDF_BUCKET,
    publicUrl: `${R2_PUBLIC_URL}/${path}`,
  };
}

/**
 * Borra un PDF sin importar dónde viva: si su URL es de R2 lo borra de R2;
 * si es de Supabase (ediciones subidas antes de este cambio) lo borra ahí.
 */
export async function deletePdfObject(path: string, url?: string | null) {
  const isInR2 = Boolean(url && R2_PUBLIC_URL && url.startsWith(R2_PUBLIC_URL));

  if (isInR2) {
    await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: path }));
    return;
  }

  const supabase = await createClient();
  await supabase.storage.from(PDF_BUCKET).remove([path]);
}