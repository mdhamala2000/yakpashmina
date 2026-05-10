import mongoose from "mongoose";

const paymentGatewaySchema = new mongoose.Schema({
  gatewayType: {
    type: String,
    required: true,
    unique: true,
    enum: ['stripe', 'bank_deposit', 'airwallex', 'paypal']
  },
  isActive: {
    type: Boolean,
    default: false
  },
  environment: {
    type: String,
    enum: ['sandbox', 'live'],
    default: 'sandbox'
  },
  displayName: {
    type: String,
    default: ""
  },
  logo: {
    type: String,
    default: ""
  },
  publishableKey: {
    type: String,
    default: ""
  },
  apiKey: {
    type: String,
    default: ""
  },
  apiSecret: {
    type: String,
    default: ""
  },
  webhookSecret: {
    type: String,
    default: ""
  },
  clientId: {
    type: String,
    default: ""
  },
  clientSecret: {
    type: String,
    default: ""
  },
  merchantId: {
    type: String,
    default: ""
  },
  accountNumber: {
    type: String,
    default: ""
  },
  bankName: {
    type: String,
    default: ""
  },
  routingNumber: {
    type: String,
    default: ""
  },
  branchAddress: {
    type: String,
    default: ""
  },
  accountHolderName: {
    type: String,
    default: ""
  },
  bankCode: {
    type: String,
    default: ""
  },
  branchCode: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },
  accountType: {
    type: String,
    default: ""
  },
  bankAddress: {
    type: String,
    default: ""
  },
  city: {
    type: String,
    default: ""
  },
  instructions: {
    type: String,
    default: ""
  },
  tested: {
    type: Boolean,
    default: false
  },
  testPassed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

paymentGatewaySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PaymentGateway = mongoose.model("PaymentGateway", paymentGatewaySchema);

export default PaymentGateway;