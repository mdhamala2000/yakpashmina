import ProductModel from '../models/product.modal.js';
import CategoryModel from '../models/category.modal.js';

const generateSitemap = async (baseUrl) => {
    try {
        const sitemapParts = [];
        
        // XML header
        sitemapParts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
        sitemapParts.push(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`);
        
        // 1. Static pages
        const staticPages = [
            { url: '/', priority: '1.0', changefreq: 'daily' },
            { url: '/products', priority: '0.9', changefreq: 'daily' },
            { url: '/about', priority: '0.7', changefreq: 'monthly' },
            { url: '/contact', priority: '0.7', changefreq: 'monthly' },
            { url: '/shipping', priority: '0.6', changefreq: 'monthly' },
            { url: '/returns', priority: '0.6', changefreq: 'monthly' },
            { url: '/privacy-policy', priority: '0.5', changefreq: 'monthly' },
            { url: '/terms', priority: '0.5', changefreq: 'monthly' }
        ];
        
        staticPages.forEach(page => {
            sitemapParts.push(`<url>`);
            sitemapParts.push(`<loc>${baseUrl}${page.url}</loc>`);
            sitemapParts.push(`<changefreq>${page.changefreq}</changefreq>`);
            sitemapParts.push(`<priority>${page.priority}</priority>`);
            sitemapParts.push(`</url>`);
        });
        
        // 2. Categories
        const categories = await CategoryModel.find({ 
            isDeleted: false 
        }).select('slug updatedAt').lean();
        
        categories.forEach(cat => {
            sitemapParts.push(`<url>`);
            sitemapParts.push(`<loc>${baseUrl}/category/${cat.slug}</loc>`);
            sitemapParts.push(`<changefreq>weekly</changefreq>`);
            sitemapParts.push(`<priority>0.8</priority>`);
            sitemapParts.push(`<lastmod>${new Date(cat.updatedAt).toISOString()}</lastmod>`);
            sitemapParts.push(`</url>`);
        });
        
        // 3. Subcategories (categories with parentId)
        const subCategories = await CategoryModel.find({ 
            isDeleted: false,
            parentId: { $ne: null }
        }).select('slug parentId updatedAt').populate('parentId', 'slug').lean();
        
        subCategories.forEach(subCat => {
            if (subCat.parentId?.slug) {
                sitemapParts.push(`<url>`);
                sitemapParts.push(`<loc>${baseUrl}/category/${subCat.parentId.slug}/${subCat.slug}</loc>`);
                sitemapParts.push(`<changefreq>weekly</changefreq>`);
                sitemapParts.push(`<priority>0.7</priority>`);
                sitemapParts.push(`<lastmod>${new Date(subCat.updatedAt).toISOString()}</lastmod>`);
                sitemapParts.push(`</url>`);
            }
        });
        
        // 4. Products (only active ones)
        // Get products in batches to avoid memory issues
        const batchSize = 1000;
        let skip = 0;
        let hasMore = true;
        
        while (hasMore) {
            const products = await ProductModel.find({ 
                isDeleted: false,
                countInStock: { $gt: 0 }
            })
            .select('slug updatedAt')
            .skip(skip)
            .limit(batchSize)
            .lean();
            
            if (products.length === 0) {
                hasMore = false;
                break;
            }
            
            products.forEach(product => {
                sitemapParts.push(`<url>`);
                sitemapParts.push(`<loc>${baseUrl}/product/${product.slug}</loc>`);
                sitemapParts.push(`<changefreq>weekly</changefreq>`);
                sitemapParts.push(`<priority>0.6</priority>`);
                sitemapParts.push(`<lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>`);
                sitemapParts.push(`</url>`);
            });
            
            skip += batchSize;
            
            // Safety check - limit total products in sitemap
            if (skip > 10000) {
                console.warn('Sitemap generation limited to 10,000 products');
                break;
            }
        }
        
        // Close XML
        sitemapParts.push(`</urlset>`);
        
        return sitemapParts.join('\n');
        
    } catch (error) {
        console.error('Sitemap generation error:', error);
        throw error;
    }
};

// Generate sitemap.xml and save to file
export const generateSitemapFile = async (outputPath) => {
    const baseUrl = process.env.CLIENT_URL || 'https://yakpashamina.com';
    const sitemap = await generateSitemap(baseUrl);
    
    const fs = await import('fs');
    fs.writeFileSync(outputPath, sitemap, 'utf8');
    console.log(`Sitemap generated at ${outputPath}`);
    
    return sitemap;
};

export default generateSitemap;