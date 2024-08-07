const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false
}));

// Middleware to handle session messages
app.use((req, res, next) => {
    if (req.session) {
        res.locals.message = req.session.message;
        delete req.session.message;
    }
    next();
});

app.set('view engine', 'ejs');
app.set('views', './views');

// Routes and static files
app.use(express.static("Uploads"));
app.use("/", require("./routes/routes.js"));

// This line might be unnecessary if the user model does not contain routes
// app.use("/", require("./models/user.js"));

app.get('/', (req, res) => {
    console.log("Hello Boobalan");
    res.send("<h2>Welcome Boobalan A As FullStack Developer</h2>");
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();

const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});