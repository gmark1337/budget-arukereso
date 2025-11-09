import {
	after, before, describe, it,
} from 'node:test';
import assert from 'node:assert';
import {load} from 'cheerio';
import {DB, USER} from '../db.js';
import {config} from '../configuration/config.js';

const placeholders = config.placeHolders;

describe('registration-login-user-tests', () => {
	const p = getP();
	before(async () => {
		await USER.findOneAndDelete({username: p.username});
	});
	it('register-test-user-bob', async () => {
		await fetch('http://localhost:8080/register', {
			method: 'POST',
			body: new URLSearchParams(p),
		});
		const user = await USER.findOne({username: p.username});
		assert.equal(user.username, p.username);
	});
	it('login-user-bob', async () => {
		const res = await fetch('http://localhost:8080/login', {
			method: 'POST',
			body: new URLSearchParams(p),
			redirect: 'manual',
		});
		assert.equal(res.status, 302);
	});
	it('check-if-bob-is-logged-in', async () => {
		let res = await fetch('http://localhost:8080/login', {
			method: 'POST',
			body: new URLSearchParams(p),
			redirect: 'manual',
		});
		const cookies = res.headers.getSetCookie();
		const token = getToken(cookies, 'Authorize');
		res = await fetch('http://localhost:8080', {
			headers: {
				Cookie: `Authorize=${token}`,
			},
		});
		const text = await res.text();
		const $ = load(text);
		const username = $('div#account').map((_, e) => $(e).text())
			.get()[0].trim();
		assert.equal(username, p.username);
	});
	after(async () => {
		await USER.findOneAndDelete({username: p.username});
	});
});

describe('registration-edgecases-tests', () => {
	it('no-username-provided', async () => {
		const p = getP();
		p.username = '';
		const res = await fetch('http://localhost:8080/register', {
			method: 'POST',
			body: new URLSearchParams(p),
		});
		const text = await res.text();
		const $ = load(text);
		const actual = $('#error-message').map((_, e) => $(e).text()).get()[0]
			.trim();
		assert.equal(actual, placeholders.errormessage.nousername.en);
	});
	it('no-password-provided', async () => {
		const p = getP();
		p.password = '';
		const res = await fetch('http://localhost:8080/register', {
			method: 'POST',
			body: new URLSearchParams(p),
		});
		const text = await res.text();
		const $ = load(text);
		const actual = $('#error-message').map((_, e) => $(e).text()).get()[0]
			.trim();
		assert.equal(actual, placeholders.errormessage.nopassword.en);
	});
	it('no-email-provided', async () => {
		const p = getP();
		p.email = '';
		const res = await fetch('http://localhost:8080/register', {
			method: 'POST',
			body: new URLSearchParams(p),
		});
		const text = await res.text();
		const $ = load(text);
		const actual = $('#error-message').map((_, e) => $(e).text()).get()[0]
			.trim();
		assert.equal(actual, placeholders.errormessage.noemail.en);
	});
});

describe('taken-username-or-email-tests', () => {
	const p = getP();
	before(async () => {
		await USER.create({
			username: p.username,
			password: p.password,
			email: p.email,
		});
	});
	it('taken-username', async () => {
		const res = await fetch('http://localhost:8080/register', {
			method: 'POST',
			body: new URLSearchParams({
				username: p.username,
				password: p.password,
				email: `a${p.email}`,
			}),
		});
		const text = await res.text();
		const $ = load(text);
		const actual = $('#error-message').map((_, e) => $(e).text()).get()[0]
			.trim();
		assert.equal(actual, placeholders.errormessage.usernametaken.en);
	});
	it('taken-email', async () => {
		const res = await fetch('http://localhost:8080/register', {
			method: 'POST',
			body: new URLSearchParams({
				username: `${p.username}1`,
				password: p.password,
				email: p.email,
			}),
		});
		const text = await res.text();
		const $ = load(text);
		const actual = $('#error-message').map((_, e) => $(e).text()).get()[0]
			.trim();
		assert.equal(actual, placeholders.errormessage.emailtaken.en);
	});
	after(async () => {
		await USER.findOneAndDelete({username: p.username});
	});
});

describe('login-edgecases-tests', () => {
	const p = getP();
	before(async () => {
		await USER.create({
			username: p.username,
			password: p.password,
			email: p.email,
		});
	});
	it('incorrect-password', async () => {
        const res = await fetch('http://localhost:8080/login', {
            method: 'POST',
            body: new URLSearchParams({
 				username: p.username,
				password: `${p.password}1`,
				email: p.email,               
            })
        });
        const text = await res.text();
        const $ = load(text);
		const actual = $('#error-message').map((_, e) => $(e).text()).get()[0]
			.trim();
		assert.equal(actual, placeholders.errormessage.invalidpassword.en);
    });
	it('incorrect-username', async () => {
        const res = await fetch('http://localhost:8080/login', {
            method: 'POST',
            body: new URLSearchParams({
 				username: `${p.username}1`,
				password: p.password,
				email: p.email,               
            })
        });
        const text = await res.text();
        const $ = load(text);
		const actual = $('#error-message').map((_, e) => $(e).text()).get()[0]
			.trim();
		assert.equal(actual, placeholders.errormessage.invalidusername.en);
    });
    after(async () => {
        await USER.findOneAndDelete({username: p.username});
    });
});

after(async () => {
	await DB.disconnect();
});

function getP(name) {
	name ||= 'bob';
	const p = {
		email: `test-user-${name}@test.com`,
		username: `test-user-${name}`,
		password: 'test-C1jzovFk6vU2',
	};
	return p;
}

function getToken(cookies, tokenName) {
	for (const cookie of cookies) {
		if (cookie.includes(tokenName)) {
			const parameters = cookie.split(' ');
			for (const parameter of parameters) {
				if (parameter.includes(tokenName)) {
					return parameter.split('=')[1];
				}
			}
		}
	}
}
