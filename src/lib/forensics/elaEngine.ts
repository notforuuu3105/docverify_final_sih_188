import { SuspiciousRegion } from '../types';

export interface ElaOptions {
  /** JPEG re-compression quality between 0.1 and 1.0 (default: 0.90) */
  quality?: number;
  /** Amplification factor for error differences (default: 20) */
  scale?: number;
  /** Max dimension for canvas to maintain fast client-side performance */
  maxDimension?: number;
}

export interface ElaResult {
  /** High-resolution false-color thermal ELA image as a PNG data URL */
  elaDataUrl: string;
  /** Grayscale error difference image data URL */
  diffDataUrl: string;
  /** Average error across all pixels */
  meanError: number;
  /** Maximum peak error detected */
  maxError: number;
  /** Standard deviation of error */
  stdDev: number;
  /** Whether the image exhibits significant localized recompression anomalies */
  anomalyDetected: boolean;
  /** Automatically extracted anomaly bounding boxes with normalized coordinates */
  suspiciousRegions: SuspiciousRegion[];
}

/**
 * Loads an image from a URL, data URL, or File into an HTMLImageElement
 */
function loadImage(source: string | File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://'))) {
      img.crossOrigin = 'anonymous';
    }

    const timer = setTimeout(() => {
      reject(new Error('Timeout loading image for forensic ELA'));
    }, 3000);

    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = (e) => {
      clearTimeout(timer);
      reject(new Error('Failed to load image for forensic ELA: ' + e));
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
 * Maps a single scalar error value [0, 255] into an Inferno/Thermal false-color RGB tuple
 */
function thermalColorMap(val: number): [number, number, number] {
  const v = Math.max(0, Math.min(255, Math.round(val)));

  if (v < 35) {
    // 0 - 35: Near black to deep navy
    return [Math.round(v * 0.5), Math.round(v * 0.2), Math.round(v * 2.5)];
  } else if (v < 85) {
    // 35 - 85: Deep navy to cyan/blue
    const t = (v - 35) / 50;
    return [
      Math.round(18 * (1 - t) + 10 * t),
      Math.round(7 * (1 - t) + 160 * t),
      Math.round(88 * (1 - t) + 240 * t),
    ];
  } else if (v < 145) {
    // 85 - 145: Cyan to lime/yellow
    const t = (v - 85) / 60;
    return [
      Math.round(10 * (1 - t) + 245 * t),
      Math.round(160 * (1 - t) + 230 * t),
      Math.round(240 * (1 - t) + 20 * t),
    ];
  } else if (v < 205) {
    // 145 - 205: Yellow to vibrant orange/red
    const t = (v - 145) / 60;
    return [
      255,
      Math.round(230 * (1 - t) + 40 * t),
      Math.round(20 * (1 - t) + 10 * t),
    ];
  } else {
    // 205 - 255: Vibrant red to blazing thermal white/pink
    const t = (v - 205) / 50;
    return [
      255,
      Math.round(40 * (1 - t) + 240 * t),
      Math.round(10 * (1 - t) + 240 * t),
    ];
  }
}

/**
 * Executes genuine Error Level Analysis on the client-side using HTML5 Canvas.
 * Compares the original image against a controlled JPEG re-compression cycle.
 */
export async function computeErrorLevelAnalysis(
  source: string | File,
  options: ElaOptions = {}
): Promise<ElaResult> {
  const quality = options.quality ?? 0.90;
  const scale = options.scale ?? 22;
  const maxDim = options.maxDimension ?? 1200;

  // 1. Load the original source image
  const img = await loadImage(source);

  // 2. Compute constrained dimensions to keep performance high on low-spec hardware
  let width = img.naturalWidth || img.width || 800;
  let height = img.naturalHeight || img.height || 600;

  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // 3. Draw original image onto offscreen canvas A
  const origCanvas = document.createElement('canvas');
  origCanvas.width = width;
  origCanvas.height = height;
  const origCtx = origCanvas.getContext('2d', { willReadFrequently: true });
  if (!origCtx) throw new Error('Could not get 2D context for original canvas');
  origCtx.drawImage(img, 0, 0, width, height);

  // 4. Re-compress the image to a JPEG at the specified quality level
  const recompressedDataUrl = origCanvas.toDataURL('image/jpeg', quality);

  // 5. Draw the re-compressed JPEG onto offscreen canvas B
  const recompressedImg = await loadImage(recompressedDataUrl);
  const recompressedCanvas = document.createElement('canvas');
  recompressedCanvas.width = width;
  recompressedCanvas.height = height;
  const recompressedCtx = recompressedCanvas.getContext('2d', { willReadFrequently: true });
  if (!recompressedCtx) throw new Error('Could not get 2D context for recompressed canvas');
  recompressedCtx.drawImage(recompressedImg, 0, 0, width, height);

  // 6. Extract pixel data arrays
  const origData = origCtx.getImageData(0, 0, width, height);
  const recompData = recompressedCtx.getImageData(0, 0, width, height);

  const origPixels = origData.data;
  const recompPixels = recompData.data;
  const totalPixels = width * height;

  // Canvas for the false-color thermal ELA map
  const thermalCanvas = document.createElement('canvas');
  thermalCanvas.width = width;
  thermalCanvas.height = height;
  const thermalCtx = thermalCanvas.getContext('2d');
  if (!thermalCtx) throw new Error('Could not get 2D context for thermal canvas');
  const thermalImageData = thermalCtx.createImageData(width, height);
  const thermalPixels = thermalImageData.data;

  // Canvas for the grayscale difference map
  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = width;
  diffCanvas.height = height;
  const diffCtx = diffCanvas.getContext('2d');
  if (!diffCtx) throw new Error('Could not get 2D context for diff canvas');
  const diffImageData = diffCtx.createImageData(width, height);
  const diffPixels = diffImageData.data;

  let totalErrorSum = 0;
  let maxError = 0;
  const errorValues = new Float32Array(totalPixels);

  // 7. Compute pixel difference and apply false-color thermal gradient
  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;

    const rDiff = Math.abs(origPixels[idx] - recompPixels[idx]);
    const gDiff = Math.abs(origPixels[idx + 1] - recompPixels[idx + 1]);
    const bDiff = Math.abs(origPixels[idx + 2] - recompPixels[idx + 2]);

    // Mean channel difference amplified by the scale factor
    const rawDiff = (rDiff + gDiff + bDiff) / 3;
    const scaledError = Math.min(255, rawDiff * scale);

    errorValues[i] = scaledError;
    totalErrorSum += scaledError;
    if (scaledError > maxError) {
      maxError = scaledError;
    }

    // False-color thermal pixel mapping
    const [tr, tg, tb] = thermalColorMap(scaledError);
    thermalPixels[idx] = tr;
    thermalPixels[idx + 1] = tg;
    thermalPixels[idx + 2] = tb;
    thermalPixels[idx + 3] = 255;

    // Grayscale difference pixel mapping
    diffPixels[idx] = scaledError;
    diffPixels[idx + 1] = scaledError;
    diffPixels[idx + 2] = scaledError;
    diffPixels[idx + 3] = 255;
  }

  thermalCtx.putImageData(thermalImageData, 0, 0);
  diffCtx.putImageData(diffImageData, 0, 0);

  const meanError = totalErrorSum / totalPixels;

  // Compute standard deviation
  let sumSqDiff = 0;
  for (let i = 0; i < totalPixels; i++) {
    const diff = errorValues[i] - meanError;
    sumSqDiff += diff * diff;
  }
  const stdDev = Math.sqrt(sumSqDiff / totalPixels);

  // 8. Statistical Cluster Detection for Anomaly Bounding Boxes
  // We divide the image into 32x32 blocks to find localized clusters of high recompression error
  const blockSize = 32;
  const blocksX = Math.ceil(width / blockSize);
  const blocksY = Math.ceil(height / blockSize);
  const blockErrors: number[][] = [];

  for (let by = 0; by < blocksY; by++) {
    blockErrors[by] = [];
    for (let bx = 0; bx < blocksX; bx++) {
      let blockSum = 0;
      let count = 0;

      const startY = by * blockSize;
      const endY = Math.min(height, startY + blockSize);
      const startX = bx * blockSize;
      const endX = Math.min(width, startX + blockSize);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          blockSum += errorValues[y * width + x];
          count++;
        }
      }

      blockErrors[by][bx] = count > 0 ? blockSum / count : 0;
    }
  }

  // Anomaly threshold: block error significantly higher than mean image error
  const anomalyThreshold = Math.max(38, meanError + 2.0 * stdDev);
  const flaggedBlocks: { bx: number; by: number; err: number }[] = [];

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      if (blockErrors[by][bx] > anomalyThreshold) {
        flaggedBlocks.push({ bx, by, err: blockErrors[by][bx] });
      }
    }
  }

  // Merge contiguous / neighboring flagged blocks into bounding boxes
  const suspiciousRegions: SuspiciousRegion[] = [];
  const visited = new Set<string>();

  for (const block of flaggedBlocks) {
    const key = `${block.bx},${block.by}`;
    if (visited.has(key)) continue;

    let minBx = block.bx;
    let maxBx = block.bx;
    let minBy = block.by;
    let maxBy = block.by;
    let maxClusterErr = block.err;

    const queue = [block];
    visited.add(key);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      minBx = Math.min(minBx, curr.bx);
      maxBx = Math.max(maxBx, curr.bx);
      minBy = Math.min(minBy, curr.by);
      maxBy = Math.max(maxBy, curr.by);
      if (curr.err > maxClusterErr) maxClusterErr = curr.err;

      const neighbors = [
        { bx: curr.bx + 1, by: curr.by },
        { bx: curr.bx - 1, by: curr.by },
        { bx: curr.bx, by: curr.by + 1 },
        { bx: curr.bx, by: curr.by - 1 },
      ];

      for (const n of neighbors) {
        const nKey = `${n.bx},${n.by}`;
        if (
          n.bx >= 0 &&
          n.bx < blocksX &&
          n.by >= 0 &&
          n.by < blocksY &&
          !visited.has(nKey) &&
          blockErrors[n.by][n.bx] > anomalyThreshold
        ) {
          visited.add(nKey);
          queue.push({ bx: n.bx, by: n.by, err: blockErrors[n.by][n.bx] });
        }
      }
    }

    const x = Math.max(0, (minBx * blockSize) / width);
    const y = Math.max(0, (minBy * blockSize) / height);
    const regW = Math.min(1 - x, ((maxBx - minBx + 1) * blockSize) / width);
    const regH = Math.min(1 - y, ((maxBy - minBy + 1) * blockSize) / height);

    if (regW * regH >= 0.003) {
      const severity: 'critical' | 'high' | 'medium' =
        maxClusterErr > meanError + 3.2 * stdDev
          ? 'critical'
          : maxClusterErr > meanError + 2.5 * stdDev
          ? 'high'
          : 'medium';

      suspiciousRegions.push({
        id: 'ela-anom-' + Math.random().toString(36).substring(2, 7),
        page: 1,
        coordinates: { x, y, width: regW, height: regH },
        severity,
        label:
          severity === 'critical'
            ? 'Severe Compression Anomaly'
            : severity === 'high'
            ? 'Localized Splicing / Recompression'
            : 'Pixel Density Discontinuity',
        description: `Mathematical Error Level Analysis detected high quantization variance (peak error: ${Math.round(
          maxClusterErr
        )} vs baseline ${Math.round(meanError)}), indicating secondary editing or pasted bitmap overlay.`,
      });
    }
  }

  suspiciousRegions.sort((a, b) => {
    const score = (s: string) => (s === 'critical' ? 3 : s === 'high' ? 2 : 1);
    return score(b.severity) - score(a.severity);
  });
  const topRegions = suspiciousRegions.slice(0, 4);

  const isAnomaly = topRegions.some((r) => r.severity === 'critical' || r.severity === 'high');

  return {
    elaDataUrl: thermalCanvas.toDataURL('image/png'),
    diffDataUrl: diffCanvas.toDataURL('image/png'),
    meanError,
    maxError,
    stdDev,
    anomalyDetected: isAnomaly,
    suspiciousRegions: topRegions,
  };
}
