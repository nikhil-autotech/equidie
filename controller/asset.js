const assetModel = require("../model/asset")
const APIFeatures = require('../utils/apiFeatures');





const assetRegister = async (req, res) => {

    let data = req.body;
    data["status"] = "pending registration"
    let addPlantAndMachinery = await assetModel.create(data)
    return res.status(201).send({ error: false, message: "assete is creted", data: addPlantAndMachinery })


}

const updateAsset = async (req, res) => {
    let assetId = req.query.registerId;
    let data = req.body
    let updatedAsset = await assetModel.findByIdAndUpdate(assetId, { $set: data }, { upsert: true, new: true },)
    updatedAsset = updatedAsset.toObject();
    if (updatedAsset.assetType == "plantAndMachinery") {
        if (updatedAsset.purchaseBill && updatedAsset.taxInvoice && updatedAsset.insuranceDoc && updatedAsset.assetInvoice && updatedAsset.technicalSpecifications && updatedAsset.assetName && updatedAsset.tenure && updatedAsset.yearOfManufacture && updatedAsset.serialNumber && updatedAsset.assetMake && updatedAsset.assetModel && updatedAsset.assetValue && updatedAsset.technicalSpecifications && updatedAsset.otpVerification) {
            const newUpdatedAsset = await assetModel.findByIdAndUpdate(assetId, { status: "registered" }, { upsert: true, new: true },)
            return res.status(200).send({ error: false, message: "assete is updated", data: newUpdatedAsset })
        } else if (updatedAsset.purchaseBill && updatedAsset.taxInvoice && updatedAsset.insuranceDoc && updatedAsset.assetInvoice && updatedAsset.technicalSpecifications && updatedAsset.assetName && updatedAsset.tenure && updatedAsset.yearOfManufacture && updatedAsset.serialNumber && updatedAsset.assetMake && updatedAsset.assetModel && updatedAsset.assetValue && updatedAsset.technicalSpecifications && !updatedAsset.otpVerification) {
            const newUpdatedAsset = await assetModel.findByIdAndUpdate(assetId, { status: "pending verification" }, { upsert: true, new: true },)
            return res.status(200).send({ error: false, message: "assete is updated", data: newUpdatedAsset })
        }
    } else if (updatedAsset.assetType == "realEsate") {
        if (updatedAsset.propertyTax && updatedAsset.oldValuationReport && updatedAsset.assetName && updatedAsset.tenure && updatedAsset.landOwner && updatedAsset.titleDeed && updatedAsset.landRegistry && updatedAsset.assetValue && updatedAsset.otpVerification) {
            let newUpdatedAsset = await assetModel.findByIdAndUpdate(assetId, { status: "registered" }, { upsert: true, new: true },)
            return res.status(200).send({ error: false, message: "assete is updated", data: newUpdatedAsset })
        } else if (updatedAsset.propertyTax && updatedAsset.oldValuationReport && updatedAsset.assetName && updatedAsset.tenure && updatedAsset.landOwner && updatedAsset.titleDeed && updatedAsset.landRegistry && updatedAsset.assetValue && !updatedAsset.otpVerification) {
            let newUpdatedAsset = await assetModel.findByIdAndUpdate(assetId, { status: "pending verification" }, { upsert: true, new: true },)
            return res.status(200).send({ error: false, message: "assete is updated", data: newUpdatedAsset })

        }
    }
    res.send(updatedAsset)
}

const getAllAssetList = async (req, res) => {
    const features = new APIFeatures(assetModel.find({}), req.query)
        .sort()
        .limitFields()
        .paginate()
        .filter();
    const plantAssetListData = await features.query;
    const responeDataForPlant = JSON.parse(JSON.stringify(plantAssetListData));
    res.status(200).send({ error: false, message: "asset list ", data: responeDataForPlant })


}

const getAssetListById = async (req, res) => {
    let assetId = req.query.registerId
    let getplantAssetData = await assetModel.findById(assetId)
    res.status(200).send({ error: false, message: "assete data", data: getplantAssetData })

}

module.exports = { assetRegister, updateAsset, getAllAssetList, getAssetListById }
