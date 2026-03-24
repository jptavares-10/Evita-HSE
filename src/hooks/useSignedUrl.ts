import { useState, useEffect, useRef } from "react";
import { getSignedUrl, getSignedUrls, type PrivateBucket } from "@/lib/storage-utils";

/**
 * Hook that resolves a single signed URL from a private bucket.
 * Caches the result and only re-fetches when pathOrUrl changes.
 */
export function useSignedUrl(
  bucket: PrivateBucket,
  pathOrUrl: string | null | undefined
): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const lastInput = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (pathOrUrl === lastInput.current) return;
    lastInput.current = pathOrUrl;

    if (!pathOrUrl) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    getSignedUrl(bucket, pathOrUrl).then((signed) => {
      if (!cancelled) setUrl(signed);
    });
    return () => { cancelled = true; };
  }, [bucket, pathOrUrl]);

  return url;
}

/**
 * Hook that resolves signed URLs for a list of items with file URLs.
 * Returns a map of original URL/path → signed URL.
 * Only re-fetches when the list of URLs changes.
 */
export function useSignedUrls(
  bucket: PrivateBucket,
  urls: string[]
): Record<string, string> {
  const [signedMap, setSignedMap] = useState<Record<string, string>>({});
  const lastKey = useRef<string>("");

  useEffect(() => {
    const key = urls.join("|");
    if (key === lastKey.current || urls.length === 0) return;
    lastKey.current = key;

    let cancelled = false;
    getSignedUrls(bucket, urls).then((map) => {
      if (!cancelled) setSignedMap(map);
    });
    return () => { cancelled = true; };
  }, [bucket, urls]);

  return signedMap;
}
