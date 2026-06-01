import React from 'react';
import Button from "@mui/material/Button";
import { Link, useSearchParams } from "react-router-dom";
import { FaTimesCircle, FaArrowLeft, FaCreditCard } from "react-icons/fa";

export const OrderFailed = () => {
    const [searchParams] = useSearchParams();
    const error = searchParams.get('error') || 'Payment was not completed';
    const status = searchParams.get('status') || 'failed';

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-center">
                        <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-lg">
                            <FaTimesCircle className="text-5xl text-red-500" />
                        </div>
                        <h3 className='mt-4 text-3xl font-bold text-white'>Payment Failed</h3>
                        <p className='mt-2 text-red-100 text-lg'>Something went wrong</p>
                    </div>
                    
                    <div className="p-8">
                        <div className="bg-red-50 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <FaCreditCard className="text-red-600 text-lg" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Payment Issue</p>
                                    <p className="text-sm text-gray-600">{error}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-gray-600 text-center">
                                Don't worry - your order has not been charged. You can try again or choose a different payment method.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/checkout" className="flex-1">
                                <Button className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2">
                                    <FaCreditCard /> Try Again
                                </Button>
                            </Link>
                            <Link to="/" className="flex-1">
                                <Button className="w-full btn-org btn-border flex items-center justify-center gap-2">
                                    <FaArrowLeft /> Back to Shop
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
