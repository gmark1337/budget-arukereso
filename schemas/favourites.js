import mongoose from 'mongoose';

const favouritesSchema = new mongoose.Schema({
	href: String,
	src: String,
	price: String,
    vendor: String,
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
});

export const favourites = mongoose.model('Favourites', favouritesSchema, 'favourites');
