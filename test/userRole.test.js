const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const UserRoleModel = require('../model/userRole');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let userRole = null;
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
		await UserRoleModel.findByIdAndDelete(userRole._id);
	});

	describe('creating description', async () => {
		it('it should create new userRole', done => {
			const acData = {
				profile_type: '5fd1c4f6ba54044664ff8c0d',
				sequenceNumber: '1',
				isSubmitForm: false,
				isDeleteForm: false,
				url: 'String',
			};
			chai
				.request(server)
				.post('/api/v1/userRole/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					userRole = body.data;
					console.log(userRole);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the userRole ', done => {
			chai
				.request(server)
				.get('/api/v1/userRole/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update userRole by id', done => {
			const id = userRole._id;
			const updateData = {
				profile_type: '5fd1c4f6ba54044664ff8c0d',
				sequenceNumber: '2',
				isSubmitForm: false,
				isDeleteForm: false,
				url: 'String',
			};
			chai
				.request(server)
				.put(`/api/v1/userRole/${id}`)
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
		it('it should delete userRole by id', done => {
			const id = userRole._id;
			chai
				.request(server)
				.delete(`/api/v1/userRole/${id}`)
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
