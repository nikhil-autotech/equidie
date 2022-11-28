const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const learnOutcomeModel = require('../model/learnOutcome');
const schoolModel = require('../model/school');
const topicModel = require('../model/topic');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let learnOutcome = null;
let token = null;
let schools = null;
let topic = null;

describe('User', () => {
	before(async () => {
		schools = await schoolModel.find();
		topic = await topicModel.findOne();
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
		await learnOutcomeModel.deleteOne({ _id: learnOutcome._id }, () => {
			console.log('learnOutcome deleted');
		});
	});

	describe('creating description', async () => {
		it('it should create new learnOutcome', done => {
			const acData = {
				name: 'Test Learning',
				about_file: 'about_file',
				class_id: '60adea6a835f1ca1d7803612',
				files_upload: [{ file: 'files_upload' }],
				board_id: '62a4372c39c7b312e4b45598',
				chapter_id: '6243191bea0eaa0bc3e62d78',
				subject_id: '5fd2f18f9cc6537951f0b35c',
				syllabus_id: '6235afde15ef921f90e486d7',
				description: 'Test Class',
				repository: [
					{
						id: '6233335feec609c379b97b7c',
					},
				],
				createdBy: 'Test user',
				updatedBy: 'Test user',
			};
			chai
				.request(server)
				.post('/api/v1/learnOutcome/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					learnOutcome = body.data;
					console.log(learnOutcome);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the learnOutcome ', done => {
			chai
				.request(server)
				.get('/api/v1/learnOutcome/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get record count ', done => {
			const bodyData = { submitted_by: learnOutcome.submitted_by };
			chai
				.request(server)
				.post('/api/v1/learnOutcome/recordCount/')
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
		it('it should getAll the learnOutcome ', done => {
			const bodyData = {
				_id: learnOutcome._id,
			};
			chai
				.request(server)
				.post('/api/v1/learnOutcome/getAll/')
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
		it('it should filter the learnOutcome ', done => {
			const bodyData = {
				_id: learnOutcome._id,
			};
			chai
				.request(server)
				.post('/api/v1/learnOutcome/filter/')
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
		it('it should get the page', done => {
			chai
				.request(server)
				.get('/api/v1/learnOutcome/page/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get ', done => {
			const bodyData = {
				chapter_id: '6243191bea0eaa0bc3e62d78',
				topic_id: topic._id,
			};
			chai
				.request(server)
				.post('/api/v1/learnOutcome/get/')
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
		it('it should get learnOutcome by id', done => {
			const id = learnOutcome._id;
			chai
				.request(server)
				.get(`/api/v1/learnOutcome/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update learnOutcome by id', done => {
			const id = learnOutcome._id;
			const updateData = {
				name: 'Test updated Learning',
				about_file: 'about_file',
			};
			chai
				.request(server)
				.put(`/api/v1/learnOutcome/${id}`)
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
		it('it should delete learnOutcome by id', done => {
			const bodyData = {
				learningOutcomeId: learnOutcome._id,
				repositoryId: learnOutcome.repository.id,
			};
			chai
				.request(server)
				.post(`/api/v1/learnOutcome/deleteLearningOutcome/`)
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
