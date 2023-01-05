const express = require("express")
const router = express.Router()

const { assetRegister, updateAsset, getAllAssetList, getAssetListById} = require("../controller/asset")

router.post('/register', assetRegister)
router.get('/getAllAssetList', getAllAssetList)
router.get('/getAllAssetListById',getAssetListById)
router.put('/updateAsset',updateAsset)

module.exports = router