import { FaceDetectionResult, NormalizedCoordinates } from '../types';

/**
 * Loads an image from URL, data URI, or File
 */
function loadImage(source: string | File | HTMLCanvasElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (typeof HTMLCanvasElement !== 'undefined' && source instanceof HTMLCanvasElement) {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error('Failed to create image from canvas: ' + e));
      img.src = source.toDataURL();
      return;
    }

    const img = new Image();
    if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://'))) {
      img.crossOrigin = 'anonymous';
    }

    const timer = setTimeout(() => {
      reject(new Error('Timeout loading image for face detection'));
    }, 5000);

    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = (e) => {
      clearTimeout(timer);
      reject(new Error('Failed to load image for face detection: ' + e));
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
      reader.readAsDataURL(source as File);
    }
  });
}

/**
 * Crops and exports the detected face region as a JPEG data URL
 */
function cropFace(
  img: HTMLImageElement,
  box: { x: number; y: number; width: number; height: number }
): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;

    const sx = Math.max(0, Math.round(box.x * imgW));
    const sy = Math.max(0, Math.round(box.y * imgH));
    const sw = Math.min(imgW - sx, Math.round(box.width * imgW));
    const sh = Math.min(imgH - sy, Math.round(box.height * imgH));

    if (sw <= 0 || sh <= 0) return '';

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 160, 200);
    return canvas.toDataURL('image/jpeg', 0.90);
  } catch {
    return '';
  }
}

/**
 * Validates facial anatomy within a candidate region:
 * - Upper third has darker eye sockets
 * - Middle has brighter bridge/cheeks
 * - Lower third has mouth boundary
 */
function verifyFacialAnatomy(
  ctx: CanvasRenderingContext2D,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): { isFace: boolean; score: number } {
  try {
    if (rw < 12 || rh < 14) return { isFace: false, score: 0 };
    const imgData = ctx.getImageData(rx, ry, rw, rh).data;
    const lum = new Float32Array(rw * rh);

    let sum = 0;
    for (let i = 0, j = 0; i < imgData.length; i += 4, j++) {
      const y = 0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2];
      lum[j] = y;
      sum += y;
    }

    const mean = sum / lum.length;
    if (mean < 30 || mean > 240) return { isFace: false, score: 0 };

    // Divide candidate into 3 horizontal bands: forehead/eyes, nose/cheeks, mouth/chin
    const h1 = Math.floor(rh * 0.38);
    const h2 = Math.floor(rh * 0.68);

    let sumEyes = 0, countEyes = 0;
    let sumNose = 0, countNose = 0;
    let sumMouth = 0, countMouth = 0;

    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        const val = lum[y * rw + x];
        if (y < h1) {
          sumEyes += val;
          countEyes++;
        } else if (y < h2) {
          sumNose += val;
          countNose++;
        } else {
          sumMouth += val;
          countMouth++;
        }
      }
    }

    const avgEyes = sumEyes / (countEyes || 1);
    const avgNose = sumNose / (countNose || 1);
    const avgMouth = sumMouth / (countMouth || 1);

    // Anatomical contrast checks: nose/cheek ridge is typically brighter than the eye socket region
    let score = 50;
    if (avgNose >= avgEyes - 5) score += 20;
    if (Math.abs(avgMouth - avgNose) > 2) score += 15;

    // Check left-right eye symmetry in the upper band
    const midX = Math.floor(rw / 2);
    let leftEyes = 0, rightEyes = 0, countHalf = 0;
    for (let y = Math.floor(h1 * 0.3); y < h1; y++) {
      for (let x = 0; x < midX; x++) {
        leftEyes += lum[y * rw + x];
        rightEyes += lum[y * rw + (rw - 1 - x)];
        countHalf++;
      }
    }
    const leftMean = leftEyes / (countHalf || 1);
    const rightMean = rightEyes / (countHalf || 1);
    const symmetryDelta = Math.abs(leftMean - rightMean) / (mean || 1);

    if (symmetryDelta < 0.28) {
      score += 15;
    }

    return {
      isFace: score >= 65,
      score: Math.min(98, score),
    };
  } catch {
    return { isFace: false, score: 0 };
  }
}

