import { Router } from 'express'
import rateLimit from 'express-rate-limit';
import {addReview, authWithGoogle, changePasswordController, deleteMultiple, deleteUser, deleteReview, forgotPasswordController, getAllReviews, getAllReviewsAdmin, getAllUsers, getReviews, loginUserController, logoutController, refreshToken, registerUserController, removeImageFromCloudinary, resetpassword, sendInquiry, subscribeNewsletter, approveReview, updateUserDetails, userAvatarController, userDetails, verifyEmailController, verifyForgotPasswordOtp} from '../controllers/user.controller.js';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';
import UserModel from '../models/user.model.js';
import bcryptjs from 'bcryptjs';

const userRouter = Router()

// Rate limiter for login - 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: true, message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for register - 3 registrations per hour
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: true, message: 'Too many accounts created. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

userRouter.post('/register',registerLimiter,registerUserController)
userRouter.post('/verifyEmail',verifyEmailController)
userRouter.post('/login',loginLimiter,loginUserController)
userRouter.post('/authWithGoogle',authWithGoogle)
userRouter.get('/logout',auth,logoutController);
userRouter.put('/user-avatar',auth,upload.array('avatar'),userAvatarController);
userRouter.delete('/deteleImage',auth,removeImageFromCloudinary);
userRouter.put('/:id',auth,updateUserDetails);
userRouter.post('/forgot-password',forgotPasswordController)
userRouter.post('/verify-forgot-password-otp',verifyForgotPasswordOtp)
userRouter.post('/reset-password',resetpassword)
userRouter.post('/forgot-password/change-password',changePasswordController)
userRouter.post('/refresh-token',refreshToken)
userRouter.get('/user-details',auth,userDetails);
userRouter.post('/addReview',addReview);
userRouter.post('/sendInquiry',sendInquiry);
userRouter.post('/subscribe-newsletter',subscribeNewsletter);
userRouter.get('/getReviews',getReviews);
userRouter.get('/getAllReviews',getAllReviews);
userRouter.get('/getAllReviewsAdmin',auth,getAllReviewsAdmin);
userRouter.put('/approveReview/:id',auth,approveReview);
userRouter.delete('/deleteReview/:id',auth,deleteReview);
userRouter.get('/getAllUsers',auth,getAllUsers);
userRouter.delete('/deleteMultiple',auth,deleteMultiple);
userRouter.delete('/deleteUser/:id',auth,deleteUser);

// Development-only endpoints removed for security
// These endpoints were a major security risk in production

export default userRouter