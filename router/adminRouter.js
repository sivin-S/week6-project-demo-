const express = require("express");
const bcrypt = require("bcrypt");
const {ObjectId} = require("mongodb")
const { Admin,User } = require("../config/model");
const adminRouter = express.Router();

adminRouter.use(express.urlencoded({ extended: true }));

adminRouter.get("/", isAdminLogin, async function (req, res) {
    const data = await User.find({});
    res.setHeader('Cache-Control', 'no-store');
    res.render("dashboard.ejs",{data});
});

adminRouter.get("/login", preventAutoLogin, function (req, res) {
    if (req.session.adminStatus) {
        res.redirect("/admin");
    } else {
        res.setHeader('Cache-Control', 'no-store');
        res.render("adminLogin.ejs");
    }
});

adminRouter.get("/update/:id",async function(req,res){
    const data = await User.findOne({"_id":new ObjectId(req.params.id)});
    res.render("updateForm.ejs",{data});
})


adminRouter.get("/delete/:id",async function(req,res){
    const data = await User.deleteOne({"_id": new ObjectId(req.params.id)})
    if(!(data.acknowledged)){
        res.redirect(307,'/admin');
    }else{
        res.redirect('/admin');
    }
})

adminRouter.get("/logout", function (req, res) {
    req.session.destroy(function (err) {
        if (!err) {
            res.clearCookie("connect.sid");
            res.redirect("/admin/login");
        } else {
            return res.status(500).send('Failed to destroy session');
        }
    });
});

adminRouter.get("/update", function (req, res) {
    res.render("updateForm.ejs");
});

adminRouter.get("/add", function (req, res) {
    res.render("addUser.ejs");
});

adminRouter.post("/update/:id",async function(req,res){
    const data = await User.updateOne({"_id":new ObjectId(req.params.id)},{$set:{
        email:req.body.email,
        name: req.body.name,
        phoneNumber: req.body.phoneNumber
    }})
           res.redirect("/admin");
    
})

adminRouter.post("/auth", async function (req, res) {
    try {
        const admin = await Admin.findOne({ email: req.body.email });
        if (admin && await bcrypt.compare(req.body.password, admin.password)) {
            req.session.email = admin.email;
            req.session.adminStatus = true;
            res.redirect("/admin");
        } else {
            res.status(401).send('Invalid email or password');
        }
    } catch (error) {
        res.status(500).send('Error logging in');
    }
});

adminRouter.post("/add",async function(req,res){
   try{
    const data = await User.insertMany([{
        email:req.body.email,
        name: req.body.name,
        password: req.body.password,
    }])
    res.redirect("/admin")
   }catch(e){
      res.send("Input same values")
   }
})

function isAdminLogin(req, res, next) {
    if (!req.session.adminStatus) {
        req.session.destroy(function (err) {
            if (!err) {
                res.clearCookie("connect.sid");
                res.redirect("/admin/login");
            }
        });
    } else {
        return next();
    }
}

function preventAutoLogin(req, res, next) {
    if (req.session && req.session.email) {
        res.redirect("/admin");
    } else {
        return next();
    }
}

module.exports = adminRouter;
