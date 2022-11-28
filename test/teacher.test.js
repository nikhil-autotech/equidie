const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const TeacherModel = require('../model/teacher');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let teacher = null;
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
		await TeacherModel.deleteOne({ username: '9876598765' }, () => {
			console.log('teacher deleted');
		 });
	});

	describe('creating description', async () => {
		it('it should create new teacher', done => {
			const acData = {
				username: "9876598765",
				mobile: 9876598765,
				profile_type: "62a88a2900ee89f260e61fd5",
				school_id: '62a88a2900ee89f260e61fd5',
				branch_id: '62a88a2900ee89f260e61fd5',
				password: 1234,
			};
			chai
				.request(server)
				.post('/api/v1/teacher/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					teacher = body.data;
					console.log(teacher);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the teachers ', done => {
			chai
				.request(server)
				.get('/api/v1/teacher/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the teachers id ', done => {
			const schoolId = teacher.school_id;
			chai
				.request(server)
				.get('/api/v1/teacher/getAllTeacherIds/')
				.set('Authorization', `Bearer ${token}`)
				.send(schoolId)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get teacher by id', done => {
			const id = teacher._id;
			chai
				.request(server)
				.get(`/api/v1/teacher/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update teacher by id', done => {
			const id = teacher._id;
			const updateData ={
				username: "9876598765",
				mobile: 9876598765,
				password: 1234,
				name: "name updated"
			};
			chai
				.request(server)
				.put(`/api/v1/teacher/${id}`)
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
		it('it should login teacher', done => {
			const acData = {
				username: '9876598765',
				password: '1234',
			};
			chai
				.request(server)
				.post('/api/v1/teacher/login/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					teacher = body.data;
					console.log(teacher);
					done();
				})
				.catch(err => done(err));
		});
		// it('it should update device token by id', done => {
		// 	const id = teacher._id;
		// 	const DeviceToken = { device_token: 'device_token' };
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/teacher/updateDeviceToken/${id}`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(DeviceToken)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
	});
});
