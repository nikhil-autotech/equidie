const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const PerformanceModel = require('../model/performance');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let performance = null;
let token = null;
let schools = null;

describe('User', () => {
	before(async () => {
		schools = await schoolModel.find();
	});
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
		await PerformanceModel.deleteOne({ _id: performance._id }, () => {
			console.log('performance deleted');
		});
	});

	describe('creating description', async () => {
		it('it should create new performance', done => {
			const acData = {
				teacher_id: '626bb40e30905f1dce1d6368',
				student_id: '626bb40e30905f1dce1d6368',
				feed: 'feed',
				feed_type: 'feed_type',
				award_badge: 'award_badge',
				award_badge_image: 'award_badge_image',
			};
			chai
				.request(server)
				.post('/api/v1/performances/create')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					performance = body.data;
					console.log(performance);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the performance ', done => {
			chai
				.request(server)
				.get('/api/v1/performances/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get award stat by student id', done => {
			const id = performance.student_id;
			chai
				.request(server)
				.get(`/api/v1/performances/award/stats/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get performances by id', done => {
			const id = performance._id;
			chai
				.request(server)
				.get(`/api/v1/performances/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update performances by id', done => {
			const id = performance._id;
			const updateData = {
				teacher_id: '626bb40e30905f1dce1d6368',
				student_id: '626bb40e30905f1dce1d6368',
				feed: 'feed',
				feed_type: 'feed_type',
				award_badge: 'award_badge update',
				award_badge_image: 'award_badge_image',
				repository: [
					{
						id: schools[0]._id,
					},
				],
			};
			chai
				.request(server)
				.put(`/api/v1/performances/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(updateData)
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
