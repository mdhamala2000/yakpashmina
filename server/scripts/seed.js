import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import UserModel from '../models/user.model.js';
import CategoryModel from '../models/category.modal.js';
import ProductModel from '../models/product.modal.js';
import VariantModel from '../models/variant.model.js';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }

  const existingAdmin = await UserModel.findOne({ email: 'admin@example.com' });
  if (!existingAdmin) {
    const salt = await bcryptjs.genSalt(12);
    const hashPassword = await bcryptjs.hash('admin123', salt);

    const admin = new UserModel({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashPassword,
      role: 'ADMIN',
      verify_email: true,
      status: 'Active',
    });
    await admin.save();
    console.log('Admin user created: admin@example.com / admin123');
  } else {
    console.log('Admin user already exists');
  }

  const categories = [
    { name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion items' },
    { name: 'Accessories', slug: 'accessories', description: 'Fashion accessories' },
    { name: 'Home Decor', slug: 'home-decor', description: 'Home decoration items' },
  ];
  const catMap = {};
  for (const cat of categories) {
    let existing = await CategoryModel.findOne({ slug: cat.slug, isDeleted: false });
    if (!existing) {
      existing = await CategoryModel.create({ ...cat, metaTitle: cat.name });
      console.log(`Category created: ${cat.name}`);
    } else {
      console.log(`Category exists: ${cat.name}`);
    }
    catMap[cat.name] = existing;
  }

  const subCategories = [
    { name: 'Shawls', slug: 'shawls', parent: 'Clothing' },
    { name: 'Scarves', slug: 'scarves', parent: 'Clothing' },
    { name: 'Jewelry', slug: 'jewelry', parent: 'Accessories' },
    { name: 'Bags', slug: 'bags', parent: 'Accessories' },
    { name: 'Wall Art', slug: 'wall-art', parent: 'Home Decor' },
    { name: 'Cushions', slug: 'cushions', parent: 'Home Decor' },
  ];
  const subCatMap = {};
  for (const sub of subCategories) {
    let existing = await CategoryModel.findOne({ slug: sub.slug, isDeleted: false });
    if (!existing) {
      const parent = catMap[sub.parent];
      existing = await CategoryModel.create({
        name: sub.name,
        slug: sub.slug,
        parentId: parent._id,
        parentCatName: parent.name,
        metaTitle: sub.name,
      });
      console.log(`Sub-category created: ${sub.name}`);
    } else {
      console.log(`Sub-category exists: ${sub.name}`);
    }
    subCatMap[sub.name] = existing;
  }

  const simpleProd = await ProductModel.findOne({ sku: 'PASHMINA-CLASSIC-001' });
  if (!simpleProd) {
    const product = await ProductModel.create({
      name: 'Classic Pashmina Shawl',
      sku: 'PASHMINA-CLASSIC-001',
      slug: 'classic-pashmina-shawl',
      description: 'Handwoven classic pashmina shawl made from the finest cashmere wool. Lightweight, warm, and incredibly soft. Perfect for any occasion.',
      shortDescription: 'Handwoven cashmere pashmina shawl - ultra soft and warm',
      brand: 'Yak Pashmina',
      price: 79.99,
      oldPrice: 129.99,
      discount: Math.floor((129.99 - 79.99) / 129.99 * 100),
      countInStock: 50,
      category: catMap['Clothing']._id,
      catId: catMap['Clothing']._id,
      catName: 'Clothing',
      subCat: 'Shawls',
      subCatId: subCatMap['Shawls']._id,
      images: [
        'https://res.cloudinary.com/demo/image/upload/v1/samples/fashion/1.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1/samples/fashion/2.jpg',
      ],
      isFeatured: true,
      hasVariants: false,
      metaTitle: 'Classic Pashmina Shawl - Yak Pashmina',
      metaDescription: 'Handwoven classic pashmina shawl made from finest cashmere wool',
      keywords: 'pashmina, shawl, cashmere, handwoven',
    });
    console.log(`Simple product created: ${product.name}`);
  } else {
    console.log('Simple product already exists');
  }

  const variantParentName = 'Designer Pashmina Collection';
  let variantParent = await ProductModel.findOne({ name: variantParentName });
  if (!variantParent) {
    variantParent = await ProductModel.create({
      name: variantParentName,
      sku: 'DESIGNER-PASHMINA',
      slug: 'designer-pashmina-collection',
      description: 'Premium designer pashmina collection available in multiple colors and sizes. Each piece is handcrafted by skilled artisans.',
      shortDescription: 'Premium designer pashmina - multiple colors and sizes',
      brand: 'Yak Pashmina',
      price: 0,
      oldPrice: 0,
      countInStock: 0,
      category: catMap['Clothing']._id,
      catId: catMap['Clothing']._id,
      catName: 'Clothing',
      subCat: 'Shawls',
      subCatId: subCatMap['Shawls']._id,
      images: [
        'https://res.cloudinary.com/demo/image/upload/v1/samples/fashion/3.jpg',
        'https://res.cloudinary.com/demo/image/upload/v1/samples/fashion/4.jpg',
      ],
      isFeatured: true,
      hasVariants: true,
      variantAttributeNames: ['Color', 'Size'],
      metaTitle: 'Designer Pashmina Collection - Yak Pashmina',
      metaDescription: 'Premium designer pashmina in multiple colors and sizes',
      keywords: 'designer pashmina, colors, sizes, collection',
    });
    console.log(`Variant parent product created: ${variantParent.name}`);
  } else {
    console.log('Variant parent product already exists');
  }

  const existingVariants = await VariantModel.countDocuments({ product: variantParent._id, isDeleted: false });
  if (existingVariants === 0) {
    const colors = ['Crimson Red', 'Midnight Blue', 'Forest Green', 'Ivory White'];
    const sizes = ['Regular (70"x28")', 'Oversized (80"x36")'];
    const variants = [];
    let idx = 0;
    for (const color of colors) {
      for (const size of sizes) {
        idx++;
        const basePrice = color === 'Ivory White' ? 89.99 : 79.99;
        variants.push({
          product: variantParent._id,
          sku: `DSG-PASH-${String(idx).padStart(3, '0')}`,
          options: { Color: color, Size: size },
          name: `${color} / ${size}`,
          price: basePrice,
          oldPrice: basePrice + 40,
          stock: idx <= 4 ? 3 : 15,
          isActive: true,
        });
      }
    }
    await VariantModel.insertMany(variants);
    console.log(`${variants.length} variants created`);
  } else {
    console.log(`Variants already exist: ${existingVariants}`);
  }

  await mongoose.disconnect();
  console.log('\nSeed complete!');
  console.log('Admin: admin@example.com / admin123');
  process.exit(0);
}

seed();
