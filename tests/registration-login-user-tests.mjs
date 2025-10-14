import {
	after, before, describe, it,
} from 'node:test';
import assert from 'node:assert';
import {load} from 'cheerio';
import {DB, USER} from '../db.js';

describe('registration-login-user-tests', () => {
	const p = genForm();
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
        res =  await fetch('http://localhost:8080', {
            headers: {
                'Cookie': `Authorize=${token}`
            }
		});
        const text = await res.text();
        const $ = load(text);
        const username = $('div#account').map((_, e) => $(e).text())
            .get()[0].trim();
        assert.equal(username, p.username);
	});
	after(async () => {
		await USER.findOneAndDelete({username: p.username});
		await DB.disconnect();
	});
});

function genForm(name) {
	name ||= 'bob';
	const p = {
		email: `test-user-${name}@test.com`,
		username: `test-user-${name}`,
		password: 'test',
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
