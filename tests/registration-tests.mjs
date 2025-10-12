import {
	after, before, describe, it,
} from 'node:test';
import assert from 'node:assert';
import {DB, USER} from '../db.js';

describe('registration-tests', () => {
	const {form, p} = genForm();
	before('remove-test-user-bob', async () => {
		console.log('removing existing user');
		await USER.findOneAndDelete({username: p.username});
	});
	it('register-test-user-bob', async () => {
		await fetch('http://localhost:8080/register', {
			method: 'POST',
			body: form,
		});
		const user = await USER.findOne({username: p.username});
		console.log(user);
		assert.equal(user.username, p.username);
	});
	after('disconnect-from-db', async () => {
		console.log('removing existing user');
		await USER.findOneAndDelete({username: p.username});
		console.log('DB disconnecting...');
		await DB.disconnect();
	});
});

function genForm() {
	const p = {
		email: 'test-user-bob@test.com',
		username: 'test-user-bob',
		password: 'test',
	};
	const form = createElement('form');
	form.method = 'POST';
	const emailInput = createElement('input');
	emailInput.name = 'email';
	emailInput.value = p.email;
	form.append(emailInput);
	const usernameInput = createElement('input');
	usernameInput.name = 'username';
	usernameInput.value = p.username;
}
