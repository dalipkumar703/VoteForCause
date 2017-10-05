var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports =mongoose.model('AnswerOfCheckType',
               new Schema({   form_id:String,
                  question_id:String,
                 address_code:String,
                 sequence_id:String,
                 answer_one: String,
                 answer_two: String,
                 answer_three: String,
                 answer_four: String
               }),
               'answer_of_type_2');
