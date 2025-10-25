import mongoose, {mongo} from 'mongoose';
import {config} from './configuration/config.js';
import { user } from './schemas/user.js';
import { history } from './schemas/history.js';
import { globals } from './schemas/globals.js';
import { favourites } from './schemas/favourites.js';
import { reviews} from './schemas/reviews.js'

export const USER = user;
export const HISTORY = history;
export const GLOBALS = globals;
export const FAVOURITES = favourites;
export const REVIEWS = reviews;

export const DB = await mongoose.connect(config.mongo_uri)
	.catch(error => {
		console.error(`Failed to connect to the database... ${error.message}`);
	});

export async function disconnect() {
	await mongoose.disconnect();
}
