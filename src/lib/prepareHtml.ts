import { getFontFamilyName, getFontFamilyString } from "@/lib/fontUtils";
import { logger } from "~/lib/logger";

export function prepareHtml(htmlContent: string): string {
  if (!htmlContent) {
    logger.error({ event: "generate-docx" }, "HTML content is required");
    return "";
  }

  const bodyFontFamilyString = getFontFamilyString("font-montserrat");
  const headingFontFamilyString = getFontFamilyString("font-raleway");
  const bodyFontFamilyName = getFontFamilyName("font-montserrat");
  const headingFontFamilyName = getFontFamilyName("font-raleway");

  const fontsHeadContent = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans&family=Noto+Sans+Thai:wght@100..900&family=Noto+Sans+Devanagari:wght@100..900&family=Noto+Sans+SC:wght@100..900&family=Noto+Sans+TC:wght@100..900&family=Noto+Sans+CJK+JP:wght@100..900&family=Noto+Sans+JP:wght@100..900&family=Noto+Sans+Arabic:wght@100..900&display=swap" rel="stylesheet">
    ${
      bodyFontFamilyString
        ? `<link href="https://fonts.googleapis.com/css2?family=${bodyFontFamilyString}&display=swap" rel="stylesheet">`
        : ""
    }
    ${
      headingFontFamilyString
        ? `<link href="https://fonts.googleapis.com/css2?family=${headingFontFamilyString}&display=swap" rel="stylesheet">`
        : ""
    }
  `;

  const styledHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Document</title>
        ${fontsHeadContent}
        <style>
          {{css_placeholder}}
          body {
            font-family: '${bodyFontFamilyName}', 'Noto Sans', 'Noto Sans CJK JP', 'Noto Sans Arabic', 'Noto Sans JP', sans-serif;;
            font-size: 11pt;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: '${headingFontFamilyName}', 'Noto Sans', 'Noto Sans CJK JP', 'Noto Sans Arabic', 'Noto Sans JP', sans-serif;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

  return styledHtml;
}
