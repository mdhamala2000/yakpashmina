import Joi from 'joi';

export const validateOrder = (req, res, next) => {
    const schema = Joi.object({
        totalAmt: Joi.number().positive().max(100000).required(),
        currency: Joi.string().valid('USD', 'EUR', 'GBP', 'AUD', 'CAD', 'AED', 'NPR').default('USD'),
        products: Joi.array().items(
            Joi.object({
                productId: Joi.string().allow('', null),
                quantity: Joi.number().integer().positive().max(100).required(),
                price: Joi.number().positive().required(),
                name: Joi.string().max(200).allow('', null),
                image: Joi.string().allow('', null)
            })
        ).min(1).required(),
        delivery_address: Joi.object({
            firstName: Joi.string().min(1).max(50).required(),
            lastName: Joi.string().min(1).max(50).required(),
            email: Joi.string().email().required(),
            phone: Joi.string().min(5).max(20).required(),
            address_line1: Joi.string().min(1).max(200).required(),
            city: Joi.string().min(1).max(50).required(),
            country: Joi.string().min(2).max(50).required(),
            state: Joi.string().max(50).allow('', null),
            zipCode: Joi.string().max(20).allow('', null)
        }).required(),
        payment_method: Joi.string().valid('card', 'paypal', 'bank_deposit', 'stripe', 'cod', 'airwallex').required(),
        paymentId: Joi.string().allow('', null),
        payment_status: Joi.string().valid('PAID', 'PENDING', 'FAILED').allow(null),
        discountCode: Joi.string().allow('', null),
        discountAmount: Joi.number().min(0).default(0),
        shippingCost: Joi.number().min(0).default(0),
        subTotal: Joi.number().positive().allow(null)
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessage = error.details.map(d => d.message).join(', ');
        return res.status(400).json({ 
            error: true, 
            message: errorMessage 
        });
    }
    next();
};

export const validatePaymentIntent = (req, res, next) => {
    const schema = Joi.object({
        amount: Joi.number().positive().min(0.01).max(100000).required(),
        currency: Joi.string().uppercase().valid('USD', 'EUR', 'GBP', 'AUD', 'CAD', 'AED', 'NPR', 'HKD', 'SGD', 'JPY', 'CNY', 'INR', 'THB', 'MYR', 'PHP', 'IDR', 'VND', 'KRW', 'TWD', 'NZD', 'MXN', 'ZAR', 'EGP', 'NGP', 'KES', 'MA', 'GHS', 'TRY', 'SAR', 'QAT', 'KWD', 'OMN', 'BH', 'RU', 'UA').default('USD'),
        customerId: Joi.string().allow('', null),
        idempotencyKey: Joi.string().uuid().optional(),
        returnUrl: Joi.string().uri().optional(),
        env: Joi.string().valid('demo', 'prod').optional()
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessage = error.details.map(d => d.message).join(', ');
        console.log('Validation error:', errorMessage);
        return res.status(400).json({ 
            error: true, 
            message: errorMessage 
        });
    }
    next();
};

export const validateUserRegistration = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(100).required(),
        phone: Joi.string().min(5).max(20).optional()
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessage = error.details.map(d => d.message).join(', ');
        return res.status(400).json({ 
            error: true, 
            message: errorMessage 
        });
    }
    next();
};

export const validateDiscountCode = (req, res, next) => {
    const schema = Joi.object({
        code: Joi.string().min(1).max(50).required(),
        orderTotal: Joi.number().positive().required()
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ 
            error: true, 
            message: error.details[0].message 
        });
    }
    next();
};