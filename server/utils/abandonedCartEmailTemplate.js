const AbandonedCartEmail = (cart, storeName = 'Yak Pashamina', recoveryUrl = '#') => {
    const currency = 'USD';
    const symbol = '$';
    const userName = cart.userName || 'Valued Customer';
    const cartId = cart._id?.toString().slice(-8)?.toUpperCase() || 'N/A';
    const abandonedAt = cart.abandonedAt ? new Date(cart.abandonedAt).toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    }) : new Date().toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });

    const daysAgo = Math.floor((new Date() - new Date(cart.abandonedAt)) / (1000 * 60 * 60 * 24));
    const daysText = daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`;

    const formatPrice = (amount) => {
        const num = parseFloat(amount) || 0;
        return symbol + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You left something behind - ${storeName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6;">
    <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6;">
        <tr>
            <td align="center" style="padding: 20px 10px;">
                <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px 40px;" align="center">
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <span style="font-size: 40px; display: block; margin-bottom: 10px;">🛒</span>
                                        <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Forgot Something?</h1>
                                        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 5px 0 0 0;">Your cart is waiting for you</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 30px 40px 20px;">
                            <p style="color: #374151; font-size: 16px; margin: 0 0 15px 0;">Hi <strong style="color: #111827;">${userName}</strong>,</p>
                            <p style="color: #6b7280; font-size: 15px; margin: 0 0 20px 0; line-height: 1.6;">
                                We noticed you left your shopping cart behind ${daysText}. We saved your items just for you! Complete your purchase now before they sell out.
                            </p>
                            
                            <!-- Reminder Badge -->
                            <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                                <tr>
                                    <td align="center">
                                        <span style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 12px 24px; border-radius: 25px; font-size: 13px; font-weight: 600;">
                                            ⏰ Last saved ${daysText}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Cart Items -->
                    <tr>
                        <td style="padding: 0 40px 20px;">
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 12px;">
                                        <p style="color: #111827; font-size: 16px; font-weight: 600; margin: 0;">Your Saved Items</p>
                                        <p style="color: #9ca3af; font-size: 12px; margin: 3px 0 0 0;">Cart #${cartId}</p>
                                    </td>
                                </tr>
                                ${cart.products?.map((product, index) => `
                                <tr>
                                    <td style="padding: 15px; background-color: ${index % 2 === 0 ? '#f9fafb' : '#ffffff'}; border-radius: 12px; border: 1px solid #e5e7eb;">
                                        <table cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td valign="top" style="padding-right: 15px;">
                                                    <img src="${product?.image || 'https://via.placeholder.com/100x100/e5e7eb/9ca3af?text=Product'}" alt="${product?.productTitle}" style="width: 90px; height: 90px; border-radius: 10px; object-fit: cover; display: block;">
                                                </td>
                                                <td valign="top" style="padding-right: 15px;">
                                                    <p style="color: #111827; font-size: 14px; font-weight: 600; margin: 0 0 8px 0; line-height: 1.4;">${product?.productTitle || 'Product'}</p>
                                                    <p style="color: #6b7280; font-size: 13px; margin: 0;">Qty: <strong style="color: #111827;">${product?.quantity || 1}</strong></p>
                                                    <p style="color: #9ca3af; font-size: 12px; margin: 3px 0 0 0;">${formatPrice(product?.price)} each</p>
                                                </td>
                                                <td valign="top" align="right">
                                                    <p style="color: #111827; font-size: 16px; font-weight: 700; margin: 0; text-align: right;">${formatPrice(product?.subTotal || product?.price)}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                `).join('') || '<tr><td style="padding: 20px; text-align: center; color: #6b7280; background-color: #f9fafb; border-radius: 12px;">No items found</td></tr>'}
                            </table>
                        </td>
                    </tr>

                    <!-- Total Card -->
                    <tr>
                        <td style="padding: 0 40px 20px;">
                            <table cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border-radius: 12px;">
                                <tr>
                                    <td style="padding: 20px;" align="center">
                                        <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">Cart Total</p>
                                        <p style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 5px 0 15px 0;">${formatPrice(cart.totalAmount)}</p>
                                        <a href="${recoveryUrl}" style="display: inline-block; background-color: #ffffff; color: #3b82f6; padding: 14px 35px; border-radius: 25px; font-size: 15px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Complete Purchase
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Trust Badges -->
                    <tr>
                        <td style="padding: 0 40px 20px;">
                            <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">Why complete your order?</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding: 0 20px;">
                                        <table cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td align="center" style="padding: 0 10px;">
                                                    <span style="font-size: 24px; display: block; margin-bottom: 5px;">🚚</span>
                                                    <span style="color: #6b7280; font-size: 11px;">Free Shipping</span>
                                                </td>
                                                <td align="center" style="padding: 0 10px;">
                                                    <span style="font-size: 24px; display: block; margin-bottom: 5px;">🛡️</span>
                                                    <span style="color: #6b7280; font-size: 11px;">Secure Payment</span>
                                                </td>
                                                <td align="center" style="padding: 0 10px;">
                                                    <span style="font-size: 24px; display: block; margin-bottom: 5px;">↩️</span>
                                                    <span style="color: #6b7280; font-size: 11px;">Easy Returns</span>
                                                </td>
                                                <td align="center" style="padding: 0 10px;">
                                                    <span style="font-size: 24px; display: block; margin-bottom: 5px;">💬</span>
                                                    <span style="color: #6b7280; font-size: 11px;">24/7 Support</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Help Section -->
                    <tr>
                        <td style="padding: 0 40px 20px;">
                            <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border-radius: 12px;">
                                <tr>
                                    <td style="padding: 20px;" align="center">
                                        <p style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Need Help?</p>
                                        <p style="color: #6b7280; font-size: 13px; margin: 0;">Have questions? We're here to help!</p>
                                        <p style="color: #3b82f6; font-size: 13px; margin: 8px 0 0 0;">✉️ mdhamala2000@gmail.com | 📱 +977 9841321806</p>
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
                                        <p style="color: #9ca3af; font-size: 13px; margin: 0;">Thank you for considering us!</p>
                                        <p style="color: #6b7280; font-size: 11px; margin: 8px 0 0 0;">
                                            &copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.
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

export default AbandonedCartEmail;