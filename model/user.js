const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const passwordUtil = require('../utils/password');

const userSchema = mongoose.Schema({
    password: {
        type: String,
        required: true
    },
    orgName: {
        type: String,
        default: ''
    },
    product: {
        type: String,
        required: true
    },
    adminName: {
        type: String,
        default: '',
        default: false
    },
    designation: {
        type: String,
        default: ''
    },
    mobile: {
        type: String,
    },
    email: {
        type: String,
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    isEmail: {
        type: Boolean,
        default: false
    },
    isMobile: {
        type: Boolean,
        default: false
    },
    companyDetails: {
        name: {
            type: String,
            default: ''
        },
        yearOfIncorporation: {
            type: String,
            default: ''
        },
        product: {
            type: String,
            default: ''
        },
        industryType: {
            type: String,
            default: ''
        },
        licenseNumber: {
            type: String,
            default: ''
        },
        address: {
            type: String,
            default: ''
        },
        PAN: {
            type: {
                _id: false,
                name: {
                    type: String,
                    default: ''
                },
                panNumber: {
                    type: String,
                    default: ''
                },
                file: {
                    type: String,
                    default: ''
                }
            },
            default: {}
        },
        udhyamDetails: {
            type: {
                _id: false,
                name: {
                    type: String,
                    default: ''
                },
                udhyamNumber: {
                    type: String,
                    default: ''
                },
                file: {
                    type: String,
                    default: ''
                }
            },
            default: {}
        },
        GST: {
            type: {
                _id: false,
                name: {
                    type: String,
                    default: ''
                },
                GSTNumber: {
                    type: String,
                    default: ''
                },
                file: {
                    type: String,
                    default: ''
                }
            },
            default: {}
        },
        currentOutstandingLoan: {
            type: {
                _id: false,
                name: {
                    type: String,
                    default: ''
                },
                file: {
                    type: String,
                    default: ''
                }
            },
            default: {}
        },
        bankDetails: {
            bankName: {
                type: String,
                default: ''
            },
            branchName: {
                type: String,
                default: ''
            },
            accountNumber: {
                type: String,
                default: ''
            },
            IFSC: {
                type: String,
                default: ''
            },
            bankStatement: {
                type: {
                    _id: false,
                    name: {
                        type: String,
                        default: ''
                    },
                    file: {
                        type: String,
                        default: ''
                    }
                },
                default: {}
            }
        },
        profitLossStatement: {
            type: {
                _id: false,
                name: {
                    type: String,
                    default: ''
                },
                file: {
                    type: String,
                    default: ''
                }
            },
            default: {}
        },
        incomeTaxReturn: {
            type: {
                _id: false,
                name: {
                    type: String,
                    default: ''
                },
                file: {
                    type: String,
                    default: ''
                }
            },
            default: {}
        },
    },
    PAN: {
        type: {
            _id: false,
            name: {
                type: String,
                default: ''
            },
            panNumber: {
                type: String,
                default: ''
            },
            file: {
                type: String,
                default: ''
            }
        },
        default: {}
    },
    aadhar: {
        type: {
            _id: false,
            name: {
                type: String,
                default: ''
            },
            aadharNumber: {
                type: String,
                default: ''
            },
            file: {
                type: String,
                default: ''
            }
        },
        default: {}
    },
    isPersonalKYCDone: {
        type: Boolean,
        default: false
    },
    isBussinesKYCDone: {
        type: Boolean,
        default: false
    },
    isAllCompanyInfoAvailable: {
        type: Boolean,
        default: false
    },
    isKYCPartial: {
        type: Boolean,
        default: false
    },
    isKYCVerificationInProgress: {
        type: String,
        default: 'INITIAL',
        enum:['PROGRESS','FAILED','DONE','INITIAL']
    },
    KYCPersonal: {
        isPANSubmitted: {
            type: Boolean,
            default: false
        },
        isAadharSubmitted: {
            type: Boolean,
            default: false
        },
    },
    KYCBussiness: {
        isPANSubmitted: {
            type: Boolean,
            default: false
        },
        udhyamDetailsSubmitted: {
            type: Boolean,
            default: false
        },
        isGSTSubmitted: {
            type: Boolean,
            default: false
        },
        isStatementSubmitted: {
            type: Boolean,
            default: false
        },
        isProfitLossSubmitted: {
            type: Boolean,
            default: false
        },
        isIncomeTaxSubmitted: {
            type: Boolean,
            default: false
        },
        isCurrentOutStandingLoan: {
            type: Boolean,
            default: false
        },
    },
}, {
    timestamps: { createdAt: true, updatedAt: true },
}
);
userSchema.pre('save', async function (next) {
    if (this.isModified('password') && this.password) {
        this.password = await passwordUtil.getHash(this.password);
    }
    next();
});

// compare password
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};
const User = mongoose.model('User', userSchema);

module.exports = User;