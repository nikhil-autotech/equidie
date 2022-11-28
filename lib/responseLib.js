  
let generate = (err, message, statusCode, data) => {
    let response = {
        error: err,
        message: message,
        statusCode: statusCode,
        data: data
    }
    return response;
}
let generate1 = (err, adminName, message, statusCode, data) => {
    let response = {
        error: err,
        adminName:adminName,
        message: message,
        statusCode: statusCode,
        data: data
    }
    return response;
}

module.exports = {
    generate: generate,
    generate1: generate1
}