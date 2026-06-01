const OrderConfirmationEmail = (username, order, isOwner = false) => {
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
    
    const getPaymentMethodDisplay = () => {
        if (!paymentMethod || paymentMethod === 'N/A' || paymentMethod === '') return 'Pending';
        const methodMap = {
            'bank_deposit': 'Bank Transfer',
            'paypal': 'PayPal',
            'stripe': 'Credit/Debit Card',
            'cod': 'Cash on Delivery',
            'airwallex': 'Airwallex'
        };
        return methodMap[paymentMethod] || paymentMethod;
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
    const orderIdFull = order?._id?.toString() || 'N/A';
    const orderStatus = order?.order_status || 'pending';
    
    const getSymbol = (curr) => {
        const symbols = { 
            'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 
            'AUD': 'A$', 'CAD': 'C$', 'AED': 'د.إ', 'NPR': '₨' 
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

    const formatDateTime = (dateStr) => {
        if (!dateStr) return new Date().toLocaleString('en-US');
        return new Date(dateStr).toLocaleString('en-US', { 
            day: 'numeric', month: 'short', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });
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
    
    const customerName = order?.delivery_address?.firstName || username || 'Customer';
    const customerEmail = order?.delivery_address?.email || '';
    const customerPhone = order?.delivery_address?.mobile || '';

    const productsHTML = order?.products?.map((product, index) => {
        const variantInfo = [];
        if (product?.color) variantInfo.push(`<span style="display: inline-block; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 4px;">Color: ${product.color}</span>`);
        if (product?.size) variantInfo.push(`<span style="display: inline-block; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 4px;">Size: ${product.size}</span>`);
        if (product?.weight) variantInfo.push(`<span style="display: inline-block; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 4px;">Weight: ${product.weight}</span>`);
        if (product?.ram) variantInfo.push(`<span style="display: inline-block; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 4px;">RAM: ${product.ram}</span>`);
        if (product?.materials) variantInfo.push(`<span style="display: inline-block; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 4px;">Material: ${product.materials}</span>`);
        
        const variantHtml = variantInfo.length > 0 ? `<div style="margin-top: 6px;">${variantInfo.join('')}</div>` : '';
        const skuDisplay = product?.variantSku || product?.productId?.slice(-6) || 'N/A';
        
        return `
        <tr>
            <td style="padding: 12px; background-color: ${index % 2 === 0 ? '#ffffff' : '#fafafa'}; border-bottom: 1px solid #eee;">
                <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td valign="top" style="padding-right: 12px;">
                            <img src="${product?.image || 'https://placehold.co/80x80/e5e7eb/9ca3af?text=Product'}" alt="${product?.productTitle || 'Product'}" style="width: 70px; height: 70px; border-radius: 8px; object-fit: cover; display: block;">
                        </td>
                        <td valign="top" style="padding-right: 12px;">
                            <p style="color: #1f2937; font-size: 14px; font-weight: 600; margin: 0 0 4px 0; line-height: 1.3;">${product?.productTitle || 'Product'}</p>
                            <p style="color: #6b7280; font-size: 12px; margin: 0;">SKU: ${skuDisplay}</p>
                            <p style="color: #6b7280; font-size: 12px; margin: 4px 0 0 0;">Qty: <strong style="color: #1f2937;">${product?.quantity || 1}</strong></p>
                            ${variantHtml}
                        </td>
                        <td valign="top" align="right">
                            <p style="color: #1f2937; font-size: 15px; font-weight: 700; margin: 0;">${formatPrice(product?.subTotal || product?.price)}</p>
                            <p style="color: #9ca3af; font-size: 11px; margin: 4px 0 0 0;">${formatPrice(product?.perUnit)} each</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    `}).join('') || '<tr><td style="padding: 20px; text-align: center; color: #6b7280;">No products found</td></tr>';

    const successMessage = isPaid ? `
    <tr>
        <td style="padding: 0 40px 20px;">
            <table cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px;">
                <tr><td style="padding: 20px;" align="center">
                    <p style="color: #065f46; font-size: 16px; font-weight: 700; margin: 0 0 5px 0;">✓ Payment Confirmed!</p>
                    <p style="color: #047857; font-size: 13px; margin: 0;">Your order is being processed and will be dispatched soon.</p>
                </td></tr>
            </table>
        </td>
    </tr>
    ` : '';

    const bankDepositSection = isBankDeposit ? `
    <tr>
        <td style="padding: 0 40px 20px;">
            <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border: 1px solid #f59e0b;">
                        <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                                <td style="padding: 20px;">
                                    <p style="color: #92400e; font-size: 16px; font-weight: 700; margin: 0 0 15px 0; text-align: center;">⚠️ Payment Required - Bank Transfer</p>
                                    <p style="color: #b45309; font-size: 14px; margin: 0 0 20px 0; text-align: center;">Please transfer <strong style="font-size: 20px; color: #dc2626;">${formatPrice(totalAmt)}</strong> to complete your order.</p>
                                    
                                    <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 10px; margin-bottom: 15px;">
                                        <tr><td style="padding: 20px;">
                                            <p style="color: #111827; font-size: 15px; font-weight: 700; margin: 0 0 15px 0; text-align: center; border-bottom: 2px solid #f97316; padding-bottom: 10px;">🏦 Bank Transfer Details</p>
                                            <table cellpadding="0" cellspacing="0" width="100%">
<tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 13px;">Bank Name</span></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;" align="right"><span style="color: #111827; font-size: 13px; font-weight: 600;">${process.env.BANK_NAME || 'Standard Chartered Bank (Hong Kong) Ltd'}</span></td></tr>
<tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 13px;">Account Name</span></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;" align="right"><span style="color: #111827; font-size: 13px; font-weight: 600;">${process.env.BANK_ACCOUNT_NAME || 'MANTRA HANDICRAFTS'}</span></td></tr>
<tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 13px;">Account Number</span></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;" align="right"><span style="color: #111827; font-size: 13px; font-weight: 600; font-family: monospace;">${process.env.BANK_ACCOUNT_NUMBER || '47414004253'}</span></td></tr>
<tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 13px;">Bank Code</span></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;" align="right"><span style="color: #111827; font-size: 13px; font-weight: 600;">${process.env.BANK_CODE || '003'}</span></td></tr>
<tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 13px;">Branch Code</span></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;" align="right"><span style="color: #111827; font-size: 13px; font-weight: 600;">${process.env.BANK_BRANCH_CODE || '474'}</span></td></tr>
<tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><span style="color: #6b7280; font-size: 13px;">SWIFT Code</span></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;" align="right"><span style="color: #111827; font-size: 13px; font-weight: 600;">${process.env.BANK_SWIFT || 'SCBLHKHH'}</span></td></tr>
<tr><td style="padding: 8px 0;"><span style="color: #6b7280; font-size: 13px;">Location</span></td><td style="padding: 8px 0;" align="right"><span style="color: #111827; font-size: 13px; font-weight: 600;">${process.env.BANK_LOCATION || 'Hong Kong SAR'}</span></td></tr>
                                            </table>
                                        </td></tr>
                                    </table>
                                    
                                    <p style="color: #92400e; font-size: 13px; margin: 0 0 10px 0; text-align: center; font-weight: 600;">📧 How to Send Payment Receipt</p>
                                    <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 10px;">
                                        <tr><td style="padding: 15px;">
                                            <p style="color: #374151; font-size: 13px; margin: 0 0 8px 0;"><strong>Step 1:</strong> Take a screenshot of your payment receipt</p>
                                            <p style="color: #374151; font-size: 13px; margin: 0 0 8px 0;"><strong>Step 2:</strong> Email receipt to: <strong style="color: #f97316;">${process.env.OWNER_EMAIL || 'mdhamala2000@gmail.com'}</strong></p>
                                            <p style="color: #374151; font-size: 13px; margin: 0 0 8px 0;"><strong>Step 3:</strong> Include Order ID: <strong style="color: #f97316;">#${orderId}</strong> in subject</p>
                                            <p style="color: #059669; font-size: 13px; margin: 0; font-weight: 600;">✓ Orders dispatched within 24-48 hours after confirmation</p>
                                        </td></tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    ` : '';

    if (isOwner) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order - #${orderId}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6;">
    <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6;">
        <tr>
            <td align="center" style="padding: 20px 10px;">
                <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 700px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 25px 35px;">
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0;">New Order Received!</h1>
                                        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 5px 0 0 0;">Order #${orderId}</p>
                                    </td>
                                    <td align="right">
                                        <span style="background: rgba(255,255,255,0.2); color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                                            ${isPaid ? 'PAID' : 'PENDING'}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Order Info -->
                    <tr>
                        <td style="padding: 25px 35px 15px;">
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td width="50%" valign="top">
                                        <p style="color: #6b7280; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Customer</p>
                                        <p style="color: #1f2937; font-size: 15px; font-weight: 600; margin: 4px 0 0 0;">${customerName}</p>
                                        ${customerEmail ? `<p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">${customerEmail}</p>` : ''}
                                        ${customerPhone ? `<p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">📱 ${customerPhone}</p>` : ''}
                                    </td>
                                    <td width="50%" valign="top" align="right">
                                        <p style="color: #6b7280; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Order Date</p>
                                        <p style="color: #1f2937; font-size: 14px; font-weight: 600; margin: 4px 0 0 0;">${formatDateTime(order?.createdAt)}</p>
                                        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">ID: ${orderIdFull}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Payment Info -->
                    <tr>
                        <td style="padding: 0 35px 20px;">
                            <table cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 10px;">
                                <tr>
                                    <td style="padding: 15px 20px;">
                                        <table cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td>
                                                    <p style="color: #6b7280; font-size: 12px; margin: 0;">Payment Status</p>
                                                    <p style="color: ${paymentStatusColor}; font-size: 14px; font-weight: 700; margin: 4px 0 0 0;">${paymentStatus}</p>
                                                </td>
                                                <td>
                                                    <p style="color: #6b7280; font-size: 12px; margin: 0;">Payment Method</p>
                                                    <p style="color: #1f2937; font-size: 14px; font-weight: 600; margin: 4px 0 0 0;">${paymentMethodDisplay}</p>
                                                </td>
                                                <td align="right">
                                                    <p style="color: #6b7280; font-size: 12px; margin: 0;">Total Amount</p>
                                                    <p style="color: #059669; font-size: 20px; font-weight: 700; margin: 4px 0 0 0;">${formatPrice(totalAmt)}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Products -->
                    <tr>
                        <td style="padding: 0 35px 20px;">
                            <p style="color: #1f2937; font-size: 15px; font-weight: 600; margin: 0 0 12px 0;">Order Items (${order?.products?.length || 0})</p>
                            <table cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
                                ${productsHTML}
                            </table>
                        </td>
                    </tr>

                    <!-- Shipping & Summary -->
                    <tr>
                        <td style="padding: 0 35px 25px;">
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td width="50%" valign="top" style="padding-right: 15px;">
                                        <p style="color: #1f2937; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">Shipping Address</p>
                                        <div style="background: #f9fafb; border-radius: 10px; padding: 15px;">
                                            <p style="color: #374151; font-size: 13px; margin: 0 0 4px 0; font-weight: 500;">${order?.delivery_address?.addressType || 'Home'}</p>
                                            <p style="color: #6b7280; font-size: 13px; margin: 0;">${order?.delivery_address?.address_line1 || ''}</p>
                                            <p style="color: #6b7280; font-size: 13px; margin: 0;">${order?.delivery_address?.city || ''}, ${order?.delivery_address?.state || ''} ${order?.delivery_address?.pincode || ''}</p>
                                            <p style="color: #6b7280; font-size: 13px; margin: 0;">${order?.delivery_address?.country || ''}</p>
                                        </div>
                                    </td>
                                    <td width="50%" valign="top" style="padding-left: 15px;">
                                        <p style="color: #1f2937; font-size: 14px; font-weight: 600; margin: 0 0 10px 0;">Order Summary</p>
                                        <div style="background: #f9fafb; border-radius: 10px; padding: 15px;">
                                            <table cellpadding="0" cellspacing="0" width="100%">
                                                <tr><td style="color: #6b7280; font-size: 13px; padding: 4px 0;">Subtotal</td><td align="right" style="color: #374151; font-size: 13px;">${formatPrice(subTotal)}</td></tr>
                                                <tr><td style="color: #6b7280; font-size: 13px; padding: 4px 0;">Shipping</td><td align="right" style="color: ${shippingCost > 0 ? '#374151' : '#059669'}; font-size: 13px;">${shippingCost > 0 ? formatPrice(shippingCost) : 'FREE'}</td></tr>
                                                ${discountCode ? `<tr><td style="color: #059669; font-size: 13px; padding: 4px 0;">Discount (${discountCode})</td><td align="right" style="color: #059669; font-size: 13px;">-${formatPrice(discountAmount)}</td></tr>` : ''}
                                                <tr><td style="border-top: 1px solid #e5e7eb; padding-top: 8px;"><span style="color: #1f2937; font-size: 14px; font-weight: 700;">Total</span></td><td align="right" style="border-top: 1px solid #e5e7eb; padding-top: 8px;"><span style="color: #059669; font-size: 16px; font-weight: 700;">${formatPrice(totalAmt)}</span></td></tr>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1f2937; padding: 20px 35px;" align="center">
                            <p style="color: #9ca3af; font-size: 13px; margin: 0;">Yak Pashamina - Order Management</p>
                            <p style="color: #6b7280; font-size: 11px; margin: 5px 0 0 0;">© ${new Date().getFullYear()} Yak Pashamina. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

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
                    <!-- Header -->
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
                                <tr><td align="center">
                                    <span style="display: inline-block; background-color: ${status.bg}; color: ${status.text}; padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                                        ${status.label}
                                    </span>
                                </td></tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                        <td style="padding: 20px 40px 10px;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0;">Dear <strong style="color: #111827;">${customerName}</strong>,</p>
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
                                <tr><td style="padding: 20px;">
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
                                                <p style="color: #6b7280; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Payment</p>
                                                <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 3px 0 0 0;">${paymentMethodDisplay}</p>
                                            </td>
                                            <td style="padding-top: 15px; border-top: 1px solid #e5e7eb;" align="right">
                                                <p style="color: #6b7280; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Total</p>
                                                <p style="color: #111827; font-size: 20px; font-weight: 700; margin: 3px 0 0 0;">${formatPrice(totalAmt)}</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td></tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Products -->
                    <tr>
                        <td style="padding: 10px 40px 20px;">
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr><td style="padding-bottom: 12px;"><p style="color: #111827; font-size: 16px; font-weight: 600; margin: 0;">Order Items</p></td></tr>
                                <table cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
                                    ${productsHTML}
                                </table>
                            </table>
                        </td>
                    </tr>

                    <!-- Shipping & Summary -->
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
                                                <tr><td style="color: #6b7280; font-size: 13px; padding: 5px 0;">Subtotal</td><td align="right" style="color: #374151; font-size: 13px;">${formatPrice(subTotal)}</td></tr>
                                                <tr><td style="color: #6b7280; font-size: 13px; padding: 5px 0;">Shipping</td><td align="right" style="color: ${shippingCost > 0 ? '#374151' : '#059669'}; font-size: 13px;">${shippingCost > 0 ? formatPrice(shippingCost) : 'FREE'}</td></tr>
                                                ${discountCode ? `<tr><td style="color: #059669; font-size: 13px; padding: 5px 0;">Discount (${discountCode})</td><td align="right" style="color: #059669; font-size: 13px;">-${formatPrice(discountAmount)}</td></tr>` : ''}
                                                <tr><td style="border-top: 1px solid #e5e7eb; padding-top: 10px;"><span style="color: #111827; font-size: 14px; font-weight: 700;">Total</span><span style="color: #6b7280; font-size: 11px; display: block;">(${currency})</span></td><td align="right" style="border-top: 1px solid #e5e7eb; padding-top: 10px;"><span style="color: #3b82f6; font-size: 18px; font-weight: 700;">${formatPrice(totalAmt)}</span></td></tr>
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
                                <tr><td style="padding: 20px;" align="center">
                                    <p style="color: #0369a1; font-size: 14px; font-weight: 600; margin: 0 0 5px 0;">Need Assistance?</p>
                                    <p style="color: #075985; font-size: 13px; margin: 0;">Email: ${process.env.OWNER_EMAIL || 'mdhamala2000@gmail.com'}</p>
                                </td></tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1f2937; padding: 25px 40px;" align="center">
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr><td align="center">
                                    <p style="color: #9ca3af; font-size: 13px; margin: 0;">Thank you for shopping with us!</p>
                                    <p style="color: #6b7280; font-size: 11px; margin: 8px 0 0 0;">© ${new Date().getFullYear()} Yak Pashamina. All rights reserved.</p>
                                </td></tr>
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