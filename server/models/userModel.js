import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    creditBalance: {type: Number, default: 5},
    usageLogs: {
        _id: false,
        textToImage: { type: Number, default: 0 },
        removeBg:    { type: Number, default: 0 },
        enhance:     { type: Number, default: 0 },
        aiEditor:    { type: Number, default: 0 },
        genFill:     { type: Number, default: 0 },
        unblur:      { type: Number, default: 0 },
        totalUsed:   { type: Number, default: 0 },
    },
})

const userModel = mongoose.models.user || mongoose.model("user", userSchema)

export default userModel;
