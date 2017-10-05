var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports =mongoose.model('UserVotes',
               new Schema({   form_id:String,
                  question_id:String,
                 email:String
               }),
               'user_votes');
