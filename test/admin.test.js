const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const AdminModel = require('../model/admin');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let admin = null;
let token = null;

describe('User', () => {
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
		await AdminModel.deleteOne({ mobile: '0123456789' });
	});

	describe('creating description', async () => {
		// after('deleting created records', async () => {
		// 	await AdminModel.deleteOne({mobile: '0123456789'});
		// });
		it('it should create new admin', done => {
			const acData = {
				mobile: '0123456789',
				username: 'String',
				password: 'String',
				name: 'String',
				dob: 'String',
				gender: 'String',
				qualification: 'String',
				designation: 'String',
				repository: [],
				createdBy: 'String',
			};
			chai
				.request(server)
				.post('/api/v1/admin/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					admin = body.data;
					// console.log(admin);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the admin ', done => {
			chai
				.request(server)
				.get('/api/v1/admin/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get admin by id', done => {
			const id = admin._id;
			chai
				.request(server)
				.get(`/api/v1/admin/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update admin by id', done => {
			const id = admin._id;
			const updateData = {
				mobile: '0123456789',
				username: 'Update String',
				password: 'String',
				name: 'String',
				dob: 'String',
				gender: 'String',
				qualification: 'String',
				designation: 'String',
				repository: [],
				createdBy: 'String',
			};
			chai
				.request(server)
				.put(`/api/v1/admin/${id}`)
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
	});
});
