const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const GroupModel = require('../model/group');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let group = null;
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
		await GroupModel.deleteOne({ _id: group._id }, () => {
			console.log('group deleted');
		});
	});

	describe('creating description', async () => {
		it('it should create new group', done => {
			const acData = {
				group_name: 'Test group',
				school_id: schools[0]._id,
				teacher_id: '62a46dd9035778292011d4a9',
				students: [],
				users: [],
			};
			chai
				.request(server)
				.post('/api/v1/group/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					group = body.data;
					console.log(group);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the group ', done => {
			chai
				.request(server)
				.get('/api/v1/group/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get group by id', done => {
			const id = group._id;
			chai
				.request(server)
				.get(`/api/v1/group/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update group by id', done => {
			const id = group._id;
			const updateData = {
				group_name: 'Test group update',
			};
			chai
				.request(server)
				.put(`/api/v1/group/${id}`)
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
		it('it should add a student in group', done => {
			const id = group._id;
			const student_id = '6234783fc35081f02ea4ebd5';
			chai
				.request(server)
				.put(`/api/v1/group/${id}/student/${student_id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should remove a student in group', done => {
			const id = group._id;
			const student_id = '6234783fc35081f02ea4ebd5';
			chai
				.request(server)
				.delete(`/api/v1/group/${id}/student/${student_id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should add a user in group', done => {
			const id = group._id;
			const user_id = '6234783fc35081f02ea4ebd5';
			chai
				.request(server)
				.put(`/api/v1/group/${id}/user/${user_id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should remove a user in group', done => {
			const id = group._id;
			const user_id = '6234783fc35081f02ea4ebd5';
			chai
				.request(server)
				.delete(`/api/v1/group/${id}/user/${user_id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should delete group by id', done => {
			const id = group._id;
			chai
				.request(server)
				.delete(`/api/v1/group/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
	});
});
