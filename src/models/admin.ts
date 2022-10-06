/** @format */

import mongoose from "mongoose";
import { createFalse } from "typescript";
const Schema = mongoose.Schema;

// Basic Schema
const AdminSchema = new Schema({
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
    }
});

export default mongoose.model("admin", AdminSchema);
