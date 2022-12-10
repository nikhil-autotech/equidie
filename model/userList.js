const mongoose = require('mongoose')

const userListSchema = mongoose.Schema({
    comapanyName: {
        type: String,
        required: true
    },
    userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
    registrationDate: {
		type: Date,
	},
    status: {
        type: String,
        default: 'Pending',
        enum:['Pending', 'Rejected', 'Updated By MSME', 'Completed', 'Requested Access To Modify']
    },      
}, {
    timestamps: { createdAt: true, updatedAt: true },
}
);

const VerificationList = mongoose.model('VerificationList', userListSchema);

module.exports = VerificationList;