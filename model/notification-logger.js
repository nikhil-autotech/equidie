const mongoose = require('mongoose')

const notificationLoggerSchema = mongoose.Schema({
    msg: {
        type: String,
    },      
    userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
    seen:{
        type:Boolean,
        default:false
    },
    title:{
        type:String,
    },
    type:{
        type:String,
        enum:["Admin","User"],
    },
    adminStatus:{
        type:String,
        enum:["Completed","Rejected"]
    }         
}, {
    timestamps: { createdAt: true },
}
);

const NotificationLoggerSchema = mongoose.model('NotificationLogger', notificationLoggerSchema);

module.exports = NotificationLoggerSchema