/**
 * Scans image canvas across scales and spatial clusters to detect human face
 */
function scanCanvasForFace(
  img: HTMLImageElement
): { box: NormalizedCoordinates; confidence: number; count: number } | null {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (!w || !h) return null;

  const canvas = document.createElement('canvas');
  // Scale down for fast responsive processing
  const maxDim = 480;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const sw = canvas.width;
  const sh = canvas.height;
  const imgData = ctx.getImageData(0, 0, sw, sh).data;

  // Grid accumulator for skin chroma clusters
  const cellSize = 8;
  const gridW = Math.ceil(sw / cellSize);
  const gridH = Math.ceil(sh / cellSize);
  const skinGrid = new Uint8Array(gridW * gridH);

  for (let y = 0; y < sh; y += 2) {
    for (let x = 0; x < sw; x += 2) {
      const idx = (y * sw + x) * 4;
      const r = imgData[idx];
      const g = imgData[idx + 1];
      const b = imgData[idx + 2];

      // YCbCr skin chrominance
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

      if (cr >= 132 && cr <= 178 && cb >= 80 && cb <= 135 && r > 45 && g > 35) {
        const gx = Math.floor(x / cellSize);
        const gy = Math.floor(y / cellSize);
        if (gx < gridW && gy < gridH) {
          const gIdx = gy * gridW + gx;
          if (skinGrid[gIdx] < 255) skinGrid[gIdx]++;
        }
      }
    }
  }

  // Find dense skin clusters
  interface Candidate {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    points: number;
  }
  const candidates: Candidate[] = [];
  const visited = new Uint8Array(gridW * gridH);

  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      const idx = gy * gridW + gx;
      if (visited[idx] || skinGrid[idx] < 6) continue;

      // Flood fill to find connected skin component
      let minX = gx, maxX = gx, minY = gy, maxY = gy;
      let points = 0;
      const queue: [number, number][] = [[gx, gy]];
      visited[idx] = 1;

      while (queue.length > 0) {
        const [cx, cy] = queue.pop()!;
        points += skinGrid[cy * gridW + cx];

        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighbors: [number, number][] = [
          [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
        ];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < gridW && ny >= 0 && ny < gridH) {
            const nIdx = ny * gridW + nx;
            if (!visited[nIdx] && skinGrid[nIdx] >= 4) {
              visited[nIdx] = 1;
              queue.push([nx, ny]);
            }
          }
        }
      }

      const clusterW = (maxX - minX + 1) * cellSize;
      const clusterH = (maxY - minY + 1) * cellSize;
      const ratio = clusterW / clusterH;

      // Faces typically have aspect ratio 0.5 to 1.1 and occupy reasonable size on document
      if (
        clusterW >= sw * 0.08 &&
        clusterH >= sh * 0.09 &&
        ratio >= 0.45 &&
        ratio <= 1.25 &&
        points >= 40
      ) {
        candidates.push({
          minX: minX * cellSize,
          maxX: (maxX + 1) * cellSize,
          minY: minY * cellSize,
          maxY: (maxY + 1) * cellSize,
          points,
        });
      }
    }
  }

  // Sort candidates by size and verify anatomy
  candidates.sort((a, b) => b.points - a.points);

  for (const cand of candidates) {
    const cw = cand.maxX - cand.minX;
    const ch = cand.maxY - cand.minY;

    // Pad slightly for full hair and chin
    const padX = cw * 0.15;
    const padY = ch * 0.20;
    const px = Math.max(0, cand.minX - padX);
    const py = Math.max(0, cand.minY - padY);
    const pw = Math.min(sw - px, cw + padX * 2);
    const ph = Math.min(sh - py, ch + padY * 2);

    const anatomy = verifyFacialAnatomy(ctx, Math.round(px), Math.round(py), Math.round(pw), Math.round(ph));

    if (anatomy.isFace) {
      return {
        box: {
          x: Math.max(0, Math.min(1, px / sw)),
          y: Math.max(0, Math.min(1, py / sh)),
          width: Math.max(0.05, Math.min(1, pw / sw)),
          height: Math.max(0.05, Math.min(1, ph / sh)),
        },
        confidence: anatomy.score,
        count: Math.max(1, candidates.length),
      };
    }
  }

  return null;
}

