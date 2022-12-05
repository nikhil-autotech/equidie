const cloudinary = require("cloudinary");
// const _ = require('underscore');

const Q = require("q");

function upload(file) {
    cloudinary.config({
        cloud_name:	'dbd8wog43',
        api_key:'227366481328175',
        api_secret:	'fseZMdhQ_0DmcxWbXpSzEx9KMrI'
    });

    return new Q.Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(file,{resource_type: "auto",flags:"attachment"}, (err, res) => {
            if (err) {
                console.log('cloudinary err:', err);
                reject(err);
            } else {
                console.log('cloudinary res:', res);
                return resolve(res.url);
            }
        });
    });
};


module.exports.upload = upload;