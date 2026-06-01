import OrderModel from "../models/order.model.js";
import ProductModel from '../models/product.modal.js';
import VariantModel from '../models/variant.model.js';
import UserModel from '../models/user.model.js';
import paypal from "@paypal/checkout-server-sdk";
import OrderConfirmationEmail from "../utils/orderEmailTemplate.js";
import sendEmailFun from "../config/sendEmail.js";
import { markCartConverted } from "./abandonedCart.controller.js";

const syncProductPrices = async (products) => {
    if (!products || !Array.isArray(products)) return products;
    
    const productIds = products.map(p => p.productId).filter(Boolean);
    const variantIds = products.map(p => p.variantId).filter(Boolean);
    
    const [dbProducts, dbVariants] = await Promise.all([
        productIds.length > 0 ? ProductModel.find({ _id: { $in: productIds } }).lean() : [],
        variantIds.length > 0 ? VariantModel.find({ _id: { $in: variantIds } }).lean() : []
    ]);
    
    const priceMap = {};
    for (const p of dbProducts) {
        priceMap[p._id.toString()] = p.price;
    }
    const variantPriceMap = {};
    for (const v of dbVariants) {
        variantPriceMap[v._id.toString()] = v.price;
    }
    
    const syncedProducts = products.map((item) => {
        const quantity = parseInt(item.quantity) || 1;
        let unitPrice;
        if (item.variantId) {
            unitPrice = variantPriceMap[item.variantId];
        }
        if (unitPrice === undefined) {
            unitPrice = priceMap[item.productId];
        }
        unitPrice = unitPrice !== undefined ? unitPrice : (parseFloat(item.price) || 0);
        return {
            ...item,
            perUnit: unitPrice,
            price: unitPrice * quantity,
            subTotal: unitPrice * quantity
        };
    });
    
    return syncedProducts;
};

