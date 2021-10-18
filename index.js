
// The initials of starting up a server
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Article = require(__dirname + "/models/article");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: false })); // Allows the access of the POST requests
app.use(express.static("public"));
// Importing in Exports
const articleRouter = require(__dirname + "/routes/articles");

// Setting up the view engine (The EJS Layouts/Templates)
app.set("view engine", "ejs");

// Connecting to our Mongoose DB
mongoose.connect("mongodb+srv://@gettingstarted.dtf7h.mongodb.net/MarkdownBlogDB?retryWrites=true&w=majority", {
    useNewUrlParser: true,
});



// Using the articleRouter
app.use("/articles", articleRouter); // Every new article is added to the end of /articles url link

app.get("/about", (request, response) => {
    response.render("homepage/about");
});

app.get("/", (request, response) => {
    response.render("homepage/home");
});









PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.`);
});

