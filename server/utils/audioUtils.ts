/**
 * Audio Utilities
 * Helper functions for raw audio and PCM waveform manipulation.
 */

/**
 * Creates a valid WAV file buffer from raw linear16 PCM buffer with standard WAV header.
 * 
 * @param pcmBuffer - Linear16 PCM audio buffer
 * @param sampleRate - Audio sample rate in Hz (default: 16000)
 * @param numChannels - Number of audio channels (default: 1 mono)
 * @param bitDepth - Bit depth per sample (default: 16 bits)
 * @returns Complete WAV Buffer including 44-byte RIFF header
 */
export function createWavFromPcm(
  pcmBuffer: Buffer,
  sampleRate: number = 16000,
  numChannels: number = 1,
  bitDepth: number = 16
): Buffer {
  const byteRate = (sampleRate * numChannels * bitDepth) / 8;
  const blockAlign = (numChannels * bitDepth) / 8;
  const dataSize = pcmBuffer.length;
  const chunkSize = 36 + dataSize;
  const header = Buffer.alloc(44);

  // RIFF Chunk Descriptor
  header.write('RIFF', 0);
  header.writeUInt32LE(chunkSize, 4);
  header.write('WAVE', 8);

  // 'fmt ' Sub-chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);

  // 'data' Sub-chunk
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}
