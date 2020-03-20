const mongoose = require('mongoose')

const zipCodeSchema = new mongoose.Schema({
  zipCode: {
    type: String,
    unique: true
  },
  medianIncome: Number
})

module.exports = mongoose.model('ZipCode', zipCodeSchema)
