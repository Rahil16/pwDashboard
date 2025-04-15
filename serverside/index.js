import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mysql from "mysql2";
import env from "dotenv";

const app = express();
env.config();
const port = 3000 || 8080;
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.MS_HOST,
  user: process.env.MS_USER,
  port: process.env.MS_PORT,
  password: process.env.MS_PASS,
  database: process.env.MS_DB,
  connectTimeout: 60000, // Increase timeout to 60 seconds
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to database.");
});

app.get("/orders", (req, res) => {
  db.query("SELECT * FROM sales_data;", (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    console.log("Results: ", results);
    res.json(results);
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Listening at port ${port}`);
});
