const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const scheduleClassModel = require('../model/schedule_class');
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
		await scheduleClassModel.deleteOne({ _id: classC._id }, () => {
			console.log('schedule class deleted');
		});
	});

	describe('creating description', async () => {
		it('it should create new schedule class', done => {
			const acData = {
				class_start_Date: '2022-06-10T18:30:00.000Z',
				class_end_Date: '2022-06-10T18:30:00.000Z',
				class_start_time: '2022-06-10T18:30:00.000Z',
				class_end_time: '2022-06-10T18:30:00.000Z',
				subject_name: 'subject_name',
				chapter_name: 'chapter_name',
				does_class_repeat: 'no',
				teacher_id: '6262f64ed5e290104584931d',
				meeting_link: 'meeting_link',
				student_join_class: [],
				teacher_join_class: [],
				description: 'description',
				assign_To: [
					{
						student_id: '6262f64ed5e290104584931d',
					},
				],
				assign_To_you: [],
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
				.post('/api/v1/scheduleClass/add/')
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
		// it('it should get all the scheduleClasses ', done => {
		// 	const bodyData = {
		// 		assign_To: { student_id: '6262f64ed5e290104584931d' },
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post('/api/v1/scheduleClass/')
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
		it('it should update manual attendance of student', done => {
			const id = classC._id;
			const bodyData = { attendance_manually: [] };
			chai
				.request(server)
				.post(`/api/v1/scheduleClass/manual/attendance/${id}`)
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
		it('it should update manual attendance of teacher', done => {
			const id = classC._id;
			const bodyData = { teacher_attendance_manually: [] };
			chai
				.request(server)
				.post(`/api/v1/scheduleClass/manual/attendanceTeacher/${id}`)
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
		it('it should get scheduleClass data by id', done => {
			const id = classC._id;
			const bodyData = {
				meeting_link: 'meeting_link',
				description: 'description',
			};
			chai
				.request(server)
				.post(`/api/v1/scheduleClass/update/${id}`)
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
		it('it should delete linkedId', done => {
			const bodyData = {
				linked_id: 'linked_id',
				fromDate: '2022-06-10T18:30:00.000Z',
			};
			chai
				.request(server)
				.post(`/api/v1/scheduleClass/linkedId/delete`)
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
			const bodyData = {
				assign_To: { student_id: '6262f64ed5e290104584931d' },
			};
			chai
				.request(server)
				.post('/api/v1/scheduleClass/limited/')
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
		it('it should join schedule class by student id', done => {
			const id = classC._id;
			const updateData = {
				student_join_class: {
					student_id: '6262f64ed5e290104584931d',
					join_date: '2022-06-10T18:30:00.000Z',
				},
			};
			chai
				.request(server)
				.post(`/api/v1/scheduleClass/joinClass/${id}`)
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
		it('it should join schedule class by teacher id', done => {
			const id = classC._id;
			const updateData = {
				teacher_join_class: {
					teacher_id: '6262f64ed5e290104584931d',
					join_date: '2022-06-10T18:30:00.000Z',
				},
			};
			chai
				.request(server)
				.post(`/api/v1/scheduleClass/joinClassTeacher/${id}`)
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
		it('it should get scheduleClass by id', done => {
			const id = classC._id;
			chai
				.request(server)
				.post(`/api/v1/scheduleClass/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should delete scheduleClass by id', done => {
			const id = classC._id;
			chai
				.request(server)
				.post(`/api/v1/scheduleClass/delete/${id}`)
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
