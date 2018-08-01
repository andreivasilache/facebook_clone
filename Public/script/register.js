$("#registerForm").hide();
$("#loginForm").hide();

$("#register").on("click",function(){
    $(this).hide();
    $("#registerForm").show();
    $("#loginForm").hide();
    $("#login").show();
});
$("#login").on("click",function(){
    $(this).hide();
    $("#loginForm").show();
    $("#registerForm").hide();
    $("#register").show();
});
