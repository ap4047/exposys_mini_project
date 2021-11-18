const express = require("express");
const bodyParser = require("body-parser")
const ejs = require("ejs");
const alert=require("alert");
const md5=require("md5");
const app=express();
const {check,validationResult}=require("express-validator");
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
const urlencodedparser=bodyParser.urlencoded({ extended: true });
const mongoose=require("mongoose")
mongoose.connect("mongodb://localhost:27017/exposys", { useNewUrlParser: true });
const internschema = new mongoose.Schema({
    name: String,
    email: String,
    college: String,
    phone: Number,
    domain: String,
    password:String

});
const intern = mongoose.model("intern", internschema);

app.get("/", function (req, res) {
    res.render("home");
});
app.get("/login", function (req, res) {
    res.render("login");
}); 
app.post("/login",function(req,res){
    intern.findOne({email:req.body.email},function(err,foundUser){
        if(err)
        {
            console.log(err);
        }if(foundUser){
             if(foundUser.password===md5(req.body.password))
             {
                 res.render("secrets");
             }else
             {
              alert("incorrect password try again");
                
             }
        }else{
            alert("User not found Register first");
            res.render("register",{error:""})
        }
    });
})

app.get("/register", function (req, res) {
    res.render("register");
});
app.post("/register",urlencodedparser,[check('phone'," phone number must be exactly 10 numbers " ).isLength({min:10,max:10}),check('email',"email isnot valid").isEmail().normalizeEmail()],function(req,res){  
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        const alerts=errors.array();
        // return res.status(422).jsonp(alerts);
        return res.render('register',{alert:alerts })
    }
    const newuser=new intern({
        name:req.body.internname,
        email:req.body.email,
        college:req.body.college,
        phone:req.body.phone,
        doman:req.body.domain,
        password:md5(req.body.password)
         
    })
    if(req.body.password!=req.body.confirmpassword)
    {
      
        res.render("register",{error:"password didnt match"})
    }
    intern.findOne({email:req.body.email},function(err,foundUser){
        if(err)
        {
            console.log(err);
        }if(foundUser){
         
          intern.updateOne({email:req.body.email},{
            name:req.body.internname,
            college:req.body.college,
            phone:req.body.phone,
            domain:req.body.domain,
            password:md5(req.body.password)
          },function(err){
              if(err)
              {
                  console.log("update not successfull");
                  console.log(err);
              }else{
                  console.log("update successfull");
                  res.redirect("/login");
              }
          });
            
        }else
        {
            newuser.save(function(err){
                if(err){
                    console.log(err);
                }else
                {
                    console.log("insertion succeful");
                   res.redirect("/login");
                }
            })
        }
        mongoose.connection.close();
    });
  

   
});
 app.get("/secrets", function (req, res) {
    res.render("secrets");
});
app.get("/submit",function(req,res){
    res.render("submit");
});
app.post("/submit",function(req,res){
    res.redirect("/home");
});
app.get("/logout",function(req,res){
res.render("login");
});
app.listen(3000,function(req,res){
    console.log("server is listening");
});