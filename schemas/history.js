import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    href: String,
    src: String,
    price: String,
    title: String
});


const historySchema = new mongoose.Schema({
    websiteName: {type: String, required: true},
    product:{type: [productSchema]},
    user:{type: mongoose.Schema.Types.ObjectId, ref:'User', required: true}
});


export const history = mongoose.model('History', historySchema, 'history')