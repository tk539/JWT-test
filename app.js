const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const app = express();
const login = require("./server/login");
const mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017').then(()=>{
  console.log("connected to database");
}, (err) => {
  console.log("error occured",err);
}  );

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
var cor_options = {
  origin: "http://localhost:8080"
};
app.use(cors(cor_options));

var login_obj = new login();

// create the user or register api
app.post("/api/create",(req,res)=> {
  
  login_obj.check_if_user_already_exists(req.body).then(function(result) {
    console.log("already added",result);
    res.status(200).json({"result":"email already added"});
  },function(err) {
    console.log("in reject not added",err);
    login_obj.create_user(req.body).then(function(result) {
      console.log("get the result in app.js",result);
      res.status(200).json(result);
    },function(err) {
      res.status(500);
    }).catch(err=> {
      console.log("Error in add",err);
      res.status(500);
    });
  }).catch(err=> {
      console.log("Error in add",err);
      res.status(500);
  })
  
    
    // var result =login_obj.create_user(req.body);
    // console.log("get the result in app.js");
    // res.send(result);
  
})

// login to Autheticatin Server and get the token
app.post("/api/login", (req, res) => {
  try
  {
    console.log(req.body);
    login_obj.check_login(req.body).then(function(result){
      console.log("result",result);
          res.send(result);
      
    },function (err){
      console.log("No data found",err);
      res.sendStatus(403);
    }).catch(err => {
      console.log("error in login promise" ,err);
    });
    // var result = login_obj.check_login2(req.body);
    // console.log("result", result);
    // if (result == 403) {
      
    //   res.sendStatus(403);
    // }
    // else {
    //   res.send(result);
    // }
    
  }
  catch(err)
  {
    console.log("error",err);
    res.sendStatus(403);
  }
});

//validate and login user
app.post("/api/usr/data", checkHeader, (req, res) => {
  if(req.token){
  
    login_obj.verify(req.token, "secret").then(
      result => {
        res.status(200).json({
          message: "successfully log in ",
          result
        });
      },
      err => {
        console.log(err);
        res.sendStatus(403);
      }
    );
  }
});

// checking header
function checkHeader(req, res, next) {
  
  var result = login_obj.check_header(req.headers);
  result != 403 ? (req.token = result) : "";
  next();
}

// listening to server
app.listen(5000, () => console.log("Server listening on port 5000"));
