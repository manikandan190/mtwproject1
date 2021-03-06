const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require('express-session');
const passport=require("passport");
const passportLocalMongoose=require("passport-Local-mongoose");
const findOrCreate=require('mongoose-findorcreate');

const app=express();
app.use(express.static("public"));

app.set('view engine','ejs');
app.use(
    bodyParser.urlencoded({
    extended:true
}));
app.use(session({
    secret:"our little secret,",
    resave:false,
   saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/mtwproject",{useNewUrlParser:true,useUnifiedTopology: true });
mongoose.set("useCreateIndex",true);
const userSchema= new mongoose.Schema({
    email:String,
    password:String,
    secret:String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User= new mongoose.model("User",userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user,done){
    done(null,user.id);
});
passport.deserializeUser(function(id,done){
    User.findById(id,function(err,user){
        done(err,user);
    });
});
app.post("/register",function(req,res){
    User.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/login");
            });
        
    }
        
    });
});
app.post("/login",function(req,res){
    const user= new User({
        username:req.body.username,
        password:req.body.password
    });
    req.login(user,function(err){
        if(err){
            res.writeHead(404);
            return res.end("404 Not Found");
            }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secret");
            });
        }
    });
});

app.get("/error",function(req,res){
    res.render("error");
});

app.get("/",function(req,res){
    res.render("home");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});
app.get("/secret",function(req,res){
    res.render("secrets");
})
app.listen(3000,function(){
    console.log("Server started on port 3000.");
});
 
