"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const client = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// endpoint : hooks.zapier.com/catch/10923/0343534
// catch hooks in hooks by zapier is the hooks that needs to be hit by external request that is post , get or any another request.  
app.post('/hooks/catch/:userId/:zapId', async (req, res) => {
    const userId = req.params.userId;
    const zapId = req.params.zapId;
    const body = req.body;
    try {
        const result = await client.$transaction(async (tx) => {
            console.log("Starting transaction");
            const run = await tx.zapRun.create({
                data: {
                    zapId: zapId,
                    metadata: body
                }
            });
            console.log("ZapRun created:", run);
            const outbox = await tx.zapRunOutbox.create({
                data: {
                    zapRunId: run.id
                }
            });
            console.log("ZapRunOutbox created:", outbox);
            return { run, outbox };
        });
        console.log("Transaction completed successfully:", result);
        res.json({
            message: "Webhook received and data stored successfully",
            zapRun: result.run,
            zapRunOutbox: result.outbox
        });
    }
    catch (error) {
        console.error("Error in transaction:", error);
        res.status(500).json({
            message: "An error occurred while processing the webhook",
            error: error.message
        });
    }
});
app.listen(5000, () => {
    console.log(`server running on port localhost:5000`);
});
