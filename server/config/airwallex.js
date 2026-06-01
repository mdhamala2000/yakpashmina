import axios from 'axios';

class AirwallexService {
  constructor() {
    this.apiKey = process.env.AIRWALLEX_API_KEY;
    this.clientId = process.env.AIRWALLEX_CLIENT_ID;
    this.isLive = process.env.AIRWALLEX_ENVIRONMENT === 'live';
    this.apiBase = this.isLive ? 'https://api.airwallex.com' : 'https://api-demo.airwallex.com';
    this.token = null;
    this.tokenExpiry = null;
    this.loginAs = process.env.AIRWALLEX_ACCOUNT_ID || null;
  }

  async getAuthToken() {
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }
    try {
      const headers = {
        'x-api-key': this.apiKey,
        'x-client-id': this.clientId,
        'Content-Type': 'application/json'
      };
      if (this.loginAs) {
        headers['x-login-as'] = this.loginAs;
      }
      const response = await axios.post(`${this.apiBase}/api/v1/authentication/login`, {}, { headers });
      this.token = response.data.token;
      this.tokenExpiry = Date.now() + 55 * 60 * 1000;
      return this.token;
    } catch (error) {
      const errData = error.response?.data || {};
      console.error('Airwallex auth error:', JSON.stringify(errData));
      const errMsg = errData.message || errData.error || error.message;
      throw new Error(`Airwallex authentication failed: ${errMsg}`);
    }
  }

  async createPaymentIntent({ amount, currency, merchantOrderId, returnUrl, cancelUrl, metadata = {} }) {
    const token = await this.getAuthToken();
    try {
      const payload = {
        request_id: `${merchantOrderId}-${Date.now()}`,
        amount: Math.round(amount * 100) / 100,
        currency: currency.toLowerCase(),
        merchant_order_id: merchantOrderId,
        return_url: returnUrl,
        cancel_url: cancelUrl,
        metadata
      };
      const response = await axios.post(`${this.apiBase}/api/v1/pa/payment_intents/create`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const intent = response.data;
      return {
        id: intent.id,
        clientSecret: intent.client_secret,
        status: intent.status
      };
    } catch (error) {
      const errData = error.response?.data || {};
      console.error('Airwallex create intent error:', JSON.stringify(errData));
      const errMsg = errData.message || errData.error || error.message;
      throw new Error(`Airwallex payment error: ${errMsg}`);
    }
  }

  async getPaymentIntent(intentId) {
    const token = await this.getAuthToken();
    try {
      const response = await axios.get(`${this.apiBase}/api/v1/pa/payment_intents/${intentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      const errData = error.response?.data || {};
      console.error('Airwallex get intent error:', JSON.stringify(errData));
      throw new Error(`Failed to get payment intent: ${errData.message || errData.error || error.message}`);
    }
  }
}

export default new AirwallexService();
