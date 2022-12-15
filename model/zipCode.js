const mongoose = require('mongoose')

const zipCodeSchema = mongoose.Schema({
    Pincode: {
        type: Number,
    },      
    City: {
        type: String,
    },      
    State: {
        type: String,
    },      
}, {
    timestamps: { createdAt: true, updatedAt: true },
}
);

const ZipCode = mongoose.model('ZipCode', zipCodeSchema);

module.exports = ZipCode