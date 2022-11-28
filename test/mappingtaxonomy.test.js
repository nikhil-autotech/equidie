const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const taxonomyMappingModel = require('../model/mappingTaxonomyModel');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let mappingtaxonomy = null;
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
		await taxonomyMappingModel.deleteOne({ _id: mappingtaxonomy._id }, () => {
			console.log('mappingtaxonomy deleted');
		});
	});

	describe('creating description', async () => {
		it('it should create new mappingtaxonomy', done => {
			const acData = {
				class_id: '60adec830454faa7fcfb867b',
				board_id: '60adec830454faa7fcfb8671',
				syllabus_id: '60adec830454faa7fcfb8671',
				subject_id: '60adec830454faa7fcfb8671',
				repository: [
					{
						id: '60adec830454faa7fcfb8671',
					},
				],
				createdBy: 'Test',
			};
			chai
				.request(server)
				.post('/api/v1/mappingtaxonomy')
				.set('Authorization', `Bearer ${token}`)
				.query({
					class_id: '60adec830454faa7fcfb867c',
				})
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					mappingtaxonomy = body.data;
					console.log(mappingtaxonomy);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the mappingtaxonomyes ', done => {
			chai
				.request(server)
				.get('/api/v1/mappingtaxonomy/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get mappingtaxonomy by id', done => {
			const id = mappingtaxonomy._id;
			chai
				.request(server)
				.get(`/api/v1/mappingtaxonomy/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update mappingtaxonomy by id', done => {
			const id = mappingtaxonomy._id;
			const updateData = {
				class_id: '60d7e49a081be23c967a6c8f',
			};
			chai
				.request(server)
				.put(`/api/v1/mappingtaxonomy/${id}`)
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
		it('it should delete mappingtaxonomy by id', done => {
			const id = mappingtaxonomy._id;
			chai
				.request(server)
				.delete(`/api/v1/mappingtaxonomy/${id}`)
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
