let  joi  = require("joi")
// joi.objectId = require('joi-objectid')(joi);
const validUser = joi.object({
    admin:joi.boolean(),
    active:joi.boolean(),
    email:joi.string().email().lowercase().required(),
    name:joi.string().min(2).required(),
    password:joi.string().min(2),
    numberOfReports:joi.string(),
    image:joi.string().alphanum(),
    permissions:joi.string().alphanum(),
})

const login = joi.object({
    email:joi.string().email().lowercase().required(),
    password:joi.string().required()
})

const forgotPassword = joi.object({
    email:joi.string().email().lowercase().required(),
})

const  validApp = joi.object({
    name:joi.string().required(),
    type:joi.string(),
    icon:joi.string(), 
    title:joi.string().required(),
    active:joi.boolean(),
    page:joi.array().items(joi.object({
        intro:joi.object(),
        section:joi.object(),
        report:joi.object(),
        questioner:joi.object(),
    })),
    group:joi.object(),
    categories:joi.object()

})


module.exports = {validUser,login,forgotPassword,validApp}