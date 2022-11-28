const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const topicModel = require('../model/topic');
const schoolModel = require('../model/school');
const chapterModel = require('../model/chapter');
const subjectModel = require('../model/subject');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();

chai.use(chaiHttp);

let learning = null;
let token = null;
let schools = null;
let chapter = null;
let subject = null;

describe('User', () => {
	before(async () => {
		schools = await schoolModel.find();
		chapter = await chapterModel.findOne();
		subject = await subjectModel.findOne();
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
		await topicModel.deleteOne({ _id: learning._id }, () => {
			console.log('learning deleted');
		});
	});

	describe('creating description', async () => {
		it('it should create new learning (topic)', done => {
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
				.post('/api/v1/learning/create')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					learning = body.data;
					console.log(learning);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get chapter ', done => {
			const bodyData = {
				_id: learning._id,
			};
			chai
				.request(server)
				.post('/api/v1/learning/getchapter')
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
		it('it should get subject ', done => {
			const bodyData = {
				_id: learning._id,
			};
			chai
				.request(server)
				.post('/api/v1/learning/getsubject')
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
		it('it should get all topics ', done => {
			const bodyData = {
				_id: learning._id,
			};
			chai
				.request(server)
				.post('/api/v1/learning/topic')
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
		it('it should get data ', done => {
			const bodyData = {
				_id: learning._id,
			};
			chai
				.request(server)
				.post('/api/v1/learning/data')
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
		it('it should get recent file ', done => {
			const bodyData = {
				_id: learning._id,
			};
			chai
				.request(server)
				.post('/api/v1/learning/recentfile')
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
		it('it should update data(topic) by id', done => {
			const id = learning._id;
			const updateData = {
				name: 'Test Learning update',
				about_file: 'about_file updated',
				files_upload: [{ file: 'files_upload updated' }],
			};
			chai
				.request(server)
				.put(`/api/v1/learning/data/${id}`)
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
		it('it should update chapter image by id', done => {
			const id = chapter._id;
			const updateData = {
				files_upload: { file: 'files_upload' },
			};
			chai
				.request(server)
				.put(`/api/v1/learning/chapter/addImage/${id}`)
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
		it('it should update subject file by id', done => {
			const id = subject._id;
			const updateData = {
				files_upload: [{ file: 'files_upload for subject' }],
			};
			chai
				.request(server)
				.put(`/api/v1/learning/subject/files/${id}`)
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
		it('it should get topic by id', done => {
			const id = learning._id;
			chai
				.request(server)
				.get(`/api/v1/learning/${id}`)
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
