const express = require('express');
const router = express.Router();
const path = require('path');
const Author = require('../models/author');
const Book = require('../models/book');
//const multer = require('multer');
//const fs = require('fs');

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
/*
const uploadPath = path.join('public', Book.coverImagePath);
const multerUpload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        //console.log(file);
        //console.log(file.mimeType);
        if(imageMimeTypes.includes(file.mimetype))
            callback(null, true);
        else
            callback(new Error('File is not an image'), false);
    }
});*/

router.get('/', async (req, res)=>{
    let query = Book.find();
    //console.log(req.query);
    if(req.query.title){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishedBefore){
        console.log('published before filter');
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if(req.query.publishedAfter){
        console.log('published after filter');
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try{
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    }catch{
        res.redirect('/')
    }
});

router.get('/new', async (req, res)=>{
    renderNewBookPage(res, new Book())
});

router.post("/new", async (req, res)=>{
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    });
    saveCover(book, req.body.cover);
    try{
        const newBook = await book.save();
        //res.redirect('books/$(newBook.id}')
        res.redirect('/books')
    }catch(e) {
        renderNewBookPage(res, book, true);
        console.log(e)
    }
});


async function renderNewBookPage(res, book, hasError = false){
    try{
        const authors=  await Author.find({});
        const params = {
            authors: authors,
            book: book
        };
        //const book = new Book();
        if(hasError)
            params.errorMessage = 'Error adding book';
        res.render('books/new', params)
    }catch{
        res.redirect('/books');
    }
}

function saveCover(book, coverEncoded){
    if(coverEncoded == null) return;
    const cover = JSON.parse(coverEncoded)
    if(cover!=null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;

    }
}

module.exports = router;