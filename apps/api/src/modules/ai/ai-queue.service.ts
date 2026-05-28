import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Job, Queue, Worker } from 'bullmq';
import { AiService } from './ai.service';

type JobPayload = {
  sessionId: string;
  resumeId: string;
  userId: string;
  body: {
    action: string;
    experienceIndex?: number;
    targetJobDescription?: string;
    targetLanguage?: string;
  };
};

@Injectable()
export class AiQueueService implements OnModuleDestroy {
  private queue: Queue<JobPayload> | null = null;
  private worker: Worker<JobPayload> | null = null;
  private enabled = false;

  constructor(private aiService: AiService) {
    const redisUrl = process.env.REDIS_URL || '';
    if (!redisUrl) return;
    try {
      this.queue = new Queue<JobPayload>('ai-generate-queue', { connection: { url: redisUrl } });
      this.worker = new Worker<JobPayload>(
        'ai-generate-queue',
        async (job: Job<JobPayload>) => {
          await this.aiService.runQueuedSession(job.data.sessionId, job.data.resumeId, job.data.userId, job.data.body);
        },
        { connection: { url: redisUrl } },
      );
      this.enabled = true;
    } catch {
      this.enabled = false;
      this.queue = null;
      this.worker = null;
    }
  }

  isEnabled() {
    return this.enabled && !!this.queue;
  }

  async enqueue(payload: JobPayload) {
    if (!this.queue) throw new Error('Queue not initialized');
    await this.queue.add(`ai-job-${payload.sessionId}`, payload, {
      attempts: 2,
      removeOnComplete: true,
      removeOnFail: false,
      backoff: { type: 'exponential', delay: 1500 },
    });
  }

  async getQueueStats() {
    if (!this.queue || !this.worker) {
      return { waiting: 0, active: 0 };
    }
    const [waiting, active] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
    ]);
    return { waiting, active };
  }

  async onModuleDestroy() {
    await this.worker?.close();
    await this.queue?.close();
  }
}
