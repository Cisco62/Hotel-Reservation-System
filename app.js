if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const path = require('path');
const reservation = require('./models/reservation');
const ejsMate = require('ejs-mate');
const Reservation = require('./models/reservation');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { reservationSchema } = require('./schemas.js');
const express_session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('./models/user');
const {isLoggedIn} = require('./middleware');
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require('connect-mongo');(express_session);
// const {validateReservation} = require('./middleware');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/hotelReservation'
console.log({dbUrl})


mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Database Connected!!');
});

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});
store.on('error', function(e) {
    console.log('SESSION STORE ERROR');
})
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(express_session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));

//Adding user to a session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const validateReservation = (req, res, next) => {
    const {error} = reservationSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

app.use((req, res, next) => {
    //console.log(req.session)
   
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/admin', (req, res) => {
     res.render('users/admin');
});

app.get('/user_register', (req, res) => {
    res.render('users/user_register');
});

app.get('/userlogin', (req, res) => {
    res.render('users/userlogin');
});

app.get('/reservations', catchAsync (async (req, res) => {
     res.render('users/admin')
}));

app.get('/reservation', isLoggedIn, (req, res) => {
    res.render('reservations/reservation');
});

//New User Registration Route
app.post('/user_register', catchAsync(async (req, res) => {
    try{
        const { username, email, password } = req.body;
        const user = new User({ username, email});
        const registeredUser = await User.register(user, password);
        //Logs a user in immediatesly after registering
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success','Welcome To City Royale, You Can Now Make A Reservation');
            res.redirect('/');
        })
    } catch (e){
        req.flash('success', e.message);
        res.redirect('/user_register');
    }
}));

//Admin login authentication route
app.post('/admin', async (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin'){
        req.flash('success', `Signed in as admin`);
        const reservations = await Reservation.find({});
        res.render('reservations/index', { reservations });
    } else {
        res.render('users/admin')
    }
});
//User login authentication route
app.post('/userlogin', passport.authenticate('local', { failureFlash: true, failureRedirect: '/userlogin' }), (req, res) => {
    req.flash('success', 'Welcome back!!');
    const redirectUrl = req.session.returnTo || '/reservation'
    res.redirect(redirectUrl);
});

app.post('/reservation', isLoggedIn, validateReservation, catchAsync (async (req, res, next) => {
    const reservation = new Reservation(req.body.reservation);
    const savedReservation = await reservation.save();
    const reservationId = savedReservation._id.toString()
    req.flash('success', 'Your Reservation Has Been Booked!, Thank You For Choosing City Royale')
    res.redirect('/');
    // res.redirect(`/reservations/${reservationId}`);
}));

app.get('/reservations/:id', catchAsync (async (req, res) => {
    const reservation = await Reservation.findById(req.params.id);
    res.render('reservations/show', {reservation})
}));

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', 'Thank You For Choosing City Royale, GoodBye!');
      res.redirect('/');
    });
});

app.delete('/reservations/:id', catchAsync (async (req, res) => {
    const { id } = req.params;
    await Reservation.findByIdAndDelete(id);
    res.redirect('/reservations');
}));
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});
app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if(!err.message) err.message = "Oh No, Something Went Wrong";
    res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});