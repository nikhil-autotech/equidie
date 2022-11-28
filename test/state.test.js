const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const StateModule = require('../model/state');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let state = null;

let token = null;
describe('User', () => {
	before(async () => {
		const defaultUser = new UserModel({
			_id: mongoose.Types.ObjectId(),
			mobile: 9876598765,
			password: '1234',
			name: 'test',
			profile_type: '5fd1c755ba54044664ff8c0f',
		});
		await defaultUser.save();
	});
	before(done => {
		const userLogin = {
			username: 9876598765,
			password: '1234',
		};
		chai
			.request(server)
			.post('/api/v1/SignUp/login')
			.send(userLogin)
			.end((err, res) => {
				token = res.body.token;
				res.should.have.status(200);
				done();
			});
	});
	after(async () => {
		// After each test we truncate the database
		await UserModel.deleteOne({ mobile: '9876598765' }, () => {
			console.log('user deleted');
		});
	});

	describe('creating description', async () => {
		after('deleting created records', async () => {
			await StateModule.deleteOne({ state_name: 'test State' });
		});
		it('it should create new state', done => {
			const acData = {
				country_id: '60b499b8cca795cf59c4bc1b',
				state_name: 'test State',
				repository: [],
				createdBy: 'tester',
				updatedBy: '',
			};
			chai
				.request(server)
				.post('/api/v1/state/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					state = body.data;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get the state based on query ', done => {
			const quData = {
				country_id: '60b499b8cca795cf59c4bc1b',
			};
			chai
				.request(server)
				.get('/api/v1/state/')
				.set('Authorization', `Bearer ${token}`)
				.query(quData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the state ', done => {
			chai
				.request(server)
				.get('/api/v1/state/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
	});
});
