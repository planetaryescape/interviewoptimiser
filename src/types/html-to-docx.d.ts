declare module "html-to-docx" {
  interface DocxOptions {
    orientation?: "portrait" | "landscape";
    pageSize?: {
      width: number;
      height: number;
    };
    margins?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    createdAt?: Date;
    lastModified?: Date;
    description?: string;
    font?: string;
    styles?: {
      heading1?: { font?: string };
      heading2?: { font?: string };
      heading3?: { font?: string };
      heading4?: { font?: string };
      heading5?: { font?: string };
      heading6?: { font?: string };
    };
    creator?: string;
  }

  function HTMLtoDOCX(
    htmlString: string,
    headerHTMLString?: string,
    options?: DocxOptions
  ): Promise<ArrayBuffer>;

  export = HTMLtoDOCX;
}
