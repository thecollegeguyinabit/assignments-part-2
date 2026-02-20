import { model, Schema } from "mongoose";

const TransactionSchema = new Schema({
    amount: {
        type: Number,
        required: true,
        minLength: 0.01
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ['income','expense', 'transfer'],
        required: true
    },
    category: {
        type: String,
        minLength: 3,
        maxLength: 20,
        trim: true
    },
    description: {
        type: String,
        minLength: 5,
        maxLength: 200
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: "Account",
        required: true
    },
    accountName: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default model("Transaction", TransactionSchema);