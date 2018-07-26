var mongoose=require("mongoose");
var Comment=require("./models/comments.js");
var Post=require("./models/post.js");
var User=require("./models/user.js");

var data=[ //post
    // {
    //     description:"That's a new post ,awesome right?",
    // },
    // {
    //     image:"https://images.unsplash.com/photo-1531586895253-0d285eac6845?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=8edf8bacab0882cb0178ffbde2fff139&auto=format&fit=crop&w=634&q=80",
    //     description:"I like that image :)",
    //     postData:"imagePost"
    // }
]


function seedDb(){
    // remove all posts

    // Post.remove({},function(err){
    //     if(!err) console.log("Posts deleted!");
    //     Comment.remove({},function(err){
    //        if (!err) console.log("Comments deleted!");
    //         User.remove({},function(err){
    //             if(!err) console.log("Users deleted!");

                User.create(
                    {
                    username:"me",
                    name:"Vasilache Andrei",
                    maried:false,
                    quote:'"Dezvolt arta de a sta singur, când sunt înconjurat" - Cheloo',
                    from:"Suceava",
                    profilePic:"https://scontent-otp1-1.xx.fbcdn.net/v/t1.0-9/32910938_986123234888998_2805626938742276096_n.jpg?_nc_cat=0&oh=ef5f443a77e05698bbbb7e5d785020d9&oe=5BA74589",
                    coverPic:"https://scontent-otp1-1.xx.fbcdn.net/v/t1.0-9/35270217_1001235696711085_4543485043028262912_n.jpg?_nc_cat=0&oh=b66d2c9997452da2015828669f66c9cc&oe=5BA71498",
                    },function(err,users){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("Added new user!");
                        data.forEach(function(postIterr){
                            Post.create(postIterr,function(err,post){
                                if(err){
                                    console.log(err);
                                }else{
                                    Comment.create({
                                        text:"Test :D",
                                        author:"Popuescu"
                                    },function(err,comment){
                                        if(err){
                                            console.log(err);
                                        }else{
                                            users.posts.push(post);
                                            // post.save();
                                            // users.save();
                                            console.log("Added new post!");
                                            
                                        }
                                    });
                                }
                            })
                            // users.save();
                        });
                    }
                });
               
    //         });
    //     });
    // });
}

module.exports=seedDb;