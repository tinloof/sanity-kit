declare module "speakingurl" {
  interface SpeakingUrlOptions {
    separator?: string;
    locale?: string;
    maintainCase?: boolean;
    mark?: boolean;
    titleCase?: boolean | string[];
  }

  function speakingurl(
    input: string,
    options?: SpeakingUrlOptions
  ): string;

  export = speakingurl;
}