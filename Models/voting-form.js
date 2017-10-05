var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports =mongoose.model('VotingForm',
               new Schema({   form_id:String,
                  question_id:String,
                 address_code:String,
                 type:String,
                 question:String,
                 answer_1: String,
                 answer_2: String,
                 answer_3: String,
                 answer_4: String,
                 answer_5: String,
                 answer_6: String,
                 answer_7: String,
                 answer_8: String,
                 answer_9: String,
                 answer_10: String
               }),
               'question');
