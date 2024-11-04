import html2canvas from 'html2canvas';

// function to generate random id with 7 characters
export function generateRandomId() {
  return Math.random().toString(36).substring(7);
}

// take a snapshot using html2canvas for the given element
export async function takeSnapshot(element: HTMLElement) {
  const scale = window.devicePixelRatio;

  const canvas = await html2canvas(element, {scale});
  const dataUrl = canvas.toDataURL();
  return dataUrl;
}

// take a snapshot of the entire document and crop at the specified position and size
export async function takeSnapshotWithCrop(
  cropPositionLeft: number,
  cropPositionTop: number,
  cropWidth: number,
  cropHeight: number
) {
  const scale = window.devicePixelRatio;
  const body = document.body;

  const canvas = await html2canvas(body, {scale});
  const croppedCanvas = document.createElement('canvas');
  const croppedCanvasContext = croppedCanvas.getContext('2d');

  croppedCanvas.width = cropWidth;
  croppedCanvas.height = cropHeight;

  if (croppedCanvasContext) {
    croppedCanvasContext.drawImage(
      canvas,
      cropPositionLeft * scale,
      cropPositionTop * scale,
      cropWidth * scale,
      cropHeight * scale,
      0,
      0,
      cropWidth,
      cropHeight
    );
  }

  const dataURL = croppedCanvas.toDataURL();
  return dataURL;
}

/**
 * Format a number according to the current locale
 * @param value - The number to format
 * @param locale - The locale to use (e.g., 'en-US', 'de-DE')
 * @param options - Optional Intl.NumberFormatOptions
 * @returns Formatted number string
 */
export function formatNumberOrString(
  value: unknown,
  locale: string,
  options: Intl.NumberFormatOptions = {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0
  }
) {
  if (typeof value === 'number') {
    return new Intl.NumberFormat(locale, options).format(value);
  }
  return value;
}
