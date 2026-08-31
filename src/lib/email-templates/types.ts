export type RenderedEmail = {
  subject: string;
  html: string;
  text?: string;
};

export type EmailLayoutOptions = {
  appUrl: string;
  content: string;
  preheader?: string;
};
