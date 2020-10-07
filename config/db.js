if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://leandroaugusto:xbox360leandro@blogapp.bp5s2.mongodb.net/<dbname>?retryWrites=true&w=majority"}
}else {
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}