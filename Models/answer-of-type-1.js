var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports =mongoose.model('AnswerOfRangeType',
               new Schema({   form_id:String,
                  question_id:String,
                 address_code:String,
                 sequence_id:String,
                 answer_one: String,
                 answer_two: String,
                 answer_three: String,
                 answer_four: String,
                 answer_five: String,
                 answer_six: String,
                 answer_seven: String,
                 answer_eight: String,
                 answer_nine: String,
                 answer_ten: String
               }),
               'answer_of_type_1');
