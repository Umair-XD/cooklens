import { createHash } from "crypto";

function buildSignature(
  params: Record<string, string>,
  secret: string,
): string {
  // Cloudinary signature: SHA-1 of sorted key=value pairs joined by & + secret
  const str =
    Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("&") + secret;
  return createHash("sha1").update(str).digest("hex");
}

/**
 * Uploads a Blob/File to Cloudinary using a signed request.
 * Runs server-side only (uses CLOUDINARY_* env vars).
 * @returns The secure HTTPS URL of the uploaded asset.
 */
export async function uploadToCloudinary(
  file: Blob,
  folder = "cooklens",
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_KEY;
  const apiSecret = process.env.CLOUDINARY_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_KEY, and CLOUDINARY_SECRET in your environment.",
    );
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params: Record<string, string> = { folder, timestamp };
  const signature = buildSignature(params, apiSecret);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("folder", folder);
  formData.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as any)?.error?.message ?? `Cloudinary upload failed (${res.status})`,
    );
  }

  const data = await res.json();
  return (data as { secure_url: string }).secure_url;
}
