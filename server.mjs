import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import {readFileSync} from 'node:fs';
import express from 'express';
import {render} from 'ejs';
import bodyParser from 'body-parser';
import {compare, hash} from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import {Search} from './services/searchService.js';
import {config} from './configuration/config.js';
import {
	DB, USER, HISTORY, GLOBALS, FAVOURITES, REVIEWS,
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = 8080;
const resultsTemplate = readFileSync('views/results.ejs', 'utf-8');
const saltRounds = 10;
const emptyStringPlaceholder = (await GLOBALS.findOne({name: 'emptyStringPlaceholder'})).value;

const {filters} = config;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('static'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get('/', async (request, res) => {
	const user = await getUser(request);
	res.render('index', {
		username: user ? user.username : 'Guest',
		auth: Boolean(user),
	});
});

app.get('/search', async (request, res) => {
	filters.minPrice = request.query.minPrice || '0';
	filters.maxPrice = request.query.maxPrice || '5000';
	filters.size = request.query.size == '' ? determineSizeKind(request.query.searchword) : request.query.size;
	filters.pagesToFetch = request.query.count;
	filters.blackListedWebsite = [];
	if (request.query.hervis != 'true') {
		filters.blackListedWebsite.push('hervis');
	}

	if (request.query.sinsay != 'true') {
		filters.blackListedWebsite.push('sinsay');
	}

	if (request.query.sportisimo != 'true') {
		filters.blackListedWebsite.push('sportisimo');
	}

	if (request.query.aboutYou != 'true') {
		filters.blackListedWebsite.push('aboutYou');
	}

	if (request.query.decathlon != 'true') {
		filters.blackListedWebsite.push('decathlon');
	}

	if (request.query.mangoOutlet != 'true') {
		filters.blackListedWebsite.push('mangoOutlet');
	}

	const r = await Search(request.query.searchword);
	for (const element of r) {
		element.FoundImages.sort((a, b) => {
			if (request.query.order == 'asc') {
				return Number.parseInt(a.price) - Number.parseInt(b.price);
			}

			if (request.query.order == 'desc') {
				return Number.parseInt(b.price) - Number.parseInt(a.price);
			}
		});
	}

	// Check if result is in favourites
	const user = await getUser(request);
	if (user) {
		await addFavouriteTags(r, user);
	}

	res.end(render(resultsTemplate, {
		results: r,
		emptyStringPlaceholder,
		auth: Boolean(user),
	}));
});

app.get('/register', (_, res) => {
	res.render('register', {
		errorMessage: null,
	});
});

app.post('/register', async (request, res) => {
	const {email, username, password} = request.body;
	if (!email) {
		res.render('register', {
			errorMessage: 'no email provided',
		});
		return;
	}

	let user = await USER.findOne({email});
	if (user != null) {
		res.render('register', {
			errorMessage: 'email taken',
		});
		return;
	}

	if (!username) {
		res.render('register', {
			errorMessage: 'no username provided',
		});
		return;
	}

	if (!password) {
		res.render('register', {
			errorMessage: 'no password provided',
		});
		return;
	}

	user = await USER.findOne({username});
	if (user != null) {
		res.render('register', {
			errorMessage: 'username taken',
		});
		return;
	}

	hash(password, saltRounds, async (error, hash) => {
		if (error != null) {
			res.render('register', {
				errorMessage: 'failed to hash password',
			});
			return;
		}

		await USER.create({
			username,
			email,
			password: hash,
		}).then(async user => {
			const secret = (await GLOBALS.findOne({name: 'SECRET'})).value;
			const token = jwt.sign({id: user._id, username: user.username}, secret, {expiresIn: '72h'});
			res.cookie('Authorize', token, {
				httpOnly: true,
			});
			res.redirect('/');
		}).catch(() => {
			res.render('register', {
				errorMessage: 'failed to create user',
			});
		});
	});
});

app.get('/login', (_, res) => {
	res.render('login', {
		errorMessage: null,
	});
});

app.post('/login', async (request, res) => {
	const {username, password} = request.body;
	if (!username) {
		res.render('login', {
			errorMessage: 'no username provided',
		});
		return;
	}

	if (!password) {
		res.render('login', {
			errorMessage: 'no password provided',
		});
	}

	const user = await USER.findOne({username});
	if (!user) {
		res.render('login', {
			errorMessage: 'invalid username',
		});
		return;
	}

	const match = await compare(password, user.password);
	if (!match) {
		res.render('login', {
			errorMessage: 'invalid password',
		});
		return;
	}

	const secret = (await GLOBALS.findOne({name: 'SECRET'})).value;
	const token = jwt.sign({id: user._id, username: user.username}, secret, {expiresIn: '72h'});
	res.cookie('Authorize', token, {
		httpOnly: true,
	});
	res.redirect('/');
});

app.get('/history', async (request, res) => {
	const user = await getUser(request);
	res.render('history', {
		history: user ? await getHistory(user.id) : null,
	});
});

app.post('/history', async (request, res) => {
	const {image, href, price} = request.body;
	const user = await getUser(request);
	if (!user) {
		res.json({
			reason: 'unathorized',
		});
		return;
	}

	await addToHistory({
		src: image,
		href,
		price,
	}, user.id);
	res.json({
		reason: 'success',
	});
});

app.delete('/history/:id', async (request, res) => {
	const user = await getUser(request);
	if (!user) {
		res.json({
			reason: 'unauthorized',
		});
		return;
	}

	await HISTORY.findOneAndDelete({
		_id: request.params.id,
		user: user.id,
	});
	res.json({
		reason: 'ok',
	});
});

app.get('/favourites', async (request, res) => {
	const user = await getUser(request);
	if (!user) {
		res.json({
			reason: 'unauthorized',
		});
		return;
	}

	// Send specific item id to add to button class
	if (request.query.id) {
		const item = await FAVOURITES.findOne({
			src: request.query.id,
			user: user.id,
		});
		res.json({
			id: item ? item._id : null,
		});
		return;
	}

	// Send rendered view back
	res.render('favourites', {
		favourites: await FAVOURITES.find({user: user.id}),
	});
});

app.post('/favourites', async (request, res) => {
	const user = await getUser(request);
	if (!user) {
		res.json({
			reason: 'unauthorized',
		});
		return;
	}

	const {vendor, href, image, price} = request.body;
	const item = await FAVOURITES.findOne({user: user.id, src: image});
	if (item) {
		res.json({
			reason: 'duplicate',
		});
		return;
	}
    const favourites = await FAVOURITES.find({user: user.id});
    if (favourites.length >= 10) {
        res.json({
		reason: 'max 10 product allowed',
        });
        return;
    }
	await FAVOURITES.insertOne({
		vendor, href, src: image, price, user: user.id,
	});
	res.json({
		reason: 'success',
	});
});

app.delete('/favourites/:id', async (request, res) => {
	const user = await getUser(request);
	if (!user) {
		res.json({
			reason: 'unauthorized',
		});
		return;
	}

	await FAVOURITES.findOneAndDelete({
		_id: request.params.id,
		user: user.id,
	});
	res.json({
		reason: 'ok',
	});
});

app.get('/reviews', async (request, res) => {
	const user = await getUser(request);
	if (!user) {
		res.json({
			reason: 'unauthorized',
		});
		return;
	}

	const reviews = await gatherReviews();
	const threshold = await GLOBALS.findOne({name: 'trusted-site-threshold'});
	res.render('reviews', {
		reviews,
		threshold: Number.parseInt(threshold.value),
	});
});

app.post('/reviews', async (request, res) => {
	const user = await getUser(request);
	if (!user) {
		res.json({
			reason: 'unauthorized',
		});
		return;
	}

	const {vendor, content, quality} = request.body;
	await REVIEWS.create({
		vendor, review: content, quality, user: user.id,
	});
	res.json({
		reason: 'ok',
	});
});

app.listen(PORT, () => {
	console.log(`running on: http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
	console.log('DB disconnecting...');
	await DB.disconnect();
	process.exit();
});

process.on('SIGNTERM', async () => {
	console.log('DB disconnecting...');
	await DB.disconnect();
	process.exit();
});

function determineSizeKind(searchword) {
	return filters.shoeFilters.includes(searchword) ? 40 : 'M';
}

async function getHistory(userid) {
	if (!userid) {
		return [];
	}

	return await HISTORY.find({user: userid});
}

async function addToHistory(product, userId) {
	const entry = await HISTORY.findOne({src: product.src});
	if (entry) {
		return;
	}

	const items = await HISTORY.find({user: userId});
	if (items.length >= 10) {
		return;
	}

	HISTORY.insertOne({
		src: product.src,
		href: product.href,
		price: product.price,
		user: userId,
	});
}

async function getUser(request) {
	const token = request.cookies.Authorize;
	if (token) {
		const secret = (await GLOBALS.findOne({name: 'SECRET'})).value;
   		return jwt.verify(token, secret, (e, user) => {
            if (e) {
                return null;
            }
            return user;
        });
	}

	return null;
}

async function addFavouriteTags(r, user) {
	const favourites = (await FAVOURITES.find({user: user.id}));
	const srcs = new Set(favourites.map(e => e.src));
	for (const vendor of r) {
		const l = vendor.FoundImages;
		for (let i = 0; i < vendor.FoundImages.length; i++) {
			if (srcs.has(l[i].src)) {
				l[i].fav = 'favourited';
				for (const f of favourites) {
					if (f.src == l[i].src) {
						l[i].fav_id = f.id;
						break;
					}
				}
			}
		}
	}
}

async function gatherReviews() {
	const reviews = await REVIEWS.aggregate([{
		$group: {
			_id: '$vendor',
			records: {
				$push: '$$ROOT',
			},
			highQualityCount: {
				$sum: {
					$cond: [
						{$gt: ['$quality', 3]},
						1,
						0,
					],
				},
			},
		},
	}]);
	for (const r of reviews) {
		for (const rec of r.records) {
			const user = await USER.findOne({_id: rec.user});
			rec.user = user.username;
		}
	}

	return reviews;
}
