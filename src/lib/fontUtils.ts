export function getFontFamilyString(font: string): string {
  switch (font) {
    case "font-oswald":
      return "Oswald:wght@200;300;400;500;600;700";
    case "font-sourceSerif":
      return "Source+Serif+4:wght@200;300;400;500;600;700;800";
    case "font-roboto":
      return "Roboto:wght@100;300;400;500;700;900";
    case "font-openSans":
      return "Open+Sans:wght@300;400;500;600;700;800";
    case "font-lato":
      return "Lato:wght@100;300;400;700;900";
    case "font-merriweather":
      return "Merriweather:wght@300;400;700;900";
    case "font-playfairDisplay":
      return "Playfair+Display:wght@400;500;600;700;800;900";
    case "font-montserrat":
      return "Montserrat:wght@100;200;300;400;500;600;700;800;900";
    case "font-firaCode":
      return "Fira+Code:wght@300;400;500;600;700";
    case "font-jetbrainsMono":
      return "JetBrains+Mono:wght@100;200;300;400;500;600;700;800";
    case "font-geistSans":
    case "font-geistMono":
      return ""; // These are local fonts, so we don't need to fetch them from Google Fonts
    case "font-aller":
      return "Aller:wght@400;700";
    case "font-arial":
      return ""; // Arial is a system font, no need to fetch
    case "font-bebas-kai":
      return "Bebas+Kai:wght@400";
    case "font-bebas-neue":
      return "Bebas+Neue:wght@400";
    case "font-butler":
      return "Butler:wght@400;700";
    case "font-calibri":
      return ""; // Calibri is a system font, no need to fetch
    case "font-comfortaa":
      return "Comfortaa:wght@300;400;500;600;700";
    case "font-crimson-text":
      return "Crimson+Text:wght@400;600;700";
    case "font-exo":
      return "Exo:wght@100;200;300;400;500;600;700;800;900";
    case "font-fira-sans":
      return "Fira+Sans:wght@100;200;300;400;500;600;700;800;900";
    case "font-helvetica":
      return ""; // Helvetica is a system font, no need to fetch
    case "font-ibm-plex-sans":
      return "IBM+Plex+Sans:wght@100;200;300;400;500;600;700";
    case "font-kelson-sans":
      return "Kelson+Sans:wght@300;400;700";
    case "font-lora":
      return "Lora:wght@400;500;600;700";
    case "font-nunito":
      return "Nunito:wght@200;300;400;500;600;700;800;900";
    case "font-raleway":
      return "Raleway:wght@100;200;300;400;500;600;700;800;900";
    case "font-roboto-mono":
      return "Roboto+Mono:wght@100;200;300;400;500;600;700";
    case "font-rubik":
      return "Rubik:wght@300;400;500;600;700;800;900";
    case "font-source-sans-pro":
      return "Source+Sans+Pro:wght@200;300;400;600;700;900";
    case "font-ubuntu":
      return "Ubuntu:wght@300;400;500;700";
    case "font-work-sans":
      return "Work+Sans:wght@100;200;300;400;500;600;700;800;900";
    default:
      return "Roboto:wght@100;300;400;500;700;900";
  }
}

export function getFontFamilyName(font: string): string {
  switch (font) {
    case "font-oswald":
      return "Oswald";
    case "font-sourceSerif":
      return "Source Serif 4";
    case "font-roboto":
      return "Roboto";
    case "font-openSans":
      return "Open Sans";
    case "font-lato":
      return "Lato";
    case "font-merriweather":
      return "Merriweather";
    case "font-playfairDisplay":
      return "Playfair Display";
    case "font-montserrat":
      return "Montserrat";
    case "font-firaCode":
      return "Fira Code";
    case "font-jetbrainsMono":
      return "JetBrains Mono";
    case "font-geistSans":
      return "Geist Sans";
    case "font-geistMono":
      return "Geist Mono";
    case "font-aller":
      return "Aller";
    case "font-arial":
      return "Arial";
    case "font-bebas-kai":
      return "Bebas Kai";
    case "font-bebas-neue":
      return "Bebas Neue";
    case "font-butler":
      return "Butler";
    case "font-calibri":
      return "Calibri";
    case "font-comfortaa":
      return "Comfortaa";
    case "font-crimson-text":
      return "Crimson Text";
    case "font-exo":
      return "Exo";
    case "font-fira-sans":
      return "Fira Sans";
    case "font-helvetica":
      return "Helvetica";
    case "font-ibm-plex-sans":
      return "IBM Plex Sans";
    case "font-kelson-sans":
      return "Kelson Sans";
    case "font-lora":
      return "Lora";
    case "font-nunito":
      return "Nunito";
    case "font-raleway":
      return "Raleway";
    case "font-roboto-mono":
      return "Roboto Mono";
    case "font-rubik":
      return "Rubik";
    case "font-source-sans-pro":
      return "Source Sans Pro";
    case "font-ubuntu":
      return "Ubuntu";
    case "font-work-sans":
      return "Work Sans";
    default:
      return "Roboto";
  }
}
