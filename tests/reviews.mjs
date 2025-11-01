import {
	describe, it, before, after, afterEach,
} from 'node:test';
import assert from 'node:assert';
import {load} from 'cheerio';
import { DB, USER, REVIEWS } from '../db.js';

const p = {
	email: 'test-user-stanley@test.com',
	username: 'test-user-stanley',
	password: 'test-w2vsGXwjZ1',
};

describe('reviews-tests', () => {
	let userid = null;
	let auth = null;
	before(async () => {
		const res = await fetch('http://localhost:8080/register', {
			method: 'POST',
			body: new URLSearchParams(p),
			redirect: 'manual',
		});
		for (const c of res.headers.getSetCookie()) {
			if (c.startsWith('Authorize')) {
				auth = c.split(';')[0].split('=')[1];
				break;
			}
		}

		const user = await USER.findOne({username: p.username});
		userid = user.id;
	});
	it('save-successful', async () => {
		const reviews = await REVIEWS.find({vendor: 'test-site'});
		await fetch('http://localhost:8080/reviews', {
			method: 'POST',
			body: new URLSearchParams(genReview()),
			headers: {
				Cookie: `Authorize=${auth}`,
			},
		});
		const reviewsAfter = await REVIEWS.find({vendor: 'test-site'});
		assert.equal(reviews.length + 1, reviewsAfter.length);
	});
	it('star-successful', async () => {
		const review = genReview();
		await fetch('http://localhost:8080/reviews', {
			method: 'POST',
			body: new URLSearchParams(review),
			headers: {
				Cookie: `Authorize=${auth}`,
			},
		});
		const res = await fetch('http://localhost:8080/reviews', {
			headers: {
				Cookie: `Authorize=${auth}`,
			},
		});
		const text = await res.text();
		const $ = load(text);
		const r = $('fieldset').find('legend').filter((_, e) => $(e).text()
			== review.vendor).first().parent().find('.review-menu').text();
		const stars = r.trim().split(' ')[1];
		assert.equal(review.quality, stars.length);
	});
	it('name-visible', async () => {
		const review = genReview();
		await fetch('http://localhost:8080/reviews', {
			method: 'POST',
			body: new URLSearchParams(review),
			headers: {
				Cookie: `Authorize=${auth}`,
			},
		});
		const res = await fetch('http://localhost:8080/reviews', {
			headers: {
				Cookie: `Authorize=${auth}`,
			},
		});
		const text = await res.text();
		const $ = load(text);
		const r = $('fieldset').find('legend').filter((_, e) => $(e).text()
			== review.vendor).first().parent().find('.review-menu').text();
		const username = r.trim().split(' ')[0];
		assert.equal(username, p.username);
	});
	it('trusted-site-visible', async () => {
		const review = genReview();
		for (let i = 0; i < 6; i++) {
			await fetch('http://localhost:8080/reviews', {
				method: 'POST',
				body: new URLSearchParams(review),
				headers: {
					Cookie: `Authorize=${auth}`,
				},
			});
		}

		const res = await fetch('http://localhost:8080/reviews', {
			headers: {
				Cookie: `Authorize=${auth}`,
			},
		});
		const text = await res.text();
		const $ = load(text);
		const r = $('fieldset').find('legend').filter((_, e) => $(e).text()
			== review.vendor).first().parent().find('.trusted-site').text();
		assert.equal(r.trim(), 'Trusted site.');
	});
    it('only-logged-in-user-can-create-review', async () => {
		const res = await fetch('http://localhost:8080/reviews', {
			method: 'POST',
			body: new URLSearchParams(genReview()),
		});
		assert.equal(JSON.parse(await res.text()).reason, 'unauthorized');
    });
	afterEach(async () => {
		await REVIEWS.deleteMany({user: userid});
	});
	after(async () => {
		await USER.findOneAndDelete({_id: userid});
		await DB.disconnect();
	});
});

function genReview() {
	return {
		vendor: 'test-site',
		content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		quality: 5,
	};
}
