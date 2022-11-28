const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const RoleModule = require('../model/role');
const SchoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let role = null;
let token = null;
let schools = null;

describe('User', () => {
	before(async () => {
		schools = await SchoolModel.find();
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
		await RoleModule.deleteOne({ role_name: 'test Role' });
	});

	describe('creating description', async () => {
		it('it should create new role', done => {
			const acData = {
				role_name: 'test Role',
				display_name: 'test Role',
				description: 'test Role',
				level: 'custom',
				type: 'custom',
				privilege: {},
				repository: [
					{
						id: schools[0]._id,
					},
				],
			};
			chai
				.request(server)
				.post('/api/v1/role/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					role = body.data;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get the role based on query ', done => {
			const quData = {
				role_name: 'test Role',
			};
			chai
				.request(server)
				.get('/api/v1/role/')
				.set('Authorization', `Bearer ${token}`)
				.query(quData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the roles ', done => {
			chai
				.request(server)
				.get('/api/v1/role/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all dashboard roles ', done => {
			chai
				.request(server)
				.get('/api/v1/role/dashboard')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should search role', done => {
			const acData = { searchValue: 'teacher', filterKeysArray: ['role_name'] };
			chai
				.request(server)
				.post('/api/v1/role/search')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should exist role', done => {
			const acData = { role_name: 'teacher' };
			chai
				.request(server)
				.post('/api/v1/role/exist')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get role', done => {
			const acData = { role_name: 'teacher' };
			chai
				.request(server)
				.post('/api/v1/role/get')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update role by id', done => {
			const id = role._id;
			const updateData = {
				role_name: 'test Role',
				display_name: 'test Role',
				description: 'updating test Role',
				level: 'custom',
				type: 'custom',
				privilege: {
					add_class: false,
					add_board: false,
					create_question: false,
					create_question_paper: false,
					view_question_paper: false,
					add_syllubus: false,
					add_subject: false,
					add_chapter: false,
					add_topic: false,
					add_learning_outcome: false,
					add_question_category: false,
					add_exam_types: false,
					add_qa: false,
					add_assessment: false,
					create_school: false,
					create_student: false,
					create_teacher: false,
					create_principle: false,
					create_management: false,
					add_mapping: false,
					add_section: false,
				},
				repository: [
					{
						id: schools[0]._id,
					},
				],
			};
			chai
				.request(server)
				.put(`/api/v1/role/${id}`)
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
		it('it should delete a role record', done => {
			const id = { _id: role._id };
			chai
				.request(server)
				.post(`/api/v1/role/deleteRole/`)
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
