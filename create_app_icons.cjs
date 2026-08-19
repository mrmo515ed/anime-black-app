const fs = require('fs');
const path = require('path');
const { createCanvas } = (() => {
  try {
    return require('canvas');
  } catch (e) {
    return { createCanvas: null };
  }
})();

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function createPurePng(width, height) {
  // Simple valid PNG Buffer generator with red/black Anime Black emblem
  // Creates a raw PNG binary stream
  const zlib = require('zlib');
  
  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: 2 (truecolor)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const makeChunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const body = Buffer.concat([typeBuf, data]);
    
    // CRC calculation
    let crc = 0xffffffff;
    for (let i = 0; i < body.length; i++) {
      let byte = body[i];
      crc ^= byte;
      for (let j = 0; j < 8; j++) {
        if (crc & 1) crc = (crc >>> 1) ^ 0xedb88320;
        else crc = crc >>> 1;
      }
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([len, body, crcBuf]);
  };

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw Image Data: RGB scanlines with 0 filter byte
  const scanlineLength = 1 + width * 3;
  const rawData = Buffer.alloc(height * scanlineLength);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.4;

  for (let y = 0; y < height; y++) {
    const offset = y * scanlineLength;
    rawData[offset] = 0; // Filter 0
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 10, g = 10, b = 10; // Dark background #0A0A0A

      if (dist < radius) {
        // Red gradient circle
        const factor = 1 - (dist / radius);
        r = Math.floor(255 * factor);
        g = Math.floor(61 * factor);
        b = 0;
      }

      // Draw 'A' letter in center
      if (Math.abs(dx) < radius * 0.5 && Math.abs(dy) < radius * 0.5) {
        if ((Math.abs(dy - (dx * 1.2)) < width * 0.05) || (Math.abs(dy - (-dx * 1.2)) < width * 0.05) || (Math.abs(dy) < width * 0.04 && Math.abs(dx) < radius * 0.3)) {
          r = 255; g = 255; b = 255;
        }
      }

      const pixelOffset = offset + 1 + x * 3;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

try {
  const icon192 = createPurePng(192, 192);
  const icon512 = createPurePng(512, 512);

  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
  console.log('App icons generated successfully!');
} catch (e) {
  console.error('Error generating icons:', e);
}
