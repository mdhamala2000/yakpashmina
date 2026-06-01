import PaymentGateway from "../models/paymentGateway.model.js";
import Stripe from 'stripe';
import dotenv from "dotenv";
dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const PAYPAL_CLIENT_ID_TEST = process.env.PAYPAL_CLIENT_ID_TEST;
const PAYPAL_SECRET_TEST = process.env.PAYPAL_SECRET_TEST;
const PAYPAL_CLIENT_ID_LIVE = process.env.PAYPAL_CLIENT_ID_LIVE;
const PAYPAL_SECRET_LIVE = process.env.PAYPAL_SECRET_LIVE;

const BANK_NAME = process.env.BANK_NAME || '';
const BANK_ACCOUNT_NAME = process.env.BANK_ACCOUNT_NAME || '';
const BANK_ACCOUNT_NUMBER = process.env.BANK_ACCOUNT_NUMBER || '';
const BANK_SWIFT = process.env.BANK_SWIFT || '';
const BANK_INSTRUCTIONS = process.env.BANK_INSTRUCTIONS || '';
const BANK_CODE = process.env.BANK_CODE || '';
const BANK_BRANCH_CODE = process.env.BANK_BRANCH_CODE || '';
const BANK_LOCATION = process.env.BANK_LOCATION || '';
const BANK_ACCOUNT_TYPE = process.env.BANK_ACCOUNT_TYPE || '';
const BANK_ADDRESS = process.env.BANK_ADDRESS || '';
const BANK_CITY = process.env.BANK_CITY || '';

const COD_MIN_AMOUNT = process.env.COD_MIN_AMOUNT || '0';
const COD_MAX_AMOUNT = process.env.COD_MAX_AMOUNT || '10000';
const COD_INSTRUCTIONS = process.env.COD_INSTRUCTIONS || '';

export const getPaymentGateways = async (request, response) => {
  try {
    const gateways = await PaymentGateway.find().sort({ gatewayType: 1 });
    
    const gatewaysWithConfig = gateways.map(gateway => {
      const gatewayObj = gateway.toObject();
      const isLive = gatewayObj.environment === 'live';
      
      if (gatewayObj.gatewayType === 'stripe') {
        gatewayObj.hasCredentials = !!(gatewayObj.apiSecret || (STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.includes('sk_')));
        gatewayObj.publishableKey = gatewayObj.publishableKey || STRIPE_PUBLISHABLE_KEY || '';
        gatewayObj.webhookSecret = gatewayObj.webhookSecret || STRIPE_WEBHOOK_SECRET || '';
      } else if (gatewayObj.gatewayType === 'paypal') {
        gatewayObj.hasCredentials = !!(gatewayObj.clientId || gatewayObj.clientSecret || 
          (isLive ? (PAYPAL_CLIENT_ID_LIVE && PAYPAL_SECRET_LIVE) : (PAYPAL_CLIENT_ID_TEST && PAYPAL_SECRET_TEST)));
      } else if (gatewayObj.gatewayType === 'bank_deposit') {
        gatewayObj.bankName = BANK_NAME || gatewayObj.bankName;
        gatewayObj.accountName = BANK_ACCOUNT_NAME || gatewayObj.accountHolderName;
        gatewayObj.accountNumber = BANK_ACCOUNT_NUMBER || gatewayObj.accountNumber;
        gatewayObj.swift = BANK_SWIFT || gatewayObj.routingNumber;
        gatewayObj.instructions = BANK_INSTRUCTIONS || gatewayObj.instructions;
        gatewayObj.bankCode = BANK_CODE || gatewayObj.bankCode;
        gatewayObj.branchCode = BANK_BRANCH_CODE || gatewayObj.branchCode;
        gatewayObj.location = BANK_LOCATION || gatewayObj.location;
        gatewayObj.accountType = BANK_ACCOUNT_TYPE || gatewayObj.accountType;
        gatewayObj.bankAddress = BANK_ADDRESS || gatewayObj.bankAddress;
        gatewayObj.city = BANK_CITY || gatewayObj.city;
        gatewayObj.hasCredentials = !!(BANK_NAME || gatewayObj.bankName);
      } else if (gatewayObj.gatewayType === 'cod') {
        gatewayObj.minAmount = COD_MIN_AMOUNT;
        gatewayObj.maxAmount = COD_MAX_AMOUNT;
        gatewayObj.instructions = COD_INSTRUCTIONS;
      } else if (gatewayObj.gatewayType === 'airwallex') {
        gatewayObj.hasCredentials = !!(process.env.AIRWALLEX_API_KEY && process.env.AIRWALLEX_CLIENT_ID);
        gatewayObj.environment = gatewayObj.environment || process.env.AIRWALLEX_ENVIRONMENT || 'sandbox';
      }
      
      delete gatewayObj.apiSecret;
      delete gatewayObj.clientSecret;
      return gatewayObj;
    });

    return response.status(200).json({
      error: false,
      success: true,
      data: gatewaysWithConfig
    });
  } catch (error) {
    console.error('Get payment gateways error:', error);
    return response.status(500).json({
      error: true,
      success: false,
      message: error.message || "Failed to get payment gateways"
    });
  }
};

