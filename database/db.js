const mongoose = require('mongoose');
const dbUrl = 'mongodb+srv://dmprajapati8585:Deep@cluster0.osjzk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.set('strictQuery', true, 'useNewUrlParser', true);

const dbConnect = async() =>{
    try{
        mongoose.connect(dbUrl);
        console.log('Database connected');
        return true;
    }catch(error){
        console.error('error in connecting database: '+ error);
        process.exit(1);
    }
}

module.exports = dbConnect;