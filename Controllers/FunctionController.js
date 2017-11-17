var AnswerOfRangeType=require('../Models/answer-of-type-1');
var AnswerOfCheckType=require('../Models/answer-of-type-2');
var UserVotes=require('../Models/user-votes');
var request=require('request');
var Aadhar=require('../Models/aadhar_detail');
//when answer of question range
exports.answerTypeRangeUpdate=function(req,answer,data){
     var set={};   //new json object create
   //check which range value user choosen and update json object
   if(answer.vote=="answer_one")
   {
     console.log("answer_one:",data[0].answer_two);
     set={
       sequence_id: parseInt(data[0].sequence_id)+1,
       answer_one:  parseInt(data[0].answer_one)+1
     };
   }
   else if(answer.vote=="answer_two")
   {
     set={
       sequence_id: parseInt(data[0].sequence_id)+1,
       answer_two: parseInt(data[0].answer_one)+1
     };
   }
   else if(answer.vote=="answer_three")
   {
     set={
       sequence_id: parseInt(data[0].sequence_id)+1,
       answer_three: parseInt(data[0].answer_one)+1
     };
   }
   else if(answer.vote=="answer_four")
   {
     set={
       sequence_id: parseInt(data[0].sequence_id)+1,
       answer_four: parseInt(data[0].answer_one)+1
     };
   }
   else if(answer.vote=="answer_five")
   {
     set={
       sequence_id: parseInt(data[0].sequence_id)+1,
       answer_five: parseInt(data[0].answer_one)+1
     };
   }
   else if(answer.vote=="answer_six")
   {
     set={
       sequence_id: parseInt(data[0].sequence_id)+1,
       answer_six: parseInt(data[0].answer_one)+1
     };
   }
   else if(answer.vote=="answer_seven")
   {
     set={
       sequence_id: parseInt(data[0].sequence_id)+1,
       answer_seven: parseInt(data[0].answer_one)+1
     };
   }
   else if(answer.vote=="answer_eight")
   {
     set={
       sequence_id: parseInt(data[0].sequence_id)+1,
       answer_eight: parseInt(data[0].answer_one)+1
     };
   }
   else if(answer.vote=="answer_nine")
   {
     set={
       sequence_id: parseInt(data[0].sequence_id)+1,
       answer_nine: parseInt(data[0].answer_one)+1
     };
   }
   else if(answer.vote=="answer_ten")
   {
     set={
       sequence_id: parseInt(data[0].sequence_id)+1,
       answer_ten: parseInt(data[0].answer_one)+1
     };
   }
 console.log("set:",set);
 // update user vote on answerofrangetype model
  AnswerOfRangeType.update({
    $and :[
      {form_id: req.body.form_id},
      {question_id: answer.question_id},
      {address_code: req.body.pincode}
    ]
  }, {
    $set: set
  }).exec(function(err,data){
    if(!err&&data!=null)
    {
      console.log("success",data);
        //save user detail which has given vote, so it can't give again.
      UserVotes({form_id:req.body.form_id,
                 question_id:answer.question_id,
                 email:req.body.email

              }).save(function(err,data){
                if(!err&&data!=null){
                  console.log(data);

                }
              })
    }
    else {
      console.log(err);
    }
  })
}
// when answer of check type
exports.answerOfTypeCheckUpdate=function(req,answer,data)
{
  var set={}; // new json object
  // check value of checkbox type and update object
  if(answer.vote=="answer_one")
  {
    console.log("answer_one:",data[0].answer_two);
    set={
      sequence_id: parseInt(data[0].sequence_id)+1,
      answer_one:  parseInt(data[0].answer_one)+1
    };
  }
  else if(answer.vote=="answer_two")
  {
    set={
      sequence_id: parseInt(data[0].sequence_id)+1,
      answer_two: parseInt(data[0].answer_one)+1
    };
  }
  else if(answer.vote=="answer_three")
  {
    set={
      sequence_id: parseInt(data[0].sequence_id)+1,
      answer_three: parseInt(data[0].answer_one)+1
    };
  }
  else if(answer.vote=="answer_four")
  {
    set={
      sequence_id: parseInt(data[0].sequence_id)+1,
      answer_four: parseInt(data[0].answer_one)+1
    };
  }
 console.log("set:",set);
 //update user vote on answerofchecktype model
  AnswerOfCheckType.update({
    $and :[
      {form_id: req.body.form_id},
      {question_id: answer.question_id},
      {address_code: req.body.pincode}
    ]
  }, {
    $set: set
  }).exec(function(err,data){
    if(!err&&data!=null)
    {
      console.log("success",data);
        // save user detail which has given vote, so it can't give again.
       UserVotes({form_id:req.body.form_id,
                 question_id:answer.question_id,
                 email:req.body.email

              }).save(function(err,data){
                if(!err&&data!=null){
                  console.log(data);

                }
              })

    }
    else {
      console.log(err);
    }
  })
}
//get user address from aadhar card image and save to collection
exports.getAddress=function(response,err,req,res){
  var result=JSON.parse(response.body);
  console.log(result.ParsedResults);
  if(!err&&result.ParsedResults!=null)
  {
    console.log("parsed result:",result.ParsedResults);
    console.log("text:",result.ParsedResults[0].ParsedText);
    var pincode=/[0-9][0-9][0-9][0-9][0-9][0-9]/i.exec(result.ParsedResults[0].ParsedText);
     console.log("pincode",pincode[0]);
    //extract user city and district using postalpincode api
    request({
      url:"http://postalpincode.in/api/pincode/"+pincode,
      method:"GET"
    },function(error,response,body){
          if(!error)
          {
            var result=JSON.parse(body);
            //res.json(result.PostOffice[0].Circle+result.PostOffice[0].Region);
            //save aadhar detail
            Aadhar({email:req.body.email,
                    region:result.PostOffice[0].Region,
                    address_code:pincode[0]}).save(function(err,data){
                      if(!err)
                      {
                        console.log("data:",data);
                        res.json(data);
                      }
                    });
          }


    })
  }
  else {
    res.json(result.ErrorMessage);
  }

}
