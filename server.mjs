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
import {fetchProductDetailsAsync} from './services/productDetailFetchService.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = 8080;
const resultsTemplate = readFileSync('views/results.ejs', 'utf-8');
const saltRounds = 10;
const emptyStringPlaceholder = (await GLOBALS.findOne({name: 'emptyStringPlaceholder'})).value;

const sites = ['hervis', 'sinsay', 'sportisimo', 'aboutYou', 'decathlon', 'mangoOutlet'];

const {filters} = config;
const placeholders = config.placeHolders;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('static'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get('/', async (request, res) => {
	const user = await getUser(request);
	const lang = request.query.lang || 'en';
	res.render('index', {
		username: user ? user.username : placeholders.user.guest[lang],
		auth: Boolean(user),
		p: placeholders,
		lang,
	});
});

app.get('/search', async (request, res) => {
	filters.minPrice = request.query.minPrice || '0';
	filters.maxPrice = request.query.maxPrice || '5000';
	filters.size = request.query.size == '' ? determineSizeKind(request.query.searchword) : request.query.size;
	filters.pagesToFetch = request.query.count;
	filters.blackListedWebsite = [];
	for (const site of sites) {
		if (request.query[site] != 'true') {
			filters.blackListedWebsite.push(site);
		}
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

	const lang = request.query.lang || 'en';
	res.end(render(resultsTemplate, {
		results: r,
		emptyStringPlaceholder,
		auth: Boolean(user),
		lang,
		p: placeholders,
	}));
});

app.get('/register', (request, res) => {
	const lang = request.query.lang || 'en';
	res.render('register', {
		errorMessage: null,
		p: placeholders,
		lang,
	});
});

app.post('/register', async (request, res) => {
	const {email, username, password} = request.body;
	const lang = request.body.lang || 'en';
	if (!email) {
		res.render('register', {
			errorMessage: placeholders.errormessage.noemail[lang],
			p: placeholders,
			lang,
		});
		return;
	}

	let user = await USER.findOne({email});
	if (user != null) {
		res.render('register', {
			errorMessage: placeholders.errormessage.emailtaken[lang],
			p: placeholders,
			lang,
		});
		return;
	}

	if (!username) {
		res.render('register', {
			errorMessage: placeholders.errormessage.nousername[lang],
			p: placeholders,
			lang,
		});
		return;
	}

	if (!password) {
		res.render('register', {
			errorMessage: placeholders.errormessage.nopassword[lang],
			p: placeholders,
			lang,
		});
		return;
	}

	user = await USER.findOne({username});
	if (user != null) {
		res.render('register', {
			errorMessage: placeholders.errormessage.usernametaken[lang],
			p: placeholders,
			lang,
		});
		return;
	}

	hash(password, saltRounds, async (error, hash) => {
		if (error != null) {
			res.render('register', {
				errorMessage: placeholders.errormessage.hashfail[lang],
				p: placeholders,
				lang,
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
				errorMessage: placeholders.errormessage.usercreatefail[lang],
				p: placeholders,
				lang,
			});
		});
	});
});

app.get('/login', (request, res) => {
	const lang = request.query.lang || 'en';
	res.render('login', {
		errorMessage: null,
		p: placeholders,
		lang,
	});
});

app.post('/login', async (request, res) => {
	const {username, password} = request.body;
	const lang = request.body.lang || 'en';
	if (!username) {
		res.render('login', {
			errorMessage: placeholders.errormessage.nousername[lang],
			p: placeholders,
			lang,
		});
		return;
	}

	if (!password) {
		res.render('login', {
			errorMessage: placeholders.errormessage.nopassword[lang],
			p: placeholders,
			lang,
		});
	}

	const user = await USER.findOne({username});
	if (!user) {
		res.render('login', {
			errorMessage: placeholders.errormessage.invalidusername[lang],
			p: placeholders,
			lang,
		});
		return;
	}

	const match = await compare(password, user.password);
	if (!match) {
		res.render('login', {
			errorMessage: placeholders.errormessage.invalidpassword[lang],
			p: placeholders,
			lang,
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
	const lang = request.query.lang || 'en';
	res.render('history', {
		history: user ? await getHistory(user.id) : null,
		p: placeholders,
		lang,
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
	const lang = request.query.lang || 'en';
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
		p: placeholders,
		lang,
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
	const lang = request.query.lang || 'en';
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
		p: placeholders,
		lang,
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

app.get('/details', async (req, res) => {
    if (!req.query.url) {
        res.json({
            reason: 'no url',
        });
    }
    const details = await fetchProductDetailsAsync(req.query.url);
    res.send(details);
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
		checkForFavouritesTagMatch(l, srcs, favourites);
	}
}

function checkForFavouritesTagMatch(l, srcs, favourites) {
	for (const e of l) {
		if (srcs.has(e.src)) {
			e.fav = 'favourited';
			e.fav_id = findFavId(e, favourites);
		}
	}
}

function findFavId(e, favourites) {
	for (const f of favourites) {
		if (f.src == e.src) {
			return f.id;
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
