# Product & Category Management System

A complete, production-ready Shopify-like Product & Category Management system for React e-commerce apps.

## Features

### Backend (Node.js + Express + MongoDB)

- **Categories & Subcategories**: Full CRUD with unique name validation
  - Categories: Global unique names
  - Subcategories: Unique within parent category
- **Products**: Simple & Variable product types
  - Simple: Single variant per product
  - Variable: Multiple variants with options (size, color, etc.)
- **Variants**: SKU (globally unique), price, compare-at price, inventory, options
- **Automated Collections**: Smart collections with rule-based product filtering
  - Condition types: product_price, product_tag, product_category
  - Operators: equals, not_equals, contains, greater_than, less_than, etc.
  - Match types: all (AND) or any (OR)
- **Collection Sync**: Automatic product membership evaluation
  - Syncs on product/variant save (especially price changes)
  - Syncs when collection rules change
  - Idempotent sync (no duplicate entries)

### Frontend (React + Vite)

**Admin Panel**:
- Category & Subcategory Manager with error handling
- Product Manager with:
  - Simple/Variable product toggle
  - Category/Subcategory dropdowns (subcategory filters by selected category)
  - Dynamic variant rows with live SKU uniqueness check
  - Tag management
- Product listing with price range display for variable products

**Storefront**:
- Product Listing with filters, search, sorting, pagination
- Product Detail with variant selector (updates price, SKU, stock dynamically)
- Cart stores variant ID for accurate order fulfillment

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

### Environment Variables

Create `.env` files in both `server/` and `client/` directories:

**Server `.env`**:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your-database
NODE_ENV=development
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:5173
```

**Client `.env`**:
```env
VITE_API_URL=http://localhost:5000
```

### Installation

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Install admin dependencies
cd ../admin
npm install
```

### Running the Application

```bash
# Terminal 1: Start server
cd server
npm run dev

# Terminal 2: Start client
cd client
npm run dev

# Terminal 3: Start admin panel
cd admin
npm run dev
```

### Seeding Test Data

Use the admin panel to create categories, subcategories, and products. Or use MongoDB Compass to insert test data:

```javascript
// Example Category
{
  name: "Clothing",
  slug: "clothing",
  isActive: true
}

// Example Subcategory
{
  name: "T-Shirts",
  slug: "t-shirts",
  parentCategory: ObjectId("category-id"),
  isActive: true
}

// Example Product (Variable)
{
  title: "Classic T-Shirt",
  description: "A comfortable cotton t-shirt",
  category: ObjectId("category-id"),
  subcategory: ObjectId("subcategory-id"),
  productType: "variable",
  status: "active",
  handle: "classic-t-shirt",
  variants: [
    {
      title: "Small / Blue",
      sku: "TS-SM-BL-001",
      price: 19.99,
      compareAtPrice: 29.99,
      inventoryQuantity: 50,
      options: [
        { name: "Size", value: "Small" },
        { name: "Color", value: "Blue" }
      ]
    },
    {
      title: "Medium / Blue",
      sku: "TS-MD-BL-001",
      price: 19.99,
      compareAtPrice: 29.99,
      inventoryQuantity: 30,
      options: [
        { name: "Size", value: "Medium" },
        { name: "Color", value: "Blue" }
      ]
    }
  ]
}
```

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/tree` - Get category tree with subcategories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Subcategories
- `GET /api/categories/subcategory/all` - Get all subcategories
- `GET /api/categories/subcategory/by-category/:categoryId` - Get subcategories by category (filters correctly!)
- `POST /api/categories/subcategory` - Create subcategory
- `PUT /api/categories/subcategory/:id` - Update subcategory
- `DELETE /api/categories/subcategory/:id` - Delete subcategory

### Products
- `GET /api/products` - Get all products (with pagination, filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/handle/:handle` - Get product by handle
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/sku-check?sku=...` - Check SKU availability

### Collections
- `GET /api/collections` - Get all collections
- `GET /api/collections/:id` - Get collection by ID
- `POST /api/collections` - Create collection
- `PUT /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Delete collection
- `GET /api/collections/rules` - Get collection rules
- `POST /api/collections/rules` - Create collection rule
- `PUT /api/collections/rules/:id` - Update collection rule
- `DELETE /api/collections/rules/:id` - Delete collection rule

## Key Implementation Details

### Subcategory Dropdown Bug Fix
The endpoint `/api/categories/subcategory/by-category/:categoryId` returns only subcategories belonging to the selected category, fixing the common bug where all subcategories appear regardless of parent.

### SKU Uniqueness
All SKUs are globally unique across all products via Mongoose unique index. The `checkSkuAvailability` API endpoint provides live checking in the admin form.

### Collection Sync Logic
1. **On product save**: If category or variant price changes, `syncProductToCollections` re-evaluates the product against all automated collections
2. **On rule create/update**: `syncAllProductsToCollections` evaluates all active products against the collection's rules
3. **Idempotent sync**: Collections store product IDs in an array. Adding/removing is deterministic - no duplicates occur.

### Variant Selection (Storefront)
The variant selector:
1. Groups all variant options by name (Size, Color, etc.)
2. Shows only available option values based on current selection
3. Cross-references variants to find matching price, SKU, inventory
4. Updates Add to Cart button state based on stock

## Directory Structure

```
├── server/
│   ├── models/
│   │   ├── Category.model.js
│   │   ├── Subcategory.model.js
│   │   ├── Product.model.js
│   │   ├── ProductCollection.model.js
│   │   └── AutomatedCollectionRule.model.js
│   ├── controllers/
│   │   ├── categoryProduct.controller.js
│   │   ├── productProduct.controller.js
│   │   └── collection.controller.js
│   ├── services/
│   │   └── collectionSync.service.js
│   └── route/
│       ├── categoryProduct.route.js
│       ├── productProduct.route.js
│       └── collection.route.js
├── client/
│   └── src/
│       ├── context/
│       │   └── CartContext.jsx
│       └── Pages/
│           ├── ProductListing/
│           └── ProductDetails/
└── admin/
    └── src/
        ├── context/
        │   └── CategoryContext.jsx
        ├── services/
        │   ├── categoryService.js
        │   └── productService.js
        └── Pages/
            ├── CategoryManager/
            └── ProductManager/
```

## License

MIT