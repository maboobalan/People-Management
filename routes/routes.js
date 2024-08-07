const express = require('express');
const router = express.Router();
const multer = require('multer');
const session = require('express-session');
const Users = require('../models/user.js'); 
const fs = require('fs')// Make sure this path is correct

// Set up session middleware if not already done elsewhere
router.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Image upload configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./Uploads"); // Use path to avoid issues with relative paths
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

const upload = multer({ storage: storage }).single('image');

// Insert user details into the database
router.post('/add', upload, async (req, res) => {
    try {
        const user = new Users({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename
        });

        await user.save();
        req.session.message = {
            type: 'success',
            message: 'User Added Successfully'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});


router.get("/", async (req, res) => {
    try {
        const users = await Users.find().exec();
        res.render('views', {
            title: "Home Page",
            users: users
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});
//about Users
router.get('/about', (req, res) => {
    res.render('about', { title: 'About Us' });
});
// customer any queations  contact page
router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Us' });
});

// Render add user page
router.get('/add', (req, res) => {
    res.render("add-users", { title: 'Add Users' });
});

//update an users

router.get('/edit/:id', async (req, res) => {
    let id = req.params.id;
    try {
        let user = await Users.findById(id);
        if (!user) {
            return res.render('/');
        }
        res.render("edit-users", {
            title: "Edit Users",
            user: user,
        });
    } catch (err) {
        res.render('/');
    }
});

router.post('/update/:id', upload, async (req, res) => {
    let id = req.params.id;
    let new_image = req.body.old_Image; // Default to the old image

    if (req.file) {
        new_image = req.file.filename;

        // Delete the old image if a new one is uploaded
        try {
            fs.unlinkSync('./Uploads/' + req.body.old_Image);
        } catch (err) {
            console.log(err);
        }
    }

    try {
        await Users.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image
        });

        req.session.message = {
            type: 'success',
            message: 'User Updated Successfully'
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;

    try {
        let result = await Users.findByIdAndDelete(id);

        if (result && result.image) {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch (err) {
                console.log(err);
            }
        }

        req.session.message = {
            type: 'info',
            message: 'User Deleted Successfully'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message });
    }
});
module.exports = router;