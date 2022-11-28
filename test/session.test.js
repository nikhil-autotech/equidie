const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const sessionModel = require('../model/session');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let session = null;
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
		await sessionModel.deleteOne({ _id: session._id }, () => {
			console.log('session deleted');
		});
	});

	describe('creating description', async () => {
		it('it should create new session', done => {
			const acData = {
				session_start_Date: '2022-06-10T18:30:00.000Z',
				session_end_Date: '2022-06-10T18:30:00.000Z',
				session_start_time: '2022-06-10T18:30:00.000Z',
				session_end_time: '2022-06-10T18:30:00.000Z',
				subject_name: 'subject_name',
				does_session_repeat: 'no',
				isDaily: false,
				institute_id: '6262f64ed5e290104584931d',
				assign_To: [
					{
						student_id: '6262f64ed5e290104584931d',
					},
				],
				meeting_link: 'meeting_link',
				isForStudent: 'no',
				student_join_session: [],
				teacher_join_session: [],
				description: 'description',
				files: [],
				schools: ['6262f64ed5e290104584931d'],
				createdBy: '6262f64ed5e290104584931d',
			};
			chai
				.request(server)
				.post('/api/v1/session/add/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					session = body.data;
					console.log(session);
					done();
				})
				.catch(err => done(err));
		});
		// it('it should get all the session ', done => {
		// 	chai
		// 		.request(server)
		// 		.post('/api/v1/session/')
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send()
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('it should take manual attendance of student', done => {
			const id = session._id;
			const bodyData = { attendance_manually: [] };
			chai
				.request(server)
				.post(`/api/v1/session/manual/attendance/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(bodyData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should take manual attendance of teacher', done => {
			const id = session._id;
			const bodyData = { teacher_attendance_manually: [] };
			chai
				.request(server)
				.post(`/api/v1/session/manual/attendanceTeacher/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(bodyData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update session data by id', done => {
			const id = session._id;
			const bodyData = {
				meeting_link: 'meeting_link',
				description: 'description',
			};
			chai
				.request(server)
				.post(`/api/v1/session/update/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(bodyData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update complete session data by id', done => {
			const id = session._id;
			const bodyData = {
				session_start_Date: '2022-06-10T18:30:00.000Z',
				session_end_Date: '2022-06-10T18:30:00.000Z',
				session_start_time: '2022-06-10T18:30:00.000Z',
				session_end_time: '2022-06-10T18:30:00.000Z',
				subject_name: 'subject_name',
				does_session_repeat: 'no',
				isDaily: false,
				institute_id: '6262f64ed5e290104584931d',
				assign_To: [
					{
						student_id: '6262f64ed5e290104584931d',
					},
				],
				meeting_link: 'meeting_link',
				isForStudent: 'no',
				student_join_session: [],
				teacher_join_session: [],
				description: 'description updated',
				files: [],
				schools: ['6262f64ed5e290104584931d'],
				createdBy: '6262f64ed5e290104584931d',
			};
			chai
				.request(server)
				.post(`/api/v1/session/updateCompleteSession/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(bodyData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		// it('it should delete linkedId', done => {
		// 	const bodyData = {
		// 		linked_id: 'linked_id',
		// 		fromDate: '2022-06-10T18:30:00.000Z',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/session/linkedId/delete`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(bodyData)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('it should get session data with pagination', done => {
			const bodyData = {};
			chai
				.request(server)
				.post(`/api/v1/session/withPagination`)
				.set('Authorization', `Bearer ${token}`)
				.send(bodyData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get future session', done => {
			const bodyData = { session_start_Date: '2022-06-10T18:30:00.000Z' };
			chai
				.request(server)
				.post(`/api/v1/session/future`)
				.set('Authorization', `Bearer ${token}`)
				.send(bodyData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get tofuture session', done => {
			const bodyData = { session_start_Date: '2022-06-10T18:30:00.000Z' };
			chai
				.request(server)
				.post(`/api/v1/session/tofuture`)
				.set('Authorization', `Bearer ${token}`)
				.send(bodyData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get limited ', done => {
			const bodyData = {};
			chai
				.request(server)
				.post('/api/v1/session/limited/')
				.set('Authorization', `Bearer ${token}`)
				.send()
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should join session class by student id', done => {
			const id = session._id;
			const updateData = {
				student_join_session: {
					student_id: '6262f64ed5e290104584931d',
					join_date: '2022-06-10T18:30:00.000Z',
				},
			};
			chai
				.request(server)
				.post(`/api/v1/session/joinSession/${id}`)
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
		it('it should join schedule class by parent id', done => {
			const id = session._id;
			const updateData = {
				parent_join_session: {
					parent_id: '6262f64ed5e290104584931d',
					join_data: '2022-06-10T18:30:00.000Z',
				},
			};
			chai
				.request(server)
				.post(`/api/v1/session/joinSessionParent/${id}`)
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
		it('it should join session class by teacher id', done => {
			const id = session._id;
			const updateData = {
				teacher_join_session: {
					teacher_id: '6262f64ed5e290104584931d',
					join_data: '2022-06-10T18:30:00.000Z',
				},
			};
			chai
				.request(server)
				.post(`/api/v1/session/joinSessionTeacher/${id}`)
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
		it('it should get session report by institute id', done => {
			const id = session.institute_id;
			chai
				.request(server)
				.get(`/api/v1/session/report/institute/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get session report by school id for student', done => {
			const id = session.schools[0];
			chai
				.request(server)
				.get(`/api/v1/session/report/school/${id}/students`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get session report by school id for teacher', done => {
			const id = session.schools[0];
			chai
				.request(server)
				.get(`/api/v1/session/report/school/${id}/teachers`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get session by id', done => {
			const id = session._id;
			chai
				.request(server)
				.post(`/api/v1/session/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should delete session by id', done => {
			const id = session._id;
			chai
				.request(server)
				.delete(`/api/v1/session/delete/${id}`)
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
