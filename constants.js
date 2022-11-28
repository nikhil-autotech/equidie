let constants = {
  "SUCCESS": false,
  "ERROR": true,
  "HTTP_SUCCESS": 200, // Success
  "HTTP_NOT_FOUND": 404, // Not Found
  "HTTP_UNAUTHORIZED": 401,
  "HTTP_SERVER_ERROR": 500, // Server Error
  "is_debug": 1,
  //"DEBUG_TYPE": "email",
  "DEBUG_TYPE": "database", // email, database/ both
}
let messages = {

  "USER": {
    "SUCCESS": "User added successfully",
    "FAILURE": "Some error occured while adding user",
    "DOESNOTMATCH": "Old Password is incorrect",
    "ALREADYEXIST": "Try another email this is already in use",
    "ALREADYKYCDONE": "KYC already done, ask permission to update details",
    "ALREADYEXISTEMAIL": "Try another email this is already in use",
    "ALREADYEXISTMOBILE": "Try another mobile this is already in use",
    "DOESNOTEXIST": "Try another userId this user Does not Exist",
    "INVALIDUSER": "Invalid user Id",
    "FETCHEDSUCCESS": "User fetched successfully",
    "FETCHEDFAILURE": "Some error occured while fetching user",
    "UPDATEDSUCCESS": "User updated successfully",
    "UPDATEDFAILURE": "Some error occured while updating user",
    "DELETEDSUCCESS": "User deleted successfully",
    "DELETEDFAILURE": "Some error occured while deleting user"
  },
  "APPLICATION": {
    "ADDEDSUCCESS": "Application added successfully",
    "ADDEDFAILURE": "Some error occured while adding application",
    "FETCHEDSUCCESS": "Application fetched successfully",
    "FETCHEDFAILURE": "Some error occured while fetching application",
    "UPDATEDSUCCESS": "Application updated successfully",
    "UPDATEDFAILURE": "Some error occured while updating application",
    "DELETEDSUCCESS": "Application deleted successfully",
    "DELETEDFAILURE": "Some error occured while deleting application",
    "DELETEDFAILUREDUETOPERMISSION": "You cannot delete assigned application",
    "PAGEADDEDSUCCESS": "Page added successfully in application",
    "PAGEADDEFAILURE": "Some error occured while adding page in application",
    "GROUPADDEDSUCCESS": "Group added successfully in application",
    "GROUPADDEDFAILURE": "Some error occured while adding group in application",
    "CATEGORIESSUCCESS": "Categories added successfully in application",
    "CATEGORIESFAILURE": "Some error occured while adding categories in application",
    "PAGEEDITEDSUCCESS": "Page edited successfully in application",
    "PAGEEDITEDFAILURE": "Some error occured while editing page in application",
    "QUESTIONADDEDFAILURE": "Some error occured while adding question",
    "QUESTIONADDEDSUCCESS": "Question added successfully",
    "QUESTIONDELETEDFAILURE": "Some error occured while deleting question",
    "QUESTIONDELETEDSUCCESS": "Question deleted successfully",
    "QUESTIONUPDATEDSUCCESS": "Question updated successfully",
    "QUESTIONUPDATEDFAILURE": "Some error occured while updating question",
    "GROUPEDITEDSUCCESS": "Group edited successfully in application",
    "GROUPEDITEDFAILURE": "Some error occured while editing group in application",
    "CATEGORIESEDITEDSUCCESS": "Categories edited successfully in application",
    "CATEGORIESEDITEDFAILURE": "Some error occured while editing categories in application",
    "PAGEDELETEDSUCCESS": "Page deleted successfully in application",
    "PAGEDELETEDFAILURE": "Some error occured while deleted page in application",
    "GROUPDELETEDSUCCESS": "Group deleted successfully in application",
    "GROUPDELETEDFAILURE": "Some error occured while deleted group in application",
    "CATEGORIESDELETEDSUCCESS": "Categories deleted successfully in application",
    "CATEGORIESDELETEDFAILURE": "Some error occured while deleted categories in application",
    "PAGEGETEDSUCCESS": "Page got successfully from application",
    "PAGEGETEDFAILURE": "Some error occured while getting page from application",
    "GROUPGETEDSUCCESS": "Group got successfully from application",
    "GROUPGETEDFAILURE": "Some error occured while getting group from application",
    "CATEGORIESGETEDSUCCESS": "Categories got successfully from application",
    "CATEGORIESGETEDFAILURE": "Some error occured while getting categories from application"

  },
  "REPORT": {
    "ADDEDSUCCESS": "Report added successfully",
    "ADDEDFAILURE": "Some error occured while adding report",
    "FETCHEDSUCCESS": "Report fetched successfully",
    "FETCHEDFAILURE": "Some error occured while fetching report",
    "UPDATEDSUCCESS": "Report updated successfully",
    "UPDATEDFAILURE": "Some error occured while updating report",
    "DELETEDSUCCESS": "Report deleted successfully",
    "DELETEDFAILURE": "Some error occured while deleting report",
    "ACTIVEEXIST": "Active Report Exist in application",
  },
  "TEMPLATE": {
    "ADDEDSUCCESS": "Template added successfully",
    "ADDEDFAILURE": "Some error occured while adding template",
    "FETCHEDSUCCESS": "Template fetched successfully",
    "FETCHEDFAILURE": "Some error occured while fetching template",
    "UPDATEDSUCCESS": "Template updated successfully",
    "UPDATEDFAILURE": "Some error occured while updating template",
    "DELETEDSUCCESS": "Template deleted successfully",
    "DELETEDFAILURE": "Some error occured while deleting template",
  },
  "LOGIN": {
    "SUCCESS": "Login successfully",
    "FAILURE": "Username or password is incorrect",
    "NOTALLOWED": "Your account is not activated contact admin to activate"
  },
  "VERIFICATION": {
    "FAILURE": "Invalid token",
    "NOTPROVIDED": "Token is misssing"
  },
  "ERRORHANDLER": {
    "SUCCESS": "Some error occured at global level"
  },
  "NOTFOUNDHANDLER": {
    "SUCCESS": "Route not found in the application"
  }
}
module.exports = {
  constants,
  messages
}