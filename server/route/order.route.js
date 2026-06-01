import { Router } from "express";
import auth from "../middlewares/auth.js";
import axios from "axios";
import crypto from "crypto";
import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.modal.js";
import VariantModel from "../models/variant.model.js";
import sendEmailFun from "../config/sendEmail.js";
import OrderConfirmationEmail from "../utils/orderEmailTemplate.js";
import { validateOrder } from "../middlewares/validation.js";
import {  captureOrderPaypalController, createOrderController, createOrderPaypalController, deleteOrder, getOrderDetailsController, getTotalOrdersCountController, getUserOrderDetailsController, totalSalesController, totalUsersController, updateOrderStatusController, updatePaymentStatusController, trackOrderController } from "../controllers/order.controller.js";

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'mdhamala2000@gmail.com';

const orderRouter = Router();

orderRouter.post('/create',auth,createOrderController)

orderRouter.get("/order-list",auth,getOrderDetailsController)
orderRouter.get('/create-order-paypal',auth,createOrderPaypalController)
orderRouter.post('/capture-order-paypal',auth,captureOrderPaypalController)
orderRouter.put('/order-status/:id',auth,updateOrderStatusController)
orderRouter.put('/update-payment-status',auth,updatePaymentStatusController)
orderRouter.get('/verify-payment/:paymentId', async (req, res) => {
  try {
    const { Order } = await import('../models/order.model.js');
    const order = await Order.findOne({ paymentId: req.params.paymentId });
    
    if (order) {
      return res.status(200).json({ 
        success: true, 
        payment_status: order.payment_status,
        orderStatus: order.orderStatus 
      });
    }
    
    res.status(404).json({ success: false, message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
})
orderRouter.get('/count',auth,getTotalOrdersCountController)
orderRouter.get('/sales',auth,totalSalesController)
orderRouter.get('/users',auth,totalUsersController)
orderRouter.get('/order-list/orders',auth,getUserOrderDetailsController)
orderRouter.delete('/deleteOrder/:id',auth,deleteOrder)
orderRouter.get('/track/:trackingNumber', trackOrderController)
orderRouter.get('/by-payment-intent/:paymentIntentId', async (req, res) => {
  try {
    const order = await OrderModel.findOne({ paymentId: req.params.paymentIntentId });
    if (order) {
      return res.status(200).json(order);
    }
    res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

orderRouter.get('/getOrderById', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'Order ID is required' });
    }
    const order = await OrderModel.findById(id);
    if (order) {
      return res.status(200).json(order);
    }
    res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

export default orderRouter;
