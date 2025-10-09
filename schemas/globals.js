import mongoose from "mongoose";

const globalsSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    value: {type: String, required: true},
});

export const globals = mongoose.model('Globals', globalsSchema, 'globals');