export const getPaymentGateway = async (request, response) => {
  try {
    const { id } = request.params;
    const gateway = await PaymentGateway.findById(id);
    
    if (!gateway) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "Payment gateway not found"
      });
    }

    const gatewayObj = gateway.toObject();
    
    return response.status(200).json({
      error: false,
      success: true,
      data: gatewayObj
    });
  } catch (error) {
    console.error('Get payment gateway error:', error);
    return response.status(500).json({
      error: true,
      success: false,
      message: error.message || "Failed to get payment gateway"
    });
  }
};

export const createPaymentGateway = async (request, response) => {
  try {
    const {
      gatewayType,
      isActive,
      environment,
      displayName,
      logo
    } = request.body;

    const existingGateway = await PaymentGateway.findOne({ gatewayType });
    if (existingGateway) {
      return response.status(400).json({
        error: true,
        success: false,
        message: `${gatewayType} gateway already exists. Use update instead.`
      });
    }

    const gateway = new PaymentGateway({
      gatewayType,
      isActive: isActive || false,
      environment: environment || "sandbox",
      displayName: displayName || gatewayType,
      logo: logo || ""
    });

    await gateway.save();

    return response.status(201).json({
      error: false,
      success: true,
      message: "Payment gateway created successfully",
      data: {
        _id: gateway._id,
        gatewayType: gateway.gatewayType,
        isActive: gateway.isActive,
        environment: gateway.environment,
        displayName: gateway.displayName
      }
    });
  } catch (error) {
    console.error('Create payment gateway error:', error);
    return response.status(500).json({
      error: true,
      success: false,
      message: error.message || "Failed to create payment gateway"
    });
  }
};

export const updatePaymentGateway = async (request, response) => {
  try {
    const { id } = request.params;
    const updateData = { ...request.body };
    
    delete updateData._id;
    delete updateData.createdAt;

    let gateway = await PaymentGateway.findById(id);

    if (!gateway) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "Payment gateway not found"
      });
    }

    for (const key in updateData) {
      if (updateData[key] !== undefined) {
        gateway[key] = updateData[key];
      }
    }
    gateway.updatedAt = Date.now();
    await gateway.save();

    const gatewayObj = gateway.toObject();
    delete gatewayObj.apiSecret;
    delete gatewayObj.clientSecret;

    return response.status(200).json({
      error: false,
      success: true,
      message: "Payment gateway updated successfully",
      data: gatewayObj
    });
  } catch (error) {
    console.error('Update payment gateway error:', error);
    return response.status(500).json({
      error: true,
      success: false,
      message: error.message || "Failed to update payment gateway"
    });
  }
};

export const deletePaymentGateway = async (request, response) => {
  try {
    const { id } = request.params;
    const gateway = await PaymentGateway.findByIdAndDelete(id);

    if (!gateway) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "Payment gateway not found"
      });
    }

    return response.status(200).json({
      error: false,
      success: true,
      message: "Payment gateway deleted successfully"
    });
  } catch (error) {
    console.error('Delete payment gateway error:', error);
    return response.status(500).json({
      error: true,
      success: false,
      message: error.message || "Failed to delete payment gateway"
    });
  }
};

