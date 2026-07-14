const mongoose = require('mongoose');
const { Schema } = mongoose;

const interviewExperienceSchema = new Schema({
    submittedBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        trim: true
    },
    interviewRound: {
        type: String,
        enum: ['online-assessment', 'phone-screen', 'onsite', 'take-home', 'other'],
    },
    yearAsked: {
        type: Number
    },
    rawDescription: {
        type: String,
        required: true,
        minLength: 50 // enforce minimum detail to prevent spam
    },
    sourceUrl: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'generated', 'approved', 'rejected'],
        default: 'pending'
    },
    // Links to the Problem document created from this experience
    generatedProblemId: {
        type: Schema.Types.ObjectId,
        ref: 'problem'
    },
    // Links to an existing duplicate Problem if one was found
    similarProblemId: {
        type: Schema.Types.ObjectId,
        ref: 'problem'
    },
    adminNotes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

interviewExperienceSchema.index({ submittedBy: 1 });
interviewExperienceSchema.index({ status: 1 });
interviewExperienceSchema.index({ company: 1 });

const InterviewExperience = mongoose.model('interviewExperience', interviewExperienceSchema);

module.exports = InterviewExperience;
