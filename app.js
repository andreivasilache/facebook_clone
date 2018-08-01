/* request */
var express           = require("express"),
    bodyParser        = require("body-parser"),
    mongoose          = require("mongoose"),
    expressMongoDb    = require("express-mongo-db"),
    methodOverride    = require("method-override"),
    passport          = require("passport"),
    LocalStrategy     = require("passport-local"),
// ================= LOCAL MODELS ===================
    Post              = require("./models/post.js"),
    User              = require("./models/user.js"),
    Comment           = require("./models/comments.js");

var app     = express(); //Create new instance of app
app.set("view engine","ejs"); //set default engine to ejs
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+'/public'));  //set public directory
app.use(expressMongoDb('mongodb://localhost:27017/facebook')); //get db from req
mongoose.Promise = global.Promise;
app.use(methodOverride('_method'));
app.use(bodyParser.json()); //parse json files
app.use(bodyParser.text());

//============== PASSWORD ====================
app.use(require("express-session")({
    secret: "This is the best web aplication in the world",
    resave: false,
    saveUninitialized: false
}));

//============== PASSPORT SETTINGS ===========
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// set curent user as global to whole page
app.use(function(req, res, next){
    res.locals.currentUser=req.user;
    next();
});
// ============== MIDDLEWARES ==================
var middlewareObj={};

middlewareObj.isLoggedIn=function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        res.redirect("/register&login");
    }
};

//============ DATABASE SETUP ==================
mongoose.connect('mongodb://localhost:27017/facebook',{ useNewUrlParser: true },function(err, db) {
    if (err) {
        console.log('Unable to connect to the server. Please start the server. Error:', err);
    } else {
        console.log('Connected to Server successfully!');
    }
});

// =============== SEEDS =======================

// var seedsDb     =    require("./seedsDb.js");
//     seedsDb();

// ================ ROUTES =======================


// ============== USER ROUTE ======================

app.get("/",function(req,res){
    res.redirect("/register&login");
 });


 // GET - SHOW USER PROFILE
 app.get("/profile/:username",middlewareObj.isLoggedIn,(req,res) => {
     db=req.db;
     User.findOne({"username": req.params.username}, (err,user) =>{
         if(err) console.log(err);
         else{
             // console.log(friends);
             res.render('profile', { user: user});
         }
     });
 });

 // GET - STRANGERS PROFILES
 app.get("/profile/:username/people/:people",function(req,res){
     if(req.params.username == req.params.people){
         res.redirect("/profile/"+req.params.username);
     }else{
         db=req.db;
         // user  =stranger's username
         // loggedUser=logged username 
         User.findOne({"username": req.params.people}, function(err,user){
             User.findOne({"username": req.params.username}, function(err,loggedUser){
                 res.render("peoples",{user:user,loggedUser:loggedUser });
             });
         });
     }
 });

 // Add friend
app.post("/profile/:username/addfriend/:people",middlewareObj.isLoggedIn,(req,res) =>{ 
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
                               name:people.firstName+" "+people.secondName,
                               profilePic:people.profilePic,
                               username:people.username
                                }       
                            }  
                        })
                    db.collection("users").update(
                        { username: req.params.people },
                        { $addToSet: { friends:{
                               name:user.firstName+" "+user.secondName,
                               username:user.username,
                               profilePic:user.profilePic
                        }} }
                    )
                    res.redirect("/profile/"+req.params.username+"/people/"+req.params.people);
                }
            });
        }
   });
});

// DELETE-Remove friend
app.delete("/profile/:username/unfriend/:people",middlewareObj.isLoggedIn,(req,res) =>{
    User.findOne({'username':req.params.username},(err,user)=>{
        if(err) console.log(err);
        else{
            for(var i=0;i<=user.friends.length-1;i++){
                if(user.friends[i].username == req.params.people){
                    user.friends.splice(i,1);
                    user.save();
                }
            }
            User.findOne({'username':req.params.people},(err,people)=>{
                if(err) console.log(err);
                else{
                    for(var j=0;j<=people.friends.length-1;j++){
                        if(people.friends[j].username == req.params.username){
                            people.friends.splice(j,1);
                            people.save();
                            
                        }
                    }
                 res.redirect("/profile/"+user.username+"/people/"+people.username);
                }
            })
        }
    })
});

