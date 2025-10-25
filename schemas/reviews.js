import mongoose from 'mongoose';

const reviewsSchema = new mongoose.Schema({
    review: String,
    quality: Number,
    vendor: String,
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
});

export const reviews = mongoose.model('Reviews', reviewsSchema, 'reviews');
