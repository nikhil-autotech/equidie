const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const contentModel = require('../model/contentGroup');
const server = require('../index');
const curriculumModel = require('../model/curriculum');
const UserModel = require('../model/user');

const should = chai.should();
chai.use(chaiHttp);

let token = null;
let content = null;
let curriculum = null;

describe('Content Group', () => {
	before(async () => {
		curriculum = await curriculumModel.findOne();
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
		await contentModel.deleteOne({ _id: content._id }, () => {
			console.log('content deleted');
		});
	});

	describe('creating content group', async () => {
		it('should create content group', async () => {
			const contentGroup = {
				group_name: 'test group',
				description: 'testing content group',
				curriculum: curriculum._id,
				created_by: '60ade80c835f1ca1d780360d',
			};
			const res = await chai
				.request(server)
				.post('/api/v1/contentGroup')
				.set('Authorization', `Bearer ${token}`)
				.send(contentGroup);
			res.should.have.status(201);
			res.body.data.should.be.a('object');
			res.body.data.should.have.property('group_name');
			res.body.data.should.have.property('description');
			res.body.data.should.have.property('curriculum');
			res.body.data.should.have.property('_id');
			content = res.body.data;
			console.log(content);
		});
	});
	describe('get content group', async () => {
		it('should get content group', async () => {
			const res = await chai
				.request(server)
				.get('/api/v1/contentGroup')
				.set('Authorization', `Bearer ${token}`)
				.query({ curriculum: curriculum._id.toString() });
			res.should.have.status(200);
			res.body.data.should.be.a('array');
		});
		it('should add user to userList', async () => {
			const res = await chai
				.request(server)
				.post(`/api/v1/contentGroup/${content._id}/users`)
				.set('Authorization', `Bearer ${token}`)
				.send({
					user_id: '6233324ce8172cc35322969c',
				});
			res.should.have.status(201);
			res.body.data.should.be.a('object');
			res.body.data.should.have.property('userList');
			res.body.data.userList.should.not.be.equal('[]');
			res.body.data.should.have.property('_id');
		});
		it('should get teacher status', async () => {
			const payload = {
				curriculum: curriculum._id,
				user_id: '6233324ce8172cc35322969c',
				limit: 5,
				page: 0,
			};
			const res = await chai
				.request(server)
				.post(`/api/v1/contentGroup/teacher`)
				.set('Authorization', `Bearer ${token}`)
				.send(payload);
			res.should.have.status(200);
			res.body.data.should.be.a('array');
			// res.body.data.status.should.equal('requested');
			// res.body.data.should.have.property('_id');
		});
		it('should get userList of reqested users', async () => {
			const res = await chai
				.request(server)
				.get(`/api/v1/contentGroup/${content._id}/users`)
				.set('Authorization', `Bearer ${token}`);
			res.should.have.status(200);
			res.body.data.should.be.a('array');
		});
		it('should change status of user', async () => {
			const res = await chai
				.request(server)
				.post(`/api/v1/contentGroup/${content._id}/user/status`)
				.set('Authorization', `Bearer ${token}`)
				.send({
					user_id: '6233324ce8172cc35322969c',
					status: 'approved',
				});
			res.should.have.status(201);
			res.body.data.should.be.a('object');
			res.body.data.should.have.property('userList');
			res.body.data.userList.should.not.be.equal('[]');
			res.body.data.should.have.property('_id');
		});
		it('should return error if no users are requested', async () => {
			const res = await chai
				.request(server)
				.get(`/api/v1/contentGroup/${content._id}/users`)
				.set('Authorization', `Bearer ${token}`);
			res.should.have.status(404);
			res.body.should.be.a('object');
			res.body.should.have.property('message');
			res.body.message.should.equal('No users found');
		});
		it('should get usercount of content group', async () => {
			const res = await chai
				.request(server)
				.post(`/api/v1/contentGroup/userCount`)
				.set('Authorization', `Bearer ${token}`)
				.send({
					curriculum: curriculum._id,
				});
			const count = res.body.data[0];
			res.should.have.status(200);
			res.body.data.should.be.a('array');
			count.should.have.property('group_name');
			count.should.have.property('requested_count');
			count.should.have.property('approved_count');
		});
		it('should add post to a group', async () => {
			const res = await chai
				.request(server)
				.post(`/api/v1/contentGroup/${content._id}/posts`)
				.set('Authorization', `Bearer ${token}`)
				.send({
					file: 'String/s3/file/test',
					file_name: 's3testing2',
					description: 'testing verify post api',
					file_type: 'image',
					uploaded_by: '62bbea2850414217a0dbf741',
				});
			res.should.have.status(201);
			res.body.data.should.be.a('object');
			res.body.data.should.have.property('posts');
			res.body.data.should.have.property('_id');
		});
		it('should get posts of a group', async () => {
			const res = await chai
				.request(server)
				.get(`/api/v1/contentGroup/${content._id}/posts`)
				.set('Authorization', `Bearer ${token}`);
			res.should.have.status(200);
			res.body.data.should.be.a('array');
		});
	});
});
