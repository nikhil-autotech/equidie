const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');
const activityModel = require('../model/activity');
const StudentModel = require('../model/student');
const schoolModel = require('../model/school');
const ParentModel = require('../model/parent');
const UserModel = require('../model/user');
const server = require('../index');
const Parent = require('../model/parent');
const Announcement = require('../model/announcement');
const { assignmentStats } = require('../controller/stats_dashboard');

const should = chai.should();
// const { expect } = chai;
// const { assert } = chai;

chai.use(chaiHttp);

let activity = null;
let assignment = null;
let livepool = null;
let event = null;
let checklist = null;
let announcement = null;
let token = null;
let schools = null;
let parent = null;
let teacher = null;
let student = null;

describe('User', () => {
	before(async () => {
		schools = await schoolModel.findOne();
		teacher = await UserModel.findOne({ school_id: schools._id });
		student = await StudentModel.findOne({
			school_id: schools._id,
			class: '60adea6a835f1ca1d7803612',
			section: '623334f8eec609c379b97c4b',
		});
		parent = await ParentModel.findOne({ children: student._id });
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
		await activityModel.deleteMany({
			_id: assignment._id,
		});
		await activityModel.deleteMany({
			_id: announcement._id,
		});
		await activityModel.deleteMany({
			_id: checklist._id,
		});
		await activityModel.deleteMany({
			_id: livepool._id,
		});
	});

	describe('creating description', async () => {
		it('it should create new Assignment(Activity)', done => {
			const acData = {
				activity_type: 'Assignment',
				title: 'assignment 447',
				like: 0,
				view: 0,
				description: 'assignment 447',
				subject: 'assignment 447',
				status: 'Pending',
				EndDate: '30-Jun-2022',
				teacher_id: '62333c7a333f39c372823236',
				dueDate: '30-Jun-2022',
				StartTime: '2022-06-22T16:47:00.000',
				EndTime: '2022-06-30T16:47:00.000',
				startDate: '22-Jun-2022',
				links: [],
				learning_Outcome: 'assignment 447',
				coin: '20',
				publish_date: '2022-06-22T16:48:15.505325',
				file: [],
				assignTo_you: [],
				assignTo_parent: [],
				assignTo: [
					{
						status: 'pending',
						class_id: '60adea6a835f1ca1d7803612',
						branch: null,
						section_id: '623334f8eec609c379b97c4b',
						student_id: '6235afde15ef921f90e48713',
						school_id: '6233335feec609c379b97b7c',
					},
					{
						status: 'pending',
						class_id: '60adea6a835f1ca1d7803612',
						branch: null,
						section_id: '623334f8eec609c379b97c4b',
						student_id: '6235afde15ef921f90e48731',
						school_id: '6233335feec609c379b97b7c',
					},
				],
				repository: [
					{
						id: '6233335feec609c379b97b7c',
						repository_type: 'School',
						branch: null,
						class_id: null,
						school_id: null,
					},
				],
				created_by: 'Hermes Miller',
				updated_by: 'Hermes Miller',
				isOffline: false,
			};
			chai
				.request(server)
				.post('/api/v1/activity/createAssignment')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					assignment = body.data;
					console.log(assignment);
					done();
				})
				.catch(err => done(err));
		});
		it('it should get teacher data(Activity)', done => {
			const acData = {
				status: 'pending',
			};
			chai
				.request(server)
				.post('/api/v1/activity/getTeachersData')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					activity = body.data;
					console.log(activity);
					done();
				})
				.catch(err => done(err));
		});
		it('it should search in Activity', done => {
			const acData = {
				searchValue: '',
				filterKeysArray: ['name', 'username'],
			};
			chai
				.request(server)
				.post('/api/v1/activity/search')
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
		it('it should status to Evaluate by id', done => {
			const id = assignment._id;
			chai
				.request(server)
				.put(`/api/v1/activity/updateStatusToEvaluate/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should update Assignment(activity) by id', done => {
			const id = assignment._id;
			const updateData = {
				activity_type: 'Assignment',
				title: ' test title updated',
				updatedBy: 'Test user',
			};
			chai
				.request(server)
				.put(`/api/v1/activity/updateAssignment/${id}`)
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
		it('it should status to Evaluate of Assignment by id', done => {
			const id = assignment._id;
			chai
				.request(server)
				.put(`/api/v1/activity/updateAssignmentStatus/${id}`)
				.set('Authorization', `Bearer ${token}`)
				.then(res => {
					res.should.have.status(200);
					res.should.be.a('object');
					const { body } = res;
					done();
				})
				.catch(err => done(err));
		});
		it('it should create new Announncement(Activity)', done => {
			const acData = {
				activity_type: 'Announcement',
				title: 'assignment 447',
				like: 0,
				view: 0,
				description: 'assignment 447',
				subject: 'assignment 447',
				status: 'Pending',
				EndDate: '30-Jun-2022',
				teacher_id: '62333c7a333f39c372823236',
				dueDate: '30-Jun-2022',
				StartTime: '2022-06-22T16:47:00.000',
				EndTime: '2022-06-30T16:47:00.000',
				startDate: '22-Jun-2022',
				links: [],
				learning_Outcome: 'assignment 447',
				coin: '20',
				publish_date: '2022-06-22T16:48:15.505325',
				file: [],
				assignTo_you: [],
				assignTo_parent: [],
				assignTo: [
					{
						status: 'pending',
						class_id: '60adea6a835f1ca1d7803612',
						branch: null,
						section_id: '623334f8eec609c379b97c4b',
						student_id: '6235afde15ef921f90e48713',
						school_id: '6233335feec609c379b97b7c',
					},
					{
						status: 'pending',
						class_id: '60adea6a835f1ca1d7803612',
						branch: null,
						section_id: '623334f8eec609c379b97c4b',
						student_id: '6235afde15ef921f90e48731',
						school_id: '6233335feec609c379b97b7c',
					},
				],
				repository: [
					{
						id: '6233335feec609c379b97b7c',
						repository_type: 'School',
						branch: null,
						class_id: null,
						school_id: null,
					},
				],
				created_by: 'Hermes Miller',
				updated_by: 'Hermes Miller',
				isOffline: false,
			};
			chai
				.request(server)
				.post('/api/v1/activity/addAnouncement')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					announcement = body.data;
					console.log(announcement);
					done();
				})
				.catch(err => done(err));
		});
		it('it should update Announcement(activity) by id', done => {
			const id = activity[0]._id;
			const updateData = {
				activity_type: 'Announcement',
				title: ' test title announcement updated',
				updatedBy: 'Test user',
			};
			chai
				.request(server)
				.put(`/api/v1/activity/updateAnouncement/${id}`)
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
		it('it should create new Livepool(Activity)', done => {
			const acData = {
				activity_type: 'Livepool',
				title: 'assignment 447',
				like: 0,
				view: 0,
				description: 'assignment 447',
				subject: 'assignment 447',
				status: 'Pending',
				EndDate: '30-Jun-2022',
				teacher_id: '62333c7a333f39c372823236',
				dueDate: '30-Jun-2022',
				StartTime: '2022-06-22T16:47:00.000',
				EndTime: '2022-06-30T16:47:00.000',
				startDate: '22-Jun-2022',
				links: [],
				learning_Outcome: 'assignment 447',
				coin: '20',
				publish_date: '2022-06-22T16:48:15.505325',
				file: [],
				assignTo_you: [],
				assignTo_parent: [],
				assignTo: [
					{
						status: 'pending',
						class_id: '60adea6a835f1ca1d7803612',
						branch: null,
						section_id: '623334f8eec609c379b97c4b',
						student_id: '6235afde15ef921f90e48713',
						school_id: '6233335feec609c379b97b7c',
					},
					{
						status: 'pending',
						class_id: '60adea6a835f1ca1d7803612',
						branch: null,
						section_id: '623334f8eec609c379b97c4b',
						student_id: '6235afde15ef921f90e48731',
						school_id: '6233335feec609c379b97b7c',
					},
				],
				repository: [
					{
						id: '6233335feec609c379b97b7c',
						repository_type: 'School',
						branch: null,
						class_id: null,
						school_id: null,
					},
				],
				created_by: 'Hermes Miller',
				updated_by: 'Hermes Miller',
				isOffline: false,
			};
			chai
				.request(server)
				.post('/api/v1/activity/addLivepool')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					livepool = body.data;
					console.log(livepool);
					done();
				})
				.catch(err => done(err));
		});
		it('it should update Livepool(activity) by id', done => {
			const id = activity[0]._id;
			const updateData = {
				activity_type: 'Livepool',
				title: ' test title livepool updated',
				updatedBy: 'Test user',
			};
			chai
				.request(server)
				.put(`/api/v1/activity/updateLivepool/${id}`)
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
		it('it should create new Event(Activity)', done => {
			const acData = {
				activity_type: 'Event',
				title: 'assignment 447',
				like: 0,
				view: 0,
				description: 'assignment 447',
				subject: 'assignment 447',
				status: 'Pending',
				EndDate: '30-Jun-2022',
				teacher_id: '62333c7a333f39c372823236',
				dueDate: '30-Jun-2022',
				StartTime: '2022-06-22T16:47:00.000',
				EndTime: '2022-06-30T16:47:00.000',
				startDate: '22-Jun-2022',
				links: [],
				learning_Outcome: 'assignment 447',
				coin: '20',
				publish_date: '2022-06-22T16:48:15.505325',
				file: [],
				assignTo_you: [],
				assignTo_parent: [],
				assignTo: [
					{
						status: 'pending',
						class_id: '60adea6a835f1ca1d7803612',
						branch: null,
						section_id: '623334f8eec609c379b97c4b',
						student_id: '6235afde15ef921f90e48713',
						school_id: '6233335feec609c379b97b7c',
					},
					{
						status: 'pending',
						class_id: '60adea6a835f1ca1d7803612',
						branch: null,
						section_id: '623334f8eec609c379b97c4b',
						student_id: '6235afde15ef921f90e48731',
						school_id: '6233335feec609c379b97b7c',
					},
				],
				repository: [
					{
						id: '6233335feec609c379b97b7c',
						repository_type: 'School',
						branch: null,
						class_id: null,
						school_id: null,
					},
				],
				created_by: 'Hermes Miller',
				updated_by: 'Hermes Miller',
				isOffline: false,
			};
			chai
				.request(server)
				.post('/api/v1/activity/addEventCreact')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					event = body.data;
					console.log(event);
					done();
				})
				.catch(err => done(err));
		});
		it('it should update Event(activity) by id', done => {
			const id = activity[0]._id;
			const updateData = {
				activity_type: 'Event',
				title: ' test title event updated',
				updatedBy: 'Test user',
			};
			chai
				.request(server)
				.put(`/api/v1/activity/updateEvent/${id}`)
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
		it('it should create new CheckLst(Activity)', done => {
			const acData = {
				activity_type: 'CheckList',
				title: 'assignment 447',
				like: 0,
				view: 0,
				description: 'assignment 447',
				subject: 'assignment 447',
				status: 'Pending',
				EndDate: '30-Jun-2022',
				teacher_id: '62333c7a333f39c372823236',
				dueDate: '30-Jun-2022',
				StartTime: '2022-06-22T16:47:00.000',
				EndTime: '2022-06-30T16:47:00.000',
				startDate: '22-Jun-2022',
				links: [],
				learning_Outcome: 'assignment 447',
				coin: '20',
				publish_date: '2022-06-22T16:48:15.505325',
				file: [],
				assignTo_you: [],
				assignTo_parent: [],
				assignTo: [
					{
						status: 'pending',
						class_id: '60adea6a835f1ca1d7803612',
						branch: null,
						section_id: '623334f8eec609c379b97c4b',
						student_id: '6235afde15ef921f90e48713',
						school_id: '6233335feec609c379b97b7c',
					},
					{
						status: 'pending',
						class_id: '60adea6a835f1ca1d7803612',
						branch: null,
						section_id: '623334f8eec609c379b97c4b',
						student_id: '6235afde15ef921f90e48731',
						school_id: '6233335feec609c379b97b7c',
					},
				],
				repository: [
					{
						id: '6233335feec609c379b97b7c',
						repository_type: 'School',
						branch: null,
						class_id: null,
						school_id: null,
					},
				],
				created_by: 'Hermes Miller',
				updated_by: 'Hermes Miller',
				isOffline: false,
			};
			chai
				.request(server)
				.post('/api/v1/activity/Checklist/add')
				.set('Authorization', `Bearer ${token}`)
				.send(acData)
				.then(res => {
					res.should.have.status(201);
					res.should.be.a('object');
					const { body } = res;
					checklist = body.data;
					console.log(checklist);
					done();
				})
				.catch(err => done(err));
		});
		it('it should update CheckList(activity) by id', done => {
			const id = activity[0]._id;
			const updateData = {
				activity_type: 'Event',
				title: ' test title',
				updatedBy: 'Test user',
			};
			chai
				.request(server)
				.put(`/api/v1/activity/updateChecklist/${id}`)
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
		// it('it should update like count by id', done => {
		// 	const id = assignment._id;
		// 	const updateData = {
		// 		action: 'Like',
		// 		like_by: assignment.assignTo[0].student_id,
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/activity/Like/${id}`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(updateData)
		// 		.then(res => {
		// 			res.should.have.status(201);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		// it('it should update Dislike count by id', done => {
		// 	const id = assignment._id;
		// 	const updateData = {
		// 		action: 'Like',
		// 		like_by: '6233335feec609c379b97b7c',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/activity/Dislike/${id}`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(updateData)
		// 		.then(res => {
		// 			res.should.have.status(201);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		// it('it should update Checklist count by id', done => {
		// 	const id = checklist._id;
		// 	const updateData = {
		// 		selected_options: [
		// 			{
		// 				selected_by: student._id,
		// 				selected_by_parent: 'parent id',
		// 				selected_by_teacher: 'teacher id',
		// 			},
		// 		],
		// 		checklist_status: 'Submitted',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/activity/checklist/${id}`)
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
		// it('it should update view count by id', done => {
		// 	const id = assignment._id;
		// 	const updateData = {
		// 		action: 'View',
		// 		view_by: '6233335feec609c379b97b7c',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/activity/viewed/${id}`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(updateData)
		// 		.then(res => {
		// 			res.should.have.status(201);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		// it('it should update forwarded count by id', done => {
		// 	const id = assignment._id;
		// 	const updateData = {
		// 		assignTo_you: [
		// 			{
		// 				teacher_id: activity[0].assignTo_you[0].teacher_id,
		// 			},
		// 		],
		// 		forwarded_teacher_id: '6233335feec609c379b97b7c',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/activity/forwarded/${id}`)
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
		it('it should update achnowledge by teacher(announcement) by id', done => {
			const id = announcement._id;
			const updateData = {
				acknowledge_by_teacher: announcement.teacher_id,
			};
			chai
				.request(server)
				.post(`/api/v1/activity/Anouncement/teacher/${id}`)
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
		// it('it should update event notgoing by id', done => {
		// 	const id = event._id;
		// 	const updateData = {
		// 		teacher: event.teacher_id,
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/activity/event/notgoing/taecher/${id}`)
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
		// it('it should update event going by id', done => {
		// 	const id = event._id;
		// 	const updateData = {
		// 		teacher: event.teacher_id,
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/activity/event/going/taecher/${id}`)
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
		// it('it should update  acknowledge by parent (announcement) by id', done => {
		// 	const id = announcement._id;
		// 	const updateData = {
		// 		acknowledge_by_parent: '6235afde15ef921f90e4870d',
		// 		submitted_date: '2022-06-15T18:30:00.000Z',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/activity/Anouncement/parent/${id}`)
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
		// it('it should update event notgoing parent by id', done => {
		// 	const id = event._id;
		// 	const updateData = {
		// 		parent_id: '6235afde15ef921f90e4870d',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/activity/event/notgoing/parent/${id}`)
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
		// it('it should update event going parent by id', done => {
		// 	const id = event._id;
		// 	const updateData = {
		// 		parent_id: '6235afde15ef921f90e4870d',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/activity/event/going/parent/${id}`)
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
		// it('it should reassign activity', done => {
		// 	const data = {
		// 		id: 'id',
		// 		student_id: '6233335feec609c379b97b7c',
		// 		activity_id: assignment._id,
		// 		text: 'text',
		// 		submitted_date: '2022-06-15T18:30:00.000Z',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/activity/reassign`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(data)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		it('it should submitEvaluated activity', done => {
			const data = {
				student_id: assignment.assignTo[0].student_id,
				activity_id: assignment._id,
				text: 'text',
				file: [],
			};
			chai
				.request(server)
				.post(`/api/v1/activity/submitEvaluated`)
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
		it('it should get all activities ', done => {
			const data = {
				assignTo: { student_id: assignment.assignTo[0].student_id },
				assignTo_parent: { parent_id: null },
			};
			chai
				.request(server)
				.post('/api/v1/activity/')
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
		it('it should get all updated status activities ', done => {
			const data = {};
			chai
				.request(server)
				.post('/api/v1/activity/getAllUpdatestatus')
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
		it('it should get activity by id', done => {
			const id = assignment._id;
			const data = { view_by: 'user id' };
			chai
				.request(server)
				.post(`/api/v1/activity/${id}`)
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
		// it('it should update activity(Announcement) by id', done => {
		// 	const id = announcement._id;
		// 	const data = {
		// 		acknowledge_by: announcement.teacher_id,
		// 		submitted_date: '2022-06-15T18:30:00.000Z',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/activity/Anouncement/${id}`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(data)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		// it('it should update activity(Assignment) by id', done => {
		// 	const id = assignment._id;
		// 	const data = {
		// 		editFlag: true,
		// 		submited_by: [
		// 			{ student_id: assignment.assignTo[0].student_id, message: 'message' },
		// 		],
		// 		comment: 'comment',
		// 		submitted_date: '2022-06-15T18:30:00.000Z',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/activity/Assignment/${id}`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(data)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		// it('it should update offline Assignment(Activity) by id', done => {
		// 	const id = assignment._id;
		// 	const data = {
		// 		submited_by: [
		// 			{ student_id: assignment.assignTo[0].student_id, message: 'message' },
		// 		],
		// 		comment: 'comment',
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/activity/offlineAssignment/${id}`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.send(data)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
		// it('it should update event going by id', done => {
		// 	const id = event._id;
		// 	const updateData = {
		// 		student_id: assignment.assignTo[0].student_id,
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/activity/Event/going/${id}`)
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
		// it('it should update event notgoing by id', done => {
		// 	const id = event._id;
		// 	const updateData = {
		// 		student_id: assignment.assignTo[0].student_id,
		// 	};
		// 	chai
		// 		.request(server)
		// 		.post(`/api/v1/activity/Event/notgoing/${id}`)
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
		// it('it should update Livepool(activity) by id', done => {
		// 	const id = livepool._id;
		// 	const updateData = {
		// 		selected_options: [
		// 			{
		// 				selected_by: assignment.assignTo[0].student_id,
		// 				selected_by_parent: null,
		// 				selected_by_teacher: assignment.teacher_id,
		// 			},
		// 		],
		// 	};
		// 	chai
		// 		.request(server)
		// 		.put(`/api/v1/activity/livepool/${id}`)
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
		// it('it should update Livepool(activity) by id', done => {
		// 	const id = livepool._id;
		// 	const updateData = {
		// 		comment: [
		// 			{
		// 				student_id: assignment.assignTo[0].student_id,
		// 				doubt_status: 'doubt_status',
		// 			},
		// 		],
		// 	};
		// 	chai
		// 		.request(server)
		// 		.put(`/api/v1/activity/feed/${id}`)
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
		// it('it should delete activity by id', done => {
		// 	const id = assignment._id;
		// 	chai
		// 		.request(server)
		// 		.delete(`/api/v1/activity/delete/${id}`)
		// 		.set('Authorization', `Bearer ${token}`)
		// 		.then(res => {
		// 			res.should.have.status(200);
		// 			res.should.be.a('object');
		// 			const { body } = res;
		// 			done();
		// 		})
		// 		.catch(err => done(err));
		// });
	});
});
