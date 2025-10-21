import { injectable } from 'tsyringe';
import {
  IChunkingService,
  TextChunk,
  ChunkingOptions,
} from '@application/ports/IChunkingService.js';

@injectable()
export class ChunkingService implements IChunkingService {
  private defaultChunkSize: number;
  private defaultOverlap: number;

  constructor() {
    this.defaultChunkSize = parseInt(process.env.CHUNK_SIZE || '1000', 10);
    this.defaultOverlap = parseInt(process.env.CHUNK_OVERLAP || '200', 10);
  }

  chunkText(text: string, options?: ChunkingOptions): TextChunk[] {
    const chunkSize = options?.chunkSize || this.defaultChunkSize;
    const chunkOverlap = options?.chunkOverlap || this.defaultOverlap;
    const preserveParagraphs = options?.preserveParagraphs ?? true;

    if (text.length === 0) {
      return [];
    }

    // If text is smaller than chunk size, return as single chunk
    if (text.length <= chunkSize) {
      return [
        {
          content: text,
          index: 0,
          startChar: 0,
          endChar: text.length,
        },
      ];
    }

    const chunks: TextChunk[] = [];
    let currentIndex = 0;
    let chunkIndex = 0;

    if (preserveParagraphs) {
      // Split by paragraphs first to preserve document structure
      return this.chunkByParagraphs(text, chunkSize, chunkOverlap);
    }

    // Simple sliding window approach
    while (currentIndex < text.length) {
      const endIndex = Math.min(currentIndex + chunkSize, text.length);
      let chunkText = text.substring(currentIndex, endIndex);

      // Try to break at sentence boundary if not at the end
      if (endIndex < text.length) {
        const lastPeriod = chunkText.lastIndexOf('. ');
        const lastQuestion = chunkText.lastIndexOf('? ');
        const lastExclamation = chunkText.lastIndexOf('! ');
        const lastNewline = chunkText.lastIndexOf('\n');

        const breakPoints = [lastPeriod, lastQuestion, lastExclamation, lastNewline];
        const bestBreak = Math.max(...breakPoints);

        if (bestBreak > chunkSize * 0.5) {
          // Only break if we're past halfway through the chunk
          chunkText = text.substring(currentIndex, currentIndex + bestBreak + 2);
        }
      }

      chunks.push({
        content: chunkText.trim(),
        index: chunkIndex,
        startChar: currentIndex,
        endChar: currentIndex + chunkText.length,
      });

      // Move forward by chunk size minus overlap
      currentIndex += chunkText.length - chunkOverlap;
      chunkIndex++;

      // Avoid infinite loop if overlap is too large
      if (currentIndex <= chunks[chunks.length - 1].startChar) {
        currentIndex = chunks[chunks.length - 1].endChar;
      }
    }

    return chunks;
  }

  private chunkByParagraphs(
    text: string,
    chunkSize: number,
    chunkOverlap: number
  ): TextChunk[] {
    const paragraphs = text.split(/\n\n+/);
    const chunks: TextChunk[] = [];
    let currentChunk = '';
    let currentStartChar = 0;
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      const trimmedParagraph = paragraph.trim();
      if (!trimmedParagraph) continue;

      // If adding this paragraph would exceed chunk size
      if (currentChunk.length + trimmedParagraph.length > chunkSize && currentChunk.length > 0) {
        // Save current chunk
        chunks.push({
          content: currentChunk.trim(),
          index: chunkIndex,
          startChar: currentStartChar,
          endChar: currentStartChar + currentChunk.length,
        });

        chunkIndex++;

        // Start new chunk with overlap
        const overlapText = this.getOverlapText(currentChunk, chunkOverlap);
        currentStartChar = currentStartChar + currentChunk.length - overlapText.length;
        currentChunk = overlapText + '\n\n' + trimmedParagraph;
      } else {
        // Add paragraph to current chunk
        currentChunk += (currentChunk.length > 0 ? '\n\n' : '') + trimmedParagraph;
      }

      // If single paragraph is larger than chunk size, split it
      if (currentChunk.length > chunkSize * 1.5) {
        const subChunks = this.chunkText(currentChunk, {
          chunkSize,
          chunkOverlap,
          preserveParagraphs: false,
        });

        let lastEndChar = 0;
        for (const subChunk of subChunks) {
          chunks.push({
            content: subChunk.content,
            index: chunkIndex,
            startChar: currentStartChar + subChunk.startChar,
            endChar: currentStartChar + subChunk.endChar,
          });
          lastEndChar = subChunk.endChar;
          chunkIndex++;
        }

        currentChunk = '';
        currentStartChar = currentStartChar + lastEndChar;
      }
    }

    // Add final chunk if any content remains
    if (currentChunk.trim().length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex,
        startChar: currentStartChar,
        endChar: currentStartChar + currentChunk.length,
      });
    }

    return chunks;
  }

  private getOverlapText(text: string, overlapSize: number): string {
    if (text.length <= overlapSize) {
      return text;
    }

    // Get last 'overlapSize' characters
    const overlapText = text.substring(text.length - overlapSize);

    // Try to start from a sentence boundary
    const firstPeriod = overlapText.indexOf('. ');
    if (firstPeriod !== -1 && firstPeriod < overlapSize * 0.5) {
      return overlapText.substring(firstPeriod + 2);
    }

    return overlapText;
  }

  getDefaultChunkSize(): number {
    return this.defaultChunkSize;
  }

  getDefaultOverlap(): number {
    return this.defaultOverlap;
  }
}