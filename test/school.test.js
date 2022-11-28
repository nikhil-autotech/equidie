const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const SchoolModel = require('../model/school');
const UserModel = require('../model/user');
const server = require('../index');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let school = null;
let token = null;
let school2 = null;

describe('User', () => {
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
		await SchoolModel.deleteOne({ schoolName: 'String' });
	});

	describe('creating description', async () => {
		// after('deleting created records', async () => {
		// 	await SchoolModel.deleteOne({ schoolName: 'String' });
		// });
		it('it should create new school', done => {
			const acData = {
				schoolName: 'String',
				schoolImage: 'String',
				address: 'String',
				city: '60fbda40d4fbdfe05d23e6d4',
				state: '60fbda3fd4fbdfe05d23e67a',
				country: '60b499b8cca795cf59c4bc1b',
				branchNumber: '01',
				branchName: 'String',
				board: 'String ',
				email: 'a@gmail.com',
				webSite: 'String',
				contact_number: '98756',
				pincode: '741234 ',
				sType: '6155b3403f741836b8be5773',
				classList: [],
				subjectList: [],
				syllabusList: [],
				branch: [],
				activeStatus: true,
				repository: 'Array',
				createdBy: 'String ',
				updatedBy: 'String ',
			};
			chai
				.request(server)
				.post('/api/v1/school/')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					school = body.data.class;
					console.log(school);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get all the schools ', done => {
			chai
				.request(server)
				.get('/api/v1/school/')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		// it('it should get all updated school code', done => {
		// 	const id = {};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/school/getAllUpdateSchoolCode`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(id)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			console.log(body.message);
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('it should update every school newUpdate fields', done => {
			const payload = {
				newUpdate: false,
			};
			chai
				.request(server)
				.post(`/api/v1/school/newUpdate`)
				.set('Authorization', `Bearer ${token}`)
				.send(payload)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});

		it('it should delete students and parents from school id', done => {
			const id = {
				userDeleteFlag: true,
				studentDeleteFlag: true,
				parentDeleteFlag: true,
				schoolId: school._id,
			};
			chai
				.request(server)
				.post(`/api/v1/school/deleteParentAndStudentFromSchoolId`)
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
		it('it should get school by id', done => {
			const id = school._id;
			chai
				.request(server)
				.get(`/api/v1/school/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update school by id', done => {
			const id = school._id;
			const updateData = {
				classList: [],
			};
			chai
				.request(server)
				.put(`/api/v1/school/${id}`)
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
		// ws

		it('it should get school mapping by id', done => {
			const id = school._id;
			chai
				.request(server)
				.get(`/api/v1/school/mapping/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should delete mapping of school', done => {
			const id = school._id;
			chai
				.request(server)
				.delete(`/api/v1/school/mapping/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get single school by id', done => {
			const id = school._id;
			chai
				.request(server)
				.get(`/api/v1/school/newapi/getschool/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update class list make it empty', done => {
			chai
				.request(server)
				.get(`/api/v1/school/newapi/updateschoolclasslist`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should filter', done => {
			const acData = {};
			chai
				.request(server)
				.post('/api/v1/school/filter')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					school = body.data;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get single school by state id', done => {
			const id = '60fbda3fd4fbdfe05d23e67a';
			chai
				.request(server)
				.get(`/api/v1/school/newapi/getschools/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should get the schools ', done => {
			chai
				.request(server)
				.get('/api/v1/school/newapi/getschool')
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should new api create new school', done => {
			const acData = {
				schoolName: 'Sschool',
				schoolImage: 'String',
				address: 'String',
				cityId: '60fbda40d4fbdfe05d23e6d4',
				stateId: '60fbda3fd4fbdfe05d23e67a',
				countryId: '60b499b8cca795cf59c4bc1b',
				branchNumber: '01',
				branchName: 'String',
				board: '',
				branch: [],
				schoolEmail: 'aasan@gmail.com',
				webSite: 'String',
				SchoolContactNumber: '9875612312',
				pincode: '741234',
				institutionTypeId: '6155b3403f741836b8be5773',
			};
			chai
				.request(server)
				.post('/api/v1/school/newapi/create/addschool')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					school2 = body.data;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update school by id new api', done => {
			const id = school2.schoolId;
			const updateData = {
				schoolName: 'School Updated',
			};
			chai
				.request(server)
				.put(`/api/v1/school/newapi/updateschool/${id}`)
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
		// it('it should update branch city name', done => {
		// 	const updateData = {};
		// 	chai
		// 		.request(server)
		// 		.put(`/api/v1/school/newapi/updatebranchcity/city`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(updateData)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		// it('it should update active status', done => {
		// 	const acData = { repositoryId: school2.SchoolId, activeStatus: false };
		// 	chai
		// 		.request(server)
		// 		.post('/api/v1/school/updateActiveStatus')
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(acData)
		// 		.then(res => {
		// 			res.should.have.status(201);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			school = body.data;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		// it('it should update class in school collection', done => {
		// 	const acData = {};
		// 	chai
		// 		.request(server)
		// 		.post('/api/v1/school/updateClassInSchoolCollection')
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(acData)
		// 		.then(res => {
		// 			res.should.have.status(201);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			school = body.data;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('it should delete complete school data', done => {
			const id = school2.schoolId;
			chai
				.request(server)
				.delete(`/api/v1/school/deleteCompleteData/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should delete school by id', done => {
			const id = school2._id;
			chai
				.request(server)
				.delete(`/api/v1/school/${id}`)
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
