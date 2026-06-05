/* eslint-disable no-console */
import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaService } from '../common/prisma.service';
import { RagService } from '../modules/ai/rag.service';
import { DEFAULT_KNOWLEDGE_CHUNKS } from '../modules/ai/rag-knowledge';

config({ path: resolve(__dirname, '../../../..', '.env') });

async function main() {
  const prisma = new PrismaService();
  const rag = new RagService(prisma);

  await prisma.$connect();
  const count = await rag.upsertChunks(DEFAULT_KNOWLEDGE_CHUNKS);
  await prisma.$disconnect();

  console.log(`embeddings:sync 已完成：写入/更新 ${count} 个 KnowledgeChunk。`);
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
