const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const BoardModel = require('../model/board');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let board = null;
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
		await BoardModel.deleteOne({ name: 'Test Board' });
	});

	describe('creating description', async () => {
		it('it should create new board', done => {
			const acData = {
				name: 'Test Board',
				class_id: '60adea6a835f1ca1d7803612',
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
				.post('/api/v1/board/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					board = body.data;
					console.log(board);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the boards ', done => {
			chai
				.request(server)
				.get('/api/v1/board/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update repository of board', done => {
			const updateData = {
				repository: [
					{
						id: schools[1]._id,
					},
				],
			};
			chai
				.request(server)
				.put(`/api/v1/board?_id=${board._id}`)
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
		it('it should get map data of boards ', done => {
			const id = {
				'repository.id': board.repository[0].id,
			};
			chai
				.request(server)
				.get(`/api/v1/board/getmapdata?${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get boards by school id', done => {
			const { id } = board.repository[0].id;
			chai
				.request(server)
				.get(`/api/v1/board/byschool/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update board by school id', done => {
			const { id } = board.repository;
			const updateData = {
				removeClassId: '60adea6a835f1ca1d7803612',
				repository: [
					{
						id: schools[0]._id,
						mapDetails: [],
					},
				],
				createdBy: 'Test user',
				updatedBy: 'Test user',
			};
			chai
				.request(server)
				.put(`/api/v1/board/byschool/${id}`)
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
		it('it should get board by id', done => {
			const id = board._id;
			chai
				.request(server)
				.get(`/api/v1/board/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update board by id', done => {
			const id = board._id;
			const updateData = {
				name: 'Test Board',
				class_id: 'class Id',
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
				.put(`/api/v1/board/${id}`)
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
		it('it should unmap an board', done => {
			const id = { boardId: board._id, schoolId: board.repository.id };
			chai
				.request(server)
				.post(`/api/v1/board/unMapBoard`)
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
		it('it should delete an board', done => {
			const id = { _id: board._id };
			chai
				.request(server)
				.post(`/api/v1/board/deleteBoard`)
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
	});
});
