const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

router.get('/', async (req, res)=>{
    let searchOptions = {}
    if(req.query.name)
        searchOptions.name = new RegExp(req.query.name, 'i');
    try{
        let authors = await Author.find(searchOptions);
        res.render('authors/index', {
            authors: authors, searchOptions: req.query
        })
    }catch{
        res.redirect('/');
        //console.log('Error getting all authors, db may not be accessible')
    }
});

router.get('/new', async (req, res)=>{
    res.render('authors/new', { author: new Author()})
});

router.post("/new", async (req, res)=>{
    let author = new Author({
        name: req.body.name
    });
    try{
        let newAuthor = await author.save();
        res.redirect(`/authors/${newAuthor.id}`)
    }catch {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        })
    }
});

router.get('/:id', async (req, res)=>{
   try{
       const author = await Author.findById(req.params.id);
       const books = await Book.find({author: author.id}).limit(6).exec()
       res.render('authors/show', {
           author: author,
           booksByAuthor: books
       })
   }catch{
        res.redirect('/')
   }
});

router.get('/:id/edit', async (req, res)=>{
    try{
        const author = await Author.findById(req.params.id);
        res.render('authors/edit', { author: author})
    }catch {
        //console.log('error editing author');
        res.redirect('/authors')
    }
});

router.put('/:id', async (req, res)=>{
    let author;
    try{
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save();
        res.redirect(`/authors/${author.id}`)
    }catch {
        if(!author){
            res.redirect('/')
        }
        else {
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error updating Author'
            })
        }
    }
});

router.delete('/:id', async (req, res)=>{
    let author;
    try{
        author = await Author.findById(req.params.id);
        await author.remove();
        res.redirect('/authors');
    }catch (e) {
        if(!author){
            res.redirect('/')
        }
        else {
            //console.log(e);
            res.redirect(`/authors/${author.id}`)
        }
    }
});

module.exports = router;