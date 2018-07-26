var mongoose=require("mongoose");

var postSchema=new mongoose.Schema({
    image:String,
    coverPic:String,
    profilePic:String,
    description:String,
    username:String,
    createdOn: { type: Date, default: Date.now },
    comments:[ 
    {
        text:String,
        username:String,
        name:String,
        profileImage:String,
       
    }
],
    // author:{
    //     id:{
    //         type:mongoose.Schema.Types.ObjectId,
    //         ref:"User"
    //     },
    //     username:String
    // }
});

module.exports=mongoose.model("Post",postSchema);