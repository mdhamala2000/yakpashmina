import UserModel from '../models/user.model.js'
import Newsletter from '../models/newsletter.model.js';
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import sendEmailFun from '../config/sendEmail.js';
import VerificationEmail from '../utils/verifyEmailTemplate.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import genertedRefreshToken from '../utils/generatedRefreshToken.js';

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import ReviewModel from '../models/reviews.model.js.js';

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
});


export async function registerUserController(request, response) {
    try {
        let user;

        const { name, email, password } = request.body;
        if (!name || !email || !password) {
            return response.status(400).json({
                message: "provide email, name, password",
                error: true,
                success: false
            })
        }

        user = await UserModel.findOne({ email: email });

        if (user) {
            return response.json({
                message: "User already Registered with this email",
                error: true,
                success: false
            })
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();


        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        user = new UserModel({
            email: email,
            password: hashPassword,
            name: name,
            otp: verifyCode,
            otpExpires: Date.now() + 600000,

        });

        await user.save();

        // Send verification email
        await sendEmailFun({
            sendTo: email,
            subject: "Verify email from Ecommerce App",
            text: "",
            html: VerificationEmail(name, verifyCode)
        })


        // Create a JWT token for verification purposes
        const token = jwt.sign(
            { email: user.email, id: user._id },
            process.env.JSON_WEB_TOKEN_SECRET_KEY
        );


        return response.status(200).json({
            success: true,
            error: false,
            message: "User registered successfully! ",
            token: token, // Optional: include this if needed for verification
        });



    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function verifyEmailController(request, response) {
    try {
        const { email, otp } = request.body;

        const user = await UserModel.findOne({ email: email });
        if (!user) {
            return response.status(400).json({ error: true, success: false, message: "User not found" });
        }

        const isCodeValid = user.otp === otp;
        const isNotExpired = user.otpExpires > Date.now();

        if (isCodeValid && isNotExpired) {
            user.verify_email = true;
            user.otp = null;
            user.otpExpires = null;
            await user.save();
            return response.status(200).json({ error: false, success: true, message: "Email verified successfully" });
        } else if (!isCodeValid) {
            return response.status(400).json({ error: true, success: false, message: "Invalid OTP" });
        } else {
            return response.status(400).json({ error: true, success: false, message: "OTP expired" });
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function authWithGoogle(request, response) {
    const { name, email, password, avatar, mobile, role } = request.body;

    try {
        const existingUser = await UserModel.findOne({ email: email });

        if (!existingUser) {
            const user = await UserModel.create({
                name: name,
                mobile: mobile,
                email: email,
                password: "null",
                avatar: avatar,
                role: role,
                verify_email: true,
                signUpWithGoogle: true
            });

            await user.save();

            const accesstoken = await generatedAccessToken(user._id);
            const refreshToken = await genertedRefreshToken(user._id);

            await UserModel.findByIdAndUpdate(user?._id, {
                last_login_date: new Date()
            })


            const isProduction = process.env.NODE_ENV === 'production';
            const cookiesOption = {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "None" : "Lax"
            };
            response.cookie('accessToken', accesstoken, cookiesOption)
            response.cookie('refreshToken', refreshToken, cookiesOption)


            return response.json({
                message: "Login successfully",
                error: false,
                success: true,
                data: {
                    accesstoken,
                    refreshToken
                }
            })

        } else {
            const accesstoken = await generatedAccessToken(existingUser._id);
            const refreshToken = await genertedRefreshToken(existingUser._id);

            await UserModel.findByIdAndUpdate(existingUser?._id, {
                last_login_date: new Date()
            })


            const isProduction = process.env.NODE_ENV === 'production';
            const cookiesOption = {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "None" : "Lax"
            };
            response.cookie('accessToken', accesstoken, cookiesOption)
            response.cookie('refreshToken', refreshToken, cookiesOption)


            return response.json({
                message: "Login successfully",
                error: false,
                success: true,
                data: {
                    accesstoken,
                    refreshToken
                }
            })
        }

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }


}


export async function loginUserController(request, response) {
    try {
        const { email, password } = request.body;

        const user = await UserModel.findOne({ email: email });

        if (!user) {
            return response.status(400).json({
                message: "User not register",
                error: true,
                success: false
            })
        }

        if (user.status !== "Active") {
            return response.status(400).json({
                message: "Contact to admin",
                error: true,
                success: false
            })
        }

        if (user.verify_email !== true) {
            return response.status(400).json({
                message: "Your Email is not verify yet please verify your email first",
                error: true,
                success: false
            })
        }

        if (!user.password || user.password === "null") {
            return response.status(400).json({
                message: "Please login with Google or reset your password",
                error: true,
                success: false
            })
        }

        const checkPassword = await bcryptjs.compare(password, user.password);

        if (!checkPassword) {
            return response.status(400).json({
                message: "Check your password",
                error: true,
                success: false
            })
        }


        const accesstoken = await generatedAccessToken(user._id);
        const refreshToken = await genertedRefreshToken(user._id);

const updateUser = await UserModel.findByIdAndUpdate(user?._id, {
            last_login_date: new Date()
        })


        const isProduction = process.env.NODE_ENV === 'production';
        const cookiesOption = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "None" : "Lax"
        };
        response.cookie('accessToken', accesstoken, cookiesOption)
        response.cookie('refreshToken', refreshToken, cookiesOption)

return response.status(200).json({
            message: "Login successfully",
            error: false,
            success: true,
            data: {
                accesstoken,
                refreshToken
            }
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}



//logout controller
export async function logoutController(request, response) {
    try {
        const userid = request.userId //middleware

        const isProduction = process.env.NODE_ENV === 'production';
        const cookiesOption = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "None" : "Lax"
        };

        response.clearCookie("accessToken", cookiesOption)
        response.clearCookie("refreshToken", cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
            refresh_token: ""
        })

        return response.json({
            message: "Logout successfully",
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//image upload
var imagesArr = [];
export async function userAvatarController(request, response) {
    try {
        imagesArr = [];

        const userId = request.userId;  //auth middleware
        const image = request.files;


        const user = await UserModel.findOne({ _id: userId });

        if (!user) {
            return response.status(500).json({
                message: "User not found",
                error: true,
                success: false
            })
        }




        //first remove image from cloudinary
        const imgUrl = user.avatar;

        const urlArr = imgUrl.split("/");
        const avatar_image = urlArr[urlArr.length - 1];

        const imageName = avatar_image.split(".")[0];

        if (imageName) {
            const res = await cloudinary.uploader.destroy(
                imageName,
                (error, result) => {
                    // console.log(error, res)
                }
            );
        }

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < image?.length; i++) {

            const img = await cloudinary.uploader.upload(
                image[i].path,
                options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${request.files[i].filename}`);
                }
            );
        }

        user.avatar = imagesArr[0];
        await user.save();

        return response.status(200).json({
            _id: userId,
            avtar: imagesArr[0]
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function removeImageFromCloudinary(request, response) {
    const imgUrl = request.query.img;

    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    if (imageName) {
        const res = await cloudinary.uploader.destroy(
            imageName,
            (error, result) => {
                // console.log(error, res)
            }
        );

        if (res) {
            response.status(200).send(res);
        }
    }

}

//update user details
export async function updateUserDetails(request, response) {
    try {
        const userId = request.userId //auth middleware
        const { name, email, mobile, password } = request.body;

        const userExist = await UserModel.findById(userId);
        if (!userExist)
            return response.status(400).send('The user cannot be Updated!');


        const updateUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                name: name,
                mobile: mobile,
                email: email,
            },
            { new: true }
        )



        return response.json({
            message: "User Updated successfully",
            error: false,
            success: true,
            user: {
                name: updateUser?.name,
                _id: updateUser?._id,
                email: updateUser?.email,
                mobile: updateUser?.mobile,
                avatar: updateUser?.avatar
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//forgot password
export async function forgotPasswordController(request, response) {
    try {
        const { email } = request.body

        const user = await UserModel.findOne({ email: email })

        if (!user) {
            return response.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }

        else {
            let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

            user.otp = verifyCode;
            user.otpExpires = Date.now() + 600000;

            await user.save();

            await sendEmailFun({
                sendTo: email,
                subject: "Verify OTP from Ecommerce App",
                text: "",
                html: VerificationEmail(user.name, verifyCode)
            })


            return response.json({
                message: "check your email",
                error: false,
                success: true
            })

        }



    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function verifyForgotPasswordOtp(request, response) {
    try {
        const { email, otp } = request.body;

        const user = await UserModel.findOne({ email: email })

        console.log(user)

        if (!user) {
            return response.status(400).json({
                message: "Email not available",
                error: true,
                success: false
            })
        }

        if (!email || !otp) {
            return response.status(400).json({
                message: "Provide required field email, otp.",
                error: true,
                success: false
            })
        }

        if (otp !== user.otp) {
            return response.status(400).json({
                message: "Invailid OTP",
                error: true,
                success: false
            })
        }


        const currentTime = new Date().toISOString()

        if (user.otpExpires < currentTime) {
            return response.status(400).json({
                message: "Otp is expired",
                error: true,
                success: false
            })
        }


        user.otp = "";
        user.otpExpires = "";

        await user.save();

        return response.status(200).json({
            message: "Verify OTP successfully",
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}


//reset password
export async function resetpassword(request, response) {
    try {
        const { email, oldPassword, newPassword, confirmPassword } = request.body;
        if (!email || !newPassword || !confirmPassword) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return response.status(400).json({
                message: "Email is not available",
                error: true,
                success: false
            })
        }


        if (user?.signUpWithGoogle === false) {
            const checkPassword = await bcryptjs.compare(oldPassword, user.password);
            if (!checkPassword) {
                return response.status(400).json({
                    message: "your old password is wrong",
                    error: true,
                    success: false,
                })
            }
        }


        if (newPassword !== confirmPassword) {
            return response.status(400).json({
                message: "newPassword and confirmPassword must be same.",
                error: true,
                success: false,
            })
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(confirmPassword, salt);

        user.password = hashPassword;
        user.signUpWithGoogle = false;
        await user.save();

        return response.json({
            message: "Password updated successfully.",
            error: false,
            success: true
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



//change password
export async function changePasswordController(request, response) {
    try {
        const { email, newPassword, confirmPassword } = request.body;
        if (!email || !newPassword || !confirmPassword) {
            return response.status(400).json({
                error: true,
                success: false,
                message: "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return response.status(400).json({
                message: "Email is not available",
                error: true,
                success: false
            })
        }


        if (newPassword !== confirmPassword) {
            return response.status(400).json({
                message: "newPassword and confirmPassword must be same.",
                error: true,
                success: false,
            })
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(confirmPassword, salt);

        user.password = hashPassword;
        user.signUpWithGoogle = false;
        await user.save();

        return response.json({
            message: "Password updated successfully.",
            error: false,
            success: true
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//refresh token controler
export async function refreshToken(request, response) {
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

        if (!refreshToken) {
            return response.status(401).json({
                message: "Invalid token",
                error: true,
                success: false
            })
        }


        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN)
        if (!verifyToken) {
            return response.status(401).json({
                message: "token is expired",
                error: true,
                success: false
            })
        }

        const userId = verifyToken?._id;
        const newAccessToken = await generatedAccessToken(userId)

        const isProduction = process.env.NODE_ENV === 'production';
        const cookiesOption = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "None" : "Lax"
        };

        response.cookie('accessToken', newAccessToken, cookiesOption)

        return response.json({
            message: "New Access token generated",
            error: false,
            success: true,
            data: {
                accessToken: newAccessToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


//get login user details
export async function userDetails(request, response) {
    try {
        const userId = request.userId

        const user = await UserModel.findById(userId).select('-password -refresh_token').populate('address_details')

        return response.json({
            message: 'user details',
            data: user,
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}


//review controller
export async function addReview(request, response) {
    try {

        const {image, userName, review, rating, userId, productId, reviewImages, productName} = request.body;

        const userReview = new ReviewModel({
            image: image || '',
            userName: userName || 'Guest User',
            review: review,
            rating: rating || 5,
            userId: userId || null,
            productId: productId || '',
            productName: productName || '',
            reviewImages: reviewImages || [],
            isApproved: false // Default to unapproved
        })


        await userReview.save();

        return response.json({
            message: "Review submitted successfully! It will be visible after approval.",
            error: false,
            success: true
        })
        
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}

//get reviews
export async function getReviews(request, response) {
    try {

        const productId = request.query.productId;
       

        const reviews = await ReviewModel.find({productId:productId});

        // Calculate average rating from approved reviews only
        const approvedReviews = reviews.filter(r => r.isApproved === true);
        let avgRating = 0;
        let totalReviews = 0;
        
        if (approvedReviews.length > 0) {
            const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
            avgRating = Math.round((totalRating / approvedReviews.length) * 10) / 10;
            totalReviews = approvedReviews.length;
        }

        if(!reviews){
            return response.status(400).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            reviews:reviews,
            avgRating: avgRating,
            totalReviews: totalReviews
        })
        
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}




//get all reviews
export async function getAllReviews(request, response) {
    try {      

        const reviews = await ReviewModel.find({ isApproved: true }).sort({ createdAt: -1 });

        if(!reviews){
            return response.status(400).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            reviews:reviews
        })
        
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}

//get all reviews for admin (including unapproved)
export async function getAllReviewsAdmin(request, response) {
    try {      

        const reviews = await ReviewModel.find().sort({ createdAt: -1 });

        return response.status(200).json({
            error: false,
            success: true,
            reviews:reviews
        })
        
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}

//approve/unapprove review
export async function approveReview(request, response) {
    try {
        const { id } = request.params;
        const { isApproved } = request.body;

        const review = await ReviewModel.findByIdAndUpdate(
            id,
            { isApproved: isApproved },
            { new: true }
        );

        if (!review) {
            return response.status(404).json({
                message: "Review not found",
                error: true,
                success: false
            });
        }

        // Auto-calculate product rating from approved reviews
        if (review.productId) {
            const approvedReviews = await ReviewModel.find({ 
                productId: review.productId, 
                isApproved: true 
            });
            
            if (approvedReviews.length > 0) {
                const totalRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
                const avgRating = Math.round((totalRating / approvedReviews.length) * 10) / 10;
                
                // Update product rating
                const ProductModel = (await import('../models/product.modal.js')).default;
                await ProductModel.findByIdAndUpdate(review.productId, { rating: avgRating });
            }
        }

        return response.status(200).json({
            message: isApproved ? "Review approved successfully" : "Review unapproved successfully",
            error: false,
            success: true,
            review: review
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || "Something is wrong",
            error: true,
            success: false
        });
    }
}

//delete review
export async function deleteReview(request, response) {
    try {
        const { id } = request.params;

        const review = await ReviewModel.findById(id);

        if (!review) {
            return response.status(404).json({
                message: "Review not found",
                error: true,
                success: false
            });
        }

        const productId = review.productId;
        
        await ReviewModel.findByIdAndDelete(id);

        // Recalculate product rating after deletion
        if (productId) {
            const remainingReviews = await ReviewModel.find({ 
                productId: productId, 
                isApproved: true 
            });
            
            const ProductModel = (await import('../models/product.modal.js')).default;
            
            if (remainingReviews.length > 0) {
                const totalRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0);
                const avgRating = Math.round((totalRating / remainingReviews.length) * 10) / 10;
                await ProductModel.findByIdAndUpdate(productId, { rating: avgRating });
            } else {
                await ProductModel.findByIdAndUpdate(productId, { rating: 0 });
            }
        }

        return response.status(200).json({
            message: "Review deleted successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || "Something is wrong",
            error: true,
            success: false
        });
    }
}

//get all users
export async function getAllUsers(request, response) {
    try {
        const { page, limit } = request.query;

        const totalUsers = await UserModel.find();

        const users = await UserModel.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));

        const total = await UserModel.countDocuments(users);

        if(!users){
            return response.status(400).json({
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            error: false,
            success: true,
            users:users,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalUsersCount:totalUsers?.length,
            totalUsers:totalUsers
        })
        
    } catch (error) {
        return response.status(500).json({
            message: "Something is wrong",
            error: true,
            success: false
        })
    }
}



export async function deleteUser(request, response) {
    const user = await UserModel.findById(request.params.id);

    if (!user) {
        return response.status(404).json({
            message: "User Not found",
            error: true,
            success: false
        })
    }


    const deletedUser = await UserModel.findByIdAndDelete(request.params.id);

    if (!deletedUser) {
        response.status(404).json({
            message: "User not deleted!",
            success: false,
            error: true
        });
    }

    return response.status(200).json({
        success: true,
        error: false,
        message: "User Deleted!",
    });
}


//delete multiple products
export async function deleteMultiple(request, response) {
    const { ids } = request.body;

    if (!ids || !Array.isArray(ids)) {
        return response.status(400).json({ error: true, success: false, message: 'Invalid input' });
    }


    try {
        await UserModel.deleteMany({ _id: { $in: ids } });
        return response.status(200).json({
            message: "Users delete successfully",
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Send Inquiry Email
export async function sendInquiry(request, response) {
    try {
        const { name, email, phone, message, productName, productId, toEmail } = request.body;

        if (!name || !email || !phone || !message) {
            return response.status(400).json({
                message: "Please provide all required fields",
                error: true,
                success: false
            });
        }

        const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="background: linear-gradient(135deg, #2bbef9, #1a9bd1); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                <h2 style="color: white; margin: 0;">New Product Inquiry</h2>
            </div>
            
            <div style="padding: 20px; background: #f9f9f9;">
                <h3 style="color: #333; margin-bottom: 15px;">Customer Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${phone}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Product:</strong></td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${productName || 'General Inquiry'}</td>
                    </tr>
                    ${productId ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Product ID:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${productId}</td></tr>` : ''}
                </table>
                
                <h3 style="color: #333; margin-top: 20px; margin-bottom: 15px;">Message:</h3>
                <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                    ${message.replace(/\n/g, '<br>')}
                </div>
            </div>
            
            <div style="padding: 15px; text-align: center; background: #333; border-radius: 0 0 10px 10px;">
                <p style="color: white; margin: 0; font-size: 12px;">Classyshop - Mega Super Store | 507-Union Trade Centre France</p>
            </div>
        </div>
        `;

        const textContent = `New Inquiry from ${name}\nEmail: ${email}\nPhone: ${phone}\nProduct: ${productName}\n\nMessage: ${message}`;

        const emailSent = await sendEmailFun({
            sendTo: toEmail || "Mdhamala2000@gmail.com",
            subject: `New Inquiry for ${productName || 'Product'} - from ${name}`,
            text: textContent,
            html: htmlContent
        });

        if (emailSent) {
            return response.status(200).json({
                message: "Inquiry sent successfully",
                error: false,
                success: true
            });
        } else {
            return response.status(500).json({
                message: "Failed to send inquiry email",
                error: true,
                success: false
            });
        }

    } catch (error) {
        console.error("Error sending inquiry:", error);
        return response.status(500).json({
            message: error.message || "Something went wrong",
            error: true,
            success: false
        });
    }
}

export async function subscribeNewsletter(request, response) {
    try {
        const { email } = request.body;

        if (!email) {
            return response.status(400).json({
                message: "Email is required",
                error: true,
                success: false
            });
        }

        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return response.status(400).json({
                message: "Please provide a valid email address",
                error: true,
                success: false
            });
        }

        const existingSubscription = await Newsletter.findOne({ email: email });

        if (existingSubscription) {
            if (existingSubscription.status === "active") {
                return response.status(400).json({
                    message: "This email is already subscribed",
                    error: true,
                    success: false
                });
            } else {
                existingSubscription.status = "active";
                existingSubscription.subscribedAt = new Date();
                await existingSubscription.save();

                return response.json({
                    message: "Successfully re-subscribed to newsletter",
                    error: false,
                    success: true
                });
            }
        }

        const newSubscriber = await Newsletter.create({
            email: email,
            status: "active"
        });

        await sendEmailFun(
            email,
            "Welcome to Our Newsletter!",
            `Thank you for subscribing to our newsletter. You'll receive updates about special discounts and latest news.`,
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1a1a2e;">Welcome to Our Newsletter!</h2>
                <p>Thank you for subscribing to our newsletter.</p>
                <p>You'll now receive the latest updates about:</p>
                <ul>
                    <li>Special discounts and offers</li>
                    <li>New product arrivals</li>
                    <li>Latest news and updates</li>
                </ul>
                <p style="margin-top: 20px;">Best regards,<br>The Team</p>
            </div>
            `
        );

        return response.json({
            message: "Successfully subscribed to newsletter",
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        return response.status(500).json({
            message: error.message || "Something went wrong",
            error: true,
            success: false
        });
    }
}