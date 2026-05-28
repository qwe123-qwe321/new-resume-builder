import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiQueueService } from './ai-queue.service';

@Module({
  controllers: [AiController],
  providers: [AiService, AiQueueService],
})
export class AiModule {}
