const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const CityModel = require('../model/city');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let city = null;
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
		await CityModel.deleteOne({ city_name: 'city_name' });
	});

	describe('creating description', async () => {
		it('it should create new city', done => {
			const acData = {
				state_id: '60fbda3fd4fbdfe05d23e67a',
				city_name: 'city_name',
				repository: [],
				createdBy: 'test',
				updatedBy: 'test',
			};
			chai
				.request(server)
				.post('/api/v1/city/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					city = body.data;
					// console.log(city);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the cities ', done => {
			chai
				.request(server)
				.get('/api/v1/city/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get city by id', done => {
			const id = city._id;
			chai
				.request(server)
				.get(`/api/v1/city/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update city by id', done => {
			const id = city._id;
			const updateData = {
				state_id: '60fbda3fd4fbdfe05d23e67a',
				city_name: 'city_name',
				repository: [],
				createdBy: 'test',
				updatedBy: 'test',
			};
			chai
				.request(server)
				.put(`/api/v1/city/${id}`)
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
		it('it should get cities by state id', done => {
			const id = city.state_id;
			chai
				.request(server)
				.get(`/api/v1/city/state/${id}`)
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
