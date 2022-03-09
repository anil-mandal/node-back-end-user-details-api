const jwt = require("jsonwebtoken");
const user = require("../models/user");
require("dotenv").config();
const User = require("../models/user");
const expressJwt = require('express-jwt');

exports.signup = async (req, res) => {
    const userExists = await User.findOne({email:req.body.email})
    if(userExists) return res.status(403).json({
        error:"Email is taken"
    })
    const user = await new User(req.body)
    await user.save()
    res.status(200).json({ message: "Signup success!! Please login" });
}

exports.signin = (req, res) => {
    //find the user based on email
    const { email, password } = req.body
    User.findOne({email}, (err,user) => {

        //if error or no user
        if(err || !user) {
            return res.status(401).json({
                error: "User with that email does not exists . please signin"
            })
        }

        //if user is found make sure the email and password match 
        //create authenticate method in model and use here 

        if(!user.authenticate(password)) {
            return res.status(401).json({
                error:"Email and password do not match"
            })
        }


    //generate a token with user id and secret
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);

    //persist the token a 't' in cookie with expiry date 

    res.cookie("t", token, {expire:new Date () + 9999})
    //return response with user and token to frontend client
    const { _id, name, email } = user;
    return res.json({token,user: { _id, email, name }});
    });
}

exports.signout = (req, res) => {
    res.clearCookie("t");
    return res.json({message:"signout success !!!"})
}


exports.requireSignin = expressJwt({

    //if the token is valid, express jwt appends the verified users id
    //in an auth key to the request object
    secret:process.env.JWT_SECRET,
    algorithms: ['HS256'], //here we choose algorithms to prevent 3rd party attacks 
    userProperty:"auth"
})