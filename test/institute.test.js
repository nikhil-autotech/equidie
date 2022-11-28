const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const InstituteModel = require('../model/institute');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let institute = null;
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
		await InstituteModel.deleteOne({ instituteName: 'Test Institute' });
	});

	describe('creating description', async () => {
		it('it should create new institute', done => {
			const acData = {
				name: 'Test_Institute',
				institute_code: '0010',
				instituteImage: 'String',
				address: 'String',
				city: '60fbda40d4fbdfe05d23e6d4',
				state: '60fbda3fd4fbdfe05d23e67a',
				country: '60b499b8cca795cf59c4bc1b',
				email: 'String@gmail.com',
				webSite: 'String',
				contact_number: '0123456789',
				pincode: '78495',
				schoolList: [],
				activeStatus: true,
				createdBy: 'String',
				updatedBy: 'String',
			};
			chai
				.request(server)
				.post('/api/v1/institute/create/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					institute = body.data;
					console.log(institute);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the institute ', done => {
			chai
				.request(server)
				.get('/api/v1/institute/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update institute by id', done => {
			const updateData = {
				_id: institute._id,
				name: 'Updated Test Institute',
			};
			chai
				.request(server)
				.post(`/api/v1/institute/updateInstitute/`)
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
		it('it should update institute schoolList', done => {
			const updateData = {
				id: institute._id,
				schoolList: [],
			};
			chai
				.request(server)
				.post(`/api/v1/institute/updateSchoolList/`)
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
		it('it should remove school from institute', done => {
			const id = institute._id;
			const acData = {
				schoolId: schools[0]._id,
			};
			chai
				.request(server)
				.post(`/api/v1/institute/removeSchool/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get institute by id', done => {
			const id = institute._id;
			chai
				.request(server)
				.get(`/api/v1/institute/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should delete institute by id', done => {
			const id = institute._id;
			chai
				.request(server)
				.delete(`/api/v1/institute/delete/${id}`)
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
