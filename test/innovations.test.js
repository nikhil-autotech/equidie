const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const InnovationModel = require('../model/innovations');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const studentModel = require('../model/student');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let innovations = null;
let token = null;
let schools = null;
let user = null;
let student = null;

describe('User', () => {
	before(async () => {
		schools = await schoolModel.find();
		user = await UserModel.findOne({
			profile_type: '5fd2f18f9cc6537951f0b35c',
		});
		student = await studentModel.findOne({
			school_id: schools[0]._id,
		});
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
		await InnovationModel.deleteOne({ _id: innovations._id }, () => {
			console.log('innovation deleted');
		});
	});

	describe('creating description', async () => {
		it('it should create new innovation', done => {
			const acData = {
				title: 'test Innovation',
				coin: '30',
				teacher_id: [user._id],
				submitted_by: student._id,
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
				.post('/api/v1/innovation/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					innovations = body.data;
					console.log(innovations);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the innovations ', done => {
			const bodyData = {
				_id: innovations._id,
			};
			chai
				.request(server)
				.post('/api/v1/innovation/get/')
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
		it('it should get count ', done => {
			const bodyData = { submitted_by: innovations.submitted_by };
			chai
				.request(server)
				.post('/api/v1/innovation/count/')
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
		it('it should get innovation by id', done => {
			const id = innovations._id;
			chai
				.request(server)
				.post(`/api/v1/innovation/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update innovation by id', done => {
			const id = innovations._id;
			const updateData = {
				title: 'test Innovation',
				coin: '20',
				submitted_by: '5fd1c755ba54044664ff8c0f',
				about: 'about updating api',
			};
			chai
				.request(server)
				.post(`/api/v1/innovation/update/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(updateData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update Like by id', done => {
			const id = innovations._id;
			const updateData = {
				action: 'Like',
				like_by: ['5fd1c755ba54044664ff8c0f'],
			};
			chai
				.request(server)
				.post(`/api/v1/innovation/Like/${id}`)
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
		it('it should update Dislike by id', done => {
			const id = innovations._id;
			const updateData = {
				action: 'Dislike',
				dislike_by: ['5fd1c755ba54044664ff8c0f'],
			};
			chai
				.request(server)
				.post(`/api/v1/innovation/Dislike/${id}`)
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
		it('it should update viewed by id', done => {
			const id = innovations._id;
			const updateData = {
				action: 'View',
				View_by: ['5fd1c755ba54044664ff8c0f'],
			};
			chai
				.request(server)
				.post(`/api/v1/innovation/viewed/${id}`)
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

		it('it should delete innovation by id', done => {
			const id = innovations._id;
			chai
				.request(server)
				.post(`/api/v1/innovation/delete/${id}`)
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
