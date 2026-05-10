const OrderConfirmationEmail = (username, order) => {
    const currency = order?.currency || "USD";
    const discountAmount = order?.discountAmount || 0;
    const discountCode = order?.discountCode || null;
    const shippingCost = order?.shippingCost || 0;
    const subTotal = order?.subTotal || 0;
    const totalAmt = order?.totalAmt || 0;
    const paymentMethod = order?.payment_method || '';
    const paymentStatusRaw = order?.payment_status || '';
    const isPaid = paymentStatusRaw === 'COMPLETE' || paymentStatusRaw === 'PAID';
    const isBankDeposit = paymentMethod === 'bank_deposit';
    
    // Format payment method display
    const getPaymentMethodDisplay = () => {
        if (!paymentMethod || paymentMethod === 'N/A' || paymentMethod === '') return 'Pending';
        const methodMap = {
            'bank_deposit': '🏦 Bank Transfer',
            'paypal': '🅿️ PayPal',
            'stripe': '💳 Credit/Debit Card',
            'airwallex': '💳 Card Payment',
            'cod': '💵 Cash on Delivery'
        };
        return methodMap[paymentMethod] || '💳 ' + paymentMethod;
    };
    
    const paymentMethodDisplay = getPaymentMethodDisplay();
    let paymentStatus = 'Pending';
    if (isPaid) {
        paymentStatus = 'Paid';
    } else if (isBankDeposit) {
        paymentStatus = 'Pending Payment';
    } else if (paymentStatusRaw === 'CASH ON DELIVERY') {
        paymentStatus = 'Cash on Delivery';
    } else if (paymentStatusRaw) {
        paymentStatus = paymentStatusRaw;
    }
    const paymentStatusColor = isPaid ? '#059669' : (isBankDeposit ? '#dc2626' : '#d97706');
    const orderId = order?._id?.toString().slice(-8)?.toUpperCase() || 'N/A';
    const orderStatus = order?.order_status || 'pending';
    
    const getSymbol = (curr) => {
        const symbols = { 
            'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 
            'AUD': 'A$', 'CAD': 'C$', 'AED': 'د.إ', 'NPR': '₹' 
        };
        return symbols[curr] || '$';
    };
    
    const symbol = getSymbol(currency);
    
    const formatPrice = (amount) => {
        const num = parseFloat(amount) || 0;
        return symbol + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { bg: '#FEF3C7', text: '#92400E', label: 'Pending' },
            'confirm': { bg: '#DBEAFE', text: '#1E40AF', label: 'Confirmed' },
            'processing': { bg: '#E0E7FF', text: '#3730A3', label: 'Processing' },
            'shipped': { bg: '#C7D2FE', text: '#4338CA', label: 'Shipped' },
            'delivered': { bg: '#D1FAE5', text: '#065F46', label: 'Delivered' },
            'cancelled': { bg: '#FEE2E2', text: '#991B1B', label: 'Cancelled' },
        };
        return statusMap[status?.toLowerCase()] || statusMap['pending'];
    };

    const status = getStatusBadge(orderStatus);

    // Bank Deposit Details - Only shown for bank_deposit payment method
    const bankDepositSection = isBankDeposit ? `
    <!-- Bank Deposit Payment Details -->
    <tr>
        <td style="padding: 0 40px 20px;">
            <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border: 1px solid #f59e0b;">
                        <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td style="padding: 20px;">
                                    <p style="color: #92400e; font-size: 16px; font-weight: 700; margin: 0 0 15px 0; text-align: center;">
                                        ⚠️ Payment Required - Bank Transfer
                                    </p>
                                    <p style="color: #b45309; font-size: 13px; margin: 0 0 20px 0; text-align: center; line-height: 1.5;">
                                        Please transfer <strong style="font-size: 18px; color: #dc2626;">${formatPrice(totalAmt)}</strong> to the account below and send us the payment receipt for confirmation.
                                    </p>
                                    
                                    <!-- Bank Details Card -->
                                    <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; margin-bottom: 15px;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <p style="color: #111827; font-size: 14px; font-weight: 700; margin: 0 0 15px 0; text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
                                                    🏦 Bank Transfer Details
                                                </p>
                                                <table cellpadding="0" cellspacing="0" width="100%">
                                                    <tr>
                                                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                                            <span style="color: #6b7280; font-size: 12px;">Bank Name</span>
                                                        </td>
                                                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;" align="right">
                                                            <span style="color: #111827; font-size: 13px; font-weight: 600;">Standard Chartered Bank (Hong Kong) Ltd</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                                            <span style="color: #6b7280; font-size: 12px;">Account Name</span>
                                                        </td>
                                                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;" align="right">
                                                            <span style="color: #111827; font-size: 13px; font-weight: 600;">Sandbox Business</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                                            <span style="color: #6b7280; font-size: 12px;">Account Number</span>
                                                        </td>
                                                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;" align="right">
                                                            <span style="color: #111827; font-size: 13px; font-weight: 600; font-family: monospace;">47407003286</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                                            <span style="color: #6b7280; font-size: 12px;">SWIFT Code</span>
                                                        </td>
                                                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;" align="right">
                                                            <span style="color: #111827; font-size: 13px; font-weight: 600; font-family: monospace;">SCBLHKHH</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                                            <span style="color: #6b7280; font-size: 12px;">Bank Code</span>
                                                        </td>
                                                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;" align="right">
                                                            <span style="color: #111827; font-size: 13px; font-weight: 600;">003</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                                            <span style="color: #6b7280; font-size: 12px;">Branch Code</span>
                                                        </td>
                                                        <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;" align="right">
                                                            <span style="color: #111827; font-size: 13px; font-weight: 600;">474</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 8px 0;">
                                                            <span style="color: #6b7280; font-size: 12px;">Location</span>
                                                        </td>
                                                        <td style="padding: 8px 0;" align="right">
                                                            <span style="color: #111827; font-size: 13px; font-weight: 600;">Hong Kong SAR</span>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="color: #92400e; font-size: 13px; font-weight: 600; margin: 0 0 10px 0; text-align: center;">
                                        📧 How to Send Payment Receipt
                                    </p>
                                    <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 10px; overflow: hidden;">
                                        <tr>
                                            <td style="padding: 15px;">
                                                <p style="color: #374151; font-size: 13px; margin: 0 0 8px 0;">
                                                    <strong>Step 1:</strong> After making the transfer, take a screenshot or photo of your payment receipt
                                                </p>
                                                <p style="color: #374151; font-size: 13px; margin: 0 0 8px 0;">
                                                    <strong>Step 2:</strong> Email the receipt to: <strong style="color: #f97316;">mdhamala2000@gmail.com</strong>
                                                </p>
                                                <p style="color: #374151; font-size: 13px; margin: 0 0 8px 0;">
                                                    <strong>Step 3:</strong> Include your Order ID: <strong style="color: #f97316;">#${orderId}</strong> in the email subject
                                                </p>
                                                <p style="color: #059669; font-size: 13px; margin: 0; font-weight: 600;">
                                                    ✓ Once we confirm your payment, your order will be dispatched within 24-48 hours
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <p style="color: #b45309; font-size: 12px; margin: 15px 0 0 0; text-align: center; font-style: italic;">
                                        Please note: Orders will only be processed after payment confirmation is received.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    ` : '';

    // Paid/Success message for other payment methods
    const successMessage = isPaid ? `
    <!-- Success Message -->
    <tr>
        <td style="padding: 0 40px 20px;">
            <table cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px;">
                <tr>
                    <td style="padding: 20px;" align="center">
                        <p style="color: #065f46; font-size: 16px; font-weight: 700; margin: 0 0 5px 0;">✅ Payment Confirmed!</p>
                        <p style="color: #047857; font-size: 13px; margin: 0;">Your order is being processed and will be dispatched soon.</p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    ` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - #${orderId}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6;">
    <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6;">
        <tr>
            <td align="center" style="padding: 20px 10px;">
                <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px 40px; text-align: center;">
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">${isBankDeposit ? 'Order Received!' : 'Order Confirmed!'}</h1>
                                        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 5px 0 0 0;">${isBankDeposit ? 'Please complete your payment' : 'Thank you for your purchase'}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Order Status Badge -->
                    <tr>
                        <td style="padding: 25px 40px 10px;">
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <span style="display: inline-block; background-color: ${status.bg}; color: ${status.text}; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                                            ${status.label}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                        <td style="padding: 20px 40px 10px;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0;">Dear <strong style="color: #111827;">${username}</strong>,</p>
                            <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0 0;">
                                ${isBankDeposit 
                                    ? 'Thank you for your order! To proceed with your purchase, please complete the bank transfer using the details below.' 
                                    : 'Your order has been placed successfully! We\'re processing it right now.'}
                            </p>
                        </td>
                    </tr>

                    <!-- Success/Payment Message -->
                    ${successMessage}
                    ${bankDepositSection}

                    <!-- Order Details Card -->
                    <tr>
                        <td style="padding: 15px 40px;">
                            <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border-radius: 12px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <table cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <p style="color: #6b7280; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</p>
                                                    <p style="color: #3b82f6; font-size: 16px; font-weight: 700; margin: 3px 0 0 0;">#${orderId}</p>
                                                </td>
                                                <td style="padding-bottom: 15px;" align="right">
                                                    <p style="color: #6b7280; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</p>
                                                    <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 3px 0 0 0;">${formatDate(order?.createdAt)}</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 15px; border-top: 1px solid #e5e7eb;">
                                                    <p style="color: #6b7280; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Payment Method</p>
                                                    <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 3px 0 0 0;">
                                                        ${paymentMethodDisplay}
                                                    </p>
                                                </td>
                                                <td style="padding-top: 15px; border-top: 1px solid #e5e7eb;" align="right">
                                                    <p style="color: #6b7280; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Total Amount</p>
                                                    <p style="color: #111827; font-size: 20px; font-weight: 700; margin: 3px 0 0 0;">${formatPrice(totalAmt)}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Products Section -->
                    <tr>
                        <td style="padding: 10px 40px 20px;">
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 12px;">
                                        <p style="color: #111827; font-size: 16px; font-weight: 600; margin: 0;">Order Items</p>
                                    </td>
                                </tr>
                                ${order?.products?.map((product, index) => `
                                <tr>
                                    <td style="padding: 12px; background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'}; border-radius: 8px;">
                                        <table cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td valign="top" style="padding-right: 15px;">
                                                    <img src="${product?.image || 'https://via.placeholder.com/80x80/e5e7eb/9ca3af?text=Product'}" alt="${product?.productTitle}" style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover;">
                                                </td>
                                                <td valign="top" style="padding-right: 15px;">
                                                    <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 5px 0; line-height: 1.4;">${product?.productTitle || 'Product'}</p>
                                                    <p style="color: #6b7280; font-size: 13px; margin: 0;">Qty: <strong style="color: #111827;">${product?.quantity || 1}</strong></p>
                                                    <p style="color: #6b7280; font-size: 12px; margin: 3px 0 0 0;">${formatPrice(product?.perUnit)} each</p>
                                                </td>
                                                <td valign="top" align="right">
                                                    <p style="color: #111827; font-size: 16px; font-weight: 700; margin: 0; text-align: right;">${formatPrice(product?.subTotal || product?.price)}</p>
                                                    <p style="color: #9ca3af; font-size: 12px; margin: 3px 0 0 0; text-align: right;">${formatPrice(product?.perUnit)} per unit</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                `).join('') || '<tr><td style="padding: 20px; text-align: center; color: #6b7280;">No products found</td></tr>'}
                            </table>
                        </td>
                    </tr>

                    <!-- Shipping Address -->
                    <tr>
                        <td style="padding: 0 40px 20px;">
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td width="50%" valign="top" style="padding-right: 10px;">
                                        <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Shipping Address</p>
                                        <div style="background-color: #f9fafb; border-radius: 10px; padding: 15px;">
                                            <p style="color: #374151; font-size: 13px; margin: 0 0 3px 0; font-weight: 500;">${order?.delivery_address?.addressType || 'Home'}</p>
                                            <p style="color: #6b7280; font-size: 13px; margin: 0;">${order?.delivery_address?.address_line1 || ''}</p>
                                            <p style="color: #6b7280; font-size: 13px; margin: 0;">${order?.delivery_address?.city || ''}, ${order?.delivery_address?.state || ''} ${order?.delivery_address?.pincode || ''}</p>
                                            <p style="color: #6b7280; font-size: 13px; margin: 0;">${order?.delivery_address?.country || ''}</p>
                                            <p style="color: #6b7280; font-size: 13px; margin: 8px 0 0 0;">📱 ${order?.delivery_address?.mobile || ''}</p>
                                        </div>
                                    </td>
                                    <td width="50%" valign="top" style="padding-left: 10px;">
                                        <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Order Summary</p>
                                        <div style="background-color: #f9fafb; border-radius: 10px; padding: 15px;">
                                            <table cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td style="color: #6b7280; font-size: 13px; padding: 5px 0;">Subtotal</td>
                                                    <td align="right" style="color: #374151; font-size: 13px; font-weight: 500; padding: 5px 0;">${formatPrice(subTotal)}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color: #6b7280; font-size: 13px; padding: 5px 0;">Shipping</td>
                                                    <td align="right" style="color: ${shippingCost > 0 ? '#374151' : '#059669'}; font-size: 13px; font-weight: 500; padding: 5px 0;">
                                                        ${shippingCost > 0 ? formatPrice(shippingCost) : '<span style="color: #059669;">FREE</span>'}
                                                    </td>
                                                </tr>
                                                ${discountCode ? `
                                                <tr>
                                                    <td style="color: #059669; font-size: 13px; padding: 5px 0;">Discount (${discountCode})</td>
                                                    <td align="right" style="color: #059669; font-size: 13px; font-weight: 500; padding: 5px 0;">-${formatPrice(discountAmount)}</td>
                                                </tr>
                                                ` : ''}
                                                <tr>
                                                    <td style="border-top: 1px solid #e5e7eb; padding-top: 10px;">
                                                        <span style="color: #111827; font-size: 14px; font-weight: 700;">Total</span>
                                                        <span style="color: #6b7280; font-size: 11px; display: block;">(${currency})</span>
                                                    </td>
                                                    <td align="right" style="border-top: 1px solid #e5e7eb; padding-top: 10px;">
                                                        <span style="color: #3b82f6; font-size: 18px; font-weight: 700;">${formatPrice(totalAmt)}</span>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Help Section -->
                    <tr>
                        <td style="padding: 0 40px 20px;">
                            <table cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); border-radius: 12px;">
                                <tr>
                                    <td style="padding: 20px;" align="center">
                                        <p style="color: #0369a1; font-size: 14px; font-weight: 600; margin: 0 0 5px 0;">Need Assistance?</p>
                                        <p style="color: #075985; font-size: 13px; margin: 0;">Email us at mdhamala2000@gmail.com | WhatsApp: +977 9841321806</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1f2937; padding: 25px 40px;" align="center">
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <p style="color: #9ca3af; font-size: 13px; margin: 0;">Thank you for shopping with us!</p>
                                        <p style="color: #6b7280; font-size: 11px; margin: 8px 0 0 0;">
                                            &copy; ${new Date().getFullYear()} Yak Pashamina. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

export default OrderConfirmationEmail;