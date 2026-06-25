const encoder = new TextEncoder();
const crcTable = createCrcTable();

function createCrcTable() {
  const table = new Uint32Array(256);

  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }

  return table;
}

function crc32(bytes) {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);
  const dosDate =
    ((year - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();

  return { dosTime, dosDate };
}

function writeUInt16(view, offset, value) {
  view.setUint16(offset, value, true);
}

function writeUInt32(view, offset, value) {
  view.setUint32(offset, value, true);
}

function concatChunks(chunks, totalLength) {
  const output = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }

  return output;
}

function header(length) {
  return new Uint8Array(length);
}

export function createZipBlob(files) {
  const chunks = [];
  const centralDirectory = [];
  let offset = 0;
  const { dosTime, dosDate } = dosDateTime();

  for (const file of files) {
    const nameBytes = encoder.encode(file.path);
    const contentBytes = encoder.encode(file.content);
    const checksum = crc32(contentBytes);
    const localHeader = header(30);
    const localView = new DataView(localHeader.buffer);
    const localOffset = offset;

    writeUInt32(localView, 0, 0x04034b50);
    writeUInt16(localView, 4, 20);
    writeUInt16(localView, 6, 0);
    writeUInt16(localView, 8, 0);
    writeUInt16(localView, 10, dosTime);
    writeUInt16(localView, 12, dosDate);
    writeUInt32(localView, 14, checksum);
    writeUInt32(localView, 18, contentBytes.length);
    writeUInt32(localView, 22, contentBytes.length);
    writeUInt16(localView, 26, nameBytes.length);
    writeUInt16(localView, 28, 0);

    chunks.push(localHeader, nameBytes, contentBytes);
    offset += localHeader.length + nameBytes.length + contentBytes.length;

    const centralHeader = header(46);
    const centralView = new DataView(centralHeader.buffer);
    writeUInt32(centralView, 0, 0x02014b50);
    writeUInt16(centralView, 4, 20);
    writeUInt16(centralView, 6, 20);
    writeUInt16(centralView, 8, 0);
    writeUInt16(centralView, 10, 0);
    writeUInt16(centralView, 12, dosTime);
    writeUInt16(centralView, 14, dosDate);
    writeUInt32(centralView, 16, checksum);
    writeUInt32(centralView, 20, contentBytes.length);
    writeUInt32(centralView, 24, contentBytes.length);
    writeUInt16(centralView, 28, nameBytes.length);
    writeUInt16(centralView, 30, 0);
    writeUInt16(centralView, 32, 0);
    writeUInt16(centralView, 34, 0);
    writeUInt16(centralView, 36, 0);
    writeUInt32(centralView, 38, 0);
    writeUInt32(centralView, 42, localOffset);

    centralDirectory.push(centralHeader, nameBytes);
  }

  const centralDirectorySize = centralDirectory.reduce((total, chunk) => total + chunk.length, 0);
  const centralDirectoryOffset = offset;
  const endRecord = header(22);
  const endView = new DataView(endRecord.buffer);

  writeUInt32(endView, 0, 0x06054b50);
  writeUInt16(endView, 4, 0);
  writeUInt16(endView, 6, 0);
  writeUInt16(endView, 8, files.length);
  writeUInt16(endView, 10, files.length);
  writeUInt32(endView, 12, centralDirectorySize);
  writeUInt32(endView, 16, centralDirectoryOffset);
  writeUInt16(endView, 20, 0);

  const allChunks = [...chunks, ...centralDirectory, endRecord];
  const totalLength = allChunks.reduce((total, chunk) => total + chunk.length, 0);
  const zipBytes = concatChunks(allChunks, totalLength);

  return new Blob([zipBytes], { type: 'application/zip' });
}
