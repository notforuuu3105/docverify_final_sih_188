/**
 * DocVerify OCR Bridge (CommonJS)
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
    const result = await worker.recognize(imagePath, {}, { blocks: true });
    const { text, confidence, blocks } = result.data;

    const formattedWords = [];
    const formattedLines = [];

    if (blocks && Array.isArray(blocks)) {
      for (const block of blocks) {
        if (!block.paragraphs) continue;
        for (const para of block.paragraphs) {
          if (!para.lines) continue;
          for (const line of para.lines) {
            if (line.text && line.text.trim()) {
              formattedLines.push({
                text: line.text.trim(),
                confidence: Math.round(line.confidence || 0),
                bbox: line.bbox
                  ? {
                      x0: line.bbox.x0,
                      y0: line.bbox.y0,
                      x1: line.bbox.x1,
                      y1: line.bbox.y1,
                    }
                  : null,
              });
            }
            if (line.words) {
              for (const word of line.words) {
                if (word.text && word.text.trim()) {
                  formattedWords.push({
                    text: word.text.trim(),
                    confidence: Math.round(word.confidence || 0),
                    bbox: word.bbox
                      ? {
                          x0: word.bbox.x0,
                          y0: word.bbox.y0,
                          x1: word.bbox.x1,
                          y1: word.bbox.y1,
                        }
                      : null,
                  });
                }
              }
            }
          }
        }
      }
    }

    const output = {
      text: (text || '').trim(),
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
