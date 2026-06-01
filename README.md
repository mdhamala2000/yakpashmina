# Yak Pashmina - E-Commerce Platform

A full-stack e-commerce platform for selling handwoven Pashmina shawls, scarves, and handicrafts. Built with React (Vite), Node.js/Express, and MongoDB.

## Tech Stack

- **Frontend (Client)**: React 18, Vite, Tailwind CSS, Material UI, Stripe/PayPal/Airwallex
- **Admin Dashboard**: React 18, Vite, Material UI, Recharts, TanStack Query, Redux Toolkit
- **Backend**: Node.js, Express, Mongoose, JWT
- **Database**: MongoDB
- **Payments**: Stripe, PayPal, Airwallex, Bank Transfer, Cash on Delivery
- **Email**: Nodemailer (SMTP)

## Project Structure

```
yakpashamina/
├── server/          # Backend API (Express + MongoDB)
│   ├── config/      # DB connection, email service, payment configs
│   ├── controllers/ # Route handlers
│   ├── middlewares/  # Auth, validation, sanitization
│   ├── models/      # Mongoose schemas
│   ├── route/       # Express routers
│   ├── scripts/     # Seed script
│   ├── utils/       # Helpers (tokens, email templates)
│   └── uploads/     # Local file uploads
├── client/          # Customer storefront (React + Vite)
│   └── src/
│       ├── Pages/   # Page components
│       ├── components/ # Reusable components
│       └── context/ # Global state
└── admin/           # Admin dashboard (React + Vite)
    └── src/
        ├── Pages/      # Page components
        ├── Components/ # Reusable components
        └── utils/      # API helpers
```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client (storefront) dependencies
cd ../client
npm install

# Install admin dashboard dependencies
cd ../admin
npm install
```

### 2. Environment Variables

Create `.env` files for each service.

**server/.env** (required):
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/yakpashmina
NODE_ENV=development
CLIENT_URL=http://localhost:5174
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175

# JWT
JSON_WEB_TOKEN_SECRET_KEY=your-secret-key
SECRET_KEY_ACCESS_TOKEN=your-access-token-secret
SECRET_KEY_REFRESH_TOKEN=your-refresh-token-secret

# Email (for order notifications)
EMAIL=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary (for image uploads)
cloudinary_Config_Cloud_Name=your-cloud-name
cloudinary_Config_api_key=your-api-key
cloudinary_Config_api_secret=your-api-secret
```

**client/.env**:
```env
VITE_API_URL=http://localhost:8000
```

**admin/.env**:
```env
VITE_API_URL=http://localhost:8000
```

### 3. Seed Database

```bash
cd server
npm run seed
```

This creates:
- **Admin user**: `admin@example.com` / `admin123`
- Sample categories (Clothing, Accessories, Home Decor with sub-categories)
- Simple product: Classic Pashmina Shawl
- Variant product: Designer Pashmina Collection (8 variants: 4 colors × 2 sizes)

### 4. Start the Application

```bash
# Terminal 1: Start the server
cd server
npm run dev

# Terminal 2: Start the client storefront
cd client
npm run dev

# Terminal 3: Start the admin dashboard
cd admin
npm run dev
```

- **Server**: http://localhost:8000
- **Client Storefront**: http://localhost:5174
- **Admin Dashboard**: http://localhost:5173

## Features

### Admin Dashboard
- **Dashboard**: Summary stats (total products, orders, users, categories)
- **Product Management**:
  - Product type selection (Simple vs Variant) at creation
  - Simple product: price, stock, SKU directly on the product
  - Variant product: options builder (Size, Color, etc.) with auto-generated variant combinations
  - Auto SKU generation
  - Real-time discount percentage calculation
  - Drag-drop image upload with primary image selection
  - SEO fields (slug, meta title, keywords)
