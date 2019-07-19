const user = require("../server_model/user");
const crypto = require("crypto");
const base64url = require("base64-url");
const mongoose = require("mongoose");

class login {
  constructor() {
    this.headerData = {
      alg: "SHA256",
      type: "JWT"
    };
  }
  get_header() {
    return this.headerData;
  }
  // create_user(data) {
  //   const User = new user({
  //     _id:mongoose.Types.ObjectId(),
  //     username: data.username,
  //     password: data.password,
  //     firstName: data.firstName,
  //     lastName: data.lastName,
  //     dob: data.dob,
  //     email: data.email,
  //     address:data.address
  //   });
  //   console.log(User.schema);
  //   User.save().then(result => {
  //     console.log(result);
  //     return result
  //   }).catch(err=> {
  //     console.log(err);
  //   });
  // }

  check_if_user_already_exists(data) {
    return new Promise((resolve, reject) => {
      user.find().where("email").equals(data.email)
        .exec()
        .then(doc => {
          if (doc.length > 0) {
            var new_user=new user({
              _id: doc._id,
              username: doc.username,
              password: doc.password,
              firstName: doc.firstName,
              lastName: doc.lastName,
              dob: doc.dob,
              email: doc.email,
              address: doc.address
            })
            console.log(new_user);
            resolve(new_user);
          }else {
            reject();
          }
        }).catch(err=> {
          console.log("error in check if already exist",err);
        });
    })

  }
  create_user(data) {
    return new Promise(function (resolve, reject) {

      const User = new user({
        _id: mongoose.Types.ObjectId(),
        username: data.username,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob,
        email: data.email,
        address: data.address
      });
      User.save().then(result => {
        resolve(new user({
          _id: result._id,
          username: result.username,
          password: result.password,
          firstName: result.firstName,
          lastName: result.lastName,
          dob: result.dob,
          email: result.email,
          address: result.address

        }));
      }).catch(err => {
        reject(err);
      });
    });
  }

  check_login(data) {
    var self = this;
    return new Promise(function (resolve, reject) {
      user.find().where("email").equals(data.email).where("password").equals(data.password)
        .exec()
        .then(doc => {
          console.log("from database", doc);
          if (doc.length > 0) {

            var headerEncode = base64url.encode(JSON.stringify(self.get_header()));
            var new_user=new user({
              _id: doc[0]._id,
              username: doc[0].username,
              firstName: doc[0].firstName,
              lastName: doc[0].lastName,
              dob: doc[0].dob,
              email: doc[0].email,
              address: doc[0].address
    
            });
            console.log("new USer",new_user);
            var userEncode = base64url.encode(
              JSON.stringify(new_user)
              // JSON.stringify({
              //   username: data.username,
              //   password: user.password
              // })
            );
            const hast = self.create_hash("secret", headerEncode, userEncode);

            
            console.log(headerEncode + "." + userEncode + "." + hast);
            resolve(headerEncode + "." + userEncode + "." + hast);
          } else { reject(Error(403)); }
        }
        ).catch(err => {
          console.log("error occured in check login", err);
          reject(403);
        })
    })
  }
 
  create_hash(key, encodedHeader, encodedUser) {
    return crypto
      .createHmac("SHA256", key)
      .update(encodedHeader + "." + encodedUser)
      .digest("base64");
  }

  check_header(header) {
    try {
        var bearer = header.authorization.split(" ");
        var token = bearer[1];
        
       if(typeof token !== "undefined") {
        
        var tokens = token.split(".");
        console.log("token",tokens);
        // res.sendStatus(user);
        return tokens;
       }
       
       else {
        return 403;
      }
    } catch (err) {
      console.log("Error in function check_header", err);
    }
  }

  verify(token, private_key) {
    return new Promise((resolve, reject) => {
      try {
        var headerBase64 = token[0];
        //var userBase64 = base64url.encode(JSON.stringify(token[1]));
        var userBase64 = token[1];
        var hash = this.create_hash(private_key, headerBase64, userBase64);
        if (token[2] === hash) {
          var obj=JSON.parse(base64url.decode(userBase64));
          resolve(obj);
        } else {
          reject();
        }
      } catch (err) {
        console.log("Exception", err);
        reject();
      }
    });
  }
}
module.exports = login;
