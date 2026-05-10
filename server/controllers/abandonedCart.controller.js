import AbandonedCartModel from "../models/abandonedCart.model.js";
import CartProductModel from "../models/cartProduct.modal.js";
import UserModel from "../models/user.model.js";
import sendEmailFun from "../config/sendEmail.js";
import AbandonedCartEmail from "../utils/abandonedCartEmailTemplate.js";

const getStoreUrl = () => {
    return process.env.STORE_URL || 'https://yakpashamina.com';
};

export const getAllCartsAdmin = async (request, response) => {
    try {
        const carts = await CartProductModel.find({});
        
        const userIds = [...new Set(carts.map(c => c.userId))];
        const usersData = await UserModel.find({ _id: { $in: userIds } });
        const userMap = {};
        usersData.forEach(u => { userMap[u._id] = { name: u.name, email: u.email }; });

        const enrichedCarts = carts.map(cart => ({
            ...cart.toObject(),
            userName: userMap[cart.userId]?.name || 'Unknown',
            userEmail: userMap[cart.userId]?.email || ''
        }));

        return response.json({
            data: enrichedCarts,
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getAllAbandonedCarts = async (request, response) => {
    try {
        const { status, days, page = 1, limit = 20 } = request.query;
        
        let query = {};
        
        if (status) {
            query.status = status;
        }
        
        if (days) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
            query.abandonedAt = { $gte: cutoffDate };
        }

        const total = await AbandonedCartModel.countDocuments(query);
        const carts = await AbandonedCartModel.find(query)
            .sort({ abandonedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const stats = await AbandonedCartModel.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    totalValue: { $sum: "$totalAmount" }
                }
            }
        ]);

        return response.json({
            data: carts,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            },
            stats,
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getAbandonedCartStats = async (request, response) => {
    try {
        const totalAbandoned = await AbandonedCartModel.countDocuments({ status: 'not_recovered' });
        const recovered = await AbandonedCartModel.countDocuments({ status: 'recovered' });
        const lost = await AbandonedCartModel.countDocuments({ status: 'lost' });

        const totalValue = await AbandonedCartModel.aggregate([
            { $match: { status: 'not_recovered' } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        const recentAbandoned = await AbandonedCartModel.find({ status: 'not_recovered' })
            .sort({ abandonedAt: -1 })
            .limit(5);

        return response.json({
            data: {
                totalAbandoned,
                recovered,
                lost,
                potentialRevenue: totalValue[0]?.total || 0,
                recentAbandoned
            },
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const markCartAbandoned = async (userId) => {
    try {
        const cartItems = await CartProductModel.find({ userId, status: 'active' });
        
        if (cartItems.length === 0) return null;

        const user = await UserModel.findById(userId);
        
        const totalAmount = cartItems.reduce((sum, item) => sum + item.subTotal, 0);

        const products = cartItems.map(item => ({
            productTitle: item.productTitle,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            subTotal: item.subTotal,
            productId: item.productId
        }));

        const existingAbandoned = await AbandonedCartModel.findOne({
            userId,
            status: 'not_recovered'
        });

        if (existingAbandoned) {
            existingAbandoned.products = products;
            existingAbandoned.totalAmount = totalAmount;
            existingAbandoned.abandonedAt = new Date();
            await existingAbandoned.save();
            return existingAbandoned;
        }

        const abandonedCart = new AbandonedCartModel({
            userId,
            userEmail: user?.email || '',
            userName: user?.name || '',
            products,
            totalAmount,
            abandonedAt: new Date()
        });

        await abandonedCart.save();
        return abandonedCart;
    } catch (error) {
        console.error('Error marking cart abandoned:', error);
        return null;
    }
};

export const markCartConverted = async (userId, orderId) => {
    try {
        await AbandonedCartModel.updateMany(
            { userId, status: 'not_recovered' },
            { 
                status: 'recovered',
                recoveredAt: new Date(),
                convertedToOrderId: orderId
            }
        );

        await CartProductModel.updateMany(
            { userId, status: 'active' },
            { status: 'converted', convertedAt: new Date() }
        );
    } catch (error) {
        console.error('Error marking cart converted:', error);
    }
};

export const sendAbandonedCartReminder = async (request, response) => {
    try {
        const { cartId } = request.params;
        
        if (!cartId || cartId.length !== 24) {
            return response.status(400).json({
                message: "Invalid cart ID",
                error: true,
                success: false
            });
        }
        
        const cart = await AbandonedCartModel.findById(cartId);
        if (!cart) {
            return response.status(404).json({
                message: "Cart not found",
                error: true,
                success: false
            });
        }

        if (!cart.userEmail) {
            return response.status(400).json({
                message: "No email address found for this cart",
                error: true,
                success: false
            });
        }

        const recoveryUrl = `${getStoreUrl()}/checkout`;
        const emailHtml = AbandonedCartEmail(cart, 'Yak Pashamina', recoveryUrl);
        
        const emailSent = await sendEmailFun({
            sendTo: cart.userEmail,
            subject: "🛒 You left something behind! Complete your purchase",
            text: `Hi ${cart.userName || 'Customer'}, We noticed you left your cart. Your items are waiting for you!`,
            html: emailHtml
        });

        if (!emailSent) {
            return response.status(500).json({
                message: "Failed to send reminder email",
                error: true,
                success: false
            });
        }

        cart.reminderSent = true;
        cart.reminderSentAt = new Date();
        await cart.save();

        return response.json({
            message: "Reminder email sent successfully",
            data: cart,
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const sendBulkReminders = async (request, response) => {
    try {
        const { days = 1, limit = 50 } = request.query;
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

        const carts = await AbandonedCartModel.find({
            status: 'not_recovered',
            abandonedAt: { $gte: cutoffDate },
            $or: [
                { reminderSent: false },
                { reminderSentAt: { $lt: cutoffDate } }
            ]
        }).limit(parseInt(limit));

        let sentCount = 0;
        let failedCount = 0;
        const results = [];

        const recoveryUrl = `${getStoreUrl()}/checkout`;

        for (const cart of carts) {
            if (!cart.userEmail) {
                failedCount++;
                results.push({ cartId: cart._id, status: 'failed', reason: 'no email' });
                continue;
            }

            try {
                const emailHtml = AbandonedCartEmail(cart, 'Yak Pashamina', recoveryUrl);
                
                const emailSent = await sendEmailFun({
                    sendTo: cart.userEmail,
                    subject: "🛒 You left something behind! Complete your purchase",
                    text: `Hi ${cart.userName || 'Customer'}, We noticed you left your cart. Your items are waiting for you!`,
                    html: emailHtml
                });

                if (emailSent) {
                    cart.reminderSent = true;
                    cart.reminderSentAt = new Date();
                    await cart.save();
                    sentCount++;
                    results.push({ cartId: cart._id, status: 'sent', email: cart.userEmail });
                } else {
                    failedCount++;
                    results.push({ cartId: cart._id, status: 'failed', reason: 'email service error' });
                }
            } catch (error) {
                failedCount++;
                results.push({ cartId: cart._id, status: 'failed', reason: error.message });
            }
        }

        return response.json({
            message: `Sent ${sentCount} reminders, ${failedCount} failed`,
            data: { sent: sentCount, failed: failedCount, results },
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const sendAutomatedReminders = async () => {
    try {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const carts = await AbandonedCartModel.find({
            status: 'not_recovered',
            abandonedAt: { $lt: oneDayAgo },
            $or: [
                { reminderSent: false },
                { reminderSentAt: { $lt: oneDayAgo } }
            ]
        }).limit(100);

        let sentCount = 0;
        const recoveryUrl = `${getStoreUrl()}/checkout`;

        for (const cart of carts) {
            if (!cart.userEmail) continue;

            try {
                const emailHtml = AbandonedCartEmail(cart, 'Yak Pashamina', recoveryUrl);
                
                const emailSent = await sendEmailFun({
                    sendTo: cart.userEmail,
                    subject: "🛒 You left something behind! Complete your purchase",
                    text: `Hi ${cart.userName || 'Customer'}, We noticed you left your cart. Your items are waiting for you!`,
                    html: emailHtml
                });

                if (emailSent) {
                    cart.reminderSent = true;
                    cart.reminderSentAt = new Date();
                    await cart.save();
                    sentCount++;
                }
            } catch (error) {
                console.error(`Failed to send reminder to ${cart.userEmail}:`, error.message);
            }
        }

        console.log(`Automated reminders: Sent ${sentCount} emails`);
        return { sent: sentCount, total: carts.length };
    } catch (error) {
        console.error('Automated reminders error:', error);
        return { sent: 0, error: error.message };
    }
};

export const deleteAbandonedCart = async (request, response) => {
    try {
        const { id } = request.params;
        
        if (!id || id.length !== 24) {
            return response.status(400).json({
                message: "Invalid cart ID",
                error: true,
                success: false
            });
        }
        
        await AbandonedCartModel.findByIdAndDelete(id);

        return response.json({
            message: "Cart deleted",
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getLongTimeWishlistItems = async (request, response) => {
    try {
        const { days = 30 } = request.query;
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

        const MyListModel = (await import("../models/myList.modal.js")).default;
        
        const wishlistItems = await MyListModel.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $match: {
                    createdAt: { $lt: cutoffDate }
                }
            },
            {
                $group: {
                    _id: "$userId",
                    userEmail: { $first: "$user.email" },
                    userName: { $first: "$user.name" },
                    items: { $push: "$$ROOT" },
                    itemCount: { $sum: 1 },
                    oldestItemDate: { $min: "$createdAt" }
                }
            },
            { $sort: { oldestItemDate: 1 } }
        ]);

        return response.json({
            data: wishlistItems,
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const detectAbandonedCarts = async (hoursThreshold = 24) => {
    try {
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - hoursThreshold);

        const activeCarts = await CartProductModel.find({
            status: 'active',
            updatedAt: { $lt: cutoffTime }
        });

        const userIds = [...new Set(activeCarts.map(cart => cart.userId))];
        
        for (const userId of userIds) {
            await markCartAbandoned(userId);
            
            await CartProductModel.updateMany(
                { userId, status: 'active' },
                { status: 'abandoned', abandonedAt: new Date() }
            );
        }

        return {
            processed: userIds.length,
            message: `Marked ${userIds.length} carts as abandoned`
        };
    } catch (error) {
        console.error('Error detecting abandoned carts:', error);
        return { processed: 0, error: error.message };
    }
};

export const runAbandonedCartDetection = async (request, response) => {
    try {
        const { hours = 24 } = request.query;
        const result = await detectAbandonedCarts(parseInt(hours));
        
        return response.json({
            data: result,
            success: true,
            error: false
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const updateCartStatus = async (request, response) => {
    try {
        const { id } = request.params;
        const { status } = request.body;
        
        if (!id || id.length !== 24) {
            return response.status(400).json({
                message: "Invalid cart ID",
                error: true,
                success: false
            });
        }
        
        const cart = await AbandonedCartModel.findById(id);
        if (!cart) {
            return response.status(404).json({
                message: "Cart not found",
                error: true,
                success: false
            });
        }

        cart.status = status;
        if (status === "recovered") {
            cart.recoveredAt = new Date();
        }
        await cart.save();

        return response.json({
            message: "Cart status updated",
            data: cart,
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};