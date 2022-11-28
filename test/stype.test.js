const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const STypeModel = require('../model/stype');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let stype = null;
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
		await STypeModel.deleteOne({ stype: 'stype updated' });
	});

	describe('creating description', async () => {
		it('it should create new stype', done => {
			const acData = {
				stype: 'stype',
				createdBy: 'test',
				updatedBy: 'test',
			};
			chai
				.request(server)
				.post('/api/v1/stype/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					stype = body.result;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the stype ', done => {
			chai
				.request(server)
				.get('/api/v1/stype/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get stype by id', done => {
			const id = stype._id;
			chai
				.request(server)
				.get(`/api/v1/stype/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update stype by id', done => {
			const id = stype._id;
			const updateData = {
				stype: 'stype updated',
				createdBy: 'test',
				updatedBy: 'test',
			};
			chai
				.request(server)
				.put(`/api/v1/stype/${id}`)
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
