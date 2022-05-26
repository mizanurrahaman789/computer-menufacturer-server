const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jmj9qbb.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
      try {
            await client.connect();
            const partCollection = client.db('computer_menufacturer').collection('parts');
            const ordersCollection = client.db('computer_menufacturer').collection('orders');

            app.get('/parts', async (req, res) => {
                  const query = {};
                  const cursor = partCollection.find(query);
                  const parts = await cursor.toArray();
                  res.send(parts);
            });

            app.get('/order', async (req, res) => {
                  const parts = await partCollection.find().toArray();

                  const orders = await ordersCollection.find().toArray();

                  parts.forEach(parts => {
                        const partOrders = orders.filter(orders => orders.name === parts.name);
                  })
                  res.send(orders);
            })

            app.post('/orders', async (req, res) => {
                  const orders = req.body;
                  const result = await ordersCollection.insertOne(orders);
                  res.send(result);
            })

      }
      finally {

      }
}

run().catch(console.dir)

app.get('/', (req, res) => {
      res.send('Hello Computer Menufacturer')
})

app.listen(port, () => {
      console.log(`Computer menufacturer listening on port ${port}`)
})