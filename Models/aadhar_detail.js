var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports =mongoose.model('Aadhar',
               new Schema({   name:String,
                 email:String,
                 region: String,
                 gender: String,
                 address_code:String,
                 aadhar_no:String
               }),
               'aadhar_detail');
