var mongoose=require("mongoose");

var commentSchema=new mongoose.Schema({
    text:String,
    username:String,
    name:String,
    profileImage:String,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    }
   
    // image:String
});

module.exports=mongoose.model("Comment",commentSchema);