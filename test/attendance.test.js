const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const AttendanceModel = require('../model/attendance');
const SchoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
chai.use(chaiHttp);

let response = null;
let schools = null;
let token = null;

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
	// testcases----------------------------------------------------
	describe('TESTCASES ATTENDANCE MODULE', async () => {
		it('it should get all attendance based on query', done => {
			const Qdata = {
				school_id: '61fa84153973a220dbd75724',
			};
			chai
				.request(server)
				.get('/api/v1/attendance')
				.set('Authorization', `Bearer ${token}`)
				.query(Qdata)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					// console.log(body);
					done();
				})
				.catch(err => done(err));
		});
		it('it should create an attendance record', done => {
			const payload = {
				class_teacher: '62564f8daf09f1f280bc0a36',
				attendance_takenBy_teacher: '62564f8daf09f1f280bc0a36',
				class_id: '60adea6a835f1ca1d7803612',
				section_id: '61fa85583973a220dbd759ec',
				attendanceDetails: [
					{ student_id: '61fb8d1f3973a220dbd76cd6', status: 'Absent' },
				],
				school_id: schools[0]._id,
			};
			chai
				.request(server)
				.post('/api/v1/attendance/create')
				.set('Authorization', `Bearer ${token}`)
				.send(payload)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					response = body.data;
					console.log(response);
					done();
				})
				.catch(err => done(err));
		});
		// it('it should create multiple attendance records', done => {
		// 	const payload = [
		// 		{
		// 			class_teacher: '62564f8daf09f1f280bc0a36',
		// 			attendance_takenBy_teacher: '62564f8daf09f1f280bc0a36',
		// 			class_id: '60adea6a835f1ca1d7803612',
		// 			section_id: '61fa85583973a220dbd759ec',
		// 			data: '',
		// 			attendanceDetails: [
		// 				{ student_id: '61fb8d1f3973a220dbd76cd6', status: 'Absent' },
		// 			],
		// 			school_id: '61fa84153973a220dbd75724',
		// 		},
		// 	];

		// 	chai
		// 		.request(server)
		// 		.post('/api/v1/attendance/create')
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(payload)
		// 		.then(res => {
		// 			res.should.have.status(201);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			response = body.data;
		// 			console.log(response);
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('it should update an attendance record', done => {
			const Update = {
				_id: response._id,
				class_teacher: '62564f8daf09f1f280bc0a36',
				attendance_takenBy_teacher: '62564f8daf09f1f280bc0a36',
				class_id: '60adea6a835f1ca1d7803612',
				section_id: '61fa85583973a220dbd759ec',
				attendanceDetails: [
					{ student_id: '61fb8d1f3973a220dbd76cd6', status: 'Present' },
				],
				school_id: '61fa84153973a220dbd75724',
			};
			chai
				.request(server)
				.post('/api/v1/attendance/update')
				.set('Authorization', `Bearer ${token}`)
				.send(Update)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					response = body.data;
					console.log(response);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get an attendance record by the given id', done => {
			const id = response._id;
			chai
				.request(server)
				.get(`/api/v1/attendance/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					console.log(body);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get the attendance records based on date', done => {
			const datePayload = {
				date: response.date,
			};
			chai
				.request(server)
				.post('/api/v1/attendance/getbydate')
				.set('Authorization', `Bearer ${token}`)
				.send(datePayload)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					console.log(body);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get the attendance report', done => {
			const daPayload = {
				school_id: '61fa84153973a220dbd75724',
				class_id: '60adea6a835f1ca1d7803612',
				section_id: '61fa85583973a220dbd759ec',
				date: '2022-05-10 18:30:00.000Z',
			};
			chai
				.request(server)
				.post('/api/v1/attendance/reportbyschool')
				.set('Authorization', `Bearer ${token}`)
				.send(daPayload)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					console.log(body);
					done();
				})
				.catch(err => done(err));
		});
		it('it should update an attendance record of student', done => {
			const id = response._id;
			const Update = {
				student_id: response.attendanceDetails[0].student_id,
				status: 'Absent',
			};
			chai
				.request(server)
				.post(`/api/v1/attendance/attendanceUpdate/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(Update)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					console.log(body.message);
					done();
				})
				.catch(err => done(err));
		});
		it('it should delete an attendance record', done => {
			const id = response._id;
			chai
				.request(server)
				.delete(`/api/v1/attendance/delete/${id}`)
				.set('Authorization', `Bearer ${token}`)
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