- **Inventory Alerts**: Products and variants with stock ≤ 5
- **Order Management**: View orders, update status
- **Category Management**: Hierarchical categories with sub-categories
- **Banners & Slides**: Homepage banners and sliders
- **Blog Management**: Full CRUD for blog posts
- **Discount Codes**: Create and manage discount codes
- **Shipping Rates**: Per-country shipping configuration
- **Payment Settings**: Stripe, PayPal, Airwallex, Bank Transfer
- **User Management**: View and manage users

### Client Storefront
- **Home Page**: Hero banner, featured products, categories
- **Product Listing**: Filter by category, search by name, sort by price
- **Product Detail**:
  - Simple products: Add to cart with quantity
  - Variant products: Color/size selectors with dynamic price and stock updates
- **Shopping Cart**: Add/remove items, quantity updates
- **Checkout**: Shipping address, payment method (COD, Stripe)
- **Order Tracking**: Track order status
- **User Account**: Order history, wishlist, address management
- **Blog**: Read blog posts
- **Responsive**: Mobile, tablet, desktop

## API Endpoints

### Auth
- `POST /api/user/register` - Register
- `POST /api/user/login` - Login (rate limited)
- `GET /api/user/logout` - Logout
- `GET /api/user/user-details` - Get current user

### Products
- `POST /api/product/create` - Create product (admin)
- `GET /api/product/getAllProducts` - List products (paginated, filterable)
- `GET /api/product/getAllProductsByCatId/:catId` - By category
- `GET /api/product/getAllFeaturedProducts` - Featured products
- `PUT /api/product/:id` - Update product (admin)
- `DELETE /api/product/:id` - Soft delete product (admin)

### Variants
- `POST /api/variant/create` - Create single variant
- `POST /api/variant/createBulk` - Bulk create variants
- `GET /api/variant/product/:productId` - Get product variants
- `PUT /api/variant/:id` - Update variant
- `DELETE /api/variant/:id` - Soft delete variant

### Categories
- `POST /api/category/create` - Create category (admin)
- `GET /api/category` - List all categories
- `GET /api/category/slug/:slug` - Get by slug
- `PUT /api/category/:id` - Update category (admin)
- `DELETE /api/category/:id` - Soft delete (admin)

### Orders
- `POST /api/order/create` - Create order
- `GET /api/order/order-list` - List all orders (admin)
- `PUT /api/order/update-order-status` - Update status (admin)
- `GET /api/order/count` - Order count stats

### Cart
- `POST /api/cart/add` - Add to cart
- `GET /api/cart/get` - Get cart items
- `PUT /api/cart/update-qty` - Update quantity
- `DELETE /api/cart/delete-cart-item` - Remove item

## Admin Product Creation Flow

1. Click "Add Product" in the Products sidebar
2. **Choose Product Type**:
   - **Simple Product**: Set one price, one stock, one SKU directly
   - **Variant Product**: After saving, use the Variant Manager to define options
3. Fill in basic info, category, SEO fields
4. Upload images
5. Save the product
6. For variant products: Configure attributes (e.g., Color, Size), add option values, auto-generate variant combinations with individual pricing and stock

## Seed Data

The seed script (`server/scripts/seed.js`) creates:

| Entity | Details |
|--------|---------|
| **Admin User** | admin@example.com / admin123 |
| **Categories** | Clothing, Accessories, Home Decor |
| **Sub-categories** | Shawls, Scarves, Jewelry, Bags, Wall Art, Cushions |
| **Simple Product** | Classic Pashmina Shawl ($79.99, 50 in stock) |
| **Variant Product** | Designer Pashmina Collection (4 colors × 2 sizes = 8 variants) |

## Notes

- The admin panel runs on port 5173, client on 5174, server on 8000
- Ensure MongoDB is running before starting the server
- For email features, configure Gmail app password in server/.env
- For Stripe payments, use test keys from Stripe dashboard
- Image uploads use Cloudinary by default; configure Cloudinary credentials in server/.env
# yakpashmina
