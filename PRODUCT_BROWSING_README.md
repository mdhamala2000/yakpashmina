# Product Browsing & Category Management System

This document explains how to integrate the new product browsing and category management system with your existing e-commerce website.

## Overview

The new system includes:
- **Client-Side**: Category mega menu, product listing, product details, search
- **Admin-Side**: Category manager, product manager

All components integrate seamlessly with your existing CartContext and checkout system.

---

## Environment Setup

### 1. Set Environment Variables

Create or update your `.env` file:

```env
# Client (client/.env)
VITE_API_URL=http://localhost:8000/api

# Admin (admin/.env)
VITE_API_URL=http://localhost:8000/api
```

### 2. Ensure Cart Provider is Wrapped

Your existing `CartContext` should wrap the app. If not, add it:

**client/src/App.jsx:**
```jsx
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <YourAppContent />
    </CartProvider>
  );
}
```

---

## Client-Side Components

### 1. Category Mega Menu

**Location**: `client/src/components/CategoryMegaMenu/`

Files created:
- `HorizontalMenu.jsx` - Desktop horizontal mega menu

**Usage**:
```jsx
import HorizontalMegaMenu from './components/CategoryMegaMenu/HorizontalMenu';

// Add to your header
<HorizontalMegaMenu isOpen={isMenuOpen} onClose={() => setMenuOpen(false)} />
```

### 2. Product Listing Page (PLP)

**Location**: `client/src/Pages/ProductListing/`

**Routes**:
- `/products` - All products
- `/category/:slug` - Category filtered products
- `/search?q=query` - Search results

**Features**:
- Filtering (price, brands, colors, sizes)
- Sorting (newest, price, popularity)
- Pagination
- Grid/List view toggle
- Loading skeletons & empty states

**Integration**:
The PLP already uses your existing `useCart` via the `ProductCard` component. No changes needed.

### 3. Product Detail Page (PDP)

**Location**: `client/src/Pages/ProductDetails/EnhancedProductDetails.jsx`

**Route**: `/product/:id` or `/product/:handle`

**Features**:
- Image gallery with zoom-on-hover
- Lightbox view
- Variant selection (size, color, etc.)
- Quantity selector
- Add to Cart & Buy Now buttons
- Tabs: Description, Size Guide, Reviews
- Related products carousel
- Breadcrumbs

**Add to Cart Integration**:

The PDP uses the existing `useCart` hook:
```jsx
const { addToCart } = useCart();

// Inside handleAddToCart:
await addToCart(product, selectedVariant, quantity);
```

This automatically syncs with your existing cart/checkout system.

### 4. Search

**Components**:
- `SearchAutocomplete` - Header search with autocomplete
- `EnhancedSearchPage.jsx` - Full search results page

**Route**: `/search?q=query`

**Autocomplete Usage**:
```jsx
import SearchAutocomplete from './components/SearchAutocomplete';

<SearchAutocomplete placeholder="Search products..." />
```

---

## API Layer

### Location
`client/src/services/api/`

### Files
- `client.jsx` - Axios instance with interceptors
- `categoryApi.js` - Category CRUD operations
- `productApi.js` - Product CRUD operations
- `searchApi.js` - Search functionality

### API Client Features
- **Request Interceptor**: Attaches auth token from localStorage
- **Response Interceptor**: Global error handling (401 redirect, toast notifications)
- **Sanitization**: XSS prevention via `sanitizeInput()` and `sanitizeObject()`

### Using the API

```jsx
import { productApi, categoryApi } from '../services/api';

// Get products
const products = await productApi.getProducts({ page: 1, limit: 24 });

// Get single product
const product = await productApi.getProductBySlug('product-slug');

// Get categories
const categories = await categoryApi.getCategoryTree();
```

---

## Admin-Side Components

### 1. Category Manager

**Location**: `admin/src/Pages/CategoryManager/EnhancedCategoryManager.jsx`

**Features**:
- Tree view & List view
- Create, Edit, Delete categories
- Toggle category status (active/inactive)
- Search & filter
- Nested category support (parent/child)
- Responsive design

**Routes**: Add to your router:
```jsx
import EnhancedCategoryManager from './Pages/CategoryManager/EnhancedCategoryManager';

{ path: '/category-manager', element: <EnhancedCategoryManager /> }
```

### 2. Product Manager

**Location**: `admin/src/Pages/ProductManager/EnhancedProductManager.jsx`

**Features**:
- Grid & List view
- Search, filter, sort
- Bulk actions (activate, deactivate, delete)
- Quick status toggle
- Product creation & editing modal
- Pagination
- Responsive design

**Routes**: Add to your router:
```jsx
import EnhancedProductManager from './Pages/ProductManager/EnhancedProductManager';

{ path: '/product-manager', element: <EnhancedProductManager /> }
```

---

## Integration with Existing Cart/Checkout

### How It Works

1. **Add to Cart Button** uses `useCart().addToCart(product, variant, quantity)`
2. **CartContext** handles the API call to `/api/cart/add`
3. **Cart page** reads from `CartContext.cartItems`
4. **Checkout** uses the same cart data

### Customizing Add to Cart

If you need to modify the data sent to cart, edit the `addToCart` function in `CartContext.jsx`:

```jsx
const addToCart = async (product, variant = null, quantity = 1) => {
  // Your custom logic here
  // Example: Add custom attributes
  const data = {
    productTitle: product.title,
    // ... existing fields
    customField: value,
  };
  // ...
};
```

---

## API Endpoints Expected

Your backend should implement these endpoints:

### Categories
- `GET /api/categories` - All categories
- `GET /api/categories/tree` - Nested category tree
- `GET /api/categories/slug/:slug` - Category by slug
- `POST /api/category` - Create category (admin)
- `PUT /api/category/:id` - Update category (admin)
- `DELETE /api/category/:id` - Delete category (admin)

### Products
- `GET /api/products` - Products with filters
- `GET /api/products/:slug` - Product by slug
- `POST /api/product` - Create product (admin)
- `PUT /api/product/:id` - Update product (admin)
- `DELETE /api/product/:id` - Delete product (admin)

### Search
- `GET /api/search/suggestions?q=query` - Autocomplete
- `GET /api/search` - Full search results

---

## Troubleshooting

### Cart Not Updating
1. Verify `CartProvider` wraps your app
2. Check browser console for errors
3. Confirm API endpoint `/api/cart/add` works

### Products Not Loading
1. Verify API URL in `.env`
2. Check network tab for failed requests
3. Confirm backend returns correct data format

### Admin Features Not Working
1. Ensure user has admin role
2. Check authentication token is sent
3. Verify API endpoints exist on backend

---

## Security Notes

- All API calls use HTTPS (ensure your API URL uses `https://`)
- Auth tokens are attached via request interceptor
- User input is sanitized to prevent XSS
- 401 responses trigger automatic logout

---

## Summary

The new system integrates with your existing:
- ✅ CartContext - Add to cart works automatically
- ✅ Cart page - Shows updated cart items
- ✅ Checkout - Uses existing cart data
- ✅ Payment gateway - No changes needed
- ✅ User authentication - Works with existing auth

To use the new components, simply import them and add the routes to your router. The cart/checkout flow remains unchanged.