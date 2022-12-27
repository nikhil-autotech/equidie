const mongoose = require('mongoose')

const notificationLoggerSchema = mongoose.Schema({
    msg: {
        type: String,
    },      
    userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
    seen:{
        type:Boolean,
        default:false
    },
    title:{
        type:String,
    }         
}, {
    timestamps: { createdAt: true },
}
);

const NotificationLoggerSchema = mongoose.model('NotificationLogger', notificationLoggerSchema);

module.exports = NotificationLoggerSchema