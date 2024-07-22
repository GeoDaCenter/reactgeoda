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
