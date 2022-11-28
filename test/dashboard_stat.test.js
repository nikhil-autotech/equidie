const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
const UserModel = require('../model/user');
const server = require('../index');
const schoolModel = require('../model/school');
const studentModel = require('../model/student');

chai.use(chaiHttp);
const should = chai.should();

let schools = null;
let token = null;
let student = null;
let teacher = null;

describe('User', () => {
	before(async () => {
		schools = await schoolModel.findOne();
		student = await studentModel.findOne();
		teacher = await UserModel.findOne();
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

	describe('dashboard stats modules', async () => {
		it('should get all users based on roles', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.get('/api/v1/dashboard/stats/userByRole')
				.set('Authorization', `bearer ${token}`)
				.query(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get all users based on roles by body', done => {
			const payload = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.post('/api/v1/dashboard/stats/userByRole')
				.set('Authorization', `bearer ${token}`)
				.send(payload)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should return toatal boys and girls in school', done => {
			const schoolId = schools._id;
			chai
				.request(server)
				.get(`api/v1/dashboard/stats/${schoolId}/genderCount`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					res.body.should.have.a.property('data');
					const { data } = res.body;
					data.should.be.a('array');
					data.should.have.a.property('totalBoys');
					data.should.have.a.property('totalGirls');
				})
				.catch(err => done(err));
		});
		it('should get all activity report of school', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.get('/api/v1/dashboard/stats')
				.set('Authorization', `bearer ${token}`)
				.query(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		// it('should get all students details', done => {
		// 	const query = {
		// 		school_id: schools._id.toString(),
		// 	};
		// 	chai
		// 		.request(server)
		// 		.get('/api/v1/dashboard/stats/student/details')
		// 		.set('Authorization', `bearer ${token}`)
		// 		.query(query)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('should get all students caste details', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.get('/api/v1/dashboard/stats/student/caste')
				.set('Authorization', `bearer ${token}`)
				.query(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get all students illness report', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.get('/api/v1/dashboard/stats/student/illness')
				.set('Authorization', `bearer ${token}`)
				.query(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get all students transport report', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.get('/api/v1/dashboard/stats/student/transport')
				.set('Authorization', `bearer ${token}`)
				.query(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get all students wearing glass', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.get('/api/v1/dashboard/stats/student/wearglass')
				.set('Authorization', `bearer ${token}`)
				.query(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get all students motherTongue', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.get('/api/v1/dashboard/stats/student/motherTongue')
				.set('Authorization', `bearer ${token}`)
				.query(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get all blood group ', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.get('/api/v1/dashboard/stats/student/bloodGr')
				.set('Authorization', `bearer ${token}`)
				.query(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get all students list count', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.post('/api/v1/dashboard/stats/studentList')
				.set('Authorization', `bearer ${token}`)
				.send(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get all class progress by students', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.post('/api/v1/dashboard/stats/classprogress/calculate')
				.set('Authorization', `bearer ${token}`)
				.send(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get all attendance for schedule class ()', done => {
			const id = student._id.toString();
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/attendance/${id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get all users based on roles ()', done => {
			const id = schools._id.toString();
			const query = {
				'assignTo.student_id': student._id.toString(),
			};
			chai
				.request(server)
				.post(`/api/v1/dashboard/stats/progress/${id}`)
				.set('Authorization', `bearer ${token}`)
				.send(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get all faculty list by school', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.post('/api/v1/dashboard/stats/facultyList')
				.set('Authorization', `bearer ${token}`)
				.send(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get all parentList of students', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.post('/api/v1/dashboard/stats/parentList')
				.set('Authorization', `bearer ${token}`)
				.send(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get all students completed performane ()', done => {
			const id = student._id.toString();
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/${id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get students assignment report', done => {
			const id = student._id.toString();
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/assignment/${id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get students lateSubmission report', done => {
			const id = student._id.toString();
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/lateSubmission/${id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get students livepool report', done => {
			const id = student._id.toString();
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/livepool/${id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get students allprogress report', done => {
			const id = student._id.toString();
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/allprogress/${id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get students Announcement report', done => {
			const id = student._id.toString();
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/Announcement/${id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get students AnnouncementTeacher report', done => {
			const id = teacher._id.toString();
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/AnnouncementTeacher/${id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get students EventTeacher report', done => {
			const id = teacher._id.toString();
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/EventTeacher/${id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get students checkListStatsTeacher report', done => {
			const id = teacher._id.toString();
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/checkListStatsTeacher/${id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get students livepoolTeacher report', done => {
			const id = teacher._id.toString();
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/livepoolTeacher/${id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get students Event report', done => {
			const id = student._id.toString();
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/Event/${id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		// it('should get students studentStats report', done => {
		// 	const id = student._id.toString();
		// 	chai
		// 		.request(server)
		// 		.get(`/api/v1/dashboard/stats/studentStats/${id}`)
		// 		.set('Authorization', `bearer ${token}`)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('should get students checkListStats report', done => {
			const id = student._id.toString();
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/checkListStats/${id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get schools dashboard details report', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/testing/app`)
				.set('Authorization', `bearer ${token}`)
				.query(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get schools branch count', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/school/branch`)
				.set('Authorization', `bearer ${token}`)
				.query(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get students count report', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/student/count`)
				.set('Authorization', `bearer ${token}`)
				.query(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get students count by body', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.post(`/api/v1/dashboard/stats/student/count`)
				.set('Authorization', `bearer ${token}`)
				.send(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get students count by classlist', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/student/class/count`)
				.set('Authorization', `bearer ${token}`)
				.query(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get students count report', done => {
			const query = {
				school_id: schools._id.toString(),
			};
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/student/class/count`)
				.set('Authorization', `bearer ${token}`)
				.query(query)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('should get students by gender and class list ', done => {
			const school_id = schools._id.toString();
			chai
				.request(server)
				.get(`/api/v1/dashboard/stats/school/${school_id}/classgendercount`)
				.set('Authorization', `bearer ${token}`)
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
