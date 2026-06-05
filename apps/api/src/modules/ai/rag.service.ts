import { Injectable, Inject } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';

export interface RagChunkInput {
  source: string;
  title: string;
  category: string;
  tags?: string[];
  content: string;
  metadata?: Record<string, unknown>;
}

export interface RagHit {
  id: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  score: number;
}

const VECTOR_SIZE = 128;
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 'were',
  '一个', '以及', '或者', '但是', '如果', '进行', '通过', '需要', '可以', '应该',
]);

function normalizeText(text: string) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}+#.]+/gu, ' ').trim();
}

function tokenize(text: string) {
  const normalized = normalizeText(text);
  const baseTokens = normalized
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && !STOP_WORDS.has(item));
  const cjkText = normalized.replace(/[^\p{Script=Han}]+/gu, '');
  const cjkBigrams = Array.from({ length: Math.max(0, cjkText.length - 1) }, (_, index) =>
    cjkText.slice(index, index + 2),
  );
  return [...baseTokens, ...cjkBigrams];
}

function hashToken(token: string) {
  let hash = 2166136261;
  for (let i = 0; i < token.length; i += 1) {
    hash ^= token.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function buildLocalEmbedding(text: string) {
  const vector = Array.from({ length: VECTOR_SIZE }, () => 0);
  for (const token of tokenize(text)) {
    const index = hashToken(token) % VECTOR_SIZE;
    vector[index] += 1;
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / norm).toFixed(6)));
}

function cosineSimilarity(a: number[], b: number[]) {
  const len = Math.min(a.length, b.length);
  if (!len) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function keywordScore(queryTokens: string[], content: string, tags: string[]) {
  if (queryTokens.length === 0) return 0;
  const haystack = `${normalizeText(content)} ${tags.join(' ').toLowerCase()}`;
  const hitCount = queryTokens.reduce((count, token) => count + (haystack.includes(token) ? 1 : 0), 0);
  return hitCount / queryTokens.length;
}

@Injectable()
export class RagService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async upsertChunks(chunks: RagChunkInput[]) {
    let count = 0;
    for (const chunk of chunks) {
      const metadata = (chunk.metadata || {}) as Prisma.InputJsonValue;
      await this.prisma.knowledgeChunk.upsert({
        where: { source_title: { source: chunk.source, title: chunk.title } },
        update: {
          category: chunk.category,
          tags: chunk.tags || [],
          content: chunk.content,
          embedding: buildLocalEmbedding(`${chunk.title}\n${chunk.tags?.join(' ') || ''}\n${chunk.content}`),
          metadata,
        },
        create: {
          source: chunk.source,
          title: chunk.title,
          category: chunk.category,
          tags: chunk.tags || [],
          content: chunk.content,
          embedding: buildLocalEmbedding(`${chunk.title}\n${chunk.tags?.join(' ') || ''}\n${chunk.content}`),
          metadata,
        },
      });
      count += 1;
    }
    return count;
  }

  async retrieve(query: string, options: { topK?: number; category?: string } = {}) {
    const topK = options.topK ?? 5;
    const queryEmbedding = buildLocalEmbedding(query);
    const queryTokens = tokenize(query);
    const chunks = await this.prisma.knowledgeChunk.findMany({
      where: options.category ? { category: options.category } : undefined,
      take: 300,
      orderBy: { updatedAt: 'desc' },
    });

    return chunks
      .map((chunk) => {
        const semantic = cosineSimilarity(queryEmbedding, chunk.embedding);
        const lexical = keywordScore(queryTokens, chunk.content, chunk.tags);
        const score = semantic * 0.6 + lexical * 0.4;
        return {
          id: chunk.id,
          title: chunk.title,
          category: chunk.category,
          tags: chunk.tags,
          content: chunk.content,
          score: Number(score.toFixed(4)),
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  formatContext(hits: RagHit[]) {
    if (hits.length === 0) {
      return '未检索到可用知识片段。请仅基于用户简历和岗位描述回答，不要编造事实。';
    }
    return hits
      .map((hit, index) => [
        `[${index + 1}] ${hit.title}（${hit.category}，score=${hit.score}）`,
        `Tags: ${hit.tags.join(', ') || 'none'}`,
        hit.content,
      ].join('\n'))
      .join('\n\n');
  }
}
