export type RenderedEmail = {
  subject: string;
  html: string;
};

export type EmailLayoutOptions = {
  appUrl: string;
  content: string;
  preheader?: string;
};
