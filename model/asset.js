const mongoose = require('mongoose')

const assetSchema = mongoose.Schema({
    assetName: {
        type: String
    },
    tenure: {
        type: String
    },
    yearOfManufacture: {
        type: Number
    },
    serialNumber: {
        type: Number
    },
    assetMake: {
        type: String
    },
    assetModel: {
        type: String
    },
    assetValue: {
        type: String
    },
    technicalSpecifications: {
        type: String
    },
    purchaseBill: {
        name: { type: String },
        url: { type: String }
    },
    taxInvoice: {
        name: { type: String },
        url: { type: String }
    },
    insuranceDoc: {
        name: { type: String },
        url: { type: String }
    },
    fixedAssetRegister: {
        name: { type: String },
        url: { type: String }
    },
    chargesPending: {
        name: { type: String },
        url: { type: String }
    },
    assetInvoice: {
        name: { type: String },
        url: { type: String }
    },
    technicalSpecifications: {
        name: { type: String },
        url: { type: String }
    },
    landOwner: {
        type: String
    },
    titleDeed: {
        type: String
    },
    landRegistry: {
        type: String
    },
    assetValue: {
        type: String
    },
    propertyTax: {
        name: { type: String },
        url: { type: String }
    },
    insuranceDocument: {
        name: { type: String },
        url: { type: String }
    },
    powerOfAttorney: {
        name: { type: String },
        url: { type: String }
    },
    invoice: {
        name: { type: String },
        url: { type: String }
    },
    clearanceCertificate: {
        name: { type: String },
        url: { type: String }
    },
    fixedAssetregister: {
        name: { type: String },
        url: { type: String }
    },
    oldValuationReport: {
        name: { type: String },
        url: { type: String }
    },
    pendingCharges: {
        name: { type: String },
        url: { type: String }
    },
    status: {
        type: String
    },
    assetType: {
        type: String,
    },
    otpVerification: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: { createdAt: true },
}
);

let asset = mongoose.model('asset', assetSchema);
module.exports = asset