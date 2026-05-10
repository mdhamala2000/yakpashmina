import DiscountCodeModel from '../models/discountCode.model.js';

export async function createDiscountCode(request, response) {
    try {
        const {
            code,
            discountType,
            discountValue,
            minPurchaseAmount,
            maxDiscountAmount,
            description,
            startDate,
            endDate,
            usageLimit,
            applicableCategories,
            applicableProducts
        } = request.body;

        const existingCode = await DiscountCodeModel.findOne({ code: code.toUpperCase() });
        if (existingCode) {
            return response.status(400).json({
                message: "Discount code already exists",
                error: true,
                success: false
            });
        }

        const discountCode = new DiscountCodeModel({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minPurchaseAmount: minPurchaseAmount || 0,
            maxDiscountAmount,
            description,
            startDate,
            endDate,
            usageLimit,
            applicableCategories: applicableCategories || [],
            applicableProducts: applicableProducts || []
        });

        await discountCode.save();

        return response.status(200).json({
            message: "Discount code created successfully",
            error: false,
            success: true,
            data: discountCode
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function getDiscountCodes(request, response) {
    try {
        const discountCodes = await DiscountCodeModel.find().sort({ createdAt: -1 });
        return response.status(200).json({
            message: "Discount codes fetched successfully",
            error: false,
            success: true,
            data: discountCodes
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function getDiscountCode(request, response) {
    try {
        const discountCode = await DiscountCodeModel.findById(request.params.id);
        if (!discountCode) {
            return response.status(404).json({
                message: "Discount code not found",
                error: true,
                success: false
            });
        }
        return response.status(200).json({
            message: "Discount code fetched successfully",
            error: false,
            success: true,
            data: discountCode
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function updateDiscountCode(request, response) {
    try {
        const {
            code,
            discountType,
            discountValue,
            minPurchaseAmount,
            maxDiscountAmount,
            description,
            startDate,
            endDate,
            usageLimit,
            isActive,
            applicableCategories,
            applicableProducts
        } = request.body;

        const existingCode = await DiscountCodeModel.findOne({
            code: code.toUpperCase(),
            _id: { $ne: request.params.id }
        });
        if (existingCode) {
            return response.status(400).json({
                message: "Discount code already exists",
                error: true,
                success: false
            });
        }

        const discountCode = await DiscountCodeModel.findByIdAndUpdate(
            request.params.id,
            {
                code: code.toUpperCase(),
                discountType,
                discountValue,
                minPurchaseAmount: minPurchaseAmount || 0,
                maxDiscountAmount,
                description,
                startDate,
                endDate,
                usageLimit,
                isActive,
                applicableCategories: applicableCategories || [],
                applicableProducts: applicableProducts || []
            },
            { new: true }
        );

        if (!discountCode) {
            return response.status(404).json({
                message: "Discount code not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            message: "Discount code updated successfully",
            error: false,
            success: true,
            data: discountCode
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function deleteDiscountCode(request, response) {
    try {
        const discountCode = await DiscountCodeModel.findByIdAndDelete(request.params.id);
        if (!discountCode) {
            return response.status(404).json({
                message: "Discount code not found",
                error: true,
                success: false
            });
        }
        return response.status(200).json({
            message: "Discount code deleted successfully",
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
}

export async function validateDiscountCode(request, response) {
    try {
        const { code, cartTotal, cartItems } = request.body;

        const discountCode = await DiscountCodeModel.findOne({ code: code.toUpperCase() });
        if (!discountCode) {
            return response.status(404).json({
                message: "Invalid discount code",
                error: true,
                success: false
            });
        }

        if (!discountCode.isActive) {
            return response.status(400).json({
                message: "This discount code is no longer active",
                error: true,
                success: false
            });
        }

        const now = new Date();
        if (discountCode.startDate && new Date(discountCode.startDate) > now) {
            return response.status(400).json({
                message: "This discount code is not yet active",
                error: true,
                success: false
            });
        }

        if (discountCode.endDate && new Date(discountCode.endDate) < now) {
            return response.status(400).json({
                message: "This discount code has expired",
                error: true,
                success: false
            });
        }

        if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
            return response.status(400).json({
                message: "This discount code has reached its usage limit",
                error: true,
                success: false
            });
        }

        if (cartTotal < discountCode.minPurchaseAmount) {
            return response.status(400).json({
                message: `Minimum purchase of ${discountCode.minPurchaseAmount} required for this code`,
                error: true,
                success: false
            });
        }

        let discountAmount = 0;
        if (discountCode.discountType === 'percentage') {
            discountAmount = (cartTotal * discountCode.discountValue) / 100;
            if (discountCode.maxDiscountAmount) {
                discountAmount = Math.min(discountAmount, discountCode.maxDiscountAmount);
            }
        } else {
            discountAmount = discountCode.discountValue;
            if (discountCode.maxDiscountAmount) {
                discountAmount = Math.min(discountAmount, discountCode.maxDiscountAmount);
            }
        }

        return response.status(200).json({
            message: "Discount code is valid",
            error: false,
            success: true,
            data: {
                code: discountCode.code,
                discountType: discountCode.discountType,
                discountValue: discountCode.discountValue,
                discountAmount: discountAmount,
                description: discountCode.description
            }
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function applyDiscountCode(request, response) {
    try {
        const { code } = request.body;
        
        const discountCode = await DiscountCodeModel.findOneAndUpdate(
            { code: code.toUpperCase() },
            { $inc: { usageCount: 1 } },
            { new: true }
        );

        if (!discountCode) {
            return response.status(404).json({
                message: "Discount code not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            message: "Discount code applied successfully",
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
}