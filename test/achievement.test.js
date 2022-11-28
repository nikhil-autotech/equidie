const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const AchievementModule = require('../model/Achievements');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let token = null;

let achievement = null;

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
	after('deleting created records', async () => {
		await AchievementModule.deleteOne({ title: 'demo test' });
	});

	describe('creating description', async () => {
		it('it should create new achievement', done => {
			const acData = {
				title: 'demo test',
				teacher_id: '622885b0ade88480437f6d5e',
				class_id: '60adec5f0454faa7fcfb866c',
			};
			chai
				.request(server)
				.post('/api/v1/achievements/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					achievement = body.data;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get the achievement based on query ', done => {
			const quData = {
				teacher_id: '622885b0ade88480437f6d5e',
			};
			chai
				.request(server)
				.get('/api/v1/achievements/')
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
		it('it should get the achievement from ID ', done => {
			const id = achievement._id;
			chai
				.request(server)
				.get(`/api/v1/achievements/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send()
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update the achievement from ID ', done => {
			const id = achievement._id;
			const updateData = {
				title: 'demo test',
				description: 'updating achievement_module',
				teacher_id: '622885b0ade88480437f6d5e',
				class_id: '60adec5f0454faa7fcfb866c',
			};
			chai
				.request(server)
				.put(`/api/v1/achievements/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(updateData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
	});
});
