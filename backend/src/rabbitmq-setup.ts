import * as amqp from 'amqplib';

export async function setupRabbitMQ() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    const exchangeName = 'service_exchange';

    // Declare an exchange
    await channel.assertExchange(exchangeName, 'direct', { durable: true });

    // Declare and bind queues
    await channel.assertQueue('auth_service_queue', { durable: true });
    await channel.bindQueue('auth_service_queue', exchangeName, 'auth.validate');

    await channel.assertQueue('transactions_service_queue', { durable: true });
    await channel.bindQueue('transactions_service_queue', exchangeName, 'transactions.response');

    console.log('RabbitMQ setup complete: Exchange and queues are configured');
    await channel.close();
    await connection.close();
}
