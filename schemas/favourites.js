import mongoose from 'mongoose';

const favouritesSchema = new mongoose.Schema({
	href: String,
	src: String,
	price: String,
    store: String,
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
});

export const history = mongoose.model('Favourites', favouritesSchema, 'favourites');
