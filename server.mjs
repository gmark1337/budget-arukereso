import {fileURLToPath} from 'node:url';
import {dirname} from 'node:path';
import {readFileSync} from 'node:fs';
import express from 'express';
import {render} from 'ejs';
import bodyParser from 'body-parser';
import {compare, hash} from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import {Search} from './ImageScraperService.js';
import {config} from './configuration/config.js';
import {
	DB, USER, HISTORY, GLOBALS,
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
	const token = request.cookies.Authorize;
	let username = null;
	if (token) {
		const secret = (await GLOBALS.findOne({name: 'SECRET'})).value;
		const user = jwt.verify(token, secret);
		username = user.username;
	}

	const [historyMap, keys] = await getHistory();
	res.render('index', {
		username: username || 'Guest',
		history: username ? historyMap : null,
		keys: username ? keys : null,
	});
});

app.get('/search', async (request, res) => {
	// Console.log(req.query);
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

    if(request.query.aboutYou != "true"){
        filters.blackListedWebsite.push("aboutYou")
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

	res.end(render(resultsTemplate, {
		results: r,
		emptyStringPlaceholder,
	}));
	const token = request.cookies.Authorize;
	let user = null;
	if (token) {
		const secret = (await GLOBALS.findOne({name: 'SECRET'})).value;
		user = jwt.verify(token, secret);
	}
	if (user) {
		addToHistory(r, user);
	}
});

app.get('/register', (_, res) => {
	res.render('register', {
		errorMessage: null,
	});
});

app.post('/register', (request, res) => {
	const {email, username, password} = request.body;
	if (!email) {
		res.render('register', {
			errorMessage: 'no email provided',
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

	if (USER.findOne({username}).query != null) {
		res.render('register', {
			errorMessage: 'username taken',
		});
	}

	hash(password, saltRounds, async (error, hash) => {
		if (error != null) {
			res.render('register', {
				errorMessage: 'failed to hash password',
			});
			return;
		}

		const user = await USER.create({
			username,
			email,
			password: hash,
		});
		if (!user) {
			res.render('login', {
				errorMessage: 'failed to create user',
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

async function getHistory() {
	const historyItems = await HISTORY.find();
	const historyMap = new Map();
	for (const item of historyItems) {
		if (historyMap.has(item.websiteName)) {
			historyMap.set(item.websiteName, historyMap.get(item.websiteName).concat(item.product));
		} else {
			historyMap.set(item.websiteName, item.product);
		}
	}

	const keys = [];
	for (const key of historyMap.keys()) {
		keys.push(key);
	}

	return [historyMap, keys];
}

function addToHistory(search, user) {
	for (const e of search) {
		HISTORY.insertOne({
			websiteName: e.websiteName,
			product: e.FoundImages,
			user: user.id,
		});
	}
}