app.get("/change",(req,res)=>{
    res.redirect("/profile/"+req.user.username);
})

// --------------- PROFILE EDITS ------------------------
//     Quote edit
app.post("/profile/:username/edit/quote",middlewareObj.isLoggedIn,(req,res)=>{
    db=req.db;
    db.collection("users").update(
        {'username':req.params.username},
        {$set:{
            "quote":req.body.quote
        }}
    )
    res.redirect("/profile/"+req.params.username);
});

//     ProfilePic change
app.post("/profile/:username/edit/profilePic",middlewareObj.isLoggedIn,(req,res)=>{
    db=req.db;
    db.collection("users").update(
        {'username':req.params.username},
        {$set:{
            "profilePic":req.body.porfilePic
        }}
    )
    res.redirect("/profile/"+req.params.username);
});
//    CoverPic change
app.post("/profile/:username/edit/coverPic",middlewareObj.isLoggedIn,(req,res)=>{
    db=req.db;
    db.collection("users").update(
        {'username':req.params.username},
        {$set:{
            "coverPic":req.body.coverPic
        }}
    )
    res.redirect("/profile/"+req.params.username);
})

//     User search bar
app.post("/profile/searchByUsername/:username/",(req,res)=>{
    User.findOne({"username":req.params.username},(err,loggedUser)=>{
        if(err) console.log(err);
        else{
            User.findOne({"username":req.body.userToFind},(err,FoundUser)=>{
                if(req.body.userToFind == req.params.username){
                    //user searched himself
                    res.redirect("/profile/"+req.params.username);
                }else{
                     res.render("searchResults",{FoundUser:FoundUser,user:loggedUser});
                }
            });
        }
    });


   
});



// ============== POSTS ROUTE =====================


// POST  - ADD IMAGE POST TO POST ARRAY
app.post("/profile/:username/addPhoto",middlewareObj.isLoggedIn,(req,res)=>{
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
app.post("/profile/:username/addPost",middlewareObj.isLoggedIn,(req,res)=>{
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
app.post("/profile/:hostUsername/:postId/addComment/:postPersonUsername",middlewareObj.isLoggedIn,(req,res)=>{
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

// DELETE - delete Comment
app.delete("/profile/:hostName/:postId/deleteComm/:ComId",middlewareObj.isLoggedIn,(req,res)=>{
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

// POST - Add like
app.post("/profile/:postHost/:postId/like/:username",middlewareObj.isLoggedIn,(req,res)=>{
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

// DELETE- delete like
app.delete("/profile/:postHost/:postId/unlike/:username",middlewareObj.isLoggedIn,(req,res)=>{
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
app.delete("/profile/:username/removePost/:postId",middlewareObj.isLoggedIn,(req,res)=>{
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



// ============== lOGIN-REGISTER ROUTES============
 

//login or singup page
app.get("/register&login",(req,res)=>{
    res.render('register_login');
});

// Register page
app.post("/register",(req,res)=>{
    // first search if username is taken
    User.find({"username":req.body.username},(err,FoundUser)=>{
        if(err) console.log(err);
        else{
            if(FoundUser.length != 0){
                console.log("Somebody else already took this username!");
            }else{
                User.register(User({username:req.body.username}),req.body.password,function(err,user){
                if(err){
                    console.log(err);
                    res.redirect("/register&login");
                }else{
                    user.firstName=req.body.firstName;
                    user.secondName=req.body.secondName;
                    user.profilePic=req.body.profilePic;
                    user.coverPic=req.body.coverPic;
                    user.from=req.body.live;
                    user.married=req.body.gender;
                    user.quote=" ";
                    user.save();
                    res.redirect("/profile/"+user.username);
                }
            })
        }
        }
});
});

// Login page
app.post('/login',
  passport.authenticate('local', { successRedirect: '/change',
                                   failureRedirect: '/login' 
}));
// Logout page
app.get("/logout",function(req, res){
    req.logout();
    res.redirect("/register&login");
});
// 


var port=process.env.port || 8080
app.listen(port,function(){
    console.log("Server started!");
});




