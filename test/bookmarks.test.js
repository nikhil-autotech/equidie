const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const BookmarkModel = require('../model/bookmark');
const UserModel = require('../model/user');
const studentModel = require('../model/student');
const parentModel = require('../model/parent');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let bookmark = null;
let token = null;
let student = null;
let parent = null;
let bookmark_parent = null;

describe('User', () => {
	before(async () => {
		student = await studentModel.find();
	});
	before(async () => {
		parent = await parentModel.find();
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
		await BookmarkModel.deleteOne({ _id: bookmark._id });
	});

	describe('creating description', async () => {
		it('it should create new bookmark', done => {
			const acData = {
				student_id: student[0]._id,
				parent_id: parent[0]._id,
				bookmark_details: [
					{
						activity: '5fd1c755ba54044664ff8c0f',
					},
				],
				createdBy: 'Test user',
				updatedBy: 'Test user',
			};
			chai
				.request(server)
				.post('/api/v1/bookmarks/create')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					bookmark = body.data;
					console.log(bookmark);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get the bookmarks ', done => {
			const data = { student_id: bookmark.student_id };
			chai
				.request(server)
				.post('/api/v1/bookmarks/')
				.set('Authorization', `Bearer ${token}`)
				.send(data)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get the bookmarks ', done => {
			const data = { parent_id: bookmark.parent_id };
			chai
				.request(server)
				.post('/api/v1/bookmarks/parent/')
				.set('Authorization', `Bearer ${token}`)
				.send(data)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should create new bookmark for parent', done => {
			const acData = {
				parent_id: parent[1]._id,
				bookmark_details: [
					{
						activity: '5fd1c755ba54044664ff8c0f',
					},
				],
				createdBy: 'Test user',
				updatedBy: 'Test user',
			};
			chai
				.request(server)
				.post('/api/v1/bookmarks/parent/create')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					bookmark_parent = body.data;
					console.log(bookmark);
					done();
				})
				.catch(err => done(err));
		});
		it('it should update the bookmarks ', done => {
			const bodyData = {
				student_id: bookmark.student_id,
				bookmark_details: [],
			};
			chai
				.request(server)
				.post('/api/v1/bookmarks/update/')
				.set('Authorization', `Bearer ${token}`)
				.send(bodyData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should delete bookmark by student_id', done => {
			const id = bookmark.student_id;
			const data = {
				student_id: bookmark.student_id,
				activity: bookmark.bookmark_details[0].activity,
			};
			chai
				.request(server)
				.post(`/api/v1/bookmarks/delete/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(data)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should delete bookmark by parent_id', done => {
			const id = bookmark_parent.parent_id;
			const data = {
				activity: bookmark_parent.bookmark_details[0].activity,
			};
			chai
				.request(server)
				.post(`/api/v1/bookmarks/parent/delete/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(data)
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
