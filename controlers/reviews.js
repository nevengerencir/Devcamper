const asyncHandler = require("../middelware/async");
const User = require("../models/User");
const Bootcamp = require("../models/Bootcamp");
const Review = require("../models/Review");

const ErrorResponse = require("../utils/errorResponse");

//  @desc Get all reviews
//  @route GET /api/v1/users
//  @access Private/Admin
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      sucess: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//  @desc Get single review
//  @route GET /api/v1/reviews/:id
//  @access Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!review) {
    next(new ErrorResponse("Review not found", 404));
  }
  res.status(200).json({
    sucess: true,
    data: review,
  });
});