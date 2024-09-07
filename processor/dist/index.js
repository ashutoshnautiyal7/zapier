"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const kafkajs_1 = require("kafkajs");
const TOPIC_NAME = 'zap-events';
const kafka = new kafkajs_1.Kafka({
    clientId: 'outbox-processor',
    brokers: ['localhost:9092']
});
const client = new client_1.PrismaClient();
async function main() {
    const producer = kafka.producer();
    await producer.connect();
    while (1) {
        const pendingRows = await client.zapRunOutbox.findMany({
            where: {},
            take: 10
        });
        producer.send({
            topic: TOPIC_NAME,
            messages: pendingRows.map(r => ({
                value: r.zapRunId
            }))
        });
        await client.zapRunOutbox.deleteMany({
            where: {
                id: {
                    in: pendingRows.map(x => x.id)
                }
            }
        });
    }
}
main();
