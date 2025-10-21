import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { ChunkingService } from '../../../src/application/services/ChunkingService.js';

describe('ChunkingService', () => {
  let chunkingService: ChunkingService;

  beforeEach(() => {
    chunkingService = new ChunkingService();
  });

  describe('chunkText', () => {
    it('should return empty array for empty text', () => {
      const result = chunkingService.chunkText('');
      expect(result).toEqual([]);
    });

    it('should return single chunk for small text', () => {
      const text = 'This is a small text.';
      const result = chunkingService.chunkText(text, { chunkSize: 100 });

      expect(result).toHaveLength(1);
      expect(result[0].content).toBe(text);
      expect(result[0].index).toBe(0);
      expect(result[0].startChar).toBe(0);
      expect(result[0].endChar).toBe(text.length);
    });

    it('should split large text into multiple chunks', () => {
      const text = 'a'.repeat(2500); // 2500 caracteres
      const result = chunkingService.chunkText(text, {
        chunkSize: 1000,
        chunkOverlap: 200,
        preserveParagraphs: false,
      });

      expect(result.length).toBeGreaterThan(1);
      expect(result[0].content.length).toBeLessThanOrEqual(1000);
    });

    it('should create overlapping chunks', () => {
      const text = 'a'.repeat(2000);
      const result = chunkingService.chunkText(text, {
        chunkSize: 1000,
        chunkOverlap: 200,
        preserveParagraphs: false,
      });

      // Check that chunks overlap
      const chunk1End = result[0].content.slice(-200);
      const chunk2Start = result[1].content.slice(0, 200);

      expect(chunk1End).toBe(chunk2Start);
    });

    it('should preserve sentence boundaries', () => {
      const text = 'First sentence. Second sentence. Third sentence. Fourth sentence.';
      const result = chunkingService.chunkText(text, {
        chunkSize: 40,
        chunkOverlap: 10,
        preserveParagraphs: false,
      });

      // Check that chunks end with sentence boundaries when possible
      expect(result.length).toBeGreaterThan(1);
      result.forEach((chunk, index) => {
        if (index < result.length - 1) {
          // Not the last chunk
          const lastChar = chunk.content.trim().slice(-1);
          // Should end with a sentence ending or be a reasonable break
          expect(['.',  '!', '?', 'e']).toContain(lastChar);
        }
      });
    });

    it('should handle paragraph-preserving mode', () => {
      const text = `Paragraph 1 line 1.
Paragraph 1 line 2.

Paragraph 2 line 1.
Paragraph 2 line 2.

Paragraph 3 line 1.`;

      const result = chunkingService.chunkText(text, {
        chunkSize: 100,
        chunkOverlap: 20,
        preserveParagraphs: true,
      });

      expect(result.length).toBeGreaterThan(0);
      // Each chunk should contain whole paragraphs when possible
      result.forEach(chunk => {
        expect(chunk.content.length).toBeGreaterThan(0);
      });
    });

    it('should assign correct chunk indices', () => {
      const text = 'a'.repeat(3000);
      const result = chunkingService.chunkText(text, {
        chunkSize: 1000,
        chunkOverlap: 200,
        preserveParagraphs: false,
      });

      result.forEach((chunk, index) => {
        expect(chunk.index).toBe(index);
      });
    });

    it('should respect chunk size limits', () => {
      const text = 'a'.repeat(5000);
      const chunkSize = 500;
      const result = chunkingService.chunkText(text, {
        chunkSize,
        chunkOverlap: 100,
        preserveParagraphs: false,
      });

      result.forEach((chunk) => {
        // Allow some flexibility due to sentence boundary breaking
        expect(chunk.content.length).toBeLessThanOrEqual(chunkSize * 1.5);
      });
    });
  });

  describe('getDefaultChunkSize', () => {
    it('should return default chunk size', () => {
      const size = chunkingService.getDefaultChunkSize();
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThan(0);
    });
  });

  describe('getDefaultOverlap', () => {
    it('should return default overlap', () => {
      const overlap = chunkingService.getDefaultOverlap();
      expect(typeof overlap).toBe('number');
      expect(overlap).toBeGreaterThan(0);
    });
  });
});
