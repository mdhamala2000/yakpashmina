# Category Management System - Integration Guide

## Quick Start

### 1. Add the CategoryProvider to your App

In your `App.jsx` or `main.jsx`:

```jsx
import { CategoryProvider } from './context/CategoryContext';

function App() {
  return (
    <CategoryProvider>
      <YourApp />
    </CategoryProvider>
  );
}
```

### 2. Use the CategoryManager in a page

```jsx
import { CategoryManager } from './components/CategoryManager';

function CategoriesPage() {
  return (
    <div>
      <CategoryManager />
    </div>
  );
}
```

### 3. Use the ProductForm in your product form

```jsx
import { ProductForm } from './components/ProductForm';

function AddProductPage() {
  const handleSubmit = async (data) => {
    // Call your API to save the product
    await api.createProduct(data);
  };

  return (
    <ProductForm 
      onSubmit={handleSubmit} 
      onCancel={() => history.goBack()}
    />
  );
}
```

---

## Features Overview

### CategoryManager Features:
- ✅ **Full CRUD** - Add, Edit, Delete categories and subcategories
- ✅ **Tree View** - Hierarchical display with expand/collapse
- ✅ **Duplicate Validation** - Real-time checking before save
- ✅ **Delete Confirmation** - Modal with warning for products
- ✅ **Tabs View** - All / Main Categories / Subcategories
- ✅ **Product Counts** - Shows product count per category
- ✅ **Responsive** - Works on mobile, tablet, desktop

### ProductForm Features:
- ✅ **Category Selection** - Shows only main categories
- ✅ **Subcategory Filtering** - Shows ONLY subcategories of selected category
- ✅ **Real-time Validation** - Errors shown as you type
- ✅ **Responsive Design** - Mobile-friendly form

---

## File Structure

```
client/
├── src/
│   ├── context/
│   │   └── CategoryContext.jsx      # State management
│   ├── services/
│   │   └── categoryService.js       # API calls
│   ├── components/
│   │   ├── CategoryManager/
│   │   │   └── index.jsx            # Full CRUD interface
│   │   └── ProductForm/
│   │       └── index.jsx            # Product form with category selection
│   └── App.jsx                       # Wrap with CategoryProvider
│
server/
├── controllers/
│   └── category.controller.js        # Added checkCategoryName endpoint
├── route/
│   └── category.route.js             # Added /check-name route
```

---

## Backend API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/category` | Get all categories (tree) |
| GET | `/api/category/check-name?name=...&excludeId=...` | Check duplicate name |
| POST | `/api/category/create` | Create category |
| PUT | `/api/category/:id` | Update category |
| DELETE | `/api/category/:id` | Delete category |

---

## How to Switch to Real Backend

### Current (with this system):
```javascript
// Already configured to use your existing backend
// API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
```

### For Production:
Add to your `.env`:
```
VITE_API_URL=https://your-api-domain.com/api
```

---

## Customization

### Change API Base URL:
In `services/categoryService.js`:
```javascript
const API_URL = 'https://your-custom-domain.com/api';
```

### Add More Fields to Category:
In `services/categoryService.js`, modify `createCategory` data object.

### Style Customization:
All components use Tailwind CSS classes. Modify the `styles` object in each component to match your design system.

---

## Troubleshooting

### "useCategory must be used within CategoryProvider"
Make sure you wrapped your app with `CategoryProvider` in App.jsx

### Categories not loading
Check:
1. Server is running
2. API endpoint `/api/category` works
3. Check browser console for errors

### Duplicate check not working
Make sure you added the route in `server/route/category.route.js`:
```javascript
categoryRouter.get('/check-name', checkCategoryName);
```

---

## Example: Using with Redux (Optional)

If you prefer Redux instead of Context:

```javascript
// Create categorySlice.js
import { createSlice } from '@reduxjs/toolkit';
import * as categoryService from '../services/categoryService';

const categorySlice = createSlice({
  name: 'categories',
  initialState: { categories: [], loading: false },
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setCategories, setLoading } = categorySlice.actions;

// Thunk for async operations
export const fetchCategories = () => async (dispatch) => {
  dispatch(setLoading(true));
  const categories = await categoryService.getAllCategories();
  dispatch(setCategories(categories));
  dispatch(setLoading(false));
};
```

---

## Support

For issues or questions, check:
1. Console errors
2. Network tab for failed API calls
3. Server logs