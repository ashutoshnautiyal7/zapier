import { PrismaClient } from '@prisma/client';
import express from 'express';
import { json } from 'stream/consumers';
const client = new PrismaClient(); 

const app = express(); 
app.use(express.json());

// endpoint : hooks.zapier.com/catch/10923/0343534



app.post('/hooks/catch/:userId/:zapId' , async(req, res) => {
    const userId = req.params.userId; 
    const zapId = req.params.zapId; 

    const body = req.body;

    // store a new trigger in db 
    await client.$transaction(async tx => {
        const run =  await client.zapRun.create({
            data: {
                zapId: zapId,
                metadata: body
            }
        })

        await client.zapRunOutbox.create({
            data: {
                zapRunId: run.id
            }
        })
  

    })

    res.json({
        message: "webhook recieved "
    })

    // pushing it to queue (kafka or redis ) 
    // we need to crate a transactions that is the zaprunoutbox model 




    

})

app.listen(5000 , () => {
    console.log(`server running on port localhost:5000`)
})