const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const SectionModel = require('../model/section');
const SchoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let section = null;
let token = null;
let schools = null;

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
	after('deleting created records', async () => {
		await SectionModel.deleteOne({ _id: section._id });
	});

	describe('creating description', async () => {
		it('it should create new section', done => {
			const acData = {
				data: [
					{
						repository: [],
						class_id: '60adea6a835f1ca1d7803612',
						name: 'section name',
						description: 'section name',
						sectionList: [
							{
								name: 'test Section',
								desc: 'testing',
							},
						],
					},
				],
			};
			chai
				.request(server)
				.post('/api/v1/section/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					section = body.newObj;
					console.log(section);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the section ', done => {
			chai
				.request(server)
				.get('/api/v1/section/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get section by id', done => {
			const id = section._id;
			chai
				.request(server)
				.get(`/api/v1/section/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update section by id', done => {
			const id = section._id;
			const updateData = { desc: 'Updated section' };
			chai
				.request(server)
				.put(`/api/v1/section/${id}`)
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
		it('it should delete an section', done => {
			const id = { _id: section._id };
			chai
				.request(server)
				.post(`/api/v1/section/delete`)
				.set('Authorization', `Bearer ${token}`)
				.send(id)
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
