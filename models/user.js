var mongoose=require("mongoose");

var userSchema=new mongoose.Schema({
    username:String,
    password:String,
    name:String,
    maried:Boolean,
    createdOn: { type: Date, default: Date.now },
    from:String,
    quote:String, //profile quote
    coverPic:String,
    profilePic:String,


    friends:[
        {
            username:String,
            profilePic:String,
            name:String
        }
    ],
    posts:
    [
        { 
            username:String,
            image:String,
            description:String,
            createdOn: { type: Date, default: Date.now },
            // id: { type:mongoose.Schema.Types.ObjectId ,ref:"Post" },
            likes:[
            {
                username:String,
            }
            ],
            comments:[
            {
                text:String,
                username:String,
                name:String,
                profileImage:String
            }
            ]
        },
    ]
});

module.exports=mongoose.model("User",userSchema);
