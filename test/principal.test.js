const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const PrincipalModel = require('../model/principal');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let principal = null;
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
		await PrincipalModel.deleteOne({ name: 'String' });
	});

	describe('creating description', async () => {
		// after('deleting created records', async () => {
		// 	await PrincipalModel.deleteOne({name: 'String'});
		// });
		it('it should create new principal', done => {
			const acData = {
				mobile: '012345689',
				name: 'String',
				gender: 'String',
				password: 's@123',
				qualification: 'String',
				dob: 'String',
				email: 'abc@gmail.com',
				address: 'String',
				aadhar_card: '0123456789',
				blood_gr: 'String',
				religion: 'String',
				caste: 'String',
				mother_tounge: 'String',
				marital_status: 'String',
				experiance: 'String',
				level: 'String',
				leaderShip_Exp: 'String',
				cv: 'String',
				ten_details: 'String',
				twelve_details: 'String',
				graduation_details: 'String',
				masters_details: 'String',
				other_degrees: 'String',
				certifications: 'String',
				extra_achievement: 'String',
				repository: [],
				createdBy: 'String',
				updatedBy: 'String',
			};
			chai
				.request(server)
				.post('/api/v1/principal/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					principal = body.data;
					console.log(principal);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the principal ', done => {
			chai
				.request(server)
				.get('/api/v1/principal/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get principal by id', done => {
			const id = principal._id;
			chai
				.request(server)
				.get(`/api/v1/principal/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update principal by id', done => {
			const id = principal._id;
			const updateData = {
				mobile: '012345689',
				name: 'String',
				gender: 'String',
				password: 'ac2@12',
				qualification: 'String',
				dob: 'String',
				email: 'abc@gmail.com',
				address: 'String',
				aadhar_card: '0123456789',
				blood_gr: 'String',
				religion: 'String',
				caste: 'String',
				mother_tounge: 'String',
				marital_status: 'String',
				experiance: 'String',
				level: 'String',
				leaderShip_Exp: 'String',
				cv: 'String',
				ten_details: 'String',
				twelve_details: 'String',
				graduation_details: 'String',
				masters_details: 'String',
				other_degrees: 'String',
				certifications: 'String',
				extra_achievement: 'String',
				repository: [],
				createdBy: 'String',
				updatedBy: 'String',
			};
			chai
				.request(server)
				.put(`/api/v1/principal/${id}`)
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
