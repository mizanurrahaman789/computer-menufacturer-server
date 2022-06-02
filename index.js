const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jmj9qbb.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function veryfiJWT(req, res, nest) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
            return res.status(401).send({ messagge: 'Unauthorization' });
      }
      const token = authHeader.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
            if (err) {
                  return res.status(403).send({ message: 'forbiten access' })
            }
            req.decoded = decoded;
            next();
      });
}

async function run() {
      try {
            await client.connect();
            const partCollection = client.db('computer_menufacturer').collection('parts');

            const ordersCollection = client.db('computer_menufacturer').collection('orders');
            const userCollection = client.db('computer_menufacturer').collection('users');
            // const partdetailsCollection = client.db('computer_menufacturer').collection('partdetails');

            app.get('/parts', async (req, res) => {
                  const query = {};
                  const cursor = partCollection.find(query);
                  const parts = await cursor.toArray();
                  res.send(parts);
            });

            app.get('/parts/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: ObjectId(id) };
                  const parts = await partCollection.findOne(query);
                  res.send(parts);
            });

            app.get('/order', async (req, res) => {
                  const parts = await partCollection.find().toArray();

                  // const orders = await ordersCollection.find().toArray();
                  // parts.forEach(parts => {
                  //       const partOrders = orders.filter(orders => orders.name === parts.name);
                  // })
                  // return res.send(orders);

                  const decodedEmail = req.dedcoded.email;
                  if (email === decodedEmail) {

                        const orders = await ordersCollection.find().toArray();
                        parts.forEach(parts => {
                              const partOrders = orders.filter(orders => orders.name === parts.name);
                        })
                        return res.send(orders);

                  }
                  else {
                        return res.status(403).send({ message: 'access forbiten' })
                  }


            });

            app.get('./user', veryfiJWT, async (req, res) => {
                  // const order = await ordersCollection.find().toArray();

                  const users = await userCollection.find().toArray();
                  // order.forEach(order => {
                  //       // const orderUser = users.filter(users => users.name === order.name);
                  // })
                  res.send(users);
                  console.log(users)
            });

            app.get('admin/:email', async (req, res) => {
                  const email = req.params.email;
                  const user = await userCollection.findOne({ email: email });
                  const isAdmin = user.role === 'admin';
                  res.send({ admin: isAdmin })
            })




            app.put('/user/admin/:email', veryfiJWT, async (req, res) => {
                  const email = req.params.email;
                  const requester = req.decoded.email;
                  const requesterAccount = await userCollection.findOne({ email: requester });
                  if (requesterAccount.role === 'admin') {

                        const filter = { email: email };
                        const updateDoc = {
                              $set: { role: 'admin' },
                        };
                        const result = await userCollection.updateOne(filter, updateDoc);
                        res.send({ result });
                  }
                  else {
                        res.status(403).send({ message: 'forbidden' })
                  }

            });

            app.put('/user/:email', async (req, res) => {
                  const email = req.params.email;
                  const user = req.body;
                  const filter = { email: email };
                  const options = { upsert: true };
                  const updateDoc = {
                        $set: user,
                  };
                  const result = await userCollection.updateOne(filter, updateDoc, options);
                  const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET,
                        { expiresIn: '1h' });
                  res.send({ result, token });
            });

            // app.post('./partdetails', async (req, res) => {
            //       const partdetails = req.body;
            //       const result = await partdetailsCollection.insertOne(partdetails);
            //       res.send(result);
            // })

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