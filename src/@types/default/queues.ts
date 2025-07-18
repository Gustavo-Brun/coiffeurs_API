import { QueueEntryStatus } from '@prisma/client';

namespace typesQueues {
  export interface CreateQueueBody {
    providerId: number;
  }

  export interface CreateQueueEntryBody {
    queueId: string;
    clientId: number;
    order: number;
  }

  export interface EditQueueEntryOrderBody {
    queueId: string;
    clientId: number;
    direction: 'UP' | 'DOWN';
  }
}

export = typesQueues;