export const togglePaymentGateway = async (request, response) => {
  try {
    const { id } = request.params;
    const gateway = await PaymentGateway.findById(id);

    if (!gateway) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "Payment gateway not found"
      });
    }

    gateway.isActive = !gateway.isActive;
    gateway.updatedAt = Date.now();
    await gateway.save();

    return response.status(200).json({
      error: false,
      success: true,
      message: `Payment gateway ${gateway.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: gateway._id,
        gatewayType: gateway.gatewayType,
        isActive: gateway.isActive,
        environment: gateway.environment
      }
    });
  } catch (error) {
    console.error('Toggle payment gateway error:', error);
    return response.status(500).json({
      error: true,
      success: false,
      message: error.message || "Failed to toggle payment gateway"
    });
  }
};

export const getCredentials = async (request, response) => {
  try {
    const { gatewayType, environment } = request.query;
    
    const isLive = environment === 'live';
    
    let credentials = {};
    
    if (gatewayType === 'stripe') {
      credentials = {
        secretKey: STRIPE_SECRET_KEY,
        publishableKey: STRIPE_PUBLISHABLE_KEY,
        webhookSecret: STRIPE_WEBHOOK_SECRET
      };
    } else if (gatewayType === 'paypal') {
      credentials = {
        mode: isLive ? 'live' : 'sandbox',
        clientId: isLive ? PAYPAL_CLIENT_ID_LIVE : PAYPAL_CLIENT_ID_TEST,
        secret: isLive ? PAYPAL_SECRET_LIVE : PAYPAL_SECRET_TEST,
        baseUrl: isLive ? 'https://api.paypal.com' : 'https://api.sandbox.paypal.com'
      };
    } else if (gatewayType === 'bank_deposit') {
      credentials = {
        bankName: BANK_NAME,
        accountName: BANK_ACCOUNT_NAME,
        accountNumber: BANK_ACCOUNT_NUMBER,
        swift: BANK_SWIFT,
        instructions: BANK_INSTRUCTIONS,
        bankCode: BANK_CODE,
        branchCode: BANK_BRANCH_CODE,
        location: BANK_LOCATION,
        accountType: BANK_ACCOUNT_TYPE,
        bankAddress: BANK_ADDRESS,
        city: BANK_CITY
      };
    } else if (gatewayType === 'cod') {
      credentials = {
        minAmount: COD_MIN_AMOUNT,
        maxAmount: COD_MAX_AMOUNT,
        instructions: COD_INSTRUCTIONS
      };
    } else if (gatewayType === 'airwallex') {
      credentials = {
        apiKey: process.env.AIRWALLEX_API_KEY ? '••••' + process.env.AIRWALLEX_API_KEY.slice(-8) : '',
        clientId: process.env.AIRWALLEX_CLIENT_ID || '',
        environment: process.env.AIRWALLEX_ENVIRONMENT || 'sandbox',
        orgId: process.env.AIRWALLEX_ORG_ID || ''
      };
    }

    return response.status(200).json({
      error: false,
      success: true,
      data: credentials
    });
  } catch (error) {
    console.error('Get credentials error:', error);
    return response.status(500).json({
      error: true,
      success: false,
      message: error.message || "Failed to get credentials"
    });
  }
};

export const initializePaymentGateways = async () => {
  try {
    const defaultGateways = [
      { gatewayType: 'stripe', displayName: 'Stripe', environment: 'sandbox' },
      { gatewayType: 'bank_deposit', displayName: 'Bank Transfer', environment: 'sandbox' },
      { gatewayType: 'paypal', displayName: 'PayPal', environment: 'sandbox' },
      { gatewayType: 'airwallex', displayName: 'Airwallex', environment: 'sandbox' }
    ];

    for (const gateway of defaultGateways) {
      const existing = await PaymentGateway.findOne({ gatewayType: gateway.gatewayType });
      if (!existing) {
        await PaymentGateway.create(gateway);
        console.log(`Created default ${gateway.gatewayType} gateway`);
      }
    }
  } catch (error) {
    console.error('Error initializing payment gateways:', error);
  }
};

export const testPaymentGateway = async (request, response) => {
  try {
    const { gatewayType, environment, credentials } = request.body;
    
    if (!gatewayType) {
      return response.status(400).json({
        error: true,
        success: false,
        message: "Gateway type is required"
      });
    }

    const gateway = await PaymentGateway.findOne({ gatewayType });
    
    if (!gateway) {
      return response.status(404).json({
        error: true,
        success: false,
        message: "Payment gateway not found"
      });
    }

    let isValid = false;
    let message = "";

    if (gatewayType === 'stripe') {
      // Always use .env key (most reliable)
      let testKey = process.env.STRIPE_SECRET_KEY;
      
      console.log('Stripe test - env key exists:', !!testKey);
      console.log('Stripe test - key starts with:', testKey?.substring(0, 10));
      
      if (testKey && (testKey.startsWith('sk_test_') || testKey.startsWith('sk_live_'))) {
        isValid = true;
        message = "Stripe credentials valid (from .env)";
      } else if (testKey) {
        // Key exists but wrong format
        message = "Stripe key exists but format invalid";
      } else {
        message = "No Stripe key found in .env";
      }
    } else if (gatewayType === 'paypal') {
      const testClientId = credentials?.clientId || gateway.clientId;
      const testSecret = credentials?.clientSecret || gateway.clientSecret;
      if (testClientId && testSecret) {
        isValid = true;
        message = "PayPal credentials validated successfully";
      } else {
        message = "Missing PayPal credentials";
      }
    } else if (gatewayType === 'bank_deposit') {
      const bankName = credentials?.bankName || gateway.bankName;
      const accountNumber = credentials?.accountNumber || gateway.accountNumber;
      if (bankName && accountNumber) {
        isValid = true;
        message = "Bank transfer details validated successfully";
      } else {
        message = "Missing bank details";
      }
    } else if (gatewayType === 'airwallex') {
      const apiKey = process.env.AIRWALLEX_API_KEY;
      const clientId = process.env.AIRWALLEX_CLIENT_ID;
      if (apiKey && clientId) {
        isValid = true;
        message = "Airwallex credentials validated successfully (from .env)";
      } else {
        message = "Missing Airwallex credentials in .env";
      }
    } else {
      message = "Gateway type validation not implemented";
    }

    if (isValid) {
      gateway.tested = true;
      gateway.testPassed = true;
      gateway.updatedAt = Date.now();
      await gateway.save();
    }

    return response.status(200).json({
      error: !isValid,
      success: isValid,
      message: message,
      data: { tested: isValid }
    });
  } catch (error) {
    console.error('Test payment gateway error:', error);
    return response.status(500).json({
      error: true,
      success: false,
      message: error.message || "Failed to test payment gateway"
    });
  }
};

export default {
  getPaymentGateways,
  getPaymentGateway,
  createPaymentGateway,
  updatePaymentGateway,
  deletePaymentGateway,
  togglePaymentGateway,
  getCredentials,
  initializePaymentGateways,
  testPaymentGateway
};