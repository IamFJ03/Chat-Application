const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://faheemjawaid12:DKpymksY4LQcM36x@cluster0.njgmkgt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
    }
}

module.exports = connectDB;
