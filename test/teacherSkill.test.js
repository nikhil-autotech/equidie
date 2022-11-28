const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const TeacherSkillModel = require('../model/teacherSkill');
const schoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let teacherSkill = null;
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
		await TeacherSkillModel.deleteOne({ _id: teacherSkill._id });
	});
	describe('creating description', async () => {
		it('it should create new teacher skill', done => {
			const acData = {
				class_id: '60adec5f0454faa7fcfb866c',
				teacher_id: '5fd1c755ba54044664ff8c0f',
				skill: 'skill',
			};
			chai
				.request(server)
				.post('/api/v1/teacher/skill')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					teacherSkill = body.data;
					console.log(teacherSkill);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all teacher skill ', done => {
			chai
				.request(server)
				.get('/api/v1/teacher/skill')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get teacher skill by id', done => {
			const id = teacherSkill._id;
			chai
				.request(server)
				.get(`/api/v1/teacher/skill/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update teacher skill by id', done => {
			const id = teacherSkill._id;
			const updateData = {
				skill: 'skill updated',
			};
			chai
				.request(server)
				.put(`/api/v1/teacher/skill/${id}`)
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
	});
});