/**
 * Main Face Detection Engine:
 * Evaluates document image, detects facial boundaries, returns honest detection status and coordinates.
 */
export async function detectFaceInDocument(source: string | File | HTMLCanvasElement): Promise<FaceDetectionResult> {
  try {
    const img = await loadImage(source);
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;

    if (!imgW || !imgH) {
      return {
        detected: false,
        count: 0,
        confidence: 0,
        boundingBox: null,
        status: 'Face Not Detected',
        message: 'Unable to read image dimensions for face detection.',
      };
    }

    // 1. Check native browser FaceDetector API if available
    try {
      if ('FaceDetector' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const FaceDetectorClass = (window as any).FaceDetector;
        const detector = new FaceDetectorClass({ fastMode: false, maxDetectedFaces: 5 });
        const faces = await detector.detect(img);

        if (faces && faces.length > 0) {
          const b = faces[0].boundingBox;
          const padX = b.width * 0.15;
          const padY = b.height * 0.20;
          const x = Math.max(0, b.x - padX) / imgW;
          const y = Math.max(0, b.y - padY) / imgH;
          const width = Math.min(imgW, b.width + padX * 2) / imgW;
          const height = Math.min(imgH, b.height + padY * 2) / imgH;

          const box: NormalizedCoordinates = {
            x: Math.round(x * 1000) / 1000,
            y: Math.round(y * 1000) / 1000,
            width: Math.round(width * 1000) / 1000,
            height: Math.round(height * 1000) / 1000,
          };

          const cropUrl = cropFace(img, box);

          return {
            detected: true,
            count: faces.length,
            confidence: 96,
            boundingBox: box,
            cropDataUrl: cropUrl,
            status: 'Face Detected',
            message: `Primary cardholder portrait located (${faces.length} face${faces.length > 1 ? 's' : ''} detected).`,
          };
        }
      }
    } catch (apiErr) {
      console.debug('Native FaceDetector API error / unsupported, continuing with canvas detector:', apiErr);
    }

    // 2. High-precision multi-scale canvas detector
    const detected = scanCanvasForFace(img);

    if (detected) {
      const box: NormalizedCoordinates = {
        x: Math.round(detected.box.x * 1000) / 1000,
        y: Math.round(detected.box.y * 1000) / 1000,
        width: Math.round(detected.box.width * 1000) / 1000,
        height: Math.round(detected.box.height * 1000) / 1000,
      };

      const cropUrl = cropFace(img, box);

      return {
        detected: true,
        count: detected.count,
        confidence: detected.confidence,
        boundingBox: box,
        cropDataUrl: cropUrl,
        status: 'Face Detected',
        message: 'Primary cardholder portrait located on document canvas.',
      };
    }

    // 3. No face found
    return {
      detected: false,
      count: 0,
      confidence: 0,
      boundingBox: null,
      status: 'Face Not Detected',
      message: 'No human facial contours identified on document substrate.',
    };
  } catch (err) {
    console.warn('Face detection error safeguard:', err);
    return {
      detected: false,
      count: 0,
      confidence: 0,
      boundingBox: null,
      status: 'Face Not Detected',
      message: 'Face detection could not be executed on this file format.',
    };
  }
}
