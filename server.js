const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();
const dbConnect =  require('./database/db');
const jwt = require('jsonwebtoken');
const userModel = require('./models/user');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// app.use(bodyParser.urlencoded({ extended: true }));

// ---------- for the email sender in contact me section ----------------------------

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


// ------------------------------------- Projects section ---------------------------------

// ------- Database COnnection ---------------------------------------------

dbConnect();

// --- Authentication Application ---------------------------------------

// --- password encryption function 

const encryptPassword = async (password) => {
    let salt = 10;
    try{
        let encryptedPassword = await bcrypt.hash(password, salt);
        return encryptedPassword;
    }
    catch(error){
        console.error(`error in password encryption: ${error}`);

    }
}

// --- jwt authentication middleware

const authentication = async (req, res, next) => {
    const token = req.header('Authorization');

    if(!token){
        return res.status(401).json({message: 'Authorization denied!, no token found.'})
    }

    try{
        
        const actualToken = token.split(' ')[1];
        const decodedToken = jwt.verify(actualToken, process.env.JWT_SECRET);
        req.user = decodedToken.id;
        next();
    }
    catch(error){
        res.status(401).json({message: 'Tocken is not valid, you have to sign in again.'});
    }
}

// --- signup request

app.post('/signup', async (req, res) => {
    try{
        const {name, email, password} = req.body;
        const userExist = await userModel.findOne({email});

        if(userExist){
            return res.status(400).json({message: 'Account already exist.'});
        }

        const encryptedPassword = await encryptPassword(password);
        const newUser = new userModel({name,email,password: encryptedPassword});//I have to use same name as userModel
        await newUser.save();
        res.status(201).json({message: 'User Registered Successfully'});
    }

    catch(error){
        res.status(500).json({message: 'Error while Signing up:' + error});
        console.log('Error1:' + error);
    }
});

//--- Log in code

app.post('/login', async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(400).json({message: 'Account does not exist'});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(isMatch){
            const token = jwt.sign({id:user._id},process.env.JWT_SECRET, {expiresIn:'1h'});
            return res.status(200).json({message: 'Log in successfull ', token: token, user_id: user._id});
        }
        else{
            return res.status(401).json({message: 'Incorrect Password'});
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({message: 'error in loging in: '+ error})
    }
})

//--- fetch loged in user data from database

app.get('/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Protected Route
app.get('/contact', authentication, (req, res) => {
    res.status(200).json({ message: 'Protected route accessed', userId: req.user });
    console.log(req.user);
});