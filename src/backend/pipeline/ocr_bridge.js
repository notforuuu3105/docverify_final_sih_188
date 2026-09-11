/**
 * DocVerify OCR Bridge
 * Runs Tesseract OCR via tesseract.js and outputs structured JSON.
 * Returns text, confidence, words with bounding boxes, and lines.
 */

const { createWorker } = require('tesseract.js');
const fs = require('fs');

async function runOCR(imagePath) {
  if (!fs.existsSync(imagePath)) {
    console.error(JSON.stringify({ error: `File not found: ${imagePath}` }));
    process.exit(1);
  }

  const worker = await createWorker('eng');
  try {
    const result = await worker.recognize(imagePath);
    const { text, confidence, words, lines } = result.data;

    const formattedWords = (words || []).map((w) => ({
      text: w.text,
      confidence: Math.round(w.confidence || 0),
      bbox: {
        x0: w.bbox.x0,
        y0: w.bbox.y0,
        x1: w.bbox.x1,
        y1: w.bbox.y1,
      },
    }));

    const formattedLines = (lines || []).map((l) => ({
      text: l.text.trim(),
      confidence: Math.round(l.confidence || 0),
      bbox: {
        x0: l.bbox.x0,
        y0: l.bbox.y0,
        x1: l.bbox.x1,
        y1: l.bbox.y1,
      },
    }));

    const output = {
      text: text.trim(),
      confidence: Math.round(confidence || 0),
      words: formattedWords,
      lines: formattedLines,
    };

    console.log(JSON.stringify(output));
  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
  } finally {
    await worker.terminate();
  }
}

const targetPath = process.argv[2];
if (!targetPath) {
  console.error(JSON.stringify({ error: 'No image path provided' }));
  process.exit(1);
}

runOCR(targetPath);
