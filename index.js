const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
const { json } = require('express')
require('dotenv').config()
const objectId = require('mongodb').ObjectId; 

const app = express()
app.use(cors())
app.use(express.json())

const port = process.env.PORT || 3030;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.68bgv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
      await client.connect();
      console.log('database connected');
      const database = client.db("ExGamer");
      const gamesCollection = database.collection('games');
      const orderCollection = database.collection('orders');
      const reviewCollection = database.collection('review');
      const usersCollection = database.collection('users');

      app.get('/games',async(req,res)=>{
        let size = req.query.size;
        const query = {}
        const cursor = gamesCollection.find(query);

        if(size){
          let games = await cursor.limit(6).toArray();
          res.json(games)

        }
        else{
          let games = await cursor.toArray();
          res.json(games)
        }

      })
      app.post('/games',async(req,res)=>{
        const game = req.body;
        const result = await gamesCollection.insertOne(game);
        res.json(result);
      })

      app.get('/review', async(req,res)=>{
        
        const cursor = reviewCollection.find({});
        const result = await cursor.toArray();
        res.json(result);
      })

      app.post('/review',async(req,res)=>{
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        res.json(result);
      })



      app.get('/gamesbyid',async(req,res)=>{
        const id = req.query.id;
        console.log(id);
        const query = {_id: id};
        const data = await gamesCollection.findOne(query);
        console.log(data);
        res.json(data);
      })

      app.post('/order',async(req,res)=>{
        const order = req.body;

        const result = await orderCollection.insertOne(order);

        res.json(result);

      })

      app.get('/users/:email', async(req,res)=>{
        const email = req.params.email;
        let isAdmin = false;
        const query = {email};
        const user = await usersCollection.findOne(query);
        if(user?.role === 'admin'){
          isAdmin = true;
        }
        res.json({admin:isAdmin})
      })

      app.post('/users', async(req,res)=>{
        const user = req.body;

        const result = await usersCollection.insertOne(user)

        console.log(result);

        res.json({result})
      })

      app.put('/users',async(req,res)=>{
          const user = req.body;
          const query = {email: user.email};
          const option = {upsert:true};
          const data ={
            $set: user
          };
          const result = await usersCollection.updateOne(query,data,option)

          res.json(result)
      })

      app.put('/users/admin',async(req,res)=>{
        const user = req.body;
        const filter = {email:user.email}
        const updateDoc = {$set: {role: 'admin'}};
        const result = await usersCollection.updateOne(filter,updateDoc);
        res.json(result);

      })

      app.get('/myorders', async(req,res)=>{
        const email = req.query.email;
        const query = {email}
        const cursor = orderCollection.find(query);
        const appointments = await cursor.toArray();
        res.json(appointments)
      })

      app.delete('/myorders', async(req,res)=>{
        const id = req.query.id;
        const query = {_id: objectId(id)}
        const result = await orderCollection.deleteOne(query);
        res.json(result)
      })

    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Server is running')
})

app.listen(port, () => {
  console.log(`Server listing on port: ${port}`)
})