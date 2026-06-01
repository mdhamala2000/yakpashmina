import CartProductModel from "../models/cartProduct.modal.js";
import ProductModel from "../models/product.modal.js";
import VariantModel from "../models/variant.model.js";
import { markCartAbandoned } from "./abandonedCart.controller.js";

export const addToCartItemController = async (request, response) => {
    try {
        const userId = request.userId //middleware
        const { productTitle, image, rating, price, oldPrice, quantity, subTotal, productId, countInStock, discount, size, weight, ram, color, materials, brand, variantId, variantSku } = request.body

        if (!productId) {
            return response.status(402).json({
                message: "Provide productId",
                error: true,
                success: false
            })
        }

        const product = await ProductModel.findById(productId);
        
        if (!product) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            })
        }

        if (product.hasVariants) {
            if (!variantId) {
                return response.status(400).json({
                    message: "Variant selection is required for this product.",
                    error: true,
                    success: false
                })
            }
            const variant = await VariantModel.findById(variantId);
            if (!variant || variant.isDeleted || !variant.isActive) {
                return response.status(404).json({
                    message: "Selected variant not found.",
                    error: true,
                    success: false
                })
            }
            if (variant.stock <= 0) {
                return response.status(400).json({
                    message: "Sorry, this variant is currently out of stock. Please check back later or contact us for alternatives.",
                    error: true,
                    success: false
                })
            }
            if (variant.stock < quantity) {
                return response.status(400).json({
                    message: `Sorry, only ${variant.stock} items available in stock.`,
                    error: true,
                    success: false
                })
            }
        } else {
            if (product.countInStock <= 0) {
                return response.status(400).json({
                    message: "Sorry, this item is currently out of stock. Please check back later or contact us for alternatives.",
                    error: true,
                    success: false
                })
            }

            if (product.countInStock < quantity) {
                return response.status(400).json({
                    message: `Sorry, only ${product.countInStock} items available in stock.`,
                    error: true,
                    success: false
                })
            }
        }


        const checkItemCartQuery = {
            userId: userId,
            productId: productId,
        };
        if (variantId) {
            checkItemCartQuery.variantId = variantId;
        }
        const checkItemCart = await CartProductModel.findOne(checkItemCartQuery);

        if (checkItemCart) {
            return response.status(400).json({
                message: "Item already in cart"
            })
        }


        const cartItem = new CartProductModel({
            productTitle: productTitle || 'Unnamed Product',
            image: image || '',
            rating: rating || 0,
            price: price || 0,
            oldPrice: oldPrice || 0,
            quantity: quantity,
            subTotal: subTotal || 0,
            productId: productId,
            variantId: variantId || '',
            variantSku: variantSku || '',
            countInStock: countInStock || 0,
            userId: userId,
            brand: brand || '',
            discount: discount || 0,
            size: size || '',
            weight: weight || '',
            ram: ram || '',
            color: color || '',
            materials: materials || ''
        })

        const save = await cartItem.save();


        return response.status(200).json({
            data: save,
            message: "Item add successfully",
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


export const getCartItemController = async (request, response) => {
    try {
        const userId = request.userId;

        const cartItems = await CartProductModel.find({
            userId: userId
        });

        return response.json({
            data: cartItems,
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

export const updateCartItemQtyController = async (request, response) => {
    try {

        const userId = request.userId
        const { _id, qty , subTotal, size, weight, ram} = request.body



        if (!_id || !qty) {
            return response.status(400).json({
                message: "provide _id, qty"
            })
        }

        const cartItem = await CartProductModel.findOne({ _id: _id, userId: userId });
        if (!cartItem) {
            return response.status(404).json({
                message: "Cart item not found",
                error: true,
                success: false
            })
        }

        if (cartItem.variantId) {
            const variant = await VariantModel.findById(cartItem.variantId);
            if (!variant || variant.isDeleted || !variant.isActive) {
                return response.status(400).json({
                    message: "Selected variant not found.",
                    error: true,
                    success: false
                })
            }
            if (variant.stock < qty) {
                return response.status(400).json({
                    message: `Sorry, only ${variant.stock} items available in stock.`,
                    error: true,
                    success: false
                })
            }
        } else {
            const product = await ProductModel.findById(cartItem.productId);
            if (product && product.countInStock < qty) {
                return response.status(400).json({
                    message: `Sorry, only ${product.countInStock} items available in stock.`,
                    error: true,
                    success: false
                })
            }
        }

        const updateCartitem = await CartProductModel.updateOne(
            {
                _id: _id,
                userId: userId
            },
            {
                quantity: qty,
                subTotal:subTotal,
                size:size,
                ram:ram,
                weight:weight
            },
            { new: true }
        )


        return response.json({
            message: "Update cart item",
            success: true,
            error: false,
            data: updateCartitem
        })



    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}


export const deleteCartItemQtyController = async (request, response) => {
    try {
        const userId = request.userId // middleware
        const { id } = request.params


        if(!id){
            return response.status(400).json({
                message : "Provide _id",
                error : true,
                success : false
            })
          }


          const deleteCartItem  = await CartProductModel.deleteOne({_id : id, userId : userId })

          if(deleteCartItem.deletedCount === 0){
            return response.status(404).json({
                message:"The product in the cart is not found",
                error:true,
                success:false
            })
          }
         

          return response.status(200).json({
            message : "Item remove",
            error : false,
            success : true,
            data : deleteCartItem
          })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}



export const emptyCartController = async (request, response) => {
    try {
        const userId = request.params.id // middlewar

        await CartProductModel.deleteMany({userId:userId })

          return response.status(200).json({
            error : false,
            success : true,
          })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error : true,
            success : false
        })
    }
}

export const trackCheckoutStart = async (request, response) => {
    try {
        const userId = request.userId;
        
        const abandonedCart = await markCartAbandoned(userId);
        
        return response.json({
            data: abandonedCart,
            message: "Checkout tracked",
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

export const getCartStats = async (request, response) => {
    try {
        const totalCarts = await CartProductModel.countDocuments({ status: 'active' });
        const abandonedCarts = await CartProductModel.countDocuments({ status: 'abandoned' });
        const convertedCarts = await CartProductModel.countDocuments({ status: 'converted' });
        
        const activeCarts = await CartProductModel.find({ status: 'active' });
        const totalValue = activeCarts.reduce((sum, item) => sum + item.subTotal, 0);

        return response.json({
            data: {
                active: totalCarts,
                abandoned: abandonedCarts,
                converted: convertedCarts,
                cartValue: totalValue
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
}