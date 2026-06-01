import React, { useContext, useEffect, useState } from 'react';
import Button from "@mui/material/Button";
import { Link, useSearchParams } from "react-router-dom";
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaShippingFast, FaBoxOpen, FaEnvelope, FaHome, FaShoppingBag, FaCreditCard, FaReceipt } from "react-icons/fa";

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const OrderSuccess = () => {
    const context = useContext(MyContext);
    const [lastOrder, setLastOrder] = useState(null);
    const [bankDetails, setBankDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState('success');
    const [verifying, setVerifying] = useState(false);
    const { CURRENCIES, currency } = useCurrency();
    const [searchParams] = useSearchParams();
    
    const paymentId = searchParams.get('payment_id');
    const orderIdFromUrl = searchParams.get('order_id');
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        fetchOrderDetails();
    }, []);

    const fetchOrderDetails = async () => {
        try {
            if (orderIdFromUrl) {
                const res = await fetchDataFromApi(`/api/order/getOrderById?id=${orderIdFromUrl}`);
                if (res?._id) {
                    setLastOrder(res);
                }
            } else if (context?.userData?._id) {
                const res = await fetchDataFromApi(`/api/order/${context.userData._id}`);
                if (res?.orders?.length > 0) {
                    setLastOrder(res.orders[0]);
                }
            }
        } catch {}
        setLoading(false);
    };

    useEffect(() => {
        if (lastOrder?.payment_method === 'bank_deposit') {
            fetchDataFromApi('/api/payment-gateway').then((res) => {
                if (res?.data) {
                    const bankGateway = res.data.find(g => g.gatewayType === 'bank_deposit');
                    if (bankGateway) setBankDetails(bankGateway);
                }
            });
        }
    }, [lastOrder]);

    const getSymbolForOrder = (orderCurrency) => {
        return CURRENCIES[orderCurrency || currency]?.symbol || '$';
    };

    const displayAmountDirect = (amount, orderCurrency) => {
        if (!amount || isNaN(amount)) return `${getSymbolForOrder(orderCurrency)}0.00`;
        return `${getSymbolForOrder(orderCurrency)}${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (loading || verifying) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-cyan-600 mx-auto mb-4" />
                    <p className="text-gray-600">
                        {verifying ? 'Verifying your payment...' : 'Loading order details...'}
                    </p>
                </div>
            </div>
        );
    }

    if (paymentStatus === 'pending') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-8 text-center">
                            <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg">
                                <FaSpinner className="text-5xl text-amber-500" />
                            </div>
                            <h3 className='mt-4 text-3xl font-bold text-white'>Payment Processing</h3>
                            <p className='mt-2 text-amber-100 text-lg'>Your payment is being confirmed</p>
                        </div>
                        <div className="p-8 text-center">
                            <p className="text-gray-600 mb-4">Please wait while we confirm your payment. This page will update automatically.</p>
                            <FaSpinner className="animate-spin text-2xl text-amber-500 mx-auto" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (paymentStatus === 'failed') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-center">
                            <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg">
                                <FaTimesCircle className="text-5xl text-red-500" />
                            </div>
                            <h3 className='mt-4 text-3xl font-bold text-white'>Payment Failed</h3>
                            <p className='mt-2 text-red-100 text-lg'>Your payment could not be processed</p>
                        </div>
                        <div className="p-8">
                            <div className="bg-red-50 rounded-xl p-4 mb-6">
                                <p className="text-sm text-red-700 text-center">
                                    The payment did not go through. No charges have been made.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/checkout" className="flex-1">
                                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2">
                                        Try Again
                                    </Button>
                                </Link>
                                <Link to="/" className="flex-1">
                                    <Button className="w-full btn-org btn-border">Back to Shop</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-8 text-center">
                        <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg">
                            <FaCheckCircle className="text-5xl text-emerald-500" />
                        </div>
                        <h3 className='mt-4 text-3xl font-bold text-white'>Thank You!</h3>
                        <p className='mt-2 text-emerald-100 text-lg'>Your order has been placed successfully</p>
                    </div>
                    
                    <div className="p-8">
                        {(lastOrder || orderIdFromUrl) && (
                            <div className="bg-emerald-50 rounded-xl p-4 mb-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-gray-800">
                                        {lastOrder ? displayAmountDirect(lastOrder.totalAmt, lastOrder?.currency) : ''}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Order ID: #{lastOrder?._id?.slice(-8) || orderIdFromUrl?.slice(-8)}
                                    </p>
                                </div>
                                {(paymentId || sessionId) && (
                                    <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center justify-center gap-2 text-sm text-emerald-700">
                                        <FaCreditCard />
                                        <span>Payment ID: {(paymentId || sessionId)?.slice(-12)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-6 p-4 bg-emerald-50 rounded-xl">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                <FaEnvelope className="text-emerald-600 text-xl" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Confirmation Email Sent</p>
                                <p className="text-sm text-gray-500">Check your email for order details</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FaBoxOpen className="text-blue-600 text-lg" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Order Processing</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <FaShippingFast className="text-purple-600 text-lg" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Shipping Soon</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <FaHome className="text-orange-600 text-lg" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Home Delivery</p>
                                </div>
                            </div>
                        </div>

                        {lastOrder?.payment_method === 'bank_deposit' && bankDetails && (
                            <div className="mt-4 p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xl">🏦</span>
                                    <h4 className="font-semibold text-amber-900 text-base">Bank Transfer Required</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                    {bankDetails.bankName && (
                                        <div className="flex justify-between">
                                            <span className="text-amber-700">Bank Name:</span>
                                            <span className="text-amber-900 font-medium">{bankDetails.bankName}</span>
                                        </div>
                                    )}
                                    {bankDetails.accountName && (
                                        <div className="flex justify-between">
                                            <span className="text-amber-700">Account Name:</span>
                                            <span className="text-amber-900 font-medium">{bankDetails.accountName}</span>
                                        </div>
                                    )}
                                    {bankDetails.accountNumber && (
                                        <div className="flex justify-between">
                                            <span className="text-amber-700">Account Number:</span>
                                            <span className="text-amber-900 font-medium">{bankDetails.accountNumber}</span>
                                        </div>
                                    )}
                                    {bankDetails.swift && (
                                        <div className="flex justify-between">
                                            <span className="text-amber-700">SWIFT Code:</span>
                                            <span className="text-amber-900 font-medium">{bankDetails.swift}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-amber-600 mt-4">
                                    Please complete your bank transfer within 48 hours to confirm your order.
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <Link to="/" className="flex-1">
                                <Button className="w-full btn-org btn-border">Continue Shopping</Button>
                            </Link>
                            <Link to="/my-orders" className="flex-1">
                                <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center gap-2">
                                    <FaShoppingBag /> View My Orders
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
