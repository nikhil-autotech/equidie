const s3 = require('../config/s3.config');
const coudinary = require('../config/coudinary');
const _ = require('underscore');

exports.doUpload = (req, res) => {
	const { s3Client } = s3;
	const params = s3.uploadParams;

	// originalname = originalname + Date.now() + originalname;
	params.Key =
		Date.now() + req.file ? req.file.originalname : req.files.file.name;
	console.log('key', params.Key);
	params.Body = req.file ? req.file.buffer : req.files.file.data;

	s3Client.upload(params, (err, data) => {
		if (err) {
			res.status(500).json({ error: `Error -> ${err}` });
		}
		res.status(201).json({
			status: 'success',
			message: data.Location,
		});
	});
};
exports.fileUpload = async (req, res, next) => {
    if (!req.file || _.isEmpty(req.file)) {
        return res.status(400)
            .json(vm.ApiResponse(false, 400, "No file uploaded'"))
    }
    try {
        const { path } = req.file;
		console.log(req.file);
        let link = await coudinary.upload(path);
        // let apiResponse = response.generate(false, 'Image uploaded', 200, link)
        res.send({error:false,message:'Image uploaded',link})
    } catch (e) {
        console.log("err :", e);
        return next(e);
    }
};

exports.deleteObject = (req, res) => {
	const { s3Client } = s3;
	const params = s3.uploadParams;
	const { link } = req.params;

	// eslint-disable-next-line prefer-destructuring
	params.Key = link.split('/')[3];

	s3Client.deleteObject(params, (err, data) => {
		if (err) {
			res.status(500).json({ error: `Error -> ${err}` });
		}
		res.status(201).json({
			status: 'success',
			data,
		});
	});
};
