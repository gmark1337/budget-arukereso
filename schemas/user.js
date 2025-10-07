import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    username: {type: String, required:true, unique: true},
    email: {type: String, required: true, match:/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, unique: true},
    password: {type: String, required: true, minLength:8},
    
})


export const user = mongoose.model('User', userSchema, 'user'); 