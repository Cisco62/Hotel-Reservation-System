const mongoose = require('mongoose');
const cities = require('./cities');
const { lastname, firstname } = require('./seedHelpers');
const Reservation = require('../models/reservation')

mongoose.connect('mongodb://localhost:27017/realEstate', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, {});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log("Database Connected!!!");
});

//Picking a random element from array
const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

//Removing Everything form the database
const seedDB = async () => {
    await Reservation.deleteMany({});
    //Loop through seed
    for(i = 0; i < 2; i++){
        const random5 = Math.floor(Math.random() * 5);
        //Making a new random price
        //const price = Math.floor(Math.random() *20) + 10;
        //Making new Apartment
        const a = new Reservation({
            firstname: `${cities[random5].city}, ${cities[random5].location}`,
            lastname: `${sample(firstname)} ${sample(lastname)}`,
            //image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8aG91c2VzfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
            //description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere placeat fugit est ipsum hic culpa quidem earum, cum omnis temporibus, architecto soluta tempora eaque at, quisquam perspiciatis vitae ad nobis.',
            price
        })
       await a.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})