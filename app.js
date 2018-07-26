/* request */
var express           = require("express"),
    bodyParser        = require("body-parser"),
    mongoose          = require("mongoose"),
    expressMongoDb    = require("express-mongo-db"),
    methodOverride    = require("method-override"),
// local models
    Post        = require("./models/post.js"),
    User        = require("./models/user.js"),
    Comment     = require("./models/comments.js");


//Create new instance of app
var app     = express(); 
//set default engine to ejs
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+'/public'));  //set public directory
app.use(expressMongoDb('mongodb://localhost:27017/facebook')); //get db from req
mongoose.Promise = global.Promise;
// app.use(express.bodyParser());
//parse json files
app.use(bodyParser.json()); 
app.use(bodyParser.text());
app.use(methodOverride('_method'));
// connect to the database
mongoose.connect('mongodb://localhost:27017/facebook',{ useNewUrlParser: true },function(err, db) {
    if (err) {
        console.log('Unable to connect to the server. Please start the server. Error:', err);
    } else {
        console.log('Connected to Server successfully!');
    }
});

// seeds

// var seedsDb     =    require("./seedsDb.js");
//     seedsDb();

//login or singup page
app.get("/",function(req,res){
    res.render('landing');
});
// show profiles with friends in it
// GET - SHOW USER PROFILE
app.get("/profile/:username",(req,res) => {
    db=req.db;
    User.findOne({"username": req.params.username}, (err,user) =>{
        // console.log(friends);
        res.render('profile', { user: user});
    });
});
// GET - STRANGERS PROILES
app.get("/profile/:username/people/:people",function(req,res){
    db=req.db;
    User.findOne({"username": req.params.people}, function(err,user){
        User.findOne({"username": req.params.username}, function(err,loggedUser){
            res.render("peoples",{user:user,loggedUser:loggedUser});
        });
    });
});


// POST - ADD USERNAME TO THE PROFILE FRIENDS ARRAY AND THE OTHER WAY
app.post("/profile/:username/addfriend/:people",(req,res) => { 
    db=req.db;
   User.findOne({"username":req.params.username},(err,user)=>{
        if(err) console.log(err);
        else{
            User.findOne({"username":req.params.people},(err,people)=>{
                if(err) console.log(err);
                else{
                    db.collection("users").update(
                            { username: req.params.username },
                            { $addToSet: { friends:{
                               name:people.name,
                               profilePic:people.profilePic,
                               username:people.username
                                }       
                            }  
                        })
                    db.collection("users").update(
                        { username: req.params.people },
                        { $addToSet: { friends:{
                               username:user.username,
                               name:user.name,
                               profilePic:user.profilePic
                        }} }
                    )
                    res.redirect("/profile/"+req.params.username+"/people/"+req.params.people);
                }
            });
        }
   });
});
// POST  - ADD IMAGE POST TO POST ARRAY
app.post("/profile/:username/addPhoto",(req,res)=>{
    Post.create({
        username:req.params.username,
        description:req.body.description,
        image:req.body.photo
    },(err,newImagePost)=>{
        if(err) console.log(err);
        else{
            User.findOne({"username":req.params.username},(err,user)=>{
                if(err) console.log(err);
                else{
                    user.posts.push(newImagePost);
                    user.save();
                    res.redirect("/profile/"+req.params.username);
                }
            });
        }
    });
});
// POST  - ADD POST TO POST ARRAY
app.post("/profile/:username/addPost",(req,res)=>{
    User.findOne({"username":req.params.username},(err,user)=>{
        if(err) console.log(err);
        else{
            Post.create({
                username:req.params.username,
                description:req.body.newPost
            },(err,newPost) =>{
                if(err) console.log(err);
                else{
                    user.posts.push(newPost);
                    user.save();
                    res.redirect("/profile/"+req.params.username);
                }
            })
        }
    })
});
// Comment -Add comment
app.post("/profile/:hostUsername/:postId/addComment/:postPersonUsername",(req,res)=>{
    User.findOne({"username":req.params.postPersonUsername},(err,profilImageInfoUser)=>{
        if(err) console.log(err);
        else{
            var newComment={
                text:req.body.comment,
                username:req.params.postPersonUsername,
                name:profilImageInfoUser.name,
                profileImage:profilImageInfoUser.profilePic
            }
            User.findOne({"username":req.params.hostUsername},(err,user)=>{
                if(err) console.log(err);
                else{
                    Comment.create(newComment,(err,newComm)=>{
                        if(err) console.log(err);
                        else{
                            for(var i=0;i<=user.posts.length-1;i++){
                                if(user.posts[i]._id == req.params.postId){
                                   user.posts[i].comments.push(newComm);
                                   user.save();
                                   res.redirect('back');
                                   break;
                                }
                            }
                        }
                    })
                }
            })
        }
    })
});
// Comment -delete Comment
app.delete("/profile/:hostName/:postId/deleteComm/:ComId",(req,res)=>{
    User.findOne({'username':req.params.hostName},(err,user)=>{
        if(err) console.log(err);
        else{
            for(var i=0;i<=user.posts.length-1;i++){
                if(user.posts[i]._id == req.params.postId){
                    for(var j=0;j<=user.posts[i].comments.length-1;j++){
                        if(user.posts[i].comments[j]._id == req.params.ComId){
                            user.posts[i].comments.splice(j,1);
                            user.save();
                            res.redirect("/profile/"+req.params.hostName);
                            break; 
                            
                        }
                    }
                }
            }
        }
    })
});
// like -Add like
app.post("/profile/:postHost/:postId/like/:username",(req,res)=>{
    User.findOne({"username":req.params.postHost},(err,user)=>{
        var userObj={
            username:req.params.username
        }
        if(err) console.log(err);
        else{
            for(var i=0;i<=user.posts.length-1;i++){
                if(user.posts[i]._id == req.params.postId){
                    user.posts[i].likes.push(userObj);
                    user.save();
                    res.redirect("back");
                    break;
                }
            }
        }
    })
})

// like-delete like
app.delete("/profile/:postHost/:postId/unlike/:username",(req,res)=>{
    User.findOne({"username":req.params.postHost},(err,user)=>{
        if(err) console.log(err);
        else{  
            for(var i=0;i<=user.posts.length-1;i++){
            if(user.posts[i]._id == req.params.postId){
                for(var j=0;j<=user.posts[i].likes.length-1;j++){
                    if(user.posts[i].likes[j].username == req.params.username){
                        console.log("true");
                        user.posts[i].likes.splice(j,1);
                        user.save();
                        res.redirect("back");
                        break;
                      }
                     }
                }
            }
        }
    });
});

// DELETE - Delete post
app.delete("/profile/:username/removePost/:postId",(req,res)=>{
    db=req.db;
    User.findOne({"username":req.params.username},(err,user)=>{
        if(err) console.log(err);
        else{
            for(var i=0;i<=user.posts.length-1;i++){
                if(user.posts[i]._id == req.params.postId){
                    user.posts.splice(i,1);
                    user.save();
                    res.redirect("/profile/"+req.params.username);
                    break; 
                }else{
                    console.log("false");
                }
            }
        }
    });
});




var port=process.env.port || 8080
app.listen(port,function(){
    console.log("Server started!");
});

// TODO
// ADD USERNAME TO POSTS AND THEN ADD LIKES 


