const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const AwardBadgeModel = require('../model/award_badge');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let awardBadge = null;
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
		await AwardBadgeModel.deleteOne({ title: 'Test Award' });
	});

	describe('creating description', async () => {
		it('it should create new Award Badge', done => {
			const acData = {
				title: 'Test Award',
				repository: [
					{
						id: schools[0]._id,
					},
				],
				file_upload: 'test_file.png',
				createdBy: 'Test user',
			};
			chai
				.request(server)
				.post('/api/v1/awardBadge/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					awardBadge = body.data;
					console.log(awardBadge);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the awardBadge ', done => {
			chai
				.request(server)
				.get('/api/v1/awardBadge/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get awardBadge by id', done => {
			const id = awardBadge._id;
			chai
				.request(server)
				.get(`/api/v1/awardBadge/${id}`)
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
