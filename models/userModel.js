import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
        userName: String,
        password: String,
        employeeID: String,
        email: String
})

export const User = mongoose.model('user', userSchema);