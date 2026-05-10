import React, { useContext, useEffect, useState } from 'react';
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { MyContext } from '../../App';
import { fetchDataFromApi } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';

export const OrderSuccess = () => {
    const context = useContext(MyContext);
    const [lastOrder, setLastOrder] = useState(null);
    const [bankDetails, setBankDetails] = useState(null);
    const { CURRENCIES, currency } = useCurrency();

    useEffect(() => {
        if (context?.userData?._id) {
            fetchDataFromApi(`/api/order/${context.userData._id}`).then((res) => {
                if (res?.orders?.length > 0) {
                    setLastOrder(res.orders[0]);
                }
            });
        }
    }, [context?.userData]);

    useEffect(() => {
        if (lastOrder?.payment_method === 'bank_deposit') {
            fetchDataFromApi('/api/payment-gateway').then((res) => {
                if (res?.data) {
                    const bankGateway = res.data.find(g => g.gatewayType === 'bank_deposit');
                    if (bankGateway) {
                        setBankDetails(bankGateway);
                    }
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

    return (
        <section className='w-full p-10 py-8 lg:py-20 flex items-center justify-center flex-col gap-2'>
            <img src="/checked.png" className="w-[80px] sm:w-[120px]" />
            <h3 className='mb-0 text-[20px] sm:text-[25px]'>Your order is placed</h3>
            <p className='mt-0 mb-0'>Thank you for your payment.</p>
            {lastOrder && (
                <p className='mt-0 text-[16px]'>Total Amount: <b>{displayAmountDirect(lastOrder.totalAmt, lastOrder?.currency)}</b></p>
            )}
            <p className='mt-0 text-center'>Order Invoice send to your email <b>{context?.userData?.email}</b></p>

            {lastOrder?.payment_method === 'bank_deposit' && bankDetails && (
                <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm max-w-md w-full">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🏦</span>
                        <h4 className="font-semibold text-amber-900 text-sm">Bank Transfer Details</h4>
                    </div>
                    <div className="space-y-2 text-xs">
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
                        {bankDetails.bankCode && (
                            <div className="flex justify-between">
                                <span className="text-amber-700">Bank Code:</span>
                                <span className="text-amber-900 font-medium">{bankDetails.bankCode}</span>
                            </div>
                        )}
                        {bankDetails.branchCode && (
                            <div className="flex justify-between">
                                <span className="text-amber-700">Branch Code:</span>
                                <span className="text-amber-900 font-medium">{bankDetails.branchCode}</span>
                            </div>
                        )}
                        {bankDetails.swift && (
                            <div className="flex justify-between">
                                <span className="text-amber-700">SWIFT Code:</span>
                                <span className="text-amber-900 font-medium">{bankDetails.swift}</span>
                            </div>
                        )}
                        {bankDetails.accountType && (
                            <div className="flex justify-between">
                                <span className="text-amber-700">Account Type:</span>
                                <span className="text-amber-900 font-medium">{bankDetails.accountType}</span>
                            </div>
                        )}
                        {bankDetails.location && (
                            <div className="flex justify-between">
                                <span className="text-amber-700">Location:</span>
                                <span className="text-amber-900 font-medium">{bankDetails.location}</span>
                            </div>
                        )}
                        {bankDetails.city && (
                            <div className="flex justify-between">
                                <span className="text-amber-700">City:</span>
                                <span className="text-amber-900 font-medium">{bankDetails.city}</span>
                            </div>
                        )}
                        {bankDetails.bankAddress && (
                            <div className="flex flex-col mt-2">
                                <span className="text-amber-700">Bank Address:</span>
                                <span className="text-amber-900 font-medium">{bankDetails.bankAddress}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] text-amber-600 mt-3">
                        Please complete your bank transfer within 48 hours to confirm your order.
                    </p>
                </div>
            )}

            <Link to="/">
                <Button className="btn-org btn-border">Back to home</Button>
            </Link>
        </section>
    )
}