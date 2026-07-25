const MEMBER_NAME_FALLBACK = "Member";

function readMetadataString(
  metadata: Record<string, unknown>,
  key: string
): string {
  const value = metadata[key];
  return typeof value === "string" ? value.trim() : "";
}

export function hasOAuthNameMetadata(metadata: Record<string, unknown>) {
  return Boolean(
    readMetadataString(metadata, "given_name") ||
      readMetadataString(metadata, "full_name") ||
      readMetadataString(metadata, "name") ||
      readMetadataString(metadata, "family_name")
  );
}

function splitFullName(fullName: string) {
  const parts = fullName.split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

/** Extract first/last name from Google (or other OAuth) user_metadata fields. */
export function parseOAuthDisplayName(metadata: Record<string, unknown>) {
  const givenName = readMetadataString(metadata, "given_name");
  const familyName = readMetadataString(metadata, "family_name");

  if (givenName) {
    return {
      firstName: givenName,
      lastName: familyName,
    };
  }

  const displayName =
    readMetadataString(metadata, "full_name") ||
    readMetadataString(metadata, "name");

  if (displayName) {
    const { firstName, lastName } = splitFullName(displayName);
    return {
      firstName,
      lastName: lastName || familyName,
    };
  }

  if (familyName) {
    return {
      firstName: MEMBER_NAME_FALLBACK,
      lastName: familyName,
    };
  }

  return {
    firstName: MEMBER_NAME_FALLBACK,
    lastName: "",
  };
}

export function shouldReplacePlaceholderMemberName(
  metadata: Record<string, unknown>
) {
  const firstName = readMetadataString(metadata, "first_name");
  if (!firstName) {
    return true;
  }

  if (firstName !== MEMBER_NAME_FALLBACK) {
    return false;
  }

  return hasOAuthNameMetadata(metadata);
}

/** Prefer explicit signup names; fall back to OAuth metadata before "Member". */
export function resolveMemberNameFromMetadata(
  metadata: Record<string, unknown>
) {
  const explicitFirst = readMetadataString(metadata, "first_name");
  const explicitLast = readMetadataString(metadata, "last_name");

  if (explicitFirst && !shouldReplacePlaceholderMemberName(metadata)) {
    return {
      firstName: explicitFirst,
      lastName: explicitLast,
    };
  }

  const oauthName = parseOAuthDisplayName(metadata);
  return {
    firstName: oauthName.firstName,
    lastName: oauthName.lastName || explicitLast,
  };
}
