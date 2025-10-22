import mongoose from "mongoose";

const historyRevampSchema = new mongoose.Schema({
    href: String,
    src: {type: String, unique: true},
    price: String,
    user:{type: mongoose.Schema.Types.ObjectId, ref:'User', required: true},
});

export const history = mongoose.model('HistoryRevamp', historyRevampSchema, 'historyrevamp')
