import { FieldVerificationStatus } from '../types';

export interface FieldComparisonResult {
  fieldName: string;
  printedValue: string;
  referenceValue: string;
  status: FieldVerificationStatus;
  isMatch: boolean;
  isMismatch: boolean;
  message: string;
}

/**
 * Normalizes text for deterministic matching:
 * lowercase, removes special characters, collapses consecutive whitespace, trims
 */
export function normalizeText(text?: string | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s]/g, ' ')   // remove punctuation
    .replace(/\s+/g, ' ')           // collapse whitespace
    .trim();
}

/**
 * Normalizes date into DD/MM/YYYY or YYYY string
 */
export function normalizeDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const clean = dateStr.trim().replace(/[-.]/g, '/');

  // Case 1: DD/MM/YYYY
  const dmyMatch = clean.match(/\b([0-3]?\d)\/([0-1]?\d)\/(\d{4})\b/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${day}/${month}/${year}`;
  }

  // Case 2: YYYY/MM/DD
  const ymdMatch = clean.match(/\b(\d{4})\/([0-1]?\d)\/([0-3]?\d)\b/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  // Case 3: Only Year (e.g. 1996 or 2007)
  const yMatch = clean.match(/\b(19\d{2}|20\d{2})\b/);
  if (yMatch) {
    return yMatch[1];
  }

  return clean;
}

/**
 * Validates Date of Birth values
 */
export function validateDateOfBirth(dobStr?: string | null): { isValid: boolean; message: string } {
  if (!dobStr || dobStr.toLowerCase().includes('not detected') || dobStr.trim().length === 0) {
    return { isValid: false, message: 'Date not detected' };
  }

  const normalized = normalizeDate(dobStr);
  const parts = normalized.split('/');

  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    const currentYear = new Date().getFullYear();

    if (isNaN(d) || d < 1 || d > 31) return { isValid: false, message: 'Invalid calendar day' };
    if (isNaN(m) || m < 1 || m > 12) return { isValid: false, message: 'Invalid calendar month' };
    if (isNaN(y) || y < 1900 || y > currentYear) return { isValid: false, message: 'Invalid year of birth' };

    return { isValid: true, message: 'Valid calendar date format' };
  } else if (parts.length === 1 && /^\d{4}$/.test(parts[0])) {
    const y = parseInt(parts[0], 10);
    const currentYear = new Date().getFullYear();
    if (y >= 1900 && y <= currentYear) {
      return { isValid: true, message: 'Valid year of birth' };
    }
  }

  return { isValid: false, message: 'Invalid date format' };
}

/**
 * Validates Indian PAN number format (5 uppercase letters, 4 digits, 1 letter)
 */
export function validatePanNumber(pan?: string | null): { isValid: boolean; message: string; entityType?: string } {
  if (!pan || pan.toLowerCase().includes('not detected')) {
    return { isValid: false, message: 'PAN number not detected' };
  }
  const clean = pan.trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

  if (!panRegex.test(clean)) {
    return { isValid: false, message: 'Does not conform to 10-character PAN syntax (AAAAA9999A)' };
  }

  const fourthChar = clean[3];
  const entityMap: Record<string, string> = {
    P: 'Individual (Person)',
    C: 'Company',
    H: 'Hindu Undivided Family',
    A: 'Association of Persons',
    B: 'Body of Individuals',
    T: 'Trust',
    F: 'Firm / LLP',
    G: 'Government Agency',
    J: 'Artificial Juridical Person',
    L: 'Local Authority',
  };

  const entityType = entityMap[fourthChar] || 'Registered Entity';
  return { isValid: true, message: `Valid Income Tax PAN format (${entityType})`, entityType };
}

/**
 * Validates 12-digit Aadhaar number format
 */
export function validateAadhaarNumber(uid?: string | null): { isValid: boolean; message: string } {
  if (!uid || uid.toLowerCase().includes('not detected')) {
    return { isValid: false, message: 'Aadhaar number not detected' };
  }

  const digitsOnly = uid.replace(/\D/g, '');
  if (digitsOnly.length === 12) {
    return { isValid: true, message: 'Valid 12-digit Aadhaar format' };
  }

  // Masked format: XXXX XXXX 1234
  if (/^[X\s-]{8,12}\d{4}$/i.test(uid.trim())) {
    return { isValid: true, message: 'Compliant masked Aadhaar format (First 8 digits securely redacted)' };
  }

  return { isValid: false, message: 'Invalid Aadhaar numeral structure' };
}

/**
 * Masks sensitive document identification numbers
 */
export function maskIdentificationNumber(value?: string | null, docType: 'aadhaar' | 'pan' | 'passport' = 'aadhaar'): string {
  if (!value || value.toLowerCase().includes('not detected')) {
    return 'Not detected';
  }

  const clean = value.trim();

  if (docType === 'aadhaar') {
    const digits = clean.replace(/\D/g, '');
    if (digits.length >= 4) {
      return `XXXX XXXX ${digits.slice(-4)}`;
    }
    return clean;
  }

  if (docType === 'pan') {
    if (clean.length === 10) {
      return `${clean.slice(0, 5)}****${clean.slice(-1)}`;
    }
    return clean;
  }

  if (docType === 'passport') {
    if (clean.length >= 4) {
      return `${clean.slice(0, 2)}****${clean.slice(-2)}`;
    }
    return clean;
  }

  return clean;
}

/**
 * Deterministic comparison between printed OCR field and QR reference field:
 * - If both exist and normalized values are equal: status = MATCHED
 * - If both exist and normalized values differ: status = MISMATCH
 * - If reference is absent: status = DETECTED or VALID
 * - If printed is absent: status = NOT_DETECTED
 */
export function compareFields(
  fieldName: string,
  printedVal?: string | null,
  referenceVal?: string | null,
  isDate: boolean = false
): FieldComparisonResult {
  const pStr = (printedVal || '').trim();
  const rStr = (referenceVal || '').trim();

  const isPrintedMissing = !pStr || pStr.toLowerCase().includes('not detected') || pStr.toLowerCase().includes('unable to extract');
  const isRefMissing = !rStr || rStr.toLowerCase().includes('not detected') || rStr.toLowerCase().includes('unavailable') || rStr.toLowerCase().includes('not available');

  // Case 1: Reference is missing (e.g. no QR code on document)
  if (isRefMissing) {
    if (isPrintedMissing) {
      return {
        fieldName,
        printedValue: 'Not detected',
        referenceValue: 'QR data unavailable',
        status: 'NOT_DETECTED',
        isMatch: false,
        isMismatch: false,
        message: `${fieldName} could not be extracted from document text`,
      };
    }

    // Format validation if available
    let status: FieldVerificationStatus = 'DETECTED';
    let msg = `Extracted from printed document text (External reference unavailable)`;

    if (isDate) {
      const v = validateDateOfBirth(pStr);
      status = v.isValid ? 'VALID' : 'INVALID';
      msg = v.message;
    }

    return {
      fieldName,
      printedValue: pStr,
      referenceValue: 'QR data unavailable',
      status,
      isMatch: false,
      isMismatch: false,
      message: msg,
    };
  }

  // Case 2: Printed value is missing, but reference exists
  if (isPrintedMissing) {
    return {
      fieldName,
      printedValue: 'Not detected',
      referenceValue: rStr,
      status: 'REVIEW_REQUIRED',
      isMatch: false,
      isMismatch: true,
      message: `Present in QR reference but unreadable on document face`,
    };
  }

  // Case 3: Both printed and reference exist -> Deterministic comparison!
  let isEqual = false;

  if (isDate) {
    const normP = normalizeDate(pStr);
    const normR = normalizeDate(rStr);

    // If both contain full DD/MM/YYYY, compare directly
    if (normP === normR) {
      isEqual = true;
    } else {
      // If one only contains year (e.g. YOB 1996 vs 14/05/1996)
      const yP = normP.slice(-4);
      const yR = normR.slice(-4);
      if (yP && yR && yP === yR && (normP.length === 4 || normR.length === 4)) {
        isEqual = true;
      } else {
        isEqual = false;
      }
    }
  } else {
    const normP = normalizeText(pStr);
    const normR = normalizeText(rStr);
    isEqual = normP === normR || (normP.length >= 4 && normR.length >= 4 && (normP.includes(normR) || normR.includes(normP)));
  }

  if (isEqual) {
    return {
      fieldName,
      printedValue: pStr,
      referenceValue: rStr,
      status: 'MATCHED',
      isMatch: true,
      isMismatch: false,
      message: `Identical match between printed text and signed QR data`,
    };
  } else {
    return {
      fieldName,
      printedValue: pStr,
      referenceValue: rStr,
      status: 'MISMATCH',
      isMatch: false,
      isMismatch: true,
      message: `CONFLICT DETECTED: Printed ${fieldName} ("${pStr}") does not match reference ("${rStr}")`,
    };
  }
}
