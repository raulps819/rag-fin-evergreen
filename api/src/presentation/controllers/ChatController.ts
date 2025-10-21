import { FastifyRequest, FastifyReply } from 'fastify';
import { inject, injectable } from 'tsyringe';
import { ChatQueryUseCase } from '@application/usecases/chat/ChatQueryUseCase.js';
import { ChatStreamUseCase } from '@application/usecases/chat/ChatStreamUseCase.js';
import { chatQuerySchema } from '@presentation/schemas/chat.schema.js';

@injectable()
export class ChatController {
  constructor(
    @inject('ChatQueryUseCase') private chatQueryUseCase: ChatQueryUseCase,
    @inject('ChatStreamUseCase') private chatStreamUseCase: ChatStreamUseCase
  ) {}

  async query(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = chatQuerySchema.parse(request.body);

    const result = await this.chatQueryUseCase.execute({
      query: validatedData.query,
      documentTypes: validatedData.documentTypes,
      topK: validatedData.topK,
      dateRange: validatedData.dateRange,
    });

    return reply.send({
      answer: result.answer,
      sources: result.sources.map(source => ({
        id: source.id,
        documentId: source.documentId,
        content: source.content,
        score: source.score,
        metadata: {
          documentType: source.metadata.documentType,
          originalName: source.metadata.originalName,
          pageNumber: source.metadata.pageNumber,
          chunkIndex: source.metadata.chunkIndex,
        },
      })),
      metadata: result.metadata,
    });
  }

  async queryStream(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = chatQuerySchema.parse(request.body);

    // Set headers for SSE (Server-Sent Events)
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    try {
      for await (const chunk of this.chatStreamUseCase.execute({
        query: validatedData.query,
        documentTypes: validatedData.documentTypes,
        topK: validatedData.topK,
        dateRange: validatedData.dateRange,
      })) {
        // Send SSE formatted message
        const data = JSON.stringify(chunk);
        reply.raw.write(`data: ${data}\n\n`);
      }

      // Send done event
      reply.raw.write('data: [DONE]\n\n');
      reply.raw.end();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      reply.raw.write(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`);
      reply.raw.end();
    }
  }
}