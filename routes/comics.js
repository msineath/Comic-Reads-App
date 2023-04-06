const express = require('express');
const router = express.Router();

const db = require('../db/models');
const { csrfProtection, asyncHandler } = require('./utils');
const { requireAuth } = require('../auth');
const { Comic, User, Review, Collection} = db;
const { check, validationResult } = require('express-validator');
const Sequelize = require('sequelize')
const { Op } = require('sequelize');


router.use(requireAuth)

router.get('/', asyncHandler(async(req, res) => {
const comics = await Comic.findAll();
    let currUser = req.session.auth.userId
    const statusABC = await Collection.findAll({where:{userId:currUser}});
    let status = {}
    statusABC.forEach(el =>{
        status[el.id]=el.dataValues
    })

    res.render("comics", { comics, status })
}));

router.get('/search/:searchCriteria/:selectedChoice', async (req, res, next) => {
    const searchCriteria = req.params.searchCriteria;
    const selectedChoice = req.params.selectedChoice;
    let results;
    
    switch (searchCriteria) {
        case 'title':
            results = await Comic.findAll({where: {title: selectedChoice}});
            break;
        case 'author':
            results = await Comic.findAll({where: {author: selectedChoice}});
            break;
        case 'genre':
            results = await Comic.findAll({where: {genre: selectedChoice}});
            break;
        case 'keyword':
            results = await Comic.findAll({where: {title: { [Op.iLike]: `%${selectedChoice}%`}}});
            let results2 = await Comic.findAll({where: {author: { [Op.iLike]: `%${selectedChoice}%`}}});
            let results3 = await Comic.findAll({where: {genre: { [Op.iLike]: `%${selectedChoice}%`}}});
            results2.forEach(result => results.push(result));
            results3.forEach(result => results.push(result));
            break;
    }
    res.render('results', {results});
  });

router.get('/:id(\\d+)', asyncHandler(async(req, res) => {
    const id = parseInt(req.params.id, 10);
    const comic = await Comic.findByPk(id);
    const reviews = await Review.findAll( {where: {comicId: id}})
    let currUser = req.session.auth.userId
    const status = await Collection.findOne({where:{
        userId:currUser,
        comicId:id    
    }});
    res.render('comic', { comic, reviews, status })
}));

router.post('/', asyncHandler(async(req, res) => {
    let currUser = req.session.auth.userId
    const { bookId, hasRead, wantsToRead }  = req.body
    const collection = await Collection.findOne({where:{comicId:bookId,userId:currUser}});
    if(collection === null){
        await Collection.create({ hasRead:hasRead, wantsToRead:wantsToRead, comicId:bookId, userId:currUser });
        res.json({"post":"success"});
    } else {
        res.json({"post":"exists"});
    }
}));

router.patch('/', asyncHandler(async(req, res) => {
    let currUser = req.session.auth.userId
    const { bookId, hasRead, wantsToRead }  = req.body
    const collection = await Collection.findOne({where:{comicId:bookId,userId:currUser}});
    await collection.update({ hasRead:hasRead, wantsToRead:wantsToRead });
    res.json({"patch":"success"});
}));


router.post(
    "/:id(\\d+)/review",
    asyncHandler(async (req, res) => {
        const { commentArea } = req.body;
        await Review.create({ review: commentArea, userId: res.locals.user.id, comicId: req.params.id });
        res.redirect(`/comics/${req.params.id}`);
    })
);


module.exports = router
