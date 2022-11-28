const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const QuestionTypeModel = require('../model/questionType');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let question_category = null;
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
		await QuestionTypeModel.deleteOne({ _id: question_category }, () => {
			console.log('question_category deleted');
		});
	});

	describe('creating description', async () => {
		it('it should create new question_category', done => {
			const acData = {
				name: 'Test category',
				class_id: '5fd1c755ba54044664ff8c0f',
				description: 'Test category description',
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
				.post('/api/v1/question_category/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					question_category = body.data;
					console.log(question_category);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the question_category ', done => {
			const acData = {
				'repository.id': schools[0]._id,
			};
			chai
				.request(server)
				.get('/api/v1/question_category/')
				.set('Authorization', `Bearer ${token}`)
				.query(acData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get question_category by repository id', done => {
			const { id } = question_category.repository;
			chai
				.request(server)
				.get(`/api/v1/question_category/byrepositoryid/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get question_category by id', done => {
			const id = question_category._id;
			chai
				.request(server)
				.get(`/api/v1/question_category/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update question_category by id', done => {
			const id = question_category._id;

			const updateData = {
				name: 'update Test Class',
				description: 'Test Class update description',
				createdBy: 'Test user',
				updatedBy: 'Test user',
			};
			chai
				.request(server)
				.put(`/api/v1/question_category/${id}`)
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
		it('it should delete question_category by id', done => {
			const id = {
				questionCategoryId: question_category._id,
				isGlobal: true,
				repositoryId: schools[0]._id,
			};
			chai
				.request(server)
				.post(`/api/v1/question_category/delete/`)
				.set('Authorization', `Bearer ${token}`)
				.send(id)
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
