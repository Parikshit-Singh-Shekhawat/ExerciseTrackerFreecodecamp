const mySecret = process.env['MONGO_URI']
const mongoose=require("mongoose");
const moment=require("moment");

mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: String 
});

const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date,
  id: String
});

const User = mongoose.model("User", userSchema);

const Exercise = mongoose.model("Exercise", exerciseSchema);

function newUser(userName,callback){
  var newUser=new User({username:userName});
  const result={};
  newUser.save(function(err,data){
    if(err){
      result.message="User not Added.";
      callback(true,result);
    } else{
      callback(false,data);
    }
    
  });
}
//612f14eb07d33c0732788efd
function findAllUsers( callback){
  // var newUser=new User({username:userName});
  User.find()
  .select({username:1, _id:1})
  .exec(function(err,data){
    const result={};
    if(err){
      result.message="User's does not Exists.";
      callback(true,result);
    } else{
      callback(false,data);
    }
  });
}

function checkUserById( userId,callback){
  // var newUser=new User({username:userName});
  User.findOne({_id:userId})
  .select({username:1, _id:1})
  .exec(function(err,data){
    const result={};
    if(err){
      result.message="User's does not Exists.";
      callback(true,result);
    } else{
      callback(false,data);
    }
  });
}

function addNewExercise(id,description,duration,date,username,callback){
  var newExercise=new Exercise({username:username,description:description,duration:duration,date:date,id:id});
  console.log("new exercise adding->"+newExercise);
  const result={};
  newExercise.save(function(err,data){
    if(err){
      result.message="Exercise not Added.";
      console.log("new exercise adding Failes->"+err)
      callback(true,result);
    } else{
      var res={};
      res.username=data.username;
      res.description=data.description;
      res.duration=data.duration;
      res.date=data.date;
       res._id=data.id;
      callback(false,res);
    }
    
  });
}



function checkExerciseById( userId,callback){
  Exercise.find({id:userId})
  .select({description:1, duration:1,date:1})
  .exec(function(err,exercise){
    const result={};
    if(err){
      result.message="User's does not Exists.";
      callback(true,result);
    } else{
      var exercises=[];
      exercise.forEach(element => {
          var dataElement={}
          dataElement.description=element.description;
          dataElement.duration=element.duration;
          dataElement.date=moment(element.date).format('ddd MMM DD YYYY');
          exercises.push(dataElement);
      });
      callback(false,exercises);
    }
  });
}


function checkExerciseByIdWithFilter( userId,query,callback){
  // var query=[
  //   { $match: { date:  { $gte: new Date("1990-01-01"), 
  //                         $lte: new      Date("2021-08-31") 
  //                       } 
  //               , id: userId
  //             }
  //   },
  //   {$limit:2}
  // ] ;

  Exercise.aggregate(query,function(err,exercise){
    const result={};
    if(err){
      result.message="User's does not Exists.";
      console.log(err);
      callback(true,result);
    } else{
      console.log("checkExerciseByIdWithFilter result ok->"+JSON.stringify(exercise));
      var exercises=[];
      exercise.forEach(element => {
        
          var dataElement={}
          dataElement.description=element.description;
          dataElement.duration=element.duration;
          dataElement.date=moment(element.date).format('ddd MMM DD YYYY');
          exercises.push(dataElement);
      });
      callback(false,exercises);
    }
  });
  
}

module.exports={newUser,findAllUsers,checkUserById,addNewExercise,checkExerciseById, checkExerciseByIdWithFilter}