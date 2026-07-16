const mongoose = require('mongoose');
const {Schema} = mongoose;

const problemSchema = new Schema({
    title:{
        type:String,
        required:true,
        trim: true
    },
    description:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        enum:['easy','medium','hard'],
        required:true,
    },
    tags:{
        type:[String],
        default:[]
    },

    // Interview metadata — what makes SolveSphere different
    company: {
        type: [String],
        default: []
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
    frequency: {
        type: Number,
        default: 1
    },
    sourceType: {
        type: String,
        enum: ['admin', 'community', 'archive'],
        default: 'admin'
    },
    sourceUrl: {
        type: String,
        trim: true
    },
    relatedProblems: [{
        type: Schema.Types.ObjectId,
        ref: 'problem'
    }],

    // Community workflow status
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected'],
        default: 'approved' // admin-created problems skip the review queue
    },
    confidenceLevel: {
        type: String,
        enum: ['community-reported', 'multiple-reports', 'admin-reviewed', 'high-confidence'],
        default: 'community-reported'
    },
    reports: [{
        experienceId: {
            type: Schema.Types.ObjectId,
            ref: 'interviewExperience'
        },
        submittedBy: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],

    visibleTestCases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            },
            explanation:{
                type:String,
                required:true
            }
        }
    ],

    hiddenTestCases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            }
        }
    ],

    startCode: [
        {
            language:{
                type:String,
                required:true,
            },
            initialCode:{
                type:String,
                required:true
            }
        }
    ],

    referenceSolution:[
        {
            language:{
                type:String,
                required:true,
            },
            completeCode:{
                type:String,
                required:true
            }
        }
    ],

    problemCreator:{
        type: Schema.Types.ObjectId,
        ref:'user',
        required:true
    }
}, {
    timestamps: true
});

// Indexes for filtering, searching, and sorting
problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ company: 1 });
problemSchema.index({ status: 1 });
problemSchema.index({ frequency: -1 });
problemSchema.index({ company: 1, difficulty: 1 });
problemSchema.index({ title: 'text', description: 'text' });

const Problem = mongoose.model('problem', problemSchema);

module.exports = Problem;