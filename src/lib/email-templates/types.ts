export type EmailAttachment = {
  filename: string;
  content: Buffer | string;
  contentType?: string;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
};

export type EmailLayoutOptions = {
  appUrl: string;
  content: string;
  preheader?: string;
};
