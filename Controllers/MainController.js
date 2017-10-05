var bodyParser=require('body-parser');
var mongo=require('mongoose');
var request=require('request');
var FunctionController=require('./FunctionController');
var User=require('../Models/user');
var Aadhar=require('../Models/aadhar_detail');
var VoteForm=require('../Models/voting-form');
var AnswerOfRangeType=require('../Models/answer-of-type-1');
var AnswerOfCheckType=require('../Models/answer-of-type-2');
var UserVotes=require('../Models/user-votes');
var reply="";
var db="mongodb://dalip:dannyLUCK@ds157584.mlab.com:57584/vote";
mongo.connect(db);
module.exports=function(app){
  console.log("main controller");
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.get('/',function(req,res){
    res.send("Bingo");
  });
  app.post('/api/usersubmit/',function(req,res){
      User({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password
      }).save(function(err,data){
        if(!err)
        {
          console.log("data:",data);
          res.json(data);
        }
      })
  });
  app.post('/api/aadhardetail',function(req,res){
   console.log("i am here.");
   console.log("email:",req.body.email);
    User.findOne({email:req.body.email}).exec(function(err,data){
      console.log("length:",data)
      if(!err&& data!=null)
      {
        request({
          url:"https://api.ocr.space/parse/imageurl?apikey=db4d686b888957&url="+req.body.url,
          method:"GET"
        }, function(err,response){
          var result=JSON.parse(response.body);
          console.log(result.ParsedResults);
          if(!err&&result.ParsedResults!=null)
          {
            console.log("parsed result:",result.ParsedResults);
            console.log("text:",result.ParsedResults[0].ParsedText);
            var pincode=/[0-9][0-9][0-9][0-9][0-9][0-9]/i.exec(result.ParsedResults[0].ParsedText);
             console.log("pincode",pincode[0]);
            request({
              url:"http://postalpincode.in/api/pincode/"+pincode,
              method:"GET"
            },function(error,response,body){
                  if(!error)
                  {
                    var result=JSON.parse(body);
                    //res.json(result.PostOffice[0].Circle+result.PostOffice[0].Region);
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
        })
      }
      else {
        console.log("error in user finding");
        res.json("error in user finding");
      }
    })
  });

  app.get('/api/votingformdetail/:pincode',function(req,res){
       VoteForm.find({address_code:req.params.pincode}).exec(function(err,data){
         if(!err&&data!=null)
         {
           console.log("data:",data);
           res.json(data);

         }
         else {
           res.json(err);
         }
       })
  });
  app.post('/api/votingformsubmit',function(req,res){
          /*
          {
          pincode: req.body.pincode,
          email: req.body.email,
          form_id: req.body.form_id,
          answer:[
          {
          type:range,
          question_id: req.body.question_id
        }
        ]
        }
          */
          console.log("i am here.");
       Aadhar.findOne({
         $and : [
             {email:req.body.email},
              {address_code:req.body.pincode}
         ]
       }).exec(function(err,data){
              console.log("data:",data);
         if(!err && data!=null)
         {
           UserVotes.find({
             $and : [
               {form_id:req.body.form_id},
               {email:req.body.email}
           ]
         }).exec(function(err,data){
             console.log("USER:",data.length);
             if(data.length==0)
             {
               req.body.answers.forEach(function(answer){
                 console.log("answer:",answer);
                 if(answer.type=="range")
                 {
                  AnswerOfRangeType.find({
                     $and :[
                    {form_id: req.body.form_id},
                    {question_id: answer.question_id},
                    {address_code: req.body.pincode}
                  ]
                }).exec(function(err,data){
                    if(!err && data!=null)
                    {
                      console.log("data:",data);
                      console.log("sequence_id:",data[0].sequence_id);
                      console.log("answer:",answer.vote);
                      var test="answer_five";
                      //console.log("value of 5:",data[0].5);
                     FunctionController.answerTypeRangeUpdate(req,answer,data);
                    }
                    else {
                      res.json(err);
                    }
                  })
                 }
                 else if(answer.type=="checkbox")
                 {
                 AnswerOfCheckType.find({
                   $and :[
                     {form_id: req.body.form_id},
                     {question_id: answer.question_id},
                     {address_code: req.body.pincode}
                   ]}).exec(function(err,data){
                     if(!err && data!=null)
                     {
                       console.log("data:",data);
                      FunctionController.answerOfTypeCheckUpdate(req,answer,data);
                     }
                     else {
                       res.json(err);
                     }
                   })
                 }
               })

             }
             else {
              console.log("user voted ");
        //      res.json("user voted for it");
             }
           })
        res.json("success");

         }
         else {
           console.log(err);
           res.json(err);
         }
       })
  });
}
