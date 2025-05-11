export function getPagePreviewHtml(elementId: string) {
  const originalElement = document.getElementById(elementId);
  if (!originalElement) {
    throw new Error("Cover letter preview element not found");
  }

  const clonedElement = originalElement.cloneNode(true) as HTMLElement;

  clonedElement.style.scale = "1";
  clonedElement.classList.remove("border", "border-gray-300", "shadow-lg", "overflow-hidden");

  const page0 = clonedElement.querySelector("#page-0");

  if (page0) {
    (page0 as HTMLElement).style.margin = "0";
  }

  const htmlContent = clonedElement.outerHTML;

  return htmlContent;
}
