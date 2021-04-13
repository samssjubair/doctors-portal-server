const bodyParser = require('body-parser');
const express = require('express')
const fileUpload=require('express-fileupload');
const fs=require('fs-extra')
require('dotenv').config();
const cors = require('cors')
const app = express()


app.use(cors());
app.use(bodyParser.json());
app.use(express.static('doctors'));
app.use(fileUpload());

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uizyj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;




app.get('/', (req, res) => {
  res.send('Hello World!')
})
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentsCollection = client.db("doctorsPortal").collection("appointments");
  const doctorsCollection = client.db("doctorsPortal").collection("doctors");

  app.get('/appointments',(req,res)=>{
      appointmentsCollection.find({})
      .toArray((err,documents)=>{
          res.send(documents);
      })
  })
  app.post('/addAppointment',(req,res)=>{
      const appointment= req.body;
      appointmentsCollection.insertOne(appointment)
      .then(function(result) {
        res.send(result.insertedCount>0)
      })
  })

  app.post('/appointmentsByDate',(req,res)=>{
    const date= req.body.date;
    const email=req.body.email
    
    doctorsCollection.find({email: email})
    .toArray((err,docs)=>{
        const filter={appointmentDate: date};
        if(docs.length===0){
            filter.email=email;
        }
        appointmentsCollection.find(filter)
        .toArray((err,documents)=>{
            res.send(documents)
        })
    })
    
  })

  app.post('/isDoctor',(req,res)=>{
      const email=req.body.email;
      doctorsCollection.find({email: email})
      .toArray((err,documents)=>{
          
              res.send(documents.length>0)
          
      })
  })
    
    app.post('/addDoctor',(req,res)=>{
        const name=req.body.name;
        const email=req.body.email;
        const file=req.files.file;
        // const filePath=`${__dirname}/doctors/${file.name}`;
        

        

        // file.mv(filePath,err=>{
        //     if(err){
        //         res.status(500).send({msg: "Failed to upload image"})
        //     }
            const newImg=file.data;
            const encImg= newImg.toString('base64');
            const image={
                contentType: file.mimetype,
                size: file.size,
                img: Buffer.from(encImg,'base64')
            };
            doctorsCollection.insertOne({name,email,image})
            .then(result=>{
                // fs.remove(filePath,error=>{
                //     if(error){
                //         console.log(error);
                //         res.status(500).send({msg: "Failed to upload image"})
                //     }
                    res.send(result.insertedCount>0)
                // })
            })

        // })
    })
    app.get('/doctors',(req,res)=>{
        doctorsCollection.find({})
        .toArray((err,documents)=>{
            res.send(documents);
        })
    })


});

app.listen( process.env.PORT || 5055, () => {
  console.log(`Example app listening at port 5055`)
})
