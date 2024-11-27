import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject('TRANSACTIONS_SERVICE') private readonly transactionsClient: ClientProxy,
  ) {}

  async sendMessageToTransactions(message: any) {
    const pattern = 'user_event'; // Pattern name (can be 'user_event' or 'create_transaction')
    return this.transactionsClient.emit(pattern, message).toPromise();
  }
}
