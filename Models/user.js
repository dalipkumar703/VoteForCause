var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports =mongoose.model('User',
               new Schema({   name:String,
                 email: String,
                 password: String
               }),
               'user');
