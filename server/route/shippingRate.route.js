import { Router } from 'express';
import auth from '../middlewares/auth.js';
import ShippingRateModel from '../models/shippingRate.model.js';

const shippingRateRouter = Router();

// RESET ALL - delete everything and start fresh
shippingRateRouter.post('/reset-all', async (req, res) => {
    try {
        const result = await ShippingRateModel.deleteMany({});
        return res.status(200).json({
            message: `Deleted ${result.deletedCount} shipping rates`,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
});

shippingRateRouter.get('/reset-all', async (req, res) => {
    try {
        const result = await ShippingRateModel.deleteMany({});
        return res.status(200).json({
            message: `Deleted ${result.deletedCount} shipping rates`,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
});

// Quick setup
shippingRateRouter.post('/quick-setup', auth, async (req, res) => {
    try {
        const { countries, pricingType, flatRate, freeShippingThreshold, estimatedDeliveryDays, currency, isActive } = req.body;

        if (!countries || !Array.isArray(countries) || countries.length === 0) {
            return res.status(400).json({
                message: "Countries array required",
                error: true,
                success: false
            });
        }

const countryNames = {
          // Asia Pacific
          NP: "Nepal", IN: "India", CN: "China", JP: "Japan", KR: "South Korea", TW: "Taiwan",
          HK: "Hong Kong", SG: "Singapore", MY: "Malaysia", TH: "Thailand", VN: "Vietnam",
          PH: "Philippines", ID: "Indonesia", PK: "Pakistan", BD: "Bangladesh", LK: "Sri Lanka",
          MM: "Cambodia", LA: "Laos", BN: "Brunei", MV: "Maldives", AF: "Afghanistan", BT: "Bhutan",
          
          // Australia & Oceania
          AU: "Australia", NZ: "New Zealand", FJ: "Fiji",
          
          // North America
          US: "United States", CA: "Canada", MX: "Mexico",
          
          // Europe
          GB: "United Kingdom", DE: "Germany", FR: "France", IT: "Italy", ES: "Spain",
          NL: "Netherlands", BE: "Belgium", CH: "Switzerland", AT: "Austria",
          SE: "Sweden", NO: "Norway", DK: "Denmark", FI: "Finland", PL: "Poland",
          PT: "Portugal", IE: "Ireland", CZ: "Czech Republic", HU: "Hungary",
          RO: "Romania", GR: "Greece", BG: "Bulgaria", HR: "Croatia", SK: "Slovakia",
          SI: "Slovenia", LU: "Luxembourg", IS: "Iceland", EE: "Estonia", LV: "Latvia",
          LT: "Lithuania", MT: "Malta", CY: "Cyprus",
          
          // Middle East
          AE: "United Arab Emirates", SA: "Saudi Arabia", QA: "Qatar", KW: "Kuwait",
          OM: "Oman", BH: "Bahrain", JO: "Jordan", LB: "Lebanon", IL: "Israel", TR: "Turkey",
          
          // Africa
          ZA: "South Africa", EG: "Egypt", NG: "Nigeria", KE: "Kenya", MA: "Morocco",
          GH: "Ghana", ET: "Ethiopia", TZ: "Tanzania", TN: "Tunisia", DZ: "Algeria",
          
          // South America
          BR: "Brazil", AR: "Argentina", CL: "Chile", CO: "Colombia", PE: "Peru",
          VE: "Venezuela", EC: "Ecuador", BO: "Bolivia", PY: "Paraguay", UY: "Uruguay",
          
          // Russia & CIS
          RU: "Russia", UA: "Ukraine", KZ: "Kazakhstan", UZ: "Uzbekistan", AZ: "Azerbaijan",
          AM: "Armenia", GE: "Georgia", BY: "Belarus"
        };

        const createdRates = [];
        
        for (const countryCode of countries) {
            const existingRate = await ShippingRateModel.findOne({ countryCode });
            if (existingRate) continue;

            const shippingRate = new ShippingRateModel({
                country: countryNames[countryCode] || countryCode,
                countryCode,
                pricingType,
                flatRate: flatRate || 0,
                freeShippingThreshold,
                estimatedDeliveryDays,
                currency: currency || 'USD',
                isActive: isActive !== false
            });

            await shippingRate.save();
            createdRates.push(shippingRate);
        }

        return res.status(200).json({
            message: `${createdRates.length} shipping rates created`,
            error: false,
            success: true,
            data: createdRates
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
});

// Get all
shippingRateRouter.get('/', async (req, res) => {
    try {
        const shippingRates = await ShippingRateModel.find().sort({ displayOrder: 1, createdAt: -1 });
        return res.status(200).json({
            message: "Shipping rates fetched",
            error: false,
            success: true,
            data: shippingRates
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
});

// Get by ID
shippingRateRouter.get('/:id', async (req, res) => {
    try {
        const shippingRate = await ShippingRateModel.findById(req.params.id);
        if (!shippingRate) {
            return res.status(404).json({
                message: "Not found",
                error: true,
                success: false
            });
        }
        return res.status(200).json({
            message: "Fetched",
            error: false,
            success: true,
            data: shippingRate
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
});

// Lookup by country
shippingRateRouter.get('/lookup/country', async (req, res) => {
    try {
        const { countryCode } = req.query;
        
        let query = {};
        if (countryCode) {
            query = { 
                $or: [
                    { countryCode: countryCode.toUpperCase() }
                ],
                isActive: true 
            };
        }

        const shippingRate = await ShippingRateModel.findOne(query);
        
        if (!shippingRate) {
            return res.status(404).json({
                message: "No shipping rate found",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "OK",
            error: false,
            success: true,
            data: shippingRate
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
});

// Create
shippingRateRouter.post('/create', auth, async (req, res) => {
    try {
        const { country, countryCode, pricingType, flatRate, freeShippingThreshold, estimatedDeliveryDays, currency, isActive } = req.body;

        const existingRate = await ShippingRateModel.findOne({
            $or: [
                { country: { $regex: new RegExp(`^${country}$`, 'i') } },
                { countryCode: countryCode?.toUpperCase() }
            ]
        });

        if (existingRate) {
            return res.status(400).json({
                message: "Already exists",
                error: true,
                success: false
            });
        }

        const shippingRate = new ShippingRateModel({
            country,
            countryCode: countryCode?.toUpperCase(),
            pricingType,
            flatRate: flatRate || 0,
            freeShippingThreshold,
            estimatedDeliveryDays,
            currency: currency || 'USD',
            isActive: isActive !== false
        });

        await shippingRate.save();

        return res.status(200).json({
            message: "Created",
            error: false,
            success: true,
            data: shippingRate
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
});

// Update
shippingRateRouter.put('/:id', auth, async (req, res) => {
    try {
        const shippingRate = await ShippingRateModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!shippingRate) {
            return res.status(404).json({
                message: "Not found",
                error: true,
                success: false
            });
        }

        return res.status(200).json({
            message: "Updated",
            error: false,
            success: true,
            data: shippingRate
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
});

// Delete single
shippingRateRouter.delete('/:id', async (req, res) => {
    try {
        const shippingRate = await ShippingRateModel.findByIdAndDelete(req.params.id);
        if (!shippingRate) {
            return res.status(404).json({
                message: "Not found",
                error: true,
                success: false
            });
        }
        return res.status(200).json({
            message: "Deleted",
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
});

// Toggle
shippingRateRouter.put('/:id/toggle', auth, async (req, res) => {
    try {
        const shippingRate = await ShippingRateModel.findById(req.params.id);
        if (!shippingRate) {
            return res.status(404).json({
                message: "Not found",
                error: true,
                success: false
            });
        }

        shippingRate.isActive = !shippingRate.isActive;
        await shippingRate.save();

        return res.status(200).json({
            message: `Changed to ${shippingRate.isActive ? 'active' : 'inactive'}`,
            error: false,
            success: true,
            data: shippingRate
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
            error: true,
            success: false
        });
    }
});

export default shippingRateRouter;