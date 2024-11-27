export const RABBITMQ_CONFIG = {
    url: process.env.RABBITMQ_URL || 'amqp://localhost',
    queue: 'example_queue',
};
