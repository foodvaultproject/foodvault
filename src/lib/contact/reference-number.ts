const REFERENCE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateEnquiryReferenceNumber() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let suffix = "";
  for (const byte of bytes) {
    suffix += REFERENCE_ALPHABET[byte % REFERENCE_ALPHABET.length];
  }
  return `FV-${suffix}`;
}

export function isUniqueConstraintError(error: { code?: string } | null) {
  return error?.code === "23505";
}
