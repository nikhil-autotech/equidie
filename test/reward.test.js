const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const rewardModel = require('../model/reward');
const ActivityModel = require('../model/activity');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let reward = null;
let token = null;
let activity = null;

describe('User', () => {
	before(async () => {
		activity = await ActivityModel.find();
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
		await rewardModel.deleteOne({ role_name: reward._id }, () => {
			console.log('reward deleted');
		});
	});

	describe('creating description', async () => {
		it('it should create new reward', done => {
			const acData = {
				activity_id: activity[0]._id,
				student_details: [
					{
						student_id: '5fd1c755ba54044664ff8c0f',
						coin: 10,
						extra_coin: 0,
					},
				],
				teacher_details: [
					{
						teacher_id: '5fd1c755ba54044664ff8c0f',
						coin: 10,
						extra_coin: 0,
					},
				],
				createdBy: 'Test user',
				updatedBy: 'Test user',
			};
			chai
				.request(server)
				.post('/api/v1/reward/create/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					reward = body.data;
					console.log(reward);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the rewards ', done => {
			const acData = {
				_id: reward._id,
			};
			chai
				.request(server)
				.post('/api/v1/reward/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all rank ', done => {
			const bodyData = { reward: reward._id };
			chai
				.request(server)
				.post('/api/v1/reward/getallrank/')
				.set('Authorization', `Bearer ${token}`)
				.send(bodyData)
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
