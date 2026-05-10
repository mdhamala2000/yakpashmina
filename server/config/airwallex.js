import axios from 'axios';

const AIRWALLEX_API_URL = process.env.AIRWALLEX_API_URL || 'https://api-demo.airwallex.com';

console.log('=== AIRWALLEX CONFIG LOADED ===');
console.log('API_URL:', AIRWALLEX_API_URL);
console.log('API_KEY exists:', !!process.env.AIRWALLEX_API_KEY);
console.log('API_KEY value:', process.env.AIRWALLEX_API_KEY);
console.log('CLIENT_ID:', process.env.AIRWALLEX_CLIENT_ID);

class AirwallexService {
  constructor() {
    this.apiKey = process.env.AIRWALLEX_API_KEY;
    this.clientId = process.env.AIRWALLEX_CLIENT_ID;
    this.apiUrl = AIRWALLEX_API_URL;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    try {
      console.log('=== AIRWALLEX LOGIN ATTEMPT ===');
      console.log('x-api-key:', this.apiKey);
      console.log('x-client-id:', this.clientId);
      
      if (!this.apiKey || !this.clientId) {
        console.error('MISSING API KEY OR CLIENT ID');
        throw new Error('Missing AIRWALLEX_API_KEY or AIRWALLEX_CLIENT_ID');
      }
      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'x-client-id': this.clientId
      };
      
      // Add account ID for sandbox multi-account access
      if (process.env.AIRWALLEX_ACCOUNT_ID) {
        headers['x-login-as'] = process.env.AIRWALLEX_ACCOUNT_ID;
        console.log('Using Account ID:', process.env.AIRWALLEX_ACCOUNT_ID);
      }
      
      console.log('Login URL:', `${this.apiUrl}/api/v1/authentication/login`);
      console.log('Attempting login with Client ID:', this.clientId);
      
      let response;
      try {
        response = await axios.post(
          `${this.apiUrl}/api/v1/authentication/login`,
          {},
          { headers }
        );
        console.log('Login SUCCESS:', response.data);
      } catch (loginError) {
        console.error('=== AIRWALLEX LOGIN FAILED ===');
        console.error('Status:', loginError.response?.status);
        console.error('Response:', loginError.response?.data);
        console.error('Full error:', loginError.message);
        throw loginError;
      }
      
      const accessToken = response.data.token;
      console.log('Token obtained successfully');
      this.accessToken = response.data.token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
      console.log('Token obtained successfully');
      return this.accessToken;
    } catch (error) {
      console.error('=== AIRWALLEX LOGIN FAILED ===');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
      throw error;
    }
  }

  async createPaymentIntent(amount, currency = 'USD', customerId = null) {
    try {
      const token = await this.getAccessToken();
      const data = {
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        request_id: `req_${Date.now()}`,
        merchant_order_id: `order_${Date.now()}`,
        return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/order/success`,
        metadata: {
          type: 'order_payment'
        }
      };

      if (customerId) {
        data.customer_id = customerId;
      }

      const response = await axios.post(
        `${this.apiUrl}/api/v1/pa/payment_intents/create`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Airwallex-Client-Id': this.clientId
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Airwallex create payment intent error:', error.response?.data || error.message);
      throw error;
    }
  }

  async confirmPaymentIntent(paymentIntentId, paymentMethod) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.post(
        `${this.apiUrl}/api/v1/pa/payment_intents/${paymentIntentId}/confirm`,
        {
          request_id: `req_${Date.now()}`,
          payment_method: paymentMethod
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Airwallex-Client-Id': this.clientId
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Airwallex confirm payment intent error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getPaymentIntent(paymentIntentId) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `${this.apiUrl}/api/v1/pa/payment_intents/${paymentIntentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Airwallex-Client-Id': this.clientId
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Airwallex get payment intent error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new AirwallexService();