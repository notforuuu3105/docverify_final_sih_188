import jsQR from 'jsqr';
import { ParsedQrData } from '../types';

/**
 * Loads an image into an HTMLImageElement safely
 */
function loadImage(source: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://'))) {
      img.crossOrigin = 'anonymous';
    }

    const timer = setTimeout(() => {
      reject(new Error('Timeout loading image for QR detection'));
    }, 5000);

    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = (e) => {
      clearTimeout(timer);
      reject(new Error('Failed to load image for QR decoding: ' + e));
    };

    if (typeof source === 'string') {
      img.src = source;
      if (img.complete && img.naturalWidth > 0) {
        clearTimeout(timer);
        resolve(img);
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result as string;
        if (img.complete && img.naturalWidth > 0) {
          clearTimeout(timer);
          resolve(img);
        }
      };
      reader.onerror = (e) => {
        clearTimeout(timer);
        reject(e);
      };
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Parses XML attributes from Aadhaar PrintLetterBarcodeData
 */
function parseAadhaarXml(xmlText: string): ParsedQrData | null {
  try {
    const matchAttr = (attr: string): string => {
      const regex = new RegExp(`${attr}\\s*=\\s*["']([^"']*)["']`, 'i');
      const m = xmlText.match(regex);
      return m ? m[1].trim() : '';
    };

    if (!/PrintLetterBarcodeData/i.test(xmlText) && !/uid=/i.test(xmlText)) {
      return null;
    }

    const uid = matchAttr('uid');
    const name = matchAttr('name');
    const gender = matchAttr('gender');
    const dob = matchAttr('dob');
    const yob = matchAttr('yob');
    const co = matchAttr('co');
    const house = matchAttr('house');
    const street = matchAttr('street');
    const lm = matchAttr('lm');
    const loc = matchAttr('loc');
    const vtc = matchAttr('vtc');
    const po = matchAttr('po');
    const dist = matchAttr('dist');
    const state = matchAttr('state');
    const pc = matchAttr('pc');

    const addressParts = [co, house, street, lm, loc, vtc, po, dist, state, pc].filter(Boolean);
    const address = addressParts.join(', ');

    let maskedUid = '';
    if (uid) {
      const digitsOnly = uid.replace(/\D/g, '');
      if (digitsOnly.length === 12) {
        maskedUid = `XXXX XXXX ${digitsOnly.slice(8)}`;
      } else {
        maskedUid = uid;
      }
    }

    return {
      detected: true,
      rawPayload: xmlText,
      full_name: name || undefined,
      date_of_birth: dob || (yob ? `01/01/${yob}` : undefined),
      year_of_birth: yob || (dob ? dob.slice(-4) : undefined),
      gender: gender ? (gender.toUpperCase().startsWith('F') ? 'F' : 'M') : undefined,
      aadhaar_number_masked: maskedUid || undefined,
      address: address || undefined,
      statusMessage: 'UIDAI Secure QR decoded and parsed successfully',
    };
  } catch {
    return null;
  }
}

/**
 * Parses JSON format QR payloads
 */
function parseJsonQr(rawText: string): ParsedQrData | null {
  try {
    const data = JSON.parse(rawText);
    if (typeof data !== 'object' || data === null) return null;

    const name = data.name || data.fullName || data.full_name;
    const dob = data.dob || data.date_of_birth || data.dateOfBirth;
    const yob = data.yob || data.year_of_birth || data.yearOfBirth;
    const gender = data.gender || data.sex;
    const uid = data.uid || data.aadhaar || data.aadhaar_number;
    const address = data.address || data.addr;

    let maskedUid = '';
    if (uid) {
      const digitsOnly = String(uid).replace(/\D/g, '');
      if (digitsOnly.length === 12) {
        maskedUid = `XXXX XXXX ${digitsOnly.slice(8)}`;
      } else {
        maskedUid = String(uid);
      }
    }

    return {
      detected: true,
      rawPayload: rawText,
      full_name: name ? String(name).trim() : undefined,
      date_of_birth: dob ? String(dob).trim() : undefined,
      year_of_birth: yob ? String(yob).trim() : undefined,
      gender: gender ? (String(gender).toUpperCase().startsWith('F') ? 'F' : 'M') : undefined,
      aadhaar_number_masked: maskedUid || undefined,
      address: address ? String(address).trim() : undefined,
      statusMessage: 'QR payload parsed from JSON structure',
    };
  } catch {
    return null;
  }
}

/**
 * Parses raw decoded QR string into structured fields or identifies encrypted formats
 */
export function parseRawQrString(raw: string): ParsedQrData {
  if (!raw || raw.trim().length === 0) {
    return { detected: false, statusMessage: 'QR code not detected on document face' };
  }

  // Check if XML
  const xmlResult = parseAadhaarXml(raw);
  if (xmlResult) return xmlResult;

  // Check if JSON
  if (raw.startsWith('{') && raw.endsWith('}')) {
    const jsonResult = parseJsonQr(raw);
    if (jsonResult) return jsonResult;
  }

  // Check if Delimited Key-Value format (e.g. name=.../dob=...)
  if (raw.includes('=') && (raw.includes('name') || raw.includes('dob') || raw.includes('uid'))) {
    const fields: Record<string, string> = {};
    const pairs = raw.split(/[;&,\n|]/);
    for (const p of pairs) {
      const idx = p.indexOf('=');
      if (idx > 0) {
        const k = p.slice(0, idx).trim().toLowerCase();
        const v = p.slice(idx + 1).trim();
        fields[k] = v;
      }
    }

    const name = fields['name'] || fields['full_name'] || fields['fullname'];
    const dob = fields['dob'] || fields['date_of_birth'] || fields['dateofbirth'];
    const gender = fields['gender'] || fields['sex'];
    const uid = fields['uid'] || fields['aadhaar'] || fields['aadhaar_number'];

    let maskedUid = '';
    if (uid) {
      const digitsOnly = uid.replace(/\D/g, '');
      if (digitsOnly.length === 12) {
        maskedUid = `XXXX XXXX ${digitsOnly.slice(8)}`;
      } else {
        maskedUid = uid;
      }
    }

    return {
      detected: true,
      rawPayload: raw,
      full_name: name,
      date_of_birth: dob,
      gender: gender ? (gender.toUpperCase().startsWith('F') ? 'F' : 'M') : undefined,
      aadhaar_number_masked: maskedUid || undefined,
      statusMessage: 'QR fields parsed from key-value structure',
    };
  }

  // Check if large numeric or compressed byte stream (encrypted Aadhaar V2/V3)
  const isLargeNumber = /^\d{200,}$/.test(raw.trim());
  const isBase64Binary = /^[A-Za-z0-9+/=]{150,}$/.test(raw.trim());

  if (isLargeNumber || isBase64Binary || raw.length > 100) {
    return {
      detected: true,
      rawPayload: raw,
      isEncryptedOrUnparseable: true,
      statusMessage: 'QR code detected (Signed cryptographic payload, raw fields require UIDAI decryption key)',
    };
  }

  return {
    detected: true,
    rawPayload: raw,
    statusMessage: 'QR code payload detected (plain text format)',
  };
}

/**
 * Runs genuine QR decoding on canvas using jsQR across 4 preprocessing passes
 */
export async function decodeQrFromCanvas(canvas: HTMLCanvasElement): Promise<ParsedQrData> {
  const w = canvas.width;
  const h = canvas.height;
  if (!w || !h) {
    return { detected: false, statusMessage: 'QR code not detected on document face' };
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return { detected: false, statusMessage: 'QR code not detected on document face' };
  }

  // 1. First attempt: jsQR on raw canvas
  try {
    const imgData = ctx.getImageData(0, 0, w, h);
    const code = jsQR(imgData.data, w, h, { inversionAttempts: 'attemptBoth' });
    if (code && code.data && code.data.trim().length > 0) {
      return parseRawQrString(code.data.trim());
    }
  } catch (err) {
    console.debug('jsQR pass 1 error:', err);
  }

  // 2. Second attempt: high contrast grayscale
  try {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0);
      const imgData = tempCtx.getImageData(0, 0, w, h);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        const contrasted = Math.max(0, Math.min(255, 1.8 * (gray - 128) + 128));
        d[i] = contrasted;
        d[i + 1] = contrasted;
        d[i + 2] = contrasted;
      }
      tempCtx.putImageData(imgData, 0, 0);

      const code = jsQR(imgData.data, w, h, { inversionAttempts: 'attemptBoth' });
      if (code && code.data && code.data.trim().length > 0) {
        return parseRawQrString(code.data.trim());
      }
    }
  } catch (err) {
    console.debug('jsQR pass 2 error:', err);
  }

  // 3. Third attempt: Native BarcodeDetector if available
  try {
    if ('BarcodeDetector' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const BarcodeDetectorClass = (window as any).BarcodeDetector;
      const detector = new BarcodeDetectorClass({ formats: ['qr_code'] });
      const barcodes = await detector.detect(canvas);
      if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        return parseRawQrString(barcodes[0].rawValue);
      }
    }
  } catch (err) {
    console.debug('Native BarcodeDetector notice:', err);
  }

  return {
    detected: false,
    statusMessage: 'QR code not detected on document face',
  };
}

/**
 * Decodes QR code directly from image source
 */
export async function decodeQrFromImage(source: string | File): Promise<ParsedQrData> {
  try {
    const img = await loadImage(source);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width || 800;
    canvas.height = img.naturalHeight || img.height || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { detected: false, statusMessage: 'QR code not detected on document face' };
    }
    ctx.drawImage(img, 0, 0);
    return await decodeQrFromCanvas(canvas);
  } catch (err) {
    console.debug('decodeQrFromImage notice:', err);
    return { detected: false, statusMessage: 'QR code not detected on document face' };
  }
}
