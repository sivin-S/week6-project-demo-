const express = require("express");
const app = express();
const path = require("path");
const userRouter = require("./router/userRouter");
const adminRouter = require("./router/adminRouter");
const session = require("express-session");
require("dotenv").config();
require("./config/db");

// Setting up view engine
app.set("view engine", "ejs");

// User session config
const userSession = session({
    secret: "userSecretKey77",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 20000,
        httpOnly: true,
        // secure: true
    }
});

// Admin session config
const adminSession = session({
    secret: "adminSecretKey77",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 20000,
        httpOnly: true,
        // secure: true //https -> only works
    }
});

// setting templates multiple path using " [] "
app.set("views", [
    path.join(__dirname + "/views/user"),
    path.join(__dirname + "/views/admin")
]);

// setup static files
app.use("/", express.static(path.join(__dirname + "/public/user")));
app.use("/admin", express.static(path.join(__dirname + "/public/admin")));

// Apply user session middleware to user routes
app.use("/", userSession, userRouter);

// Apply admin session middleware to admin routes
app.use("/admin", adminSession, adminRouter);

// 404 error handler
app.use(function (req, res, next) {
    res.status(404).render("pageNotFound.ejs");
});

app.listen(process.env.PORT || 8080, function () {
    console.log(`Server is running on port ${process.env.PORT || 8080}`);
});
