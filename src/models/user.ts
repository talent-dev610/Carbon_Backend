
/** @format */

import mongoose from "mongoose";
import { createFalse } from "typescript";
const Schema = mongoose.Schema;

// Basic Schema
const UserSchema = new Schema({
    name: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        default: "",
        require: true,
    },
    password: {
        type: String,
        default: "",
    },
    purchaser: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    yearsOwned: {
        type: String,
        default: ""
    },
    titledOwner: {
        type: String,
        default: ""
    },
    developed: {
        type: Boolean,
        default: true
    },
    treeType: {
        type: String,
        default: ""
    },
    landPlotImage: {
        type: String,
        default: ""
    },
    ownershipDocument: {
        type: String,
        default: ""
    },
    contactName: {
        type: String,
        default: "",
    },
    city: {
        type: String,
        default: "",
    },

    state: {
        type: String,
        default: "",
    },

    contactNumber: {
        type: String,
        default: "",
    },

    creditRequired: {
        type: String,
        default: "",
    },

    businessType: {
        type: String,
        default: ""
    },
    role: {
        type: Number,
        default: 1
    },
    verify: {
        type: Boolean,
        default: false
    }
});

export default mongoose.model("users", UserSchema);
