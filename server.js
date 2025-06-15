const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const mailgun = require("mailgun-js");
require('dotenv').config();

const app = express();
app.use(cors());  // ✅ FULLY ENABLED CORS
app.use(express.json());

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Initialize Mailgun
const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

app.post("/register", async (req, res) => {
  try {
    const { email, name, uid } = req.body;
    const timestamp = new Date();

    await db.collection("drop_users").doc(uid).set({
      email, name, uid, timestamp
    });

    const message = {
      from: "Drop 2luux <noreply@2luux.com>",
      to: email,
      subject: "You're in for the Drop 🎉",
      text: `Hello ${name},\n\nThanks for signing up for the drop! You will get access once the countdown ends.`
    };

    await mg.messages().send(message);
    res.status(200).send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});