const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const ClassModel = require('../model/class');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let classC = null;
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
		await ClassModel.deleteOne({ role_name: 'test Role' });
	});

	describe('creating description', async () => {
		it('it should create new class', done => {
			const acData = {
				sequence_number: 20,
				name: 'Test Class',
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
				.post('/api/v1/class/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					classC = body.data;
					console.log(classC);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the classes ', done => {
			chai
				.request(server)
				.get('/api/v1/class/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get class by id', done => {
			const id = classC._id;
			chai
				.request(server)
				.get(`/api/v1/class/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update class by id', done => {
			const id = classC._id;
			const updateData = {
				sequence_number: 20,
				name: 'Test Class',
				description: 'Test Class1',
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

		it('it should delete an class', done => {
			const id = { _id: classC._id };
			chai
				.request(server)
				.post(`/api/v1/class/deleteClass`)
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
		it('it should unmap an class', done => {
			const id = { classId: classC._id, schoolId: classC.repository.id };
			chai
				.request(server)
				.post(`/api/v1/class/unMapClass`)
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
		it('it should delete class by id', done => {
			const id = classC._id;
			chai
				.request(server)
				.delete(`/api/v1/class/${id}`)
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
