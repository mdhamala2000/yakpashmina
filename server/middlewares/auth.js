import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js'

const auth = async(request,response,next)=>{
    try {
        const token = request.cookies.accessToken || request?.headers?.authorization?.split(" ")[1];

        if(!token){
            return response.status(401).json({
                message : "Provide token",
                error: true,
                success: false
            })
        }

        const decode = await jwt.verify(token,process.env.SECRET_KEY_ACCESS_TOKEN);

        if(!decode){
            return response.status(401).json({
                message : "unauthorized access",
                error : true,
                success : false
            })
        }

        // Fetch user to check role
        const user = await UserModel.findById(decode.id);
        
        if(!user){
            return response.status(401).json({
                message : "User not found",
                error : true,
                success : false
            })
        }

        // Check if user is active
        if(user.status !== "Active"){
            return response.status(403).json({
                message : "Account is not active",
                error : true,
                success : false
            })
        }

        // Check for admin-only routes
        const adminOnlyRoutes = [
            '/getAllUsers',
            '/deleteUser',
            '/deleteMultiple',
            '/getAllReviewsAdmin',
            '/approveReview',
            '/deleteReview',
            '/order-list',
            '/sales',
            '/count',
            '/order-status',
            '/update-payment-status'
        ];
        
        const isAdminRoute = adminOnlyRoutes.some(route => request.path.includes(route));
        
        if (isAdminRoute && user.role !== 'ADMIN') {
            return response.status(403).json({
                message : "Admin access required",
                error : true,
                success : false
            })
        }

        request.userId = decode.id
        request.userRole = user.role

        next()

    } catch (error) {
        return response.status(500).json({
            message : "Authentication failed",
            error : true,
            success : false
        })
    }
}

export const requireAdmin = (request, response, next) => {
    if (request.userRole !== 'ADMIN') {
        return response.status(403).json({
            message: "Admin access required",
            error: true,
            success: false
        });
    }
    next();
};

export default auth