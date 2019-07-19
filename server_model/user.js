const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id:mongoose.Schema.Types.ObjectId,
  username: String,
  password: String,
  firstName: String,
  lastName: String,
  dob: String,
  email: String,
  address:String
});


module.exports = mongoose.model('User',userSchema);


// module.exports = {
//   username: "user123",
//   password: "1234",
//   firstName: "Jon",
//   lastName: "Doe",
//   dob: "12/11/1991",
//   email: "user@gmail.com",
//   address: {
//     street: "555 Bayshore Blvd",
//     city: "Tampa",
//     state: "Florida",
//     zip: "33813"
//   }
// };
