const mongoose = require('mongoose');
const { Schema } = mongoose;

const codeDraftSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'problem',
        required: true
    },
    code: {
        type: String,
        default: ''
    },
    language: {
        type: String,
        default: 'javascript'
    }
}, {
    timestamps: true
});

// A user can only have one draft per problem
codeDraftSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const CodeDraft = mongoose.model('codeDraft', codeDraftSchema);

module.exports = CodeDraft;
