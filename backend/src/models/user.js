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
    username: {
        type: String,
        unique: true,
        sparse: true, // allows multiple null values (not everyone sets a username)
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 20
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
    bio: {
        type: String,
        maxLength: 200,
        default: ''
    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user'
    },
    problemSolved: [{
        type: Schema.Types.ObjectId,
        ref: 'problem'
    }],
    bookmarks: [{
        type: Schema.Types.ObjectId,
        ref: 'problem'
    }],
    reputation: {
        type: Number,
        default: 0
    },
    password:{
        type:String,
        required: true,
        select: false // Do not return password by default in queries
    }
},{
    timestamps:true
});

// Cascade delete: when a user profile is deleted, delete all their submissions
userSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        // Need to require Submission here to avoid circular dependency issues
        const Submission = require('./submission');
        await Submission.deleteMany({ userId: doc._id });
    }
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
