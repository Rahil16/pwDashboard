import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import mysql from "mysql2"
import env from "dotenv"

const app=express();
env.config();
const port=3000;
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: process.env.MS_HOST,
    user: process.env.MS_USER,
    password: process.env.MS_PASS,
    database: process.env.MS_DB,
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

app.get('/orders', (req, res) => {
    db.query('SELECT * FROM productwarfare.orders;', (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
        console.log(results);
        
    });
});

app.listen(port,()=>{console.log(`Listening at port ${port}`)})