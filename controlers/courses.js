const asyncHandler = require('../middelware/async')
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

const ErrorResponse = require('../utils/errorResponse')

exports.getCourses  = asyncHandler(async (req, res, next) => {
    let query
if (req.params.bootcampId){
    query = Course.find({bootcamp: req.params.bootcampId})
}else{
    query = Course.find().populate({
        path: 'bootcamp',
        select: 'name description'
})
}

    const courses = await query
    res.status(200).json({
      sucess:true,
      count: courses.length,
      data: courses
    })  
})

exports.getCourse  = asyncHandler(async (req, res, next) => {
   const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
   })
   if(!course){
     next(new ErrorResponse(`No course with the id of ${req.params.id} `,404))
   }
    res.status(200).json({
      sucess:true,
      data: course
    })  
})

exports.addCourse  = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
if (!bootcamp){
    return next( new ErrorResponse(`Bootcamp with id:${req.params.bootcampId} doesn't exist`),404)
}
req.body.bootcamp = req.params.bootcampId
const course = await Course.create(req.body)
res.status(200).json({
    success:true,
    data:course
})

    })  
