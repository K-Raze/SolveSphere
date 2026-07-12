const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    firstName:{
        type: String,
        required: true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20,
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim: true,
        lowercase:true,
        immutable: true,
    },
    age:{
        type:Number,
        min:6,
        max:80,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user'
    },
    problemSolved:{
        type:[String]
    },
    password:{
        type:String,
        required: true,
        select: false // Do not return password by default in queries
    }
},{
    timestamps:true
});

// Compare user's password with the hashed password in database
userSchema.methods.comparePassword = async function (enteredPassword) {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token for the user
userSchema.methods.getJwtToken = function () {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
        { _id: this._id, emailId: this.emailId, role: this.role },
        process.env.JWT_KEY,
        { expiresIn: '1h' } // 1 hour expiration
    );
};

const User = mongoose.model("user",userSchema);

module.exports = User;
