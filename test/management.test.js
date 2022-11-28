const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const ManagementModel = require('../model/management');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let management = null;
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
		await ManagementModel.deleteOne({ mobile: '0123456789' });
	});

	describe('creating description', async () => {
		it('it should create new management', done => {
			const acData = {
				mobile: '0123456789',
				name: 'String',
				gender: 'String',
				password: '12345',
				qualification: 'String',
				dob: 'String',
				email: 'abc@gmail.com',
				address: 'String',
				aadhar_card: '98765',
				blood_gr: 'String',
				religion: 'String',
				caste: 'String',
				mother_tounge: 'String',
				marital_status: 'String',
				repository: [],
				createdBy: 'String',
				updatedBy: 'String',
			};
			chai
				.request(server)
				.post('/api/v1/management/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					management = body.data;
					console.log(management);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the management ', done => {
			chai
				.request(server)
				.get('/api/v1/management/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get management by id', done => {
			const id = management._id;
			chai
				.request(server)
				.get(`/api/v1/management/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update management by id', done => {
			const id = management._id;
			const updateData = {
				mobile: '0123456789',
				name: 'updated String',
				gender: 'String',
				password: 'String',
				qualification: 'String',
				dob: 'String',
				email: 'String',
				address: 'String',
				aadhar_card: 'Number',
				blood_gr: 'String',
				religion: 'String',
				caste: 'String',
				mother_tounge: 'String',
				marital_status: 'String',
				repository: [],
				createdBy: 'String',
				updatedBy: 'String',
			};
			chai
				.request(server)
				.put(`/api/v1/management/${id}`)
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
	});
});
