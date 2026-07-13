export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "tiktok"
  | "youtube";

export type PartnerSocialLinks = Record<SocialPlatform, string>;

export type SocialFieldKey = SocialPlatform;

export type SocialFieldErrors = Partial<Record<SocialFieldKey, string>>;

export const SOCIAL_PRESENCE_SECTION_TITLE = "Social Presence (Optional)";

export const SOCIAL_PRESENCE_SECTION_DESCRIPTION =
  "Optional, but recommended. Help members discover more about your brand and build trust by linking your social channels.";

export const EMPTY_PARTNER_SOCIAL_LINKS: PartnerSocialLinks = {
  instagram: "",
  facebook: "",
  linkedin: "",
  tiktok: "",
  youtube: "",
};

export const SOCIAL_FIELD_ORDER: SocialFieldKey[] = [
  "instagram",
  "facebook",
  "linkedin",
  "tiktok",
  "youtube",
];

export const SOCIAL_FIELD_CONFIG: Record<
  SocialFieldKey,
  { label: string; placeholder: string }
> = {
  instagram: {
    label: "Instagram",
    placeholder: "@examplebrand",
  },
  facebook: {
    label: "Facebook",
    placeholder: "https://facebook.com/examplebrand",
  },
  linkedin: {
    label: "LinkedIn",
    placeholder: "https://linkedin.com/company/examplebrand",
  },
  tiktok: {
    label: "TikTok",
    placeholder: "@examplebrand",
  },
  youtube: {
    label: "YouTube",
    placeholder: "https://youtube.com/@examplebrand",
  },
};

const SOCIAL_HANDLE_PATTERN = /^@[A-Za-z0-9._]+$/;

const FACEBOOK_PREFIXES = [
  "https://facebook.com/",
  "https://www.facebook.com/",
] as const;

const LINKEDIN_PREFIXES = [
  "https://linkedin.com/",
  "https://www.linkedin.com/",
] as const;

const YOUTUBE_PREFIXES = [
  "https://youtube.com/",
  "https://www.youtube.com/",
  "https://youtu.be/",
] as const;

export function isBlankSocialValue(value: string | null | undefined): boolean {
  return !value || value.trim() === "";
}

function hasUrlPrefix(value: string, prefixes: readonly string[]): boolean {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  return prefixes.some((prefix) => lower.startsWith(prefix.toLowerCase()));
}

export function validateInstagram(value: string): string | null {
  if (isBlankSocialValue(value)) return null;
  if (!SOCIAL_HANDLE_PATTERN.test(value.trim())) {
    return "Please enter a valid Instagram handle (example: @examplebrand)";
  }
  return null;
}

export function validateFacebook(value: string): string | null {
  if (isBlankSocialValue(value)) return null;
  if (!hasUrlPrefix(value, FACEBOOK_PREFIXES)) {
    return "Please enter a valid Facebook page URL.";
  }
  return null;
}

export function validateLinkedIn(value: string): string | null {
  if (isBlankSocialValue(value)) return null;
  if (!hasUrlPrefix(value, LINKEDIN_PREFIXES)) {
    return "Please enter a valid LinkedIn page URL.";
  }
  return null;
}

export function validateTikTok(value: string): string | null {
  if (isBlankSocialValue(value)) return null;
  if (!SOCIAL_HANDLE_PATTERN.test(value.trim())) {
    return "Please enter a valid TikTok handle (example: @examplebrand)";
  }
  return null;
}

export function validateYouTube(value: string): string | null {
  if (isBlankSocialValue(value)) return null;
  if (!hasUrlPrefix(value, YOUTUBE_PREFIXES)) {
    return "Please enter a valid YouTube channel URL.";
  }
  return null;
}

export function validateSocialField(
  field: SocialFieldKey,
  value: string
): string | null {
  switch (field) {
    case "instagram":
      return validateInstagram(value);
    case "facebook":
      return validateFacebook(value);
    case "linkedin":
      return validateLinkedIn(value);
    case "tiktok":
      return validateTikTok(value);
    case "youtube":
      return validateYouTube(value);
    default:
      return null;
  }
}

export function validatePartnerSocialLinks(
  links: PartnerSocialLinks
): SocialFieldErrors {
  const errors: SocialFieldErrors = {};

  for (const field of SOCIAL_FIELD_ORDER) {
    const message = validateSocialField(field, links[field]);
    if (message) {
      errors[field] = message;
    }
  }

  return errors;
}

export function hasSocialFieldErrors(errors: SocialFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function normalizeSocialValueForStorage(
  value: string | null | undefined
): string | null {
  if (isBlankSocialValue(value)) return null;
  return value!.trim();
}

export function buildInstagramProfileUrl(
  handle: string | null | undefined
): string | null {
  if (isBlankSocialValue(handle)) return null;
  const username = handle!.trim().replace(/^@/, "");
  return `https://instagram.com/${username}`;
}

export function buildTikTokProfileUrl(
  handle: string | null | undefined
): string | null {
  if (isBlankSocialValue(handle)) return null;
  const username = handle!.trim().replace(/^@/, "");
  return `https://www.tiktok.com/@${username}`;
}

export function buildFacebookProfileUrl(
  value: string | null | undefined
): string | null {
  if (isBlankSocialValue(value)) return null;
  return value!.trim();
}

export function buildLinkedInProfileUrl(
  value: string | null | undefined
): string | null {
  if (isBlankSocialValue(value)) return null;
  return value!.trim();
}

export function buildYouTubeProfileUrl(
  value: string | null | undefined
): string | null {
  if (isBlankSocialValue(value)) return null;
  return value!.trim();
}

export function resolveSocialProfileUrl(
  platform: SocialPlatform,
  stored: string | null | undefined
): string | null {
  switch (platform) {
    case "instagram":
      return buildInstagramProfileUrl(stored);
    case "facebook":
      return buildFacebookProfileUrl(stored);
    case "linkedin":
      return buildLinkedInProfileUrl(stored);
    case "tiktok":
      return buildTikTokProfileUrl(stored);
    case "youtube":
      return buildYouTubeProfileUrl(stored);
    default:
      return null;
  }
}

export type PartnerSocialLinkItem = {
  platform: SocialPlatform;
  label: string;
  href: string;
};

export function listPartnerSocialLinks(
  links: Partial<PartnerSocialLinks> | null | undefined
): PartnerSocialLinkItem[] {
  if (!links) return [];

  return SOCIAL_FIELD_ORDER.flatMap((platform) => {
    const href = resolveSocialProfileUrl(platform, links[platform]);
    if (!href) return [];

    return [
      {
        platform,
        label: SOCIAL_FIELD_CONFIG[platform].label,
        href,
      },
    ];
  });
}

export function patchSocialFieldError(
  errors: SocialFieldErrors,
  field: SocialFieldKey,
  value: string
): SocialFieldErrors {
  const next = { ...errors };
  const message = validateSocialField(field, value);

  if (message) {
    next[field] = message;
  } else {
    delete next[field];
  }

  return next;
}
