const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const featuresModel = require('../model/features');
const server = require('../index');
const UserModel = require('../model/user');

const should = chai.should();
chai.use(chaiHttp);

let token = null;
let newFeature = null;

describe('Content Group', () => {
	before(async () => {
		const defaultUser = new UserModel({
			_id: mongoose.Types.ObjectId(),
			mobile: 9876598765,
			password: '1234',
			name: 'test',
			profile_type: '5fd1c755ba54044664ff8c0f',
			role: '5fd1c755ba54044664ff8c0f',
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
			.then(res => {
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

	describe('Features route APIS', async () => {
		it('should create a feature', done => {
			const features = {
				name: 'test feature',
				description: 'test description',
				application: ['TEACHER_APP', 'STUDENT_APP'],
				flag: true,
			};
			chai
				.request(server)
				.post('/api/v1/features/create')
				.set('Authorization', `bearer ${token}`)
				.send(features)
				.then(res => {
					newFeature = res.body.data;
					res.should.have.status(201);
					newFeature.should.have.property('name');
					newFeature.should.have.property('description');
					newFeature.should.have.property('application');
					newFeature.should.have.property('flag');
					newFeature.should.have.property('_id');
					done();
				})
				.catch(err => {
					done(err);
				});
		});
		it('should not create without name', done => {
			const features = {
				description: 'test description',
				applied_to: ['TEACHER_APP'],
				flag: true,
			};
			chai
				.request(server)
				.post('/api/v1/features/create')
				.set('Authorization', `bearer ${token}`)
				.send(features)
				.then(res => {
					res.should.have.status(400);
					done();
				})
				.catch(err => {
					done(err);
				});
		});
		it('should not create without application', done => {
			const features = {
				name: 'test feature',
				description: 'test description',
				flag: true,
			};
			chai
				.request(server)
				.post('/api/v1/features/create')
				.set('Authorization', `bearer ${token}`)
				.send(features)
				.then(res => {
					res.should.have.status(400);
					done();
				})
				.catch(err => {
					done(err);
				});
		});
		it('should not create without flag', done => {
			const features = {
				name: 'test feature',
				description: 'test description',
				applied_to: ['TEACHER_APP'],
			};
			chai
				.request(server)
				.post('/api/v1/features/create')
				.set('Authorization', `bearer ${token}`)
				.send(features)
				.then(res => {
					res.should.have.status(400);
					done();
				})
				.catch(err => {
					done(err);
				});
		});
		it('should not create if name already exists', done => {
			const features = {
				name: 'test feature',
				description: 'test description',
				applied_to: ['TEACHER_APP'],
				flag: true,
			};
			chai
				.request(server)
				.post('/api/v1/features/create')
				.set('Authorization', `bearer ${token}`)
				.send(features)
				.then(res => {
					res.should.have.status(400);
					done();
				})
				.catch(err => {
					done(err);
				});
		});
		it('should get all features', done => {
			chai
				.request(server)
				.get(`/api/v1/features/get?application=TEACHER_APP`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					console.log(res.body);
					res.should.have.status(200);
					res.body.should.have.property('data');
					res.body.data.should.be.a('array');
					done();
				})
				.catch(err => {
					done(err);
				});
		});
		it('should get a feature', done => {
			chai
				.request(server)
				.get(`/api/v1/features/${newFeature._id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.body.should.have.property('data');
					res.body.data.should.be.a('object');
					done();
				})
				.catch(err => {
					done(err);
				});
		});
		it('should update a feature', done => {
			const updated = {
				flag: false,
			};
			chai
				.request(server)
				.put(`/api/v1/features/${newFeature._id}`)
				.set('Authorization', `bearer ${token}`)
				.send(updated)
				.then(res => {
					res.should.have.status(200);
					res.body.should.have.property('data');
					res.body.data.should.be.a('object');
					done();
				})
				.catch(err => {
					done(err);
				});
		});
		// it('should delete a feature', done => {
		// 	chai
		// 		.request(server)
		// 		.delete(`/api/v1/features/${newFeature._id}`)
		// 		.set('Authorization', `bearer ${token}`)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.body.should.have.property('data');
		// 			res.body.data.should.be.a('object');
		// 			done();
		// 		})
		// 		.catch(err => {
		// 			done(err);
		// 		});
		// });
		// it('should return 404 if feature not found', done => {
		// 	chai
		// 		.request(server)
		// 		.get(`/api/v1/features/${newFeature._id}`)
		// 		.set('Authorization', `bearer ${token}`)
		// 		.then(res => {
		// 			res.should.have.status(404);
		// 			done();
		// 		})
		// 		.catch(err => {
		// 			done(err);
		// 		});
		// });
	});
});
