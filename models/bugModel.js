import mongoose from "mongoose";

const bugSchema = new mongoose.Schema({
        title: String,
        description: String,
        priority: String,
        type: String,
        date: Date,
        notify: String,
        users: Array
});

export const Bug = mongoose.model('bug', bugSchema);