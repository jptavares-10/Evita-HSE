import { AvatarImage } from "@/components/ui/avatar";
import { useSignedUrl } from "@/hooks/useSignedUrl";

/**
 * AvatarImage that resolves a signed URL from the private `avatars` bucket.
 * Accepts either a raw storage path or a legacy full public URL.
 */
export function SignedAvatarImage({
  path,
  alt,
  className,
}: {
  path?: string | null;
  alt?: string;
  className?: string;
}) {
  const url = useSignedUrl("avatars", path);
  if (!url) return null;
  return <AvatarImage src={url} alt={alt} className={className} />;
}