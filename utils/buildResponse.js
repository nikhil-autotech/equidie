function buildResponse(body) {
    let data ={
        basicInformation:{},
        companyInformation:{},
        document:{
            personalKYC:{PAN:{},Aadhar:{}},
        businessKYC:{PAN:{},GST:{},udhyamDetails:{},profitLossStatement:{},incomeTaxReturn:{},currentOutstandingLoan:{},bankStatement:{}}
    },
    };
    data.basicInformation.adminName=body.adminName;
    data.basicInformation.designation=body.designation;
    data.basicInformation.zip=body.zip;
    data.basicInformation.city=body.city;
    data.basicInformation.state=body.state;
    data.basicInformation.address=body.address;
    if(body.email){data.basicInformation.email=body.email}else if(body.mobile){data.basicInformation.mobile=body.mobile}
    
    data.companyInformation.name=body.companyDetails.name;
    data.companyInformation.product=body.companyDetails.product;
    data.companyInformation.yearOfIncorporation=body.companyDetails.yearOfIncorporation;
    data.companyInformation.licenseNumber=body.companyDetails.licenseNumber;
    data.companyInformation.industryType=body.companyDetails.industryType;
    data.companyInformation.address=body.companyDetails.address;
    data.companyInformation.bankDetails=body.companyDetails.bankDetails;
    data.companyInformation.GST=body.companyDetails.GST;
    data.companyInformation.PAN=body.companyDetails.PAN;
    data.companyInformation.udhyamDetails=body.companyDetails.udhyamDetails;
    data.companyInformation.zip=body.companyDetails.zip;
    data.companyInformation.city=body.companyDetails.city;
    data.companyInformation.state=body.companyDetails.state;

    data.document.personalKYC.PAN=body.PAN;
    data.document.personalKYC.PAN.isPANSubmitted=body.KYCPersonal.isPANSubmitted;
    data.document.personalKYC.Aadhar=body.aadhar;
    data.document.personalKYC.Aadhar.isAadharSubmitted=body.KYCPersonal.isAadharSubmitted;

    data.document.businessKYC.PAN=body.companyDetails.PAN;
    data.document.businessKYC.PAN.isPANSubmitted=body.KYCBussiness.isPANSubmitted;
    data.document.businessKYC.GST=body.companyDetails.GST;
    data.document.businessKYC.GST.isGSTSubmitted=body.KYCBussiness.isGSTSubmitted;
    data.document.businessKYC.udhyamDetails=body.companyDetails.udhyamDetails;
    data.document.businessKYC.udhyamDetails.udhyamDetailsSubmitted=body.KYCBussiness.udhyamDetailsSubmitted;
    data.document.businessKYC.profitLossStatement=body.companyDetails.profitLossStatement;
    data.document.businessKYC.profitLossStatement.isProfitLossSubmitted=body.KYCBussiness.isProfitLossSubmitted;
    data.document.businessKYC.incomeTaxReturn=body.companyDetails.incomeTaxReturn;
    data.document.businessKYC.incomeTaxReturn.isIncomeTaxSubmitted=body.KYCBussiness.isIncomeTaxSubmitted;
    data.document.businessKYC.currentOutstandingLoan=body.companyDetails.currentOutstandingLoan;
    data.document.businessKYC.currentOutstandingLoan.isCurrentOutStandingLoan=body.KYCBussiness.isCurrentOutStandingLoan;
    data.document.businessKYC.bankStatement=body.companyDetails.bankDetails;
    data.document.businessKYC.bankStatement.isStatementSubmitted=body.KYCBussiness.isStatementSubmitted;

    data.isAllCompanyInfoAvailable=body.isAllCompanyInfoAvailable;
    data.isBussinesKYCDone=body.isBussinesKYCDone;
    data.isEmail=body.isEmail;
    data.isKYCPartial=body.isKYCPartial;
    data.isKYCVerificationInProgress=body.isKYCVerificationInProgress;
    data.isMobile=body.isMobile;
    data.role=body.role;
    data.userId=body.userId;
    data.profileCompletion=body.profileCompletion;
    data._id=body._id; 

    return data;
  }
  module.exports= buildResponse;