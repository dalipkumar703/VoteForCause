var bodyParser=require('body-parser');
var mongo=require('mongoose');
var request=require('request');
var User=require('../Models/user');
var Aadhar=require('../Models/aadhar_detail');
var db="mongodb://dalip:dannyLUCK@ds157584.mlab.com:57584/vote";
mongo.connect(db);
module.exports=function(app){
  console.log("main controller");
  app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
    app.get('/',function(req,res){
    res.send("Bingo");
  })
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
                    Aadhar({email:req.params.email,
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
}
