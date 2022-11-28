const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const SubjectModel = require('../model/subject');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let subject = null;
let subject1 = null;
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
		await SubjectModel.deleteMany({ name: ['test subject', 'test subject1'] });
	});

	describe('creating description', async () => {
		it('it should create new subject', done => {
			const acData = {
				name: 'test subject',
				s_image: 's_image',
				description: 'Test Class',
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
				.post('/api/v1/subject/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					subject = body.data;
					console.log(subject);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the subjects ', done => {
			chai
				.request(server)
				.get('/api/v1/subject/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update repository of subject', done => {
			const id = subject.class._id;
			const updateData = {
				repository: [
					{
						id: schools[1]._id,
					},
				],
			};
			chai
				.request(server)
				.put(`/api/v1/subject?_id=${id}`)
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
		it('it should create bulk subject', done => {
			const acData = {
				subjects: [
					{
						name: 'test subject',
						s_image: 's_image',
						description: 'Test Class',
						repository: [
							{
								id: schools[0]._id,
							},
						],
						createdBy: 'Test user',
						updatedBy: 'Test user',
					},
					{
						name: 'test subject1',
						s_image: 's_image',
						description: 'Test Class',
						repository: [
							{
								id: schools[0]._id,
							},
						],
						createdBy: 'Test user',
						updatedBy: 'Test user',
					},
				],
			};
			chai
				.request(server)
				.post('/api/v1/subject/bulkCreate')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					subject1 = body.data;
					console.log(subject);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the subjects mapping ', done => {
			const acData = {
				'repository.id': schools[0]._id,
			};
			chai
				.request(server)
				.get('/api/v1/subject/getmapdata')
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
		it('it should get subject by school id', done => {
			const school_id = schools[0]._id;
			chai
				.request(server)
				.get(`/api/v1/subject/byschool/${school_id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update mapping of subject by school id', done => {
			const school_id = schools[0]._id;
			const updateData = {
				classId: null,
				newAddedSubjectId: [],
				removeSubjectId: [],
				boardId: null,
				syllabuseId: null,
			};
			chai
				.request(server)
				.put(`/api/v1/subject/byschool/${school_id}`)
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
		it('it should get subject by id', done => {
			const id = subject.class._id;
			chai
				.request(server)
				.get(`/api/v1/subject/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update subject by id', done => {
			const id = subject.class._id;
			const updateData = {
				name: 'update test subject',
				s_image: 's_image',
				description: 'Test Class',
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
				.put(`/api/v1/class/${id}`)
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
		it('it should delete an subject', done => {
			const id = subject.class._id;
			chai
				.request(server)
				.delete(`/api/v1/subject/${id}`)
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
		// it('it should map many subject', done => {
		// 	const updateData = {
		// 		subjects: [
		// 			{
		// 				name: 'test subject',
		// 				s_image: 's_image',
		// 				description: 'Test Class',
		// 				repository: [
		// 					{
		// 						id: schools[0]._id,
		// 					},
		// 				],
		// 				createdBy: 'Test user',
		// 				updatedBy: 'Test user',
		// 			},
		// 		],
		// 	};
		// 	chai
		// 		.request(server)
		// 		.put(`/api/v1/subject/mapMany`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(updateData)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('it should unmap an subject', done => {
			const id = { subjectId: subject.class._id, schoolId: schools[0]._id };
			chai
				.request(server)
				.post(`/api/v1/subject/unMapSubject`)
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
		it('it should delete subject', done => {
			const id = { subjectId: subject.class._id };
			chai
				.request(server)
				.post(`/api/v1/subject/deleteSubject`)
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
