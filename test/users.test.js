const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const UserModel = require('../model/user');
const SchoolModel = require('../model/school');
const server = require('../index');

let user = null;
let tempToken = null;

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);
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
			role: '5fd1c4f6ba54044664ff8c0d',
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
				console.log(token);
				res.should.have.status(200);
				done();
			});
	});
	after(async () => {
		// After each test we truncate the database
		await UserModel.deleteMany(
			{ mobile: ['9876598765', '9900573822', '9900573823', '9900573821'] },
			() => {
				console.log('users deleted');
			}
		);
	});

	// console.log(path.join(__dirname, '../../../Downloads/file.csv'));
	describe('USER ROUTES APIs', () => {
		it('it should GET all the users', done => {
			chai
				.request(server)
				.get('/api/v1/SignUp?page=1&limit=5')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.have.keys('result', 'data');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should POST a user', done => {
			const book = {
				mobile: 9900573821,
				username: '9900573821',
				password: '1234',
				name: 'test',
				profile_type: '5fd1c755ba54044664ff8c0f',
				school_id: schools[0]._id,
				repository: [
					{
						id: schools[0]._id,
					},
				],
			};
			chai
				.request(server)
				.post('/api/v1/SignUp/')
				.send(book)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					const { body } = res;
					user = body.data;
					// console.log(user);
					done();
				})
				.catch(err => done(err));
		});
		it('it should GET a user by the given id', done => {
			const id = user._id;
			// console.log(id);
			chai
				.request(server)
				.get(`/api/v1/SignUp/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.keys('data');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update the existing data', done => {
			const id = user._id;
			const update = {
				mobile: 9900573821,
				name: 'test successful',
				profile_type: '5fd1c755ba54044664ff8c0f',
				password: '1234',
				school_id: schools[0]._id,
				repository: [
					{
						id: user.repository[0].id,
					},
				],
			};
			chai
				.request(server)
				.put(`/api/v1/SignUp/${id}`)
				.send(update)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should return the user information from username', done => {
			const read = { username: 9900573821 };
			chai
				.request(server)
				.post('/api/v1/SignUp/find')
				.send(read)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					const { body } = res;
					// console.log(body);
					done();
				})
				.catch(err => done(err));
		});
		it('it should return the filtered information of user', done => {
			const payload = {};
			chai
				.request(server)
				.post('/api/v1/SignUp/user/dashboard')
				.send(payload)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should return all ids  of teachers of a school', async () => {
			chai
				.request(server)
				.post('/api/v1/SignUp/getAllteacherIds')
				.query({ school_id: schools[0]._id })
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					const { body } = res;
				})
				.catch(err => err);
		});
		it('it should return logged in details', done => {
			const login = {
				username: 9900573821,
				school_code: schools[0].school_code,
				global: false,
				password: '1234',
			};
			chai
				.request(server)
				.post('/api/v1/SignUp/login')
				.send(login)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					const { body } = res;
					tempToken = body.token;
					done();
				})
				.catch(err => done(err));
		});
		// it('it should return all users Ids based on roles query payload', done => {
		// 	const payload = {
		// 		school_id: schools[0]._id,
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post('/api/v1/SignUp/userIdByRole')
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.query(payload)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.body.should.be.a('object');
		// 			const { body } = res;
		// 			// console.log(body);
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('it should return all users counts based on roles payload', done => {
			const reqbody = {
				flag: 'teacher',
				school_id: schools[0]._id,
			};
			chai
				.request(server)
				.post('/api/v1/SignUp/userByRoleCount')
				// .query()
				.send(reqbody)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					// res.body.result.should.not.be.equal(0);
					const { body } = res;
					// console.log(body);
					done();
				})
				.catch(err => done(err));
		});
		it('it should return all users information based on roles payload', done => {
			const bodypay = {
				flag: 'teacher',
				school_id: schools[0]._id,
			};
			chai
				.request(server)
				.post(`/api/v1/SignUp/userByRole`)
				.send(bodypay)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					// res.body.result.should.not.be.equal(0);
					const { body } = res;
					// console.log(body);
					done();
				})
				.catch(err => done(err));
		});
		it('it should update the pincode of user', done => {
			const Pin = {
				id: user._id,
				pincode: '1234',
			};
			chai
				.request(server)
				.post('/api/v1/SignUp/updatePinCode')
				.set('Authorization', `Bearer ${token}`)
				.send(Pin)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.have.keys('status');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update the password of user', done => {
			const Pass = {
				school_code: schools[0].school_code,
				username: user.username,
				password: '1235',
			};
			chai
				.request(server)
				.post('/api/v1/SignUp/updateUserPassword')
				.set('Authorization', `Bearer ${token}`)
				.send(Pass)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.have.keys('status', 'user');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('Mobile Login', done => {
			const login = {
				username: user.username,
				password: '1235',
			};
			chai
				.request(server)
				.post('/api/v1/SignUp/mobileLogin')
				.set('Authorization', `Bearer ${token}`)
				.send(login)
				.then(res => {
					res.should.have.status(200);
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		// it('it should get all users data based on query', done => {
		// 	// const data = {};
		// 	chai
		// 		.request(server)
		// 		.post('/api/v1/SignUp/user')
		// 		.query({ school_id: schools[0]._id })
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.body.should.be.have.keys('data', 'result');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('it should update the primary class of user', done => {
			const priClass = {
				id: user._id,
				newClassID: '60adec5f0454faa7fcfb866c',
			};
			chai
				.request(server)
				.post('/api/v1/SignUp/updateschoolid')
				.set('Authorization', `Bearer ${token}`)
				.send(priClass)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.have.keys('status');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should return all teachers data with their classes', done => {
			const Tpayload = {
				school_id: schools[0]._id,
			};
			chai
				.request(server)
				.post('/api/v1/SignUp/teacher/class')
				.set('Authorization', `Bearer ${token}`)
				.send(Tpayload)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.have.keys('status', 'classData');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should return teachers id based on filter in body', done => {
			const Ipayload = {
				username: user.username,
			};
			chai
				.request(server)
				.post('/api/v1/SignUp/teacher/id')
				.set('Authorization', `Bearer ${token}`)
				.send(Ipayload)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.have.keys('Data', 'status');
					const { body } = res;
					// console.log(body);
					done();
				})
				.catch(err => done(err));
		});
		it('it should update the device token of user', done => {
			const id = user._id;
			const Dtpayload = {
				device_token: 'abcd1234',
			};

			chai
				.request(server)
				.post(`/api/v1/SignUp/teacher/updateDeviceToken/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(Dtpayload)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.have.keys('message');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update the profile image', done => {
			const id = user._id;
			const PIpayload = {
				profile_image: 'abcdprofile1234',
			};

			chai
				.request(server)
				.post(`/api/v1/SignUp/profile/image/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(PIpayload)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.have.keys('status');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update the (about_me) description of the user', done => {
			const id = user._id;
			const description = {
				about_me: 'This is about me',
			};
			chai
				.request(server)
				.post(`/api/v1/SignUp/profile/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(description)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.have.keys('status');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		// it('it should upload multiple users ', done => {
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/SignUp/bulkupload`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.attach(path.join(__dirname, '../../../Downloads/file.csv'))
		// 		.then(res => {
		// 			// res.should.not.have.status(400);
		// 			// res.body.should.be.have.keys('message');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });

		it('it should update the state of user ', done => {
			const id = user._id;
			const Det = {
				mobile: user.mobile,
				password: '1235',
				name: user.name,
				profile_type: user.profile_type,
				repository: [
					{
						id: schools[0]._id,
					},
				],
				isSubmitForm: true,
			};
			chai
				.request(server)
				.put(`/api/v1/SignUp/updatestate/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(Det)
				.then(res => {
					res.should.have.status(201);
					res.body.should.be.have.keys('data');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should the user if exist with mobile number ', done => {
			const obj = { mobile: user.mobile };
			chai
				.request(server)
				.post(`/api/v1/SignUp/existWithMobile`)
				.set('Authorization', `Bearer ${token}`)
				.send(obj)
				.then(res => {
					res.should.have.status(200);
					res.body.flag.should.be.equal(true);
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should check the validation for user ', done => {
			const mdata = {
				mobile: user.mobile,
				type: 'principal',
				school_id: schools[0]._id,
			};
			chai
				.request(server)
				.post('/api/v1/SignUp/validationCheck')
				.set('Authorization', `Bearer ${token}`)
				.send(mdata)
				.then(res => {
					res.should.have.status(200);
					res.body.flag.should.be.equal(true);
					res.body.status.should.be.equal('Exist');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should changes the active status of user ', done => {
			const id = user._id;
			const detailObj = {
				mobile: user.mobile,
				password: '1235',
				name: user.name,
				profile_type: user.profile_type,
				repository: [
					{
						id: schools[0]._id,
					},
				],
				isSubmitForm: true,
				activeStatus: true,
			};
			chai
				.request(server)
				.put(`/api/v1/SignUp/userActiveStatus/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(detailObj)
				.then(res => {
					res.should.have.status(200);
					res.body.message.should.be.have.equal('Updated');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should delete all user by schoolID ', done => {
			const schoolId = {};
			chai
				.request(server)
				.post(`/api/v1/SignUp/deleteAllUserBySchoolId`)
				.set('Authorization', `Bearer ${token}`)
				.send(schoolId)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.have.keys('data');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should create many users at a time ', done => {
			const obj = {
				users: [
					{
						mobile: 9900573822,
						username: '9900573822',
						password: '1234',
						name: 'test1',
						profile_type: '5fd2f18f9cc6537951f0b35c',
					},
					{
						mobile: 9900573823,
						username: '9900573823',
						password: '1234',
						name: 'test2',
						profile_type: '5fd2f18f9cc6537951f0b35c',
					},
				],
			};

			chai
				.request(server)
				.post(`/api/v1/SignUp/createMany`)
				.set('Authorization', `Bearer ${token}`)
				.send(obj)
				.then(res => {
					res.should.have.status(201);
					res.body.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});

		it('it should get all data of user ', done => {
			const schoolId = {
				_id: user._id,
			};
			chai
				.request(server)
				.get(`/api/v1/SignUp/page`)
				.set('Authorization', `Bearer ${tempToken}`)
				.query(schoolId)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.have.keys('data', 'result');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get user by given payload ', done => {
			const pData = {
				school_id: schools[0]._id,
			};
			chai
				.request(server)
				.post(`/api/v1/SignUp/get`)
				.set('Authorization', `Bearer ${tempToken}`)
				.send(pData)
				.then(res => {
					res.should.have.status(201);
					res.body.should.be.have.keys('data', 'result');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should delete user by school ', done => {
			const user_id = user._id.toString();
			console.log(user._id);
			const details = {
				// isGlobal: 'no',
				// isStudent: 'no',
				repositoryId: user.repository[0].id,
				userId: user_id,
			};
			console.log(user.repository[0].id);
			chai
				.request(server)
				.post(`/api/v1/SignUp/deleteUser`)
				.set('Authorization', `Bearer ${tempToken}`)
				.send(details)
				.then(res => {
					res.should.have.status(200);
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
	});
});
