import {mongoose,Schema} from "mongoose";

const createRiskSchema = new Schema({
    title: {
        type: String,
        require: [true, "Risk must have title"]
    },
    description: {
        type: String,
        required: [true, "Risk must have description"]
    },
    Risk_Status: {
        type: String,
        required: [true, "Risk status should be mentioned"]
    },
    content: {
        type: String,
        required: true,
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_by: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    Category: {
        type: String,
        required: [true, "Category must be mentioned"]
    },
    Likelihood: {
        type: Number,
        required: [true, "Likehood must be a number between 1 and 5"],
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: `{VALUE} is not an integer value`
        }
    },
    Impact: {
        type: Number,
        required: [true, "Impact must be a number between 1 and 5"],
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: `{VALUE} is not an integer value`
        }
    },
    Risk: {
        type: Number,
    }
});

createRiskSchema.virtual('calculatedRisk').get(function () {
    return this.Likelihood * this.Impact;
});

createRiskSchema.pre('save',function(next) {
    this.Risk = this.Likelihood * this.Impact;
    next();
});

const createRiskModel = mongoose.model("risks", createRiskSchema);
export default createRiskModel;
