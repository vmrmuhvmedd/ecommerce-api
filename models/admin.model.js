const mongoose = require('mongoose');
const User = require('./user.model');
const Schema = mongoose.Schema;

const adminSchema = new Schema({});

const Admin = User.discriminator('Admin', adminSchema);

module.exports = Admin;
