const express = require('express');
const router = express.Router();
const Author = require('../models/author');

router.get('/', async (req, res)=>{
    let searchOptions = {}
    if(req.query.name != null && req.query.name != '')
        searchOptions.name = new RegExp(req.query.name, 'i');
    try{
        let authors = await Author.find(searchOptions);
        res.render('authors/index', {
            authors: authors, searchOptions: req.query
        })
    }catch{
        res.redirect('/');
        console.log('Error getting all authors, db may not be accessible')
    }
});

router.get('/new', (req, res)=>{
    res.render('authors/new', { author: new Author()})
});

router.post("/new", async (req, res)=>{
    let author = new Author({
        name: req.body.name
    });
    try{
        let newAuthor = await author.save();
        //res.redirect('authors/${newAuthor.id}')
        res.redirect('/authors')
    }catch {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        })
    }
});

module.exports = router;