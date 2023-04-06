const express = require("express");
const router = express.Router();

const db = require("../db/models");
const { asyncHandler } = require("./utils");
const { requireAuth } = require("../auth");
const { Comic, Review, Collection } = db;
const { Op } = require("sequelize");

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const comics = await Comic.findAll();
    let currUser = req.session.auth.userId;
    const statusABC = await Collection.findAll({ where: { userId: currUser } });
    let status = {};
    statusABC.forEach((el) => {
      status[el.id] = el.dataValues;
    });

    res.render("comics", { comics, status });
  })
);

router.get("/search/:searchCriteria/:selectedChoice", async (req, res) => {
  const searchCriteria = req.params.searchCriteria;
  const selectedChoice = req.params.selectedChoice;
  let results = [];
  let titleResults;
  let authorResults;
  let genreResults;
  switch (searchCriteria) {
    case "title":
      titleResults = await Comic.findAll({ where: { title: selectedChoice } });
      break;
    case "author":
      authorResults = await Comic.findAll({
        where: { author: selectedChoice },
      });
      break;
    case "genre":
      genreResults = await Comic.findAll({ where: { genre: selectedChoice } });
      break;
    case "keyword":
      titleResults = await Comic.findAll({
        where: { title: { [Op.iLike]: `%${selectedChoice}%` } },
      });
      authorResults = await Comic.findAll({
        where: { author: { [Op.iLike]: `%${selectedChoice}%` } },
      });
      genreResults = await Comic.findAll({
        where: { genre: { [Op.iLike]: `%${selectedChoice}%` } },
      });
      break;
  }
  if (titleResults) titleResults.forEach((result) => results.push(result));
  if (authorResults) authorResults.forEach((result) => results.push(result));
  if (genreResults) genreResults.forEach((result) => results.push(result));
  res.render("results", { results });
});

router.get(
  "/:id(\\d+)",
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const comic = await Comic.findByPk(id);
    const reviews = await Review.findAll({ where: { comicId: id } });
    let currUser = req.session.auth.userId;
    const status = await Collection.findOne({
      where: {
        userId: currUser,
        comicId: id,
      },
    });
    res.render("comic", { comic, reviews, status });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    let currUser = req.session.auth.userId;
    const { bookId, hasRead, wantsToRead } = req.body;
    const collection = await Collection.findOne({
      where: { comicId: bookId, userId: currUser },
    });
    if (collection === null) {
      await Collection.create({
        hasRead: hasRead,
        wantsToRead: wantsToRead,
        comicId: bookId,
        userId: currUser,
      });
      res.json({ post: "success" });
    } else {
      res.json({ post: "exists" });
    }
  })
);

router.patch(
  "/",
  asyncHandler(async (req, res) => {
    let currUser = req.session.auth.userId;
    const { bookId, hasRead, wantsToRead } = req.body;
    const collection = await Collection.findOne({
      where: { comicId: bookId, userId: currUser },
    });
    await collection.update({ hasRead: hasRead, wantsToRead: wantsToRead });
    res.json({ patch: "success" });
  })
);

router.post(
  "/:id(\\d+)/review",
  asyncHandler(async (req, res) => {
    const { commentArea } = req.body;
    await Review.create({
      review: commentArea,
      userId: res.locals.user.id,
      comicId: req.params.id,
    });
    res.redirect(`/comics/${req.params.id}`);
  })
);

module.exports = router;
