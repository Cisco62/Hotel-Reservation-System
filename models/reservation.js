const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reservationSchema = new Schema({
    first_name: String,
    last_name: String,
    email: String,
    check_in_date: String,
    check_out_date: String,
    day_of_the_week: String,
    arrival_time: String,
    number_of_persons: Number,
    room_type: String,
    phone_number: Number
});

module.exports = mongoose.model('Reservation', reservationSchema);