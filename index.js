require('dotenv').config();

const express = require('express');
// const fileupload = require('express-fileupload');

const app = express();
const cors = require('cors');
const bodyparser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');

const { createServer } = require('http');

const winston = require('./config/winston');
const image = require('./router/upload.router');
const swaggerDocument = require('./docs/swagger.json');
// const serviceAccount = require('./growon-3300b-firebase-adminsdk-1ga4o-0661848f0e.json');
const ErrorResponse = require('./utils/errorResponse');
const errorHandler = require('./utils/errorHandler');
const protect = require('./middleware/protect');

process.env.TZ = 'Asia/Kolkata';

// firebase.initializeApp({
// 	credential: firebase.credential.cert(serviceAccount),
// });

mongoose
	.connect(process.env.mongoConnectionString, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		readPreference: 'secondaryPreferred',
	})
	.then(() => {
		console.log('connected to database');
	})
	.catch(() => {
		console.log('Mongodb connection error');
	});
// mongoose.set('useCreateIndex', true);

app.use(cors());
app.use(
	bodyparser.urlencoded({
		limit: '3mb',
		extended: false,
	})
);
app.use(bodyparser.json({ limit: '3mb' }));
// app.use(fileupload());

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
		return res.status(200).json({});
	}
	next();
});
app.use(express.json());

// morgan logger
app.use(
	morgan('combined', {
		stream: winston.stream,
	})
);

// cron jobs on single instance of server
const instanceId = Number(process.env.INSTANCE_ID);

if (process.env.NODE_ENV !== 'development' && instanceId === 1) {
	// eslint-disable-next-line global-require
	require('./jobs');
}


// swagger docs
app.use(`/api/v1/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/checkenv', (req, res) => {
	res.json({ env: process.env.NODE_ENV });
});

// app.use(protect);

app.use('/api/auth', require('./router/auth'));

app.use('/', image);

app.all('*', (req, res, next) => {
	next(new ErrorResponse(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next) => {
	errorHandler(err, req, res, next);
});

const port = process.env.PORT || 3000;


app.listen(port, () => {
	console.log(`server in running on PORT: ${port} - ENV: ${process.env.NODE_ENV}`);
});
