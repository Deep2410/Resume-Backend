const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.post('/send-email', (req,res) => {
    const {name, email, message} = req.body;

    // create a transponder

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.Email,
            pass: process.env.Password
        }
    });

    const newEmail = {
        from: email,
        to: 'dm.prajapati8585@gmail.com',
        subject: `New Message From ${name}`,
        text: `Email from: ${email} Message is: ${message}`
    }

    transporter.sendMail(newEmail, (error, info) => {
        if(error){
            console.log(`error in sending Email: ${error}`);
            return res.status(500).send("error in sending email")
        }

        console.log('Email Sent.', info.response);
        res.status(200).send('email sent succesfully');
    })
});

app.listen(port, () => {
    console.log('server is running on port '+ port);
})