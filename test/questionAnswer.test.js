const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const AnswerModel = require('../model/question_answer');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let answer = null;
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
		await AnswerModel.deleteOne({ _id: answer._id }, () => {
			console.log('answer deleted');
		});
	});

	describe('creating description', async () => {
		it('it should create new answer sheet', done => {
			const acData = {
				question_title: 'question_title',
				status: 'pending',
				question_id: '5fd1c755ba54044664ff8cec',
				attempt_question: 3,
				student_details: {
					student_id: '5fd1c755ba54044664ff8c0f',
					class_id: '5fd1c755ba54044664ff8c0f',
					teacher_id: '5fd1c755ba54044664ff8c0f',
					school_id: '5fd1c755ba54044664ff8c0f',
				},
				answer_details: [],
				feedback: 'feedback',
				totalTimeTaken: 35,
				totalMarks: 40,
				coin: 50,
				createdBy: 'Test user',
			};
			chai
				.request(server)
				.post('/api/v1/answer/submit/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					answer = body.data;
					console.log(answer);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the answer sheets ', done => {
			const acData = {
				question_title: 'test question_title',
			};
			chai
				.request(server)
				.post('/api/v1/answer/get/')
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
		it('it should get result', done => {
			const acData = {
				class_id: schools[0].classList[0]._id,
				school_id: schools[0]._id,
			};
			chai
				.request(server)
				.post('/api/v1/answer/result/')
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
		it('it should get teacher feedback by id', done => {
			const id = answer._id;
			const data = {
				teacher_id: '62b023819673690828e8d36a',
				feedback_type: 'feedback_type',
				comment: 'comment',
			};
			chai
				.request(server)
				.post(`/api/v1/answer/teacherFeedback/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(data)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should give free text marks', done => {
			const updateData = {
				answer_details: [],
				student_id: '62b023819673690828e8d36a',
			};
			chai
				.request(server)
				.post(`/api/v1/answer/freetextmark/`)
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
