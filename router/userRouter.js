const express = require("express");
const bcrypt = require("bcrypt");
const { User } = require("../config/model");
const userRouter = express.Router();

userRouter.use(express.urlencoded({ extended: true }));

userRouter.get("/", isUserLogin, async function (req, res) {
    const data = await User.findOne({"email":req.session.email})
    res.setHeader('Cache-Control', 'no-store');
    res.render("home.ejs",{data});
});

userRouter.get("/login", preventAutoLogin, function (req, res) {
    if (req.session.userStatus) {
        res.redirect("/");
    } else {
        res.setHeader('Cache-Control', 'no-store');
        res.render("login.ejs");
    }
});

userRouter.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (!err) {
            res.clearCookie("connect.sid");
            res.redirect("/login");
        } else {
            return res.status(500).send('Failed to destroy session');
        }
    });
});

userRouter.get("/signUp", function (req, res) {
    res.render("signUp.ejs");
});

userRouter.post("/signup", async function (req, res) {
    // if (!req.body.email || !req.body.password) {
    //     return res.status(400).send('Email and password are required');
    // }

    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).send('Email already in use');
        }else{

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({ email: req.body.email, password: hashedPassword });
        await user.save();
        req.session.email = req.body.email;
        req.session.userStatus = true;
        res.redirect("/login");
        }
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).send('Error signing up');
    }
});

userRouter.post("/login", async function (req, res) {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            req.session.email = user.email;
            req.session.userStatus = true;
            res.redirect("/");
        } else {
            res.status(401).send('Invalid email or password');
        }
    } catch (error) {
        res.status(500).send('Error logging in');
    }
});

function isUserLogin(req, res, next) {
    if (!req.session.userStatus) {
        req.session.destroy(function (err) {
            if (!err) {
                res.clearCookie("connect.sid");
                res.redirect("/login");
            }
        });
    } else {
        return next();
    }
}

function preventAutoLogin(req, res, next) {
    if (req.session && req.session.email) {
        res.redirect("/");
    } else {
        return next();
    }
}

module.exports = userRouter;
