import {model, Schema } from "mongoose";

const AccountSchema = new Schema({
    accountName: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
}, { timestamps: true });

export default model("Account", AccountSchema);