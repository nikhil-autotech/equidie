const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const BranchModel = require('../model/branch');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let branch = null;
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
		await BranchModel.deleteOne({ name: 'Test branch' });
	});

	describe('creating description', async () => {
		// after('deleting created records', async () => {
		// 	await BranchModel.deleteOne({ name: 'Test branch' });
		// });
		it('it should create new branch', done => {
			const acData = {
				email: '',
				city: '60fbda40d4fbdfe05d23e6d4',
				state: '60fbda3fd4fbdfe05d23e67a',
				country: '60b499b8cca795cf59c4bc1b',
				schoolId: '6239d0ae950f883ba4185d16',
				name: 'Test branch',
				address: '123',
				contact: 7019471037,
				pincode: 560045,
			};
			chai
				.request(server)
				.post('/api/v1/branch')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					branch = body.data;
					console.log(branch);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the branch ', done => {
			chai
				.request(server)
				.get('/api/v1/branch/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get branch by id', done => {
			const id = branch._id;
			chai
				.request(server)
				.get(`/api/v1/branch/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update branch by id', done => {
			const id = branch._id;
			const updateData = {
				name: 'Test12',
			};
			chai
				.request(server)
				.put(`/api/v1/branch/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(updateData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					console.log(body.data);
					done();
				})
				.catch(err => done(err));
		});
		it('it should delete branch by id', done => {
			const id = branch._id;
			chai
				.request(server)
				.delete(`/api/v1/branch/${id}`)
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
