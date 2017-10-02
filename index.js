var container=require('express');
var controller=require('./Controllers/MainController');
var app=container();
app.set('port',3000);
controller(app);
app.listen(app.get('port'),function(){

  console.log("App start");
});
