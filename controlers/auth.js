const asyncHandler = require("../middelware/async");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    role,
  });
  // const token = user.getSignedJwtToken()
  // res.status(200).json({sucess:true, data:user, token})
  sendTokenResponse(user, 200, res);
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    next(new ErrorResponse(`Please provide an email and password`, 400));
  }

  const user = await User.findOne({ email: email }).select("+password"); //passsword is set as select false in the model so we need to provide it in our response manually
  if (!user) {
    next(new ErrorResponse(`Invalid credentials`, 401));
  }

  //  Check if pass matches
  const isMatch = await user.matchPassword(password);
  console.log(isMatch);
  if (!isMatch) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }
  // const token = user.getSignedJwtToken()
  // res.status(200).json({sucess:true, token})
  sendTokenResponse(user, 200, res);
});

//Get token from a model, create a cookie and respond

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    //manually calculating the cookie expiration because it doesn't accept day value as JWT token's
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie("token", token, options) // to send a cookie simply do res. cookie (name,value,options)
    .json({
      sucess: true,
      token,
    });
};

exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ErrorResponse(
        `There is no user with this email ${req.body.email}`,
        404
      )
    );
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    data: user,
  });
});
