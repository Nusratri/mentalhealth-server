const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
var admin = require("firebase-admin");

const port = process.env.PORT || 5000;
var serviceAccount = require("./mental-health-e8320-firebase-adminsdk-5tb8a-dce96789f1.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.igc4i.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
      const idToken = req.headers.authorization.split('Bearer ')[1];
      try {
          const decodedUser = await admin.auth().verifyIdToken(idToken);
          req.decodedUserEmail = decodedUser.email;
      }
      catch {

      }
  }
  next();
}

async function run() {
    try {
        await client.connect();
        const database = client.db('mentalHealth');
        const bookingCollection = database.collection('regData');
        const therapistCollection = database.collection('therapist');
        const storyCollection = database.collection('successStory');
        const blogCollection = database.collection('blog');
        const usersCollection = database.collection('users');
        const sessionCollection = database.collection('session');

        app.post('/bookingLoad',async (req, res) => {
            const newReg =req.body;
            const result = await bookingCollection.insertOne(newReg)
            . res.json(result);
          
          })
          app.get('/bookingData',(req,res) => {
            bookingCollection.find({}).limit(20)
            .toArray((err,documents)=>{
              res.send(documents);
          
            })
          })
        app.post('/therapistLoad',(req,res) => {
            const dataLoad =req.body;
            console.log(dataLoad)
            therapistCollection.insertMany(dataLoad)
            .then(result => {
              console.log(result.insertedCount)
            
              res.send(result.insertedCount);
            })
        })
        app.get('/therapistData',(req,res) => {
            therapistCollection.find({}).limit(20)
            .toArray((err,documents)=>{
              res.send(documents);
          
            })
        })
        
            app.post('/storyLoad',(req,res) => {
                const dataLoad =req.body;
                console.log(dataLoad)
                storyCollection.insertMany(dataLoad)
                .then(result => {
                  console.log(result.insertedCount)
                
                  res.send(result.insertedCount);
                })
            })
                app.get('/storyData',(req,res) => {
                    storyCollection.find({}).limit(20)
                    .toArray((err,documents)=>{
                      res.send(documents);
                  
                    })
                })
                app.post('/blogLoad',(req,res) => {
                    const dataLoad =req.body;
                    console.log(dataLoad)
                    blogCollection.insertMany(dataLoad)
                    .then(result => {
                      console.log(result.insertedCount)
                    
                      res.send(result.insertedCount);
                    })
                })
                app.get('/blogData',(req,res) => {
                    blogCollection.find({}).limit(20)
                    .toArray((err,documents)=>{
                      res.send(documents);
                  
                    })
                })
                app.post('/sessionLoad',(req,res) => {
                  const dataLoad =req.body;
                  console.log(dataLoad)
                  sessionCollection.insertMany(dataLoad)
                  .then(result => {
                    console.log(result.insertedCount)
                  
                    res.send(result.insertedCount);
                  })
              })
              app.get('/sessionData',(req,res) => {
                  sessionCollection.find({}).limit(20)
                  .toArray((err,documents)=>{
                    res.send(documents);
                
                  })
              })
                app.post('/users', async (req, res) => {
                  const user = req.body;
                  const result = await usersCollection.insertOne(user);
                  console.log(result);
                  res.json(result);
              });
              app.get('/users',(req,res) => {
                usersCollection.find({}).limit(20)
                .toArray((err,documents)=>{
                  res.send(documents);
              
                })
            })
                
              app.get('/users', verifyToken, async (req, res) => {
                const email = req.query.email;
                if (req.decodedUserEmail === email) {
                    const query = { email: email };
                    const cursor = usersCollection.find(query);
                    const orders = await cursor.toArray();
                    res.json(orders);
                }
                else {
                    res.status(401).json({ message: 'User not authorized' })
                }
    
            });

    }

    finally {
        // await client.close();
    }
}

run().catch(console.dir);


app.listen(port, () => {
    console.log(`listening at ${port}`)
})
