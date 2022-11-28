const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const ChapterModel = require('../model/chapter');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let chapter = null;
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
		await ChapterModel.deleteOne({ _id: chapter._id }, () => {
			console.log('chapter deleted');
		});
	});

	describe('creating description', async () => {
		it('it should create new chapter', done => {
			const acData = {
				name: 'Test chapter 123 ',
				class_id: '5fd1c755ba54044664ff8c0f',
				board_id: '5fd1c755ba54044664ff8c0f',
				subject_id: '5fd1c755ba54044664ff8c0f',
				syllabus_id: '5fd1c755ba54044664ff8c0f',
				files_upload: [
					{
						file_name: 'test.pdf',
					},
				],
				repository: [
					{
						id: '5fd1c755ba54044664ff8c0f',
					},
				],
			};
			chai
				.request(server)
				.post('/api/v1/chapter?name=quick')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					chapter = body.data;
					console.log(chapter);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the chapters ', done => {
			chai
				.request(server)
				.get('/api/v1/chapter/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get record count of chapters ', done => {
			const bodyData = { _id: chapter._id };
			chai
				.request(server)
				.post('/api/v1/chapter/recordCount/')
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
		it('it should get all data of the chapters ', done => {
			const bodyData = { _id: chapter._id };
			chai
				.request(server)
				.post('/api/v1/chapter/getAll/')
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
		it('it should filter the chapters ', done => {
			const bodyData = { _id: chapter._id };
			chai
				.request(server)
				.post('/api/v1/chapter/filter/')
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
		it('it should filter media of the chapters ', done => {
			const bodyData = { _id: chapter._id };
			chai
				.request(server)
				.post('/api/v1/chapter/filter/')
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
		it('it should get all the chapters with page ', done => {
			chai
				.request(server)
				.get('/api/v1/chapter/page/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all data of the chapters ', done => {
			const bodyData = { _id: chapter._id };
			chai
				.request(server)
				.post('/api/v1/chapter/get/')
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
		it('it should get chapter by id', done => {
			const id = chapter._id;
			chai
				.request(server)
				.get(`/api/v1/chapter/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update chapter by id', done => {
			const id = chapter._id;
			const updateData = {
				name: 'Test chapter update',
				description: 'Test chapter update',
			};
			chai
				.request(server)
				.put(`/api/v1/chapter/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(updateData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					console.log(body.data);
					done();
				})
				.catch(err => done(err));
		});
		it('it should delete content of a chapter', done => {
			const id = {
				chapterId: chapter._id,
				fileUploadId: chapter.files_upload[0]._id,
			};
			console.log(id);
			chai
				.request(server)
				.post(`/api/v1/chapter/deleteContent`)
				.set('Authorization', `Bearer ${token}`)
				.send(id)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					console.log(body.message);
					done();
				})
				.catch(err => done(err));
		});
		it('it should delete a chapter', done => {
			const id = {
				chapterId: chapter._id,
				repositoryId: chapter.repository.id,
			};
			chai
				.request(server)
				.post(`/api/v1/chapter/deleteChapter`)
				.set('Authorization', `Bearer ${token}`)
				.send(id)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					console.log(body.message);
					done();
				})
				.catch(err => done(err));
		});
	});
});
