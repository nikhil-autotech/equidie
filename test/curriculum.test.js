const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const UserModel = require('../model/user');
const institutionModel = require('../model/institute');
const server = require('../index');
const curriculumModel = require('../model/curriculum');

const should = chai.should();

chai.use(chaiHttp);

let token = null;
let curriculum = null;
let institute = null;

describe('user', () => {
	before(async () => {
		institute = await institutionModel.findOne();
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
		await curriculumModel.deleteOne({ _id: curriculum._id }, () => {
			console.log('institution deleted');
		});
	});

	describe('creating curriculum', async () => {
		it('should create curriculum', async () => {
			const curriculumData = {
				name: 'test curriculum',
				description: 'test description',
				institute_id: institute._id,
				created_by: '5fd1c755ba54044664ff8c0f',
			};
			const res = await chai
				.request(server)
				.post('/api/v1/curriculum/')
				.set('Authorization', `Bearer ${token}`)
				.send(curriculumData);
			curriculum = res.body.data;
			res.should.have.status(201);
			res.body.data.should.be.a('object');
			res.body.data.should.have.property('_id');
			res.body.data.should.have.property('name');
			res.body.data.should.have.property('description');
			res.body.data.should.have.property('institute_id');
			res.body.data.should.have.property('created_by');
			res.body.data.should.have.property('createdAt');
			res.body.data.should.have.property('updatedAt');
		});
		it('should not create curriculum without name', async () => {
			const curriculumData = {
				description: 'test description',
				institute_id: institute._id,
				created_by: '5fd1c755ba54044664ff8c0f',
			};
			const res = await chai
				.request(server)
				.post('/api/v1/curriculum/')
				.set('Authorization', `Bearer ${token}`)
				.send(curriculumData);
			res.should.have.status(411);
			res.body.should.be.a('object');
			res.body.should.have.property('message');
		});
		it('get all curriculums', async () => {
			const res = await chai
				.request(server)
				.get('/api/v1/curriculum')
				.set('Authorization', `Bearer ${token}`)
				.query({ institute_id: institute._id.toString() });
			res.should.have.status(200);
			res.body.data.should.be.a('array');
		});
		it('get curriculum by id', async () => {
			const res = await chai
				.request(server)
				.get(`/api/v1/curriculum/${curriculum._id}`)
				.set('Authorization', `Bearer ${token}`);
			res.should.have.status(200);
			res.body.data.should.be.a('object');
			res.body.data.should.have.property('_id');
			res.body.data.should.have.property('name');
			res.body.data.should.have.property('description');
			res.body.data.should.have.property('institute_id');
		});
		it('should not get curriculum by id', async () => {
			const res = await chai
				.request(server)
				.get(`/api/v1/curriculum/5fda8f8fba54044664ff8c0f`)
				.set('Authorization', `Bearer ${token}`);
			res.should.have.status(404);
			res.body.should.be.a('object');
			res.body.should.have.property('message');
		});
		it('should update curriculum', async () => {
			const res = await chai
				.request(server)
				.put(`/api/v1/curriculum/${curriculum._id}`)
				.set('Authorization', `Bearer ${token}`)
				.send({
					name: 'test curriculum updated',
					description: 'test description updated',
				});
			res.should.have.status(201);
			res.body.data.should.be.a('object');
			res.body.data.should.have.property('_id');
			res.body.data.should.have.property('name');
			res.body.data.should.have.property('description');
			res.body.data.should.have.property('institute_id');
			res.body.data.should.have.property('created_by');
		});
		it('should delete curriculum', async () => {
			const res = await chai
				.request(server)
				.delete(`/api/v1/curriculum/${curriculum._id}`)
				.set('Authorization', `Bearer ${token}`);
			res.should.have.status(200);
			res.body.data.should.be.a('object');
		});
	});
});