export const createOrderController = async (request, response) => {
    try {
        const targetCurrency = request.body.currency || 'USD';
        const rate = parseFloat(request.body.currencyRate) || 1;

        const syncedProducts = await syncProductPrices(request.body.products);

        const convertedProducts = syncedProducts.map(p => ({
            ...p,
            perUnit: Math.round((p.perUnit || 0) * rate * 100) / 100,
            price: Math.round((p.price || 0) * rate * 100) / 100,
            subTotal: Math.round((p.subTotal || 0) * rate * 100) / 100,
        }));

        const computedSubTotal = convertedProducts.reduce((sum, p) => sum + (p.price || 0), 0);
        const computedShipping = Math.round((parseFloat(request.body.shippingCost) || 0) * rate * 100) / 100;
        const computedDiscount = Math.round((parseFloat(request.body.discountAmount) || 0) * rate * 100) / 100;
        const computedTotal = computedSubTotal + computedShipping - computedDiscount;

        const paymentMethod = request.body.payment_method || '';
        const paymentStatus = request.body.isDemoPayment ? 'DEMO' : request.body.payment_status;
        const isBankTransfer = paymentMethod === 'bank_transfer' || paymentMethod === 'bank-transfer';

        let order = new OrderModel({
            userId: request.body.userId,
            products: convertedProducts,
            paymentId: request.body.paymentId,
            payment_method: paymentMethod,
            payment_status: isBankTransfer ? 'PENDING_VERIFICATION' : paymentStatus,
            delivery_address: request.body.delivery_address,
            totalAmt: computedTotal,
            subTotal: computedSubTotal,
            shippingCost: computedShipping,
            date: request.body.date,
            currency: targetCurrency,
            currencyRate: rate,
            discountCode: request.body.discountCode || null,
            discountAmount: computedDiscount,
            paymentExpiresAt: isBankTransfer ? new Date(Date.now() + 48 * 60 * 60 * 1000) : null
        });

        if (!order) {
            return response.status(500).json({
                error: true,
                success: false
            });
        }

        for (const item of syncedProducts) {
            const qty = parseInt(item.quantity) || 1;
            if (item.variantId) {
                const variant = await VariantModel.findById(item.variantId).select('stock isDeleted isActive');
                if (!variant || variant.isDeleted || !variant.isActive || variant.stock < qty) {
                    return response.status(409).json({
                        error: true, success: false,
                        message: `Insufficient stock for ${item.productTitle || 'product'}`
                    });
                }
            } else {
                const product = await ProductModel.findById(item.productId).select('countInStock');
                if (!product || product.countInStock < qty) {
                    return response.status(409).json({
                        error: true, success: false,
                        message: `Insufficient stock for ${item.productTitle || 'product'}`
                    });
                }
            }
        }

        for (const item of syncedProducts) {
            const qty = parseInt(item.quantity) || 1;
            if (item.variantId) {
                await VariantModel.findOneAndUpdate(
                    { _id: item.variantId, isActive: true, stock: { $gte: qty } },
                    { $inc: { stock: -qty } }
                );
            } else {
                await ProductModel.findOneAndUpdate(
                    { _id: item.productId, countInStock: { $gte: qty } },
                    { $inc: { countInStock: -qty, sale: qty } }
                );
            }
        }

        order = await order.save();

        const user = request.body.userId ? await UserModel.findOne({ _id: request.body.userId }) : null;
        const customerEmail = order.delivery_address?.email || user?.email;

        if (customerEmail) {
            try {
                await sendEmailFun({
                    sendTo: [customerEmail],
                    subject: `Order Confirmed - #${order._id.toString().slice(-8).toUpperCase()} | Yak Pashmina`,
                    text: "",
                    html: OrderConfirmationEmail(order.delivery_address?.firstName || user?.name || 'Customer', order)
                });
            } catch (emailError) {
                console.error('Customer email failed:', emailError.message);
            }
        }

        try {
            const companyEmail = process.env.OWNER_EMAIL || "mdhamala2000@gmail.com";
            const ownerEmailResult = await sendEmailFun({
                sendTo: [companyEmail],
                subject: `New Order Received - #${order._id.toString().slice(-8)} - ${order.currency} ${order.totalAmt}`,
                text: "",
                html: OrderConfirmationEmail(order.delivery_address?.firstName || user?.name || 'Customer', order, true)
            });
        } catch (ownerEmailError) {
            console.error('Owner email failed:', ownerEmailError.message);
        }

        await markCartConverted(request.body.userId, order._id.toString());

        return response.status(200).json({
            error: false,
            success: true,
            message: "Order Placed",
            order: order
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getOrderDetailsController(request, response) {
    try {
        const page = Math.max(1, parseInt(request.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(request.query.limit) || 10));

        const orderlist = await OrderModel.find()
            .sort({ createdAt: -1 })
            .populate('delivery_address userId')
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await OrderModel.countDocuments({});

        return response.json({
            message: "order list",
            data: orderlist,
            error: false,
            success: true,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function getUserOrderDetailsController(request, response) {
    try {
        const userId = request.userId

        const page = Math.max(1, parseInt(request.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(request.query.limit) || 10));

        const orderlist = await OrderModel.find({ userId }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);

        const total = await OrderModel.countDocuments({ userId });

        return response.json({
            message: "order list",
            data: orderlist,
            error: false,
            success: true,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export async function getTotalOrdersCountController(request, response) {
    try {
        const ordersCount = await OrderModel.countDocuments();
        return response.status(200).json({
            error: false,
            success: true,
            count: ordersCount
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



function getPayPalClient() {

    const environment =
        process.env.PAYPAL_MODE === "live"
            ? new paypal.core.LiveEnvironment(
                process.env.PAYPAL_CLIENT_ID_LIVE,
                process.env.PAYPAL_SECRET_LIVE
            )
            : new paypal.core.SandboxEnvironment(
                process.env.PAYPAL_CLIENT_ID_TEST,
                process.env.PAYPAL_SECRET_TEST
            );

    return new paypal.core.PayPalHttpClient(environment);


}


export const createOrderPaypalController = async (request, response) => {
    try {
        const currency = request.query.currency || 'USD';
        const totalAmount = request.query.totalAmount;
        
        if (!totalAmount || isNaN(parseFloat(totalAmount))) {
            return response.status(400).json({ 
                error: true, 
                message: "Invalid or missing totalAmount parameter" 
            });
        }
        
        const req = new paypal.orders.OrdersCreateRequest();
        req.prefer("return=representation");

        req.requestBody({
            intent: "CAPTURE",
            purchase_units: [{
                amount: {
                    currency_code: currency,
                    value: totalAmount.toString()
                }
            }]
        });

        try {
            const client = getPayPalClient();
            const order = await client.execute(req);
            return response.json({ id: order.result.id });
        } catch (paypalError) {
            console.error("PayPal API Error:", paypalError);
            return response.status(500).json({ 
                error: true, 
                message: "Failed to create PayPal order: " + paypalError.message 
            });
        }

    } catch (error) {
        console.error("PayPal create order error:", error);
        return response.status(500).json({
            error: true,
            message: error.message || "Failed to create PayPal order"
        })
    }
}




export const captureOrderPaypalController = async (request, response) => {
    try {
        const { paymentId } = request.body;
        const targetCurrency = request.body.currency || 'USD';
        const rate = parseFloat(request.body.currencyRate) || 1;
        
        const syncedProducts = await syncProductPrices(request.body.products);

        const convertedProducts = syncedProducts.map(p => ({
            ...p,
            perUnit: Math.round((p.perUnit || 0) * rate * 100) / 100,
            price: Math.round((p.price || 0) * rate * 100) / 100,
            subTotal: Math.round((p.subTotal || 0) * rate * 100) / 100,
        }));

        let paypalCaptureData = null;
        
        try {
            const req = new paypal.orders.OrdersCaptureRequest(paymentId);
            req.requestBody({});
            const client = getPayPalClient();
            const captureResult = await client.execute(req);
            paypalCaptureData = captureResult.result;
        } catch (captureError) {
            console.error('PayPal capture error:', captureError.message);
        }

        const paymentStatus = paypalCaptureData?.status === 'COMPLETED' ? 'PAID' : 'PENDING';

        const computedSubTotal = convertedProducts.reduce((sum, p) => sum + (p.price || 0), 0);
        const computedShipping = Math.round((parseFloat(request.body.shippingCost) || 0) * rate * 100) / 100;
        const computedDiscount = Math.round((parseFloat(request.body.discountAmount) || 0) * rate * 100) / 100;
        const computedTotal = computedSubTotal + computedShipping - computedDiscount;

        const orderInfo = {
            userId: request.body.userId,
            products: convertedProducts,
            paymentId: request.body.paymentId || paymentId || "",
            payment_status: request.body.payment_status || paymentStatus,
            payment_method: request.body.payment_method || "paypal",
            delivery_address: request.body.delivery_address,
            totalAmt: computedTotal,
            subTotal: computedSubTotal,
            shippingCost: computedShipping,
            date: request.body.date,
            currency: targetCurrency,
            currencyRate: rate,
            discountCode: request.body.discountCode || null,
            discountAmount: computedDiscount,
            paymentExpiresAt: null
        }

        for (const item of syncedProducts) {
            const qty = parseInt(item.quantity) || 1;
            if (item.variantId) {
                const variant = await VariantModel.findById(item.variantId).select('stock isDeleted isActive');
                if (!variant || variant.isDeleted || !variant.isActive || variant.stock < qty) {
                    return response.status(409).json({
                        error: true, success: false,
                        message: `Insufficient stock for ${item.productTitle || 'product'}`
                    });
                }
            } else {
                const product = await ProductModel.findById(item.productId).select('countInStock');
                if (!product || product.countInStock < qty) {
                    return response.status(409).json({
                        error: true, success: false,
                        message: `Insufficient stock for ${item.productTitle || 'product'}`
                    });
                }
            }
        }

        for (const item of syncedProducts) {
            const qty = parseInt(item.quantity) || 1;
            if (item.variantId) {
                await VariantModel.findOneAndUpdate(
                    { _id: item.variantId, isActive: true, stock: { $gte: qty } },
                    { $inc: { stock: -qty } }
                );
            } else {
                await ProductModel.findOneAndUpdate(
                    { _id: item.productId, countInStock: { $gte: qty } },
                    { $inc: { countInStock: -qty, sale: qty } }
                );
            }
        }

        const order = new OrderModel(orderInfo);
        await order.save();

        const user = await UserModel.findOne({ _id: request.body.userId })

        const recipients = [];
        recipients.push(user?.email);

        await sendEmailFun({
            sendTo: recipients,
            subject: "Order Confirmation",
            text: "",
            html: OrderConfirmationEmail(user?.name, order)
        })

        await markCartConverted(request.body.userId, order._id.toString());

        return response.status(200).json(
            {
                success: true,
                error: false,
                order: order,
                message: "Order Placed"
            }
        );

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}




export const updateOrderStatusController = async (request, response) => {
    try {
        const { id, order_status } = request.body;

        const updateOrder = await OrderModel.findByIdAndUpdate(
            id,
            { order_status },
            { new: true }
        )

        if (!updateOrder) {
            return response.status(404).json({
                message: "Order not found",
                success: false,
                error: true
            });
        }

        return response.json({
            message: "Update order status",
            success: true,
            error: false,
            data: updateOrder
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}






export const totalSalesController = async (request, response) => {
    try {
        const currentYear = new Date().getFullYear();

        const ordersList = await OrderModel.find();

        let totalSales = 0;
        let monthlySales = [
            {
                name: 'JAN',
                TotalSales: 0
            },
            {
                name: 'FEB',
                TotalSales: 0
            },
            {
                name: 'MAR',
                TotalSales: 0
            },
            {
                name: 'APRIL',
                TotalSales: 0
            },
            {
                name: 'MAY',
                TotalSales: 0
            },
            {
                name: 'JUNE',
                TotalSales: 0
            },
            {
                name: 'JULY',
                TotalSales: 0
            },
            {
                name: 'AUG',
                TotalSales: 0
            },
            {
                name: 'SEP',
                TotalSales: 0
            },
            {
                name: 'OCT',
                TotalSales: 0
            },
            {
                name: 'NOV',
                TotalSales: 0
            },
            {
                name: 'DEC',
                TotalSales: 0
            },
        ]


        for (let i = 0; i < ordersList.length; i++) {
            totalSales = totalSales + parseInt(ordersList[i].totalAmt);
            const str = JSON.stringify(ordersList[i]?.createdAt);
            const year = str.substr(1, 4);
            const monthStr = str.substr(6, 8);
            const month = parseInt(monthStr.substr(0, 2));

            if (currentYear == year) {

                if (month === 1) {
                    monthlySales[0] = {
                        name: 'JAN',
                        TotalSales: monthlySales[0].TotalSales = parseInt(monthlySales[0].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 2) {

                    monthlySales[1] = {
                        name: 'FEB',
                        TotalSales: monthlySales[1].TotalSales = parseInt(monthlySales[1].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 3) {
                    monthlySales[2] = {
                        name: 'MAR',
                        TotalSales: monthlySales[2].TotalSales = parseInt(monthlySales[2].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 4) {
                    monthlySales[3] = {
                        name: 'APRIL',
                        TotalSales: monthlySales[3].TotalSales = parseInt(monthlySales[3].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 5) {
                    monthlySales[4] = {
                        name: 'MAY',
                        TotalSales: monthlySales[4].TotalSales = parseInt(monthlySales[4].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 6) {
                    monthlySales[5] = {
                        name: 'JUNE',
                        TotalSales: monthlySales[5].TotalSales = parseInt(monthlySales[5].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 7) {
                    monthlySales[6] = {
                        name: 'JULY',
                        TotalSales: monthlySales[6].TotalSales = parseInt(monthlySales[6].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 8) {
                    monthlySales[7] = {
                        name: 'AUG',
                        TotalSales: monthlySales[7].TotalSales = parseInt(monthlySales[7].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 9) {
                    monthlySales[8] = {
                        name: 'SEP',
                        TotalSales: monthlySales[8].TotalSales = parseInt(monthlySales[8].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 10) {
                    monthlySales[9] = {
                        name: 'OCT',
                        TotalSales: monthlySales[9].TotalSales = parseInt(monthlySales[9].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 11) {
                    monthlySales[10] = {
                        name: 'NOV',
                        TotalSales: monthlySales[10].TotalSales = parseInt(monthlySales[10].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

                if (month === 12) {
                    monthlySales[11] = {
                        name: 'DEC',
                        TotalSales: monthlySales[11].TotalSales = parseInt(monthlySales[11].TotalSales) + parseInt(ordersList[i].totalAmt)
                    }
                }

            }


        }


        return response.status(200).json({
            totalSales: totalSales,
            monthlySales: monthlySales,
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





export const totalUsersController = async (request, response) => {
    try {
        const users = await UserModel.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 },
            },
        ]);



        let monthlyUsers = [
            {
                name: 'JAN',
                TotalUsers: 0
            },
            {
                name: 'FEB',
                TotalUsers: 0
            },
            {
                name: 'MAR',
                TotalUsers: 0
            },
            {
                name: 'APRIL',
                TotalUsers: 0
            },
            {
                name: 'MAY',
                TotalUsers: 0
            },
            {
                name: 'JUNE',
                TotalUsers: 0
            },
            {
                name: 'JULY',
                TotalUsers: 0
            },
            {
                name: 'AUG',
                TotalUsers: 0
            },
            {
                name: 'SEP',
                TotalUsers: 0
            },
            {
                name: 'OCT',
                TotalUsers: 0
            },
            {
                name: 'NOV',
                TotalUsers: 0
            },
            {
                name: 'DEC',
                TotalUsers: 0
            },
        ]




        for (let i = 0; i < users.length; i++) {

            if (users[i]?._id?.month === 1) {
                monthlyUsers[0] = {
                    name: 'JAN',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 2) {
                monthlyUsers[1] = {
                    name: 'FEB',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 3) {
                monthlyUsers[2] = {
                    name: 'MAR',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 4) {
                monthlyUsers[3] = {
                    name: 'APRIL',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 5) {
                monthlyUsers[4] = {
                    name: 'MAY',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 6) {
                monthlyUsers[5] = {
                    name: 'JUNE',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 7) {
                monthlyUsers[6] = {
                    name: 'JULY',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 8) {
                monthlyUsers[7] = {
                    name: 'AUG',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 9) {
                monthlyUsers[8] = {
                    name: 'SEP',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 10) {
                monthlyUsers[9] = {
                    name: 'OCT',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 11) {
                monthlyUsers[10] = {
                    name: 'NOV',
                    TotalUsers: users[i].count
                }
            }

            if (users[i]?._id?.month === 12) {
                monthlyUsers[11] = {
                    name: 'DEC',
                    TotalUsers: users[i].count
                }
            }

        }



        return response.status(200).json({
            TotalUsers: monthlyUsers,
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



export async function deleteOrder(request, response) {
    try {
        const order = await OrderModel.findById(request.params.id);

        if (!order) {
            return response.status(404).json({
                message: "Order Not found",
                error: true,
                success: false
            });
        }

        await OrderModel.findByIdAndDelete(request.params.id);

        return response.status(200).json({
            success: true,
            error: false,
            message: "Order Deleted!",
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export const updatePaymentStatusController = async (request, response) => {
    try {
        const { paymentIntentId, payment_status } = request.body;
        
        const order = await OrderModel.findOneAndUpdate(
            { paymentId: paymentIntentId },
            { payment_status: payment_status || 'PAID' },
            { new: true }
        );
        
        if (!order) {
            return response.status(404).json({
                error: true,
                success: false,
                message: "Order not found"
            });
        }
        
        return response.status(200).json({
            error: false,
            success: true,
            message: "Payment status updated",
            data: order
        });
    } catch (error) {
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message
        });
    }
};

export const trackOrderController = async (request, response) => {
    try {
        const { trackingNumber } = request.params;
        
        const order = await OrderModel.findById(trackingNumber);

        if (!order) {
            return response.status(404).json({
                error: true,
                success: false,
                message: "Order not found"
            });
        }

        return response.status(200).json({
            error: false,
            success: true,
            order: {
                _id: order._id,
                orderId: order._id.toString().slice(-8).toUpperCase(),
                status: order.order_status || order.payment_status || 'pending',
                createdAt: order.date || order.createdAt,
                shippingAddress: order.delivery_address,
                paymentMethod: order.payment_method,
                paymentStatus: order.payment_status,
                items: order.products.map(item => ({
                    productTitle: item.productTitle || item.name,
                    image: item.image,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmt: order.totalAmt,
                subTotal: order.subTotal,
                shippingCost: order.shippingCost,
                currency: order.currency,
                discountCode: order.discountCode,
                discountAmount: order.discountAmount
            }
        });
    } catch (error) {
        return response.status(500).json({
            error: true,
            success: false,
            message: error.message
        });
    }
};