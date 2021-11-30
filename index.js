const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 5000;
const admin = require("firebase-admin");
require('dotenv').config();

const pass = "";


const app = express();
app.use(cors());
app.use(bodyParser.json());


const serviceAccount = require("./configs/burj-al-arab-985d8-firebase-adminsdk-gntfx-26c1f3ad5d.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q0pfb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("burj_Al_Arab").collection("booking");

  app.get('/booking', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];

      admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if (tokenEmail == queryEmail) {
            collection.find({ email: queryEmail })
              .toArray((err, documents) => {
                res.status(200).send(documents);
              })
          }
        })
        .catch((error) => {
          res.status(401).send("UnAuthorized user");
        });
    }
    else {
      res.status(401).send("UnAuthorized user");
    }
  });

  app.post('/addBooking', (req, res) => {
    const booking = req.body;
    collection.insertOne(booking)
      .then(result => {
        res.send(result.acknowledged === true);
      })
  });

});

app.listen(port);