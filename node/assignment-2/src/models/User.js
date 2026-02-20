import {model, Schema} from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 40 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/, "Invalid email format"]
    },
    password: {
        type: String,
        required: true,
        minLength: [8, "Password must be at least 8 characters long"],
    },
    accounts: [{
        type: Schema.Types.ObjectId,
        ref: "Account"
    }]
},{ timestamps:  true });

// Hash password before saving
UserSchema.pre("save", async function(){
    if (!this.isModified("password")) return ;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

export default model("User", UserSchema);