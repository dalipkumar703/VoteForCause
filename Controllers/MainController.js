var bodyParser=require('body-parser');
var mongo=require('mongoose');
var db="mongodb://dalip:dannyLUCK@ds157584.mlab.com:57584/vote";
mongo.connect(db);
module.exports=function(app){
  console.log("main controller");
  app.use(bodyParser.json());

  app.get('/',function(req,res){
    res.send("Bingo");
  })
  app.post('/api/usersubmit/:user/:email',function(req,res){
    res.json(req.params.user+""+req.params.email);  
  });
}
