/**
 * File & Image Processing Utilities
 * - Resizes and compresses user-uploaded prescription / report images client-side.
 * - Extracts clean Base64 data for Gemini API inlineData.
 * - Parses text, CSV, and handles PDF file buffers.
 */

const MAX_IMAGE_DIMENSION = 1600;
const COMPRESSION_QUALITY = 0.85;

/**
 * Resizes and compresses an image file using an offscreen HTML5 canvas.
 * Reduces 5-15MB smartphone photos down to fast, crisp ~200-400KB base64 payloads.
 */
export async function processImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Downscale while preserving aspect ratio
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
            width = MAX_IMAGE_DIMENSION;
          } else {
            width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
            height = MAX_IMAGE_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with controlled quality
        const dataUrl = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);
        const base64 = dataUrl.split(',')[1];

        resolve({
          id: 'img_' + Math.random().toString(36).substring(2, 9),
          name: file.name,
          mimeType: 'image/jpeg',
          base64,
          dataUrl,
          sizeBytes: Math.round((base64.length * 3) / 4),
          originalWidth: img.width,
          originalHeight: img.height,
          displayWidth: width,
          displayHeight: height
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Processes text documents (.txt, .md, .csv) or PDF files
 */
export async function processDocumentFile(file) {
  return new Promise((resolve, reject) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.onload = () => {
        const dataUrl = reader.result;
        const base64 = dataUrl.split(',')[1];
        resolve({
          id: 'doc_' + Math.random().toString(36).substring(2, 9),
          name: file.name,
          mimeType: 'application/pdf',
          base64,
          dataUrl,
          isPdf: true,
          sizeBytes: file.size
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Plain text file
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.onload = () => {
        resolve({
          id: 'doc_' + Math.random().toString(36).substring(2, 9),
          name: file.name,
          mimeType: file.type || 'text/plain',
          content: reader.result,
          isPdf: false,
          sizeBytes: file.size
        });
      };
      reader.readAsText(file);
    }
  });
}

/**
 * Helper to convert a synthetic Canvas or SVG directly to an Image object for demo scenarios
 */
export function canvasToImageData(canvas, name = 'synthetic_document.jpg') {
  const dataUrl = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);
  const base64 = dataUrl.split(',')[1];
  return {
    id: 'demo_' + Math.random().toString(36).substring(2, 9),
    name,
    mimeType: 'image/jpeg',
    base64,
    dataUrl,
    sizeBytes: Math.round((base64.length * 3) / 4)
  };
}
