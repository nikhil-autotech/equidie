const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const contentModel = require('../model/contentGroup');
const server = require('../index');
const UserModel = require('../model/user');

const should = chai.should();
chai.use(chaiHttp);

let token = null;
let post = null;
let group = null;

describe('Content Group', () => {
	before(async () => {
		group = await contentModel.findOne();
	});
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

	describe('post route APIS', async () => {
		it('should create a post', done => {
			const contentGroup = {
				file: ['test', 'test2'],
				file_name: 'test post',
				description: 'test',
				group_id: group._id,
				uploaded_by: '5fd1c755ba54044664ff8c0f',
			};
			chai
				.request(server)
				.post('/api/v1/post/')
				.set('Authorization', `bearer ${token}`)
				.send(contentGroup)
				.then(res => {
					post = res.body.data;
					res.should.have.status(201);
					res.body.should.be.a('object');
					post.should.have.property('file');
					post.should.have.property('description');
					post.should.have.property('group_id');
					post.should.have.property('_id');
					done();
				})
				.catch(err => done(err));
		});
		it('should not create a post without file', done => {
			const contentGroup = {
				file_name: 'test post',
				description: 'test',
				group_id: group._id,
				uploaded_by: '5fd1c755ba54044664ff8c0f',
			};
			chai
				.request(server)
				.post('/api/v1/post/')
				.set('Authorization', `bearer ${token}`)
				.send(contentGroup)
				.then(res => {
					res.should.have.status(400);
					done();
				})
				.catch(err => done(err));
		});
		it('should not create a post without file_name', done => {
			const contentGroup = {
				file: ['test', 'test2'],
				description: 'test',
				group_id: group._id,
				uploaded_by: '5fd1c755ba54044664ff8c0f',
			};
			chai
				.request(server)
				.post('/api/v1/post/')
				.set('Authorization', `bearer ${token}`)
				.send(contentGroup)
				.then(res => {
					res.should.have.status(400);
					done();
				})
				.catch(err => done(err));
		});
		it('should not create a post without group_id', done => {
			const contentGroup = {
				file: ['test', 'test2'],
				file_name: 'test post',
				description: 'test',
				uploaded_by: '5fd1c755ba54044664ff8c0f',
			};
			chai
				.request(server)
				.post('/api/v1/post/')
				.set('Authorization', `bearer ${token}`)
				.send(contentGroup)
				.then(res => {
					res.should.have.status(400);
					done();
				})
				.catch(err => done(err));
		});
		it('should not create a post without uploaded_by', done => {
			const contentGroup = {
				file: ['test', 'test2'],
				file_name: 'test post',
				description: 'test',
				group_id: group._id,
			};
			chai
				.request(server)
				.post('/api/v1/post/')
				.set('Authorization', `bearer ${token}`)
				.send(contentGroup)
				.then(res => {
					res.should.have.status(400);
					done();
				})
				.catch(err => done(err));
		});
		it('should get all posts', done => {
			chai
				.request(server)
				.get(`/api/v1/post?group_id=${group._id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('data');
					res.body.data.should.be.a('array');
					done();
				})
				.catch(err => done(err));
		});
		it('should get a post', done => {
			const id = post._id;
			chai
				.request(server)
				.get(`/api/v1/post/${id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('data');
					done();
				})
				.catch(err => done(err));
		});
		it('should update a post', done => {
			const id = post._id;
			const contentGroup = {
				file_name: 'test post',
			};
			chai
				.request(server)
				.put(`/api/v1/post/${id}`)
				.set('Authorization', `bearer ${token}`)
				.send(contentGroup)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('data');
					done();
				})
				.catch(err => done(err));
		});
		it('should delete a post', done => {
			const id = post._id;
			chai
				.request(server)
				.delete(`/api/v1/post/${id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.should.have.property('data');
					done();
				})
				.catch(err => done(err));
		});
		it('should return 404 if post not found', done => {
			const id = '5fd1c755ba54044664ff8c0f';
			chai
				.request(server)
				.get(`/api/v1/post/${id}`)
				.set('Authorization', `bearer ${token}`)
				.then(res => {
					res.should.have.status(404);
					done();
				})
				.catch(err => done(err));
		});
	});
});
