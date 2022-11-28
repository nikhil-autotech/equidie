const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const TopicModel = require('../model/topic');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let topic = null;
let token = null;
let schools = null;
let topicRecord = null;

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
		await TopicModel.deleteOne({ name: 'Test updated Topic' });
	});

	describe('creating description', async () => {
		it('it should create new topic', done => {
			const acData = {
				name: 'Test Topic',
				board_id: ['61fa83993973a220dbd75630'],
				syllabus_id: ['61fa846e3973a220dbd75811'],
				about_file: 'String',
				class_id: '60adec5f0454faa7fcfb866c',
				subject_id: '61fa837e3973a220dbd7552f',
				chapter_id: '61fa851c3973a220dbd759a2',
				topic_image: 'String',
				description: 'Test Topic',
				repository: [
					{
						id: 's61fa84153973a220dbd75724',
					},
				],
				createdBy: 'Test user',
				updatedBy: 'Test user',
			};
			chai
				.request(server)
				.post('/api/v1/topic/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					topic = body.data;
					console.log(topic);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the topic ', done => {
			chai
				.request(server)
				.get('/api/v1/topic/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should give record count', done => {
			const acData = {
				_id: topic._id,
			};
			chai
				.request(server)
				.post('/api/v1/topic/recordCount')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					topicRecord = body.data;
					console.log(topic);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get allData ', done => {
			chai
				.request(server)
				.post('/api/v1/topic/getAll/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should filter ', done => {
			chai
				.request(server)
				.post('/api/v1/topic/filter/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should filter media', done => {
			chai
				.request(server)
				.post('/api/v1/topic/filter/media')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the topic page ', done => {
			chai
				.request(server)
				.get('/api/v1/topic/page')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get', done => {
			chai
				.request(server)
				.get('/api/v1/topic/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get topic by id', done => {
			const id = topic._id;
			chai
				.request(server)
				.get(`/api/v1/topic/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update topic by id', done => {
			const id = topic._id;

			const updateData = {
				name: 'Test updated Topic',
				board_id: ['61fa83993973a220dbd75630'],
				syllabus_id: ['61fa846e3973a220dbd75811'],
				files_upload: [],
				about_file: 'String',
				class_id: '60adec5f0454faa7fcfb866c',
				subject_id: '61fa837e3973a220dbd7552f',
				chapter_id: '61fa851c3973a220dbd759a2',
				topic_image: 'String',
				description: 'Test Topic',
				repository: [
					{
						id: 's61fa84153973a220dbd75724',
					},
				],
				createdBy: 'Test user',
				updatedBy: 'Test user',
			};
			chai
				.request(server)
				.put(`/api/v1/topic/${id}`)
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
		it('it should delete topic ', done => {
			const id = {
				topicId: topic._id,
				isGlobal: true,
				repositoryId: schools[0]._id,
			};
			chai
				.request(server)
				.post(`/api/v1/topic/deleteTopic/`)
				.set('Authorization', `Bearer ${token}`)
				.send(id)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should delete content ', done => {
			const id = {
				topicId: topic._id,
				fileUploadId: 'fileUploadId',
			};
			chai
				.request(server)
				.post(`/api/v1/topic/deleteContent/`)
				.set('Authorization', `Bearer ${token}`)
				.send(id)
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
