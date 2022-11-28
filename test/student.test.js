const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const StudentModel = require('../model/student');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let student = null;
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
		await StudentModel.deleteMany({ _id: student._id }, () => {
			console.log('student deleted');
		});
	});

	describe('creating description', async () => {
		it('it should create new student', done => {
			const acData = {
				school_id: schools[0]._id,
				name: 'test',
				gender: 'Male',
				class: schools[0].classList[0],
				branch_id: schools[0].branch_id,
				country: '60b499b8cca795cf59c4bc1b',
				state: '628b63eb268967112ca0b19e',
				city: '628b63ed268967112ca0b1e3',
				section: '623334f8eec609c379b97c4b',
				guardian: 'father',
				primaryParent: 'father',
				father_name: 'test father',
				f_contact_number: 7788996655,
				mobile_to_reg_student: 7788996655,
				username: 7788996655,
				p_username: 7788996655,
				password: '1234',
				activeStatus: true,
			};
			chai
				.request(server)
				.post('/api/v1/student/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					student = body.data;
					console.log(student);
					done();
				})
				.catch(err => done(err));
		});
		// it('it should get all the students ', done => {
		// 	const queryPay = {
		// 		school_id: schools[0]._id,
		// 	};
		// 	chai
		// 		.request(server)
		// 		.get('/api/v1/student/')
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.query(queryPay)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('it should login student', done => {
			const updateData = {
				password: '1234',
				username: student._id,
			};
			chai
				.request(server)
				.post(`/api/v1/student/login`)
				.send(updateData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should search', done => {
			const updateData = {
				searchValue: '',
				filterKeysArray: ['name'],
			};
			chai
				.request(server)
				.post(`/api/v1/student/search`)
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
		it('it should find student', done => {
			const updateData = {
				username: '7788996655',
			};
			chai
				.request(server)
				.post(`/api/v1/student/find`)
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
		it('it should update password of student', done => {
			const updateData = {
				id: student._id,
				password: '98765',
			};
			chai
				.request(server)
				.post(`/api/v1/student/updatePassword`)
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
		it('it should update profile of student by id', done => {
			const id = student._id;
			const updateData = {
				about_me: 'about_me updated',
			};
			chai
				.request(server)
				.post(`/api/v1/student/profile/${id}`)
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
		it('it should update class id of student', done => {
			const updateData = {
				newClassId: schools[0].classList[1],
			};
			chai
				.request(server)
				.post(`/api/v1/student/Studentclassid`)
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
		it('it should update profile image of student by id', done => {
			const id = student._id;
			const updateData = {
				profile_image: 'profile_image/stirng',
			};
			chai
				.request(server)
				.post(`/api/v1/student/profile/image/${id}`)
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
		// it('it should get student list', done => {
		// 	chai
		// 		.request(server)
		// 		.get('/api/v1/student/studentlist/')
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('it should update student by id', done => {
			const id = student._id;
			const updateData = {
				name: 'updated',
			};
			chai
				.request(server)
				.put(`/api/v1/student/student/${id}`)
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
		it('it should update student active status by id', done => {
			const id = student._id;
			const updateData = {
				activeStatus: false,
			};
			chai
				.request(server)
				.put(`/api/v1/student/studentActiveStatus/${id}`)
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
		it('it should get dashboard of students ', done => {
			const queryData = {
				_id: student._id,
			};
			chai
				.request(server)
				.get('/api/v1/student/dashboard/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get dashboard of students ', done => {
			const queryData = {
				_id: student._id,
			};
			chai
				.request(server)
				.post(`/api/v1/student/dashboard`)
				.set('Authorization', `Bearer ${token}`)
				.send(queryData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get dashboard of students count ', done => {
			const queryData = {
				_id: student._id,
			};
			chai
				.request(server)
				.post(`/api/v1/student/dashboardCount`)
				.set('Authorization', `Bearer ${token}`)
				.send(queryData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get students with parent ', done => {
			const queryData = {
				_id: student._id,
			};
			chai
				.request(server)
				.get('/api/v1/student/studentwithparent')
				.set('Authorization', `Bearer ${token}`)
				.query(queryData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		// it('it should bulk upload', done => {
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/student/bulkUpload`)
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
		// it('it should delete all students by school id', done => {
		// 	const updateData = { schoolId: 'school Id' };
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/student/deleteAllStudentBySchoolId`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(updateData)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		// it('it should delete all students by school id and class id', done => {
		// 	const updateData = { schoolId: 'school Id', classId: 'class Id' };
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/student/deleteAllStudentByClass`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(updateData)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		// it('it should delete all students by school id, class id and section id', done => {
		// 	const updateData = {
		// 		schoolId: 'school Id',
		// 		classId: 'class Id',
		// 		sectionId: 'section Id',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/student/deleteAllStudentByClass`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(updateData)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('it should get student id', done => {
			const queryData = {
				school_id: student.school_id,
			};
			chai
				.request(server)
				.get('/api/v1/student/GetAllStudentIds')
				.set('Authorization', `Bearer ${token}`)
				.query(queryData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		// it('it should add active status in users', done => {
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/student/addActiveStatusInUsers`)
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
		// it('it should delete section from student', done => {
		// 	const updateData = { schoolId: schoo, section: 'section Id' };
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/student/deleteSectionFromStudents`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(updateData)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		// it('it should create many student', done => {
		// 	const acData = {
		// 		student_list: [
		// 			{
		// 				activeStatus: true,
		// 				username: '9900573813',
		// 				password: '1234',
		// 				profile_type: 'Student',
		// 				school_id: schools[0]._id,
		// 				name: 'Test name 2',
		// 				class: schools[0].classList[0],
		// 				section: '623334f8eec609c379b97c4b',
		// 				parent_id: '623334f8eec609c379b97c4b',
		// 			},
		// 			{
		// 				activeStatus: true,
		// 				username: '9900573814',
		// 				password: '1234',
		// 				profile_type: 'Student',
		// 				school_id: schools[0]._id,
		// 				name: 'Test name 3',
		// 				class: schools[0].classList[0],
		// 				section: '623334f8eec609c379b97c4b',
		// 				parent_id: '623334f8eec609c379b97c4b',
		// 			},
		// 		],
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post('/api/v1/student/createManyStudent/')
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(acData)
		// 		.then(res => {
		// 			res.should.have.status(201);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('it should get all the students ', done => {
			const queryData = {
				_id: student._id,
			};
			chai
				.request(server)
				.get('/api/v1/student/get')
				.set('Authorization', `Bearer ${token}`)
				.query(queryData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all students ', done => {
			const updateData = {
				school_id: student.school_id,
				section: student.section,
			};
			chai
				.request(server)
				.post('/api/v1/student/getAllStudents')
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
		it('it should update device token of student by id', done => {
			const id = student._id;
			const updateData = { device_token: 'device token' };
			chai
				.request(server)
				.put(`/api/v1/student/updateDeviceToken/${id}`)
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
		it('it should get by section id', done => {
			const updateData = {
				schoolId: student.school_id,
				classId: student.class,
				sectionId: student.section,
			};
			chai
				.request(server)
				.post(`/api/v1/student/getBySectionId`)
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
		it('it should get student by id', done => {
			const id = student._id;
			chai
				.request(server)
				.get(`/api/v1/student/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get by school', done => {
			const id = student.school_id;
			const page = 5;
			const limit = 10;
			chai
				.request(server)
				.get(`/api/v1/student/byschool/${id}/${page}/${limit}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		// it('it should update by school id', done => {
		// 	const id = student.school_id;
		// 	const page = 5;
		// 	const limit = 10;
		// 	const bodyData = {};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/student/byschool/${id}/${page}/${limit}`)
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
		it('it should update student by id', done => {
			const id = student._id;
			const updateData = {
				name: 'test updated',
			};
			chai
				.request(server)
				.put(`/api/v1/student/student/${id}`)
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
		it('it should get count by school id', done => {
			const id = student.school_id;

			chai
				.request(server)
				.get(`/api/v1/student/count/byschool/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		// it('it should parent validation number', done => {
		// 	const id = { mobile: 'mobile', guardian: 'guardian' };
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/student/parentNumberValidation`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(id)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			console.log(body.message);
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
	});
});
