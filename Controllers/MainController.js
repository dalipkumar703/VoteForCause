// load npm modules
var bodyParser=require('body-parser');
var mongo=require('mongoose');
var request=require('request');
var fs=require('file-system');
var multer=require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload=multer({storage:storage});
//load controllers
var FunctionController=require('./FunctionController');
//load models
var User=require('../Models/user');
var Aadhar=require('../Models/aadhar_detail');
var VoteForm=require('../Models/voting-form');
var AnswerOfRangeType=require('../Models/answer-of-type-1');
var AnswerOfCheckType=require('../Models/answer-of-type-2');
var UserVotes=require('../Models/user-votes');
// define variables
var reply="";
var db="mongodb://dalip:dannyLUCK@ds157584.mlab.com:57584/vote";
mongo.connect(db);
//app start call function
module.exports=function(app){
  console.log("main controller");

  app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));

//test url
  app.get('/',function(req,res){
    res.send("Bingo");
  });
  app.get('/api/getAadharDetail/:email',function(req,res){
    Aadhar.findOne({email:req.params.email}).exec(function(err,data){
      if(!err&&data!=null)
      {
        res.json(data);
      }
      else {
        res.json(err);
      }
    })
  })
//register user
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
  //upload Aadhar image to server
  app.post('/api/uploadImage',upload.single('photo'),function(req,res){
    console.log("request:",req);
    //var image=req.body.image;
    request({
      headers: {
        apikey: "db4d686b888957",
        'Content-Type':"application/x-www-form-urlencoded"
      },
      url:"https://api.ocr.space/parse/image",
      method:"POST",
      formData:{
        file:fs.createReadStream('upload/'+req.file.filename)
      }
    },function(err,response){
      if(!err)
      {
         console.log("response,",response);
      FunctionController.getAddress(response,err,req,res);
   }
      else {
          console.log("err:",err);
         res.json(false);
      }
    })

  })
  //check user has submit aadhar
  app.get('/api/aadhar-check/:email',function(req,res){
    Aadhar.findOne({email:req.params.email}).exec(function(err,data){
       console.log("hello",data);
      if(!err&&data!=null)
      {
        res.send(true);
      }
      else {
        res.send(false);
      }
    })
  })
  //save user aadhar detail
  app.post('/api/aadhardetail',function(req,res){
   console.log("i am here.");
   console.log("email:",req.body.email);
     //check user exist before saving aadhar detail
    User.findOne({email:req.body.email}).exec(function(err,data){
      console.log("length:",data)
      if(!err&& data!=null)
      {
        //extract image detail using ocr api
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
        })
      }
      else {
        console.log("error in user finding");
        res.json("error in user finding");
      }
    })
  });
   //send voting form detail to user
  app.get('/api/votingformdetail/:pincode',function(req,res){
         // find form corresponding to that pincode
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
  //handle when user submit voting form
  app.post('/api/votingformsubmit',function(req,res){
          /*
          //voting form array type
          {
          pincode: req.body.pincode,
          email: req.body.email,
          form_id: req.body.form_id,
          answer:[
          {
          type:range,
          question_id: req.body.question_id,
          vote:"axy"
        }
        ]
        }
          */
          console.log("i am here.",req.body);
        //check aadhar detail exist
       Aadhar.findOne({
         $and : [
             {email:req.body.email},
              {address_code:req.body.pincode}
         ]
       }).exec(function(err,data){
              console.log("data:",data);
         if(!err && data!=null)
         {
           //check user has given vote.
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
                  //when form answer of range type
                 if(answer.type=="range")
                 {
                   //get current status of answer of range type document
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
                      //update user vote in to answer of range type document
                     FunctionController.answerTypeRangeUpdate(req,answer,data);
                    }
                    else {
                      res.json(err);
                    }
                  })
                 }
                 //when answer of checkbox type
                 else if(answer.type=="checkbox")
                 {
                   //get current status of answer of checkbox type document
                 AnswerOfCheckType.find({
                   $and :[
                     {form_id: req.body.form_id},
                     {question_id: answer.question_id},
                     {address_code: req.body.pincode}
                   ]}).exec(function(err,data){
                     if(!err && data!=null)
                     {
                       console.log("data:",data);
                       //update user vote into answer of checkbox document
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

app.get('/api/get-voting-result/:pincode',function(req,res){
  AnswerOfRangeType.findOne({address_code:req.params.pincode}).exec(function(err,data){
    if(!err&&data!=null)
    {
      AnswerOfCheckType.findOne({address_code:req.params.pincode}).exec(function(err,result){
        if(!err&&result!=null)
        {
          var sendData={
            check:result,
            range:data
          };
          res.json(sendData);
        }
        else {
          res.json("error in voting result");
        }
      })
    }
    else {
      res.json(err);
    }
  })
})
}
