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
        udhyamDetails: {
            name: {
                type: String,
                default: ''
            },
            file: {
                type: String,
                default: ''
            }
        },
        GST: {
            name: {
                type: String,
                default: ''
            },
            file: {
                type: String,
                default: ''
            }
        },
        currentOutstandingLoan: {
            name: {
                type: String,
                default: ''
            },
            file: {
                type: String,
                default: ''
            }
        },
        bankDetails: {
            bank: {
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
                name: {
                    type: String,
                    default: ''
                },
                file: {
                    type: String,
                    default: ''
                }
            }
        },
        profitLossStatement: {
            name: {
                type: String,
                default: ''
            },
            file: {
                type: String,
                default: ''
            }
        },
        incomeTaxReturn: {
            name: {
                type: String,
                default: ''
            },
            file: {
                type: String,
                default: ''
            }
        },
    },
    PAN: {
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
    aadhar: {
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
    isDoneKYC:{
        type: Boolean,
        default: false
    },
    isDoneCompanyKYC:{
        type: Boolean,
        default: false
    },
    isCompanyKYCPartial:{
        type: Boolean,
        default: false
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
