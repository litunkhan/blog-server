const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6scxok5.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    
    client.connect((error) => {
      if (error) {
        console.error(error);
        return;
      }
    });
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const usersCollection = client.db('blogapp').collection('users')
    const blogCollection = client.db('blogapp').collection('postedblogs')



    app.get('/',(req,res)=>{
        res.send('app running')
    })


    app.post('/login', async (req, res) => {
      const { email, password } = req.body;
      const user = await usersCollection.findOne({ email, password });

      if (user) {
        res.json({ message: 'Login successful', user });
      } else {
        res.status(401).json({ message: 'Invalid user' });
      }
    })



    app.post('/register', async(req,res)=>{
        const user = req.body
        const query = {email:user.email}
        const exsistingUser = await usersCollection.findOne(query)
        if(exsistingUser){
          return res.send('userAlredy exits')
        }
        const result = await usersCollection.insertOne(user)
        res.send(result)
     })

     app.post('/blogpost', async(req,res)=>{
         const blogs = req.body
         const result = await blogCollection.insertOne(blogs)
         res.send(result)
     })

     app.get('/getblog',async(req,res)=>{
        
         const result = await blogCollection.find({}).toArray()
         res.send(result)

     })
    



    app.listen(port,()=>{
        console.log('app is running')
    })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
