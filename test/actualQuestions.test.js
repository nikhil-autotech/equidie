const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const UserModel = require('../model/user');
const questionPaperModel = require('../model/actualQuestions');
const schoolModel = require('../model/school');
const server = require('../index');

const should = chai.should();
chai.use(chaiHttp);
let token = null;
let schools = null;
let question = null;
let user = null;

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
				user = res.user_info;
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
	after('deleting created question paper', async () => {
		await questionPaperModel.deleteOne({ _id: question._id });
	});
	// test cases begin---------------------------------------------------
	describe('TESTCASES ACTUAL QUESTION', async () => {
		it('it should get all questions based on query', done => {
			const id = schools[0]._id;
			chai
				.request(server)
				.get(`/api/v1/actualQuestions?repository.id=${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all question for mobile data', done => {
			const mdata = {
				school_id: schools[0]._id,
			};
			chai
				.request(server)
				.get('/api/v1/actualQuestions/mobileData')
				.set('Authorization', `Bearer ${token}`)
				.query(mdata)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all question for mobile data through body', done => {
			const mobiledata = {
				school_id: schools[0]._id,
			};
			chai
				.request(server)
				.post('/api/v1/actualQuestions/mobileData')
				.set('Authorization', `Bearer ${token}`)
				.send(mobiledata)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should filter the question paper through body', done => {
			const filterdata = {
				'repository.id': schools[0]._id,
			};
			chai
				.request(server)
				.post('/api/v1/actualQuestions/filter')
				.set('Authorization', `Bearer ${token}`)
				.send(filterdata)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should create a question paper', done => {
			const qPayload = {
				question_title: 'test',
				question_description: 'test',
				class_id: '60adea6a835f1ca1d7803612',
				student_id: null,
				section_id: null,
			};
			chai
				.request(server)
				.post('/api/v1/actualQuestions/')
				.set('Authorization', `Bearer ${token}`)
				.send(qPayload)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					question = body.data;
					done();
				})
				.catch(err => done(err));
		});
		// it('it should assign the quesion paper to given student', done => {
		// 	const id = question._id;
		// 	const mdata = {
		// 		AssignDate: '',
		// 		dueDate: '',
		// 		award: '',
		// 		duration: '',
		// 		assignTo: '',
		// 		teacher_id: '',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/actualQuestions/assign/${id}`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(mdata)
		// 		.then(res => {
		// 			res.should.have.status(201);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('it should get all the question paper', done => {
			const getData = {
				school_id: schools[0]._id,
			};
			chai
				.request(server)
				.post('/api/v1/actualQuestions/getAllQuestions')
				.set('Authorization', `Bearer ${token}`)
				.send(getData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get the question paper by id', done => {
			const id = question._id;
			chai
				.request(server)
				.get(`/api/v1/actualQuestions/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update the question paper by id', done => {
			const id = question._id;
			const updateData = {
				question_title: 'test updated',
			};
			chai
				.request(server)
				.put(`/api/v1/actualQuestions/${id}`)
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
		it('it should check the validation for question paper', done => {
			const details = {
				schoolId: schools[0]._id,
				questionId: question._id,
			};
			chai
				.request(server)
				.post(`/api/v1/actualQuestions/questionIdValidation`)
				.set('Authorization', `Bearer ${token}`)
				.send(details)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should delete the question paper', done => {
			const deleteData = {
				questionPaperId: question._id,
			};
			chai
				.request(server)
				.post(`/api/v1/actualQuestions/deleteQuestionPaper`)
				.set('Authorization', `Bearer ${token}`)
				.send(deleteData)
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
