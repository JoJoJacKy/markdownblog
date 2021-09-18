const { response } = require("express");
const express = require("express");
const Article = require("./../models/article");
const router = express.Router();


// Gets some articles and passes them into the blog page
router.get("/", async (request, response) => {
    const articles = await Article.find().sort({
        createdAt: 'desc'
    }).limit(4);

    // Trimming down the results

    response.render("articles/index.ejs", {
        articles: articles
    })
});

router.get("/all", paginatedResults(Article), async (request, response) => {

    const page = parseInt(request.query.page);
    const limit = parseInt(request.query.limit);
    const count = await Article.countDocuments();


    response.render("articles/allblogs", {
        articles: response.paginatedResults.results,
        current: page,
        pages: Math.ceil(count / limit)
    });
});

// Rendering new pages for each article @ ./articles/new
router.get("/new", (request, response) => {
    response.render("articles/new.ejs", {
        article: new Article()
    }); // renders a new article via the articles folders within views
});

router.get("/edit/:id", async (request, response) => {
    const article = await Article.findById(request.params.id)
    response.render("articles/edit", {
        article: article
    });
});

// Whenever we get a GET Request to an /articles link that is not new, this runs
router.get("/:slug", async (request, response) => {
    const article = await Article.findOne({
        slug: request.params.slug
    });
    if (article == null) { // if article DNE (id doesnt exist), Redirect to the home page
        response.redirect("/");
    }
    response.render("articles/show", {
        article: article
    })
});


// These routes will begin at /articles/
// Saves our new article to the database
router.post("/", async (request, response, next) => { // This post method is called by the Save button
    request.article = new Article();
    next();
}, saveArticleAndRedirect("new"));

router.put("/:id", async (request, response, next) => { // This post method is called by the Save button
    request.article = await Article.findById(request.params.id)
    next();
}, saveArticleAndRedirect("edit"));

router.delete("/:id", async (request, response) => {
    await Article.findByIdAndDelete(request.params.id); // Deletes a row within our database
    response.redirect("/articles");
});

// Middleware Function
function saveArticleAndRedirect(path) {
    return async (request, response) => {
        // Accessing our newly created or editing article from our POST and PUT Handlers
        let article = request.article
        article.title = request.body.title;
        article.description = request.body.description;
        article.markdown = request.body.markdown;

        try {
            article = await article.save(); // Async Function; Returns an id for our article
            response.redirect(`/articles/${article.slug}`)
        } catch (e) {
            response.render(`articles/${path}`, {article: article}); // Passes in the previous filled out fields
        }
    }
}

module.exports = router; // Export our router into main server index.js file


// Middleware Function - See All Posts
function paginatedResults(model) {
    return async (request, response, next) => {
                // Getting the parameters; Need to convert to an Int
        const page = parseInt(request.query.page);
        const limit = parseInt(request.query.limit);

        // Since we have an array to use for our data
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        // This is what holds the pages
        const results = [];

        // Checking if we can have a next page (Cant have a page 0)
        if (endIndex < await model.countDocuments()) { // endIndex is the amount if elements 
            results.next = {
                page: page + 1,
                limit: limit
            }
        }

        // Checking if we can have a previous page (Cant have a page 0)
        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            }
        }


        // Now we query our model
        try {
            results.results = await model.find().sort({createdAt: 'desc'}).limit(limit).skip(startIndex)
            response.paginatedResults = results;
            next();
        } catch {
            response.status(500).json({ message: e.message});
        }
    }
}