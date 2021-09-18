const mongoose = require("mongoose");
const marked = require("marked");
const slugify = require("slugify");

const createDomPurifier = require("dompurify");
const { JSDOM } = require("jsdom"); // Only getting the JSDOM portion
const dompurify = createDomPurifier(new JSDOM().window) // Allows the creation of HTML and Sanitizes

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String
    },
    markdown: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now // This function is called everytime we create a new article
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    sanitizedHtml: {
        type: String,
        required: true
    }
});

// This runs everytime this DB is saved update deleted etc...
articleSchema.pre("validate", function(next) {
    if (this.title) {
        this.slug = slugify(this.title, {
            lower: true,
            strict: true
        });
    }

    if (this.markdown) {
        this.sanitizedHtml = dompurify.sanitize(marked(this.markdown));
    }
    
    next();
});

module.exports = mongoose.model("Article", articleSchema);