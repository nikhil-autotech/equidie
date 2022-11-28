const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const actualQuestionModel = require('../model/actualQuestions');
const schoolModel = require('../model/school');
const AnswerModel = require('../model/question_answer');
const ClassModel = require('../model/class');
const UserModel = require('../model/user');
const server = require('../index');
const answerSheet = require('../model/question_answer');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

const classC = null;
let token = null;
let schools = null;
let actualQuestions = null;
let answer = null;

describe('User', () => {
	before(async () => {
		schools = await schoolModel.findOne();
		actualQuestions = await actualQuestionModel.findOne();
		answer = await answerSheet.findOne();
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

	describe('creating description', async () => {
		it('it should get all mobile data', done => {
			const acData = {
				_id: actualQuestions._id,
			};
			chai
				.request(server)
				.post('/api/v1/test/mobile/')
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
		it('it should get all test data', done => {
			const acData = {
				_id: actualQuestions._id,
			};
			chai
				.request(server)
				.post('/api/v1/test/')
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
		it('it should get all subject name', done => {
			const acData = {
				'detail_question_paper.subject':
					actualQuestions.detail_question_paper.subject[0],
			};
			chai
				.request(server)
				.post('/api/v1/test/getSubjectName')
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
		it('it should get all subject name', done => {
			const acData = {
				question_id: answer.question_id,
				student_id: answer.student_details.student_id,
			};
			chai
				.request(server)
				.post('/api/v1/test/getRank')
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
		it('it should get test subject ', done => {
			const acData = {
				_id: actualQuestions._id,
			};
			chai
				.request(server)
				.post('/api/v1/test/getTestSubject')
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
		it('it should get pending count ', done => {
			const acData = {
				_id: actualQuestions._id,
			};
			chai
				.request(server)
				.post('/api/v1/test/pendingCount')
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
		it('it should begin test ', done => {
			const acData = {
				_id: actualQuestions._id,
			};
			chai
				.request(server)
				.post('/api/v1/test/begin')
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
		it('it should get test details ', done => {
			const acData = {
				_id: actualQuestions._id,
			};
			chai
				.request(server)
				.post('/api/v1/test/detail')
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
	});
});
