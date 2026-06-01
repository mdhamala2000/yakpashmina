import React, { useState, useEffect } from "react";
import { fetchDataFromApi, editData } from "../../utils/api";
import { 
  FaCreditCard, FaCheckCircle, FaTimesCircle,
  FaPlay, FaBan, FaUndo, FaInfoCircle
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { Button, Switch, CircularProgress } from "@mui/material";

const gatewayConfig = {
  stripe: {
    name: "Stripe",
    icon: "💳",
    color: "from-purple-500 to-purple-600",
    bg: "bg-purple-50",
    text: "text-purple-600",
    description: "Accept credit cards, debit cards worldwide.",
    features: ["Credit & Debit Cards", "Apple Pay", "Google Pay"],
    docs: "https://dashboard.stripe.com",
    envKey: "STRIPE_SECRET_KEY"
  },
  bank_deposit: {
    name: "Bank Transfer",
    icon: "🏦",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    text: "text-blue-600",
    description: "Direct bank transfer payment.",
    features: ["Direct Transfer", "Wire Support"],
    docs: "#",
    envKey: "BANK_NAME"
  },
  paypal: {
    name: "PayPal",
    icon: "🅿️",
    color: "from-blue-600 to-blue-700",
    bg: "bg-blue-50",
    text: "text-blue-700",
    description: "PayPal checkout.",
    features: ["PayPal Balance", "Express Checkout"],
    docs: "https://developer.paypal.com",
    envKey: "PAYPAL_MODE"
  },
  airwallex: {
    name: "Airwallex",
    icon: "🌐",
    color: "from-teal-500 to-teal-600",
    bg: "bg-teal-50",
    text: "text-teal-600",
    description: "Global payment gateway accepting cards and local methods.",
    features: ["Credit & Debit Cards", "Local Payment Methods", "Hosted Payment Page"],
    docs: "https://www.airwallex.com/docs",
    envKey: "AIRWALLEX_API_KEY"
  }
};

const PaymentSettings = () => {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stripe");
  const [testing, setTesting] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({});

  const fetchGateways = async () => {
    try {
      setLoading(true);
      const res = await fetchDataFromApi("/api/payment-gateway");
      if (res?.data) {
        setGateways(res.data);
      }
    } catch (error) {
      console.error("Error fetching gateways:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const currentGateway = gateways.find(g => g.gatewayType === activeTab);
  const config = gatewayConfig[activeTab];

  const toggleGateway = async (gateway) => {
    if (testing) return;
    setTesting(gateway.gatewayType);
    try {
      const res = await editData(`/api/payment-gateway/${gateway._id}/toggle`, {});
      if (res?.success) {
        toast.success(`${gateway.displayName} ${gateway.isActive ? 'disabled' : 'enabled'}!`);
        fetchGateways();
      } else {
        toast.error(res?.message || "Failed to update");
      }
    } catch (error) {
      toast.error("Error updating gateway");
    } finally {
      setTesting(null);
    }
  };

  const testConnection = async (gwType) => {
    setTesting(gwType);
    setConnectionStatus(prev => ({ ...prev, [gwType]: 'testing' }));
    
    try {
      const res = await fetchDataFromApi("/api/stripe/config");
      
      const passed = res?.configured && (gwType === 'stripe' || res?.connection?.success);
      setConnectionStatus(prev => ({ ...prev, [gwType]: passed ? 'connected' : 'failed' }));
      
      if (passed) {
        toast.success(`${gatewayConfig[gwType]?.name} connected!`);
      } else {
        toast.error("Connection test failed");
      }
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [gwType]: 'failed' }));
      toast.error("Connection test failed");
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="w-full">
      <Toaster />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <FaCreditCard className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Payment Settings</h2>
                <p className="text-sm text-gray-500">Configured via server .env file</p>
              </div>
            </div>
            <Button
              variant="contained"
              startIcon={<FaUndo />}
              onClick={fetchGateways}
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="border-b border-gray-100 overflow-x-auto">
          <div className="flex min-w-max">
            {Object.entries(gatewayConfig).map(([key, conf]) => {
              const gw = gateways.find(g => g.gatewayType === key);
              const isActive = activeTab === key;
              const status = connectionStatus[key];
              
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                    isActive 
                      ? "border-green-500 text-green-600 bg-green-50/50" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{conf?.icon}</span>
                  <div className="text-left">
                    <p className="font-medium text-sm">{conf?.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {gw?.isActive ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span className="text-xs text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                          <span className="text-xs text-gray-400">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <CircularProgress />
            </div>
          ) : currentGateway ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config?.color} flex items-center justify-center shadow-md`}>
                    <span className="text-2xl">{config?.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{config?.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{config?.description}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Enable Payment Method</span>
                  <Switch
                    checked={currentGateway?.isActive || false}
                    onChange={() => toggleGateway(currentGateway)}
                    disabled={testing === currentGateway?.gatewayType}
                    color="success"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaInfoCircle />
                  <span>Toggle to enable/disable this payment method</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Connection Status</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {activeTab === 'stripe' 
                        ? 'Configured via STRIPE_SECRET_KEY in .env'
                        : `Check ${config?.envKey} in server .env`
                      }
                    </p>
                  </div>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={testing === activeTab ? <CircularProgress size={16} /> : <FaCheckCircle />}
                    onClick={() => testConnection(activeTab)}
                    disabled={testing === activeTab || !currentGateway?.isActive}
                    sx={{ 
                      borderRadius: '8px', 
                      textTransform: 'none',
                      backgroundColor: '#10b981',
                      '&:hover': { backgroundColor: '#059669' }
                    }}
                  >
                    Test
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Features:</p>
                <div className="flex flex-wrap gap-2">
                  {config?.features?.map((feature, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {config?.docs !== '#' && (
                <a 
                  href={config?.docs} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View Dashboard →
                </a>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;