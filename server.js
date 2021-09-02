require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser");
const db=require("./db")
const moment=require("moment");

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users",function(req,res,next){
  if(req.body.username){
    var userName=req.body.username;
    db.newUser(userName,function(err, data){
        if(err){
          console.log("POST /api/users Error->",data.message);
          res.send({error:true,
          message:data.message});
        } else{
          console.log("POST /api/users Success->",data);
          res.send({username:data.username,
          _id:data._id});
        }
      });
  } else{
    res.send({error:"invalid name"});
  }
});

app.get("/api/users",function(req,res,next){
  var userName=req.body.username;
  db.findAllUsers(function(err, data){
    if(err){
      console.log(" GET /api/users Error->",data.message);
      res.send({error:true,
      message:data.message});
    } else{
      console.log("GET /api/users Success->",data);
      res.send(data);
    }
  });
});

app.post("/api/users/:_id/exercises",function(req,res,next){

  var duration=req.body.duration;
  var description=req.body.description;
  var date=req.body.date;
  var id=req.params._id;
  console.log("add exercise values"+duration+" "+description+" "+date+" "+id);
  if(!date){
    var now = new Date();
    date = moment(now).format('YYYY-MM-DD');
  } else{
    var aDate   = moment(date, 'YYYY-MM-DD', true);
    if(!aDate.isValid()){
      res.send({error:"invalid date"});
    }
  }

  if(!duration || isNaN(duration)){
    res.send({error:"invalid duration"});
  }

  if(!description ){
    res.send({error:"invalid description"});
  }
  console.log(" POST /api/users/:_id/exercises id->",id);

  db.checkUserById(id,function(err, data){
    if(err){
      console.log("add exercise checkUserById Error->",data.message);
      res.send({error:true,
      message:data.message});
    } else{
      console.log("add exercise checkUserById Success->",data);
      var username=data.username;
      db.addNewExercise(id,description,duration,date,username,function(err,exercise){
        if(err){
          console.log("POST /api/users/:_id/exercises AddError->",err);
          res.send({error:true,
          message:"Exercise not added. "+err});       
        } else{
          exercise.date=moment(exercise.date).format('ddd MMM DD YYYY');
          console.log("add exercise Success->",exercise);
          var response={};
          response.user=exercise;
          res.send(exercise);      
        }
      });
    }
  });
});


app.get("/api/users/:_id/logs",function(req,res,next){
  var id=req.params._id;
  var query=[];
  var match={id:id};
  
  if(req.query.from || req.query.to){
    var date={};
    if(req.query.from) {
      date.$gte=new Date(req.query.from);
    }
    if(req.query.to) {
      date.$lte=new Date(req.query.to);
    }
    match.date=date;
    
  }
  query.push({$match:match});

  if(!isNaN(req.query.limit)){
    var limit={$limit:Number(req.query.limit)}
    query.push(limit);
  }
  console.log("GET /api/users/:_id/logs checkUserById Query->",JSON.stringify(query));
  db.checkUserById(id,function(err, data){
    if(err){
      console.log("GET /api/users/:_id/logs Error->",data.message);
      res.send({error:true,
      message:data.message});
    } else{
      console.log("GET /api/users/:_id/logs checkUserById Success->",data);

      var username=data.username;
      db.checkExerciseByIdWithFilter(id, query, function(err,exercise){
        if(err){
          console.log(" GET /api/users/:_id/logs Error->",err);
          res.send({error:true,
          message:"Exercise not added. "+err});       
        } else{
          var response={};
          response.username=username;
          response.count=exercise.length;
          response._id=id;
          response.log=exercise;
          console.log("GET /api/users/:_id/logs checkExerciseById Success->",response);
          res.send(response);      
        }
      });
    }
  });
});

// 613073eaa3839c078b5dd10a

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
