let Email = (employeeEmail) => {
  let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  if (employeeEmail.match(emailRegex)) {
    return employeeEmail
  } else {
    return false
  }
}

/* Minimum 8 characters which contain only characters,numeric digits, underscore and first character must be a letter */
let Password = (employeePassword) => {
  let passwordRegex = /^[A-Za-z0-9]\w{7,}$/
  if (employeePassword.match(passwordRegex)) {
    return employeePassword
  } else {
    return false
  }
}




module.exports = {
  Email: Email,
  Password: Password
}
