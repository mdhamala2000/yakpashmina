import express from 'express';
import generateSitemap from '../utils/sitemapGenerator.js';

const router = express.Router();

// Sitemap generation endpoint
router.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = process.env.CLIENT_URL || 'https://yakpashamina.com';

        res.set('Cache-Control', 'public, max-age=3600');
        res.set('Content-Type', 'application/xml');

        const sitemap = await generateSitemap(baseUrl);
        res.send(sitemap);

    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

// Placeholder for redirect functionality - can be enabled later
router.get('/check-redirect/:entityType/:slug', async (req, res) => {
    return res.status(200).json({ redirect: false });
});

router.get('/redirect/:entityType/:slug', async (req, res) => {
    return res.status(404).json({ message: 'Resource not found', error: true });
});

router.post('/create-redirect', async (req, res) => {
    return res.status(200).json({ message: 'Redirect feature disabled', error: false, success: true });
});

router.get('/redirects', async (req, res) => {
    return res.status(200).json({ data: [], error: false, success: true });
});

router.delete('/redirects/:id', async (req, res) => {
    return res.status(200).json({ message: 'Redirect deleted', error: false, success: true });
});

export default router;