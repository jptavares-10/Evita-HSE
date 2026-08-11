import { supabase } from "@/integrations/supabase/client";

/**
 * Private buckets that require signed URLs.
 */
const PRIVATE_BUCKETS = [
  "avatars",
  "company-logos",
  "occurrence-files",
  "mtr-files",
  "training-certificates",
  "supplier-documents",
  "service-attachments",
  "environmental-licenses",
  "documents-library",
  "epi-certificates",
  "aso-files",
  "inspection-files",
  "epi-files",
  "review-attachments",
  "calendar-attachments",
  "epi-signatures",
  "license-conditionants",
] as const;

export type PrivateBucket = (typeof PRIVATE_BUCKETS)[number];

/**
 * Extract the storage path from either a full Supabase public URL or a raw path.
 * Handles both old data (full URLs) and new data (just the path).
 */
export function extractStoragePath(bucket: string, pathOrUrl: string): string {
  if (!pathOrUrl) return pathOrUrl;

  if (pathOrUrl.startsWith("http")) {
    // Full public URL format: .../storage/v1/object/public/{bucket}/{path}
    const publicMarker = `/storage/v1/object/public/${bucket}/`;
    const publicIdx = pathOrUrl.indexOf(publicMarker);
    if (publicIdx !== -1) {
      return decodeURIComponent(pathOrUrl.substring(publicIdx + publicMarker.length));
    }

    // Signed URL format: .../storage/v1/object/sign/{bucket}/{path}?token=...
    const signMarker = `/storage/v1/object/sign/${bucket}/`;
    const signIdx = pathOrUrl.indexOf(signMarker);
    if (signIdx !== -1) {
      const afterMarker = pathOrUrl.substring(signIdx + signMarker.length);
      return decodeURIComponent(afterMarker.split("?")[0]);
    }
  }

  // Already a path
  return pathOrUrl;
}

/**
 * Generate a signed URL for a file in a private bucket.
 * Returns null if the input is falsy or if signing fails.
 * URL expires in 3600 seconds (1 hour).
 */
export async function getSignedUrl(
  bucket: PrivateBucket,
  pathOrUrl: string | null | undefined
): Promise<string | null> {
  if (!pathOrUrl) return null;

  const path = extractStoragePath(bucket, pathOrUrl);
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600);

  if (error || !data?.signedUrl) {
    console.warn(`Failed to get signed URL for ${bucket}/${path}:`, error?.message);
    return null;
  }

  return data.signedUrl;
}

/**
 * Generate signed URLs for multiple files in the same bucket.
 * Returns a map of original pathOrUrl → signedUrl.
 */
export async function getSignedUrls(
  bucket: PrivateBucket,
  pathsOrUrls: string[]
): Promise<Record<string, string>> {
  if (!pathsOrUrls.length) return {};

  const paths = pathsOrUrls.map((p) => extractStoragePath(bucket, p));
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, 3600);

  if (error || !data) {
    console.warn(`Failed to get signed URLs for ${bucket}:`, error?.message);
    return {};
  }

  const result: Record<string, string> = {};
  data.forEach((item, index) => {
    if (item.signedUrl) {
      result[pathsOrUrls[index]] = item.signedUrl;
    }
  });
  return result;
}
