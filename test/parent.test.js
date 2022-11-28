const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const ParentModel = require('../model/parent');
const UserModel = require('../model/user');
const schoolModel = require('../model/school');
const sectionModel = require('../model/section');
const studentModel = require('../model/student');
const server = require('../index');
const { student_details } = require('../controller/student');

const should = chai.should();
chai.use(chaiHttp);

let schools = null;
let token = null;
let section = null;
let student = null;

describe('User', () => {
	before(async () => {
		schools = await schoolModel.findOne({});
		section = await sectionModel.findOne({});
		student = await studentModel.findOne({});
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

	describe('parent modules routes', async () => {
		it('should get parents details by section id', done => {
			const acData = {
				section: section._id,
			};
			chai
				.request(server)
				.post('/api/v1/parent/getBySectionId')
				.set('Authorization', `bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		// it('should replace parents ids if more then one', done => {
		// 	chai
		// 		.request(server)
		// 		.get('/api/v1/parent/replace')
		// 		.set('Authorization', `bearer ${token}`)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		// // it('login for parents', done => {
		// 	const cred = {
		// 		username: '',
		// 		password: '',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post('/api/v1/parent/login')
		// 		.set('Authorization', `bearer ${token}`)
		// 		.send(cred)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('should return the student information', done => {
			const payload = {
				username: student.username,
			};
			chai
				.request(server)
				.post('/api/v1/parent/find')
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
		// it('should update the password of parent', done => {
		// 	const id = {
		// 		id: parent._id,
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post('/api/v1/parent/updatePassword')
		// 		.set('Authorization', `bearer ${token}`)
		// 		.send(id)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		// it('should update the profile image', done => {
		// 	const id = parent._id;
		// 	const payload1 = {
		// 		profile_image: 'string_image',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/parent/profile/image/${id}`)
		// 		.set('Authorization', `bearer ${token}`)
		// 		.send(payload1)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		// it('should update device token fo parent', done => {
		// 	const id = parent._id;
		// 	const device = {
		// 		device_token: 'stringfordevicetoken',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/parent/updateDeviceToken/${id}`)
		// 		.set('Authorization', `bearer ${token}`)
		// 		.send(device)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('should get the parent progress by id', done => {
			const id = {
				parent_id: student.parent_id,
			};
			chai
				.request(server)
				.post('/api/v1/parent/getProgress')
				.set('Authorization', `bearer ${token}`)
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
