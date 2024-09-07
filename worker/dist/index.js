"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { PrismaClient } from "@prisma/client";
const kafkajs_1 = require("kafkajs");
const TOPIC_NAME = 'zap-events';
const kafka = new kafkajs_1.Kafka({
    clientId: 'outbox-processor',
    brokers: ['localhost:9092']
});
// const client = new PrismaClient(); 
async function main() {
    const consumer = kafka.consumer({
        groupId: 'main-worker'
    });
    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true });
    await consumer.run({
        autoCommit: false, // for mannual acknowledgement 
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                partition,
                offset: message.offset,
                value: message.value.toString(),
            });
            // every event in the queue is consumed after delay of 1 sec => it is to the assumption that some service like sending mail will take atmax 1sec to complete . 
            await new Promise(r => setTimeout(r, 5000));
            // but we'll have acknowledgement queue that is only when some event has done we'll  be moving forward to another one.  
            await consumer.commitOffsets([{
                    topic: TOPIC_NAME,
                    partition: partition,
                    offset: (parseInt(message.offset) + 1).toString()
                }]);
        }
    });
}
main();
