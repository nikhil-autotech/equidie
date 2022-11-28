const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const SyllabusModel = require('../model/syllabus');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let syllabus = null;
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
		await SyllabusModel.deleteOne({ name: 'test syllabus' });
	});

	describe('creating description', async () => {
		it('it should create new syllabus', done => {
			const acData = {
				name: 'test syllabus',
				image: 's_image',
				description: 'Test syllabus',
				repository: [
					{
						id: schools[0]._id,
					},
				],
				createdBy: 'Test user',
				updatedBy: 'Test user',
			};
			chai
				.request(server)
				.post('/api/v1/syllabus/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					syllabus = body.data;
					console.log(syllabus);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the syllabus ', done => {
			chai
				.request(server)
				.get('/api/v1/syllabus/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update repository of syllabus', done => {
			const id = syllabus.class._id;
			console.log(id);
			const updateData = {
				repository: [
					{
						id: schools[1]._id,
					},
				],
			};
			chai
				.request(server)
				.put(`/api/v1/syllabus?_id=${id}`)
				.set('Authorization', `Bearer ${token}`)
				// .query(id)
				.send(updateData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the syllabus mapping ', done => {
			const acData = {
				'repository.id': schools[1]._id,
			};
			chai
				.request(server)
				.get('/api/v1/syllabus/getmapdata')
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
		it('it should get syllabus by school id', done => {
			const school_id = schools[0]._id;
			chai
				.request(server)
				.get(`/api/v1/syllabus/byschool/${school_id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update mapping of syllabus by school id', done => {
			const school_id = schools[0]._id;
			const updateData = {
				removeClassId: '',
			};
			chai
				.request(server)
				.put(`/api/v1/syllabus/byschool/${school_id}`)
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
		it('it should get syllabus by id', done => {
			const id = syllabus.class._id;
			chai
				.request(server)
				.get(`/api/v1/syllabus/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update syllabus by id', done => {
			const id = syllabus.class._id;
			const updateData = {
				name: 'update test syllabus',
				image: 's_image',
				description: 'Test syllabus',
				repository: [
					{
						id: schools[0]._id,
					},
				],
				createdBy: 'Test user',
				updatedBy: 'Test user',
			};
			chai
				.request(server)
				.put(`/api/v1/syllabus/${id}`)
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
		it('it should delete an syllabus', done => {
			const id = syllabus.class._id;
			chai
				.request(server)
				.delete(`/api/v1/syllabus/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					console.log(body.message);
					done();
				})
				.catch(err => done(err));
		});
		it('it should unmap an syllabus', done => {
			const id = { syllabusId: syllabus.class._id, schoolId: schools[0]._id };
			chai
				.request(server)
				.post(`/api/v1/syllabus/unMapSyllabus`)
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
		it('it should delete syllabus', done => {
			const id = { syllabusId: syllabus.class._id };
			chai
				.request(server)
				.post(`/api/v1/syllabus/deletesyllabus`)
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
