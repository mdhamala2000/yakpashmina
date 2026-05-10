import ShippingRateModel from '../models/shippingRate.model.js';

export async function createShippingRate(request, response) {
    try {
        const {
            country,
            countryCode,
            regions,
            pricingType,
            flatRate,
            freeShippingThreshold,
            estimatedDeliveryDays,
            currency,
            displayOrder
        } = request.body;

        const existingRate = await ShippingRateModel.findOne({
            $or: [
                { country: { $regex: new RegExp(`^${country}$`, 'i') } },
                { countryCode: countryCode?.toUpperCase() }
            ]
        });

        if (existingRate) {
            return response.status(400).json({
                message: "Shipping rate for this country already exists",
                error: true,
                success: false
            });
        }

        const shippingRate = new ShippingRateModel({
            country,
            countryCode: countryCode?.toUpperCase(),
            regions: regions || [],
            pricingType,
            flatRate: flatRate || 0,
            freeShippingThreshold,
            estimatedDeliveryDays,
            currency: currency || 'USD',
            displayOrder: displayOrder || 0
        });

        await shippingRate.save();

        return response.status(200).json({
            message: "Shipping rate created successfully",
            error: false,
            success: true,
            data: shippingRate
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function getShippingRates(request, response) {
    try {
        const shippingRates = await ShippingRateModel.find().sort({ displayOrder: 1, createdAt: -1 });
        return response.status(200).json({
            message: "Shipping rates fetched successfully",
            error: false,
            success: true,
            data: shippingRates
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function getShippingRate(request, response) {
    try {
        const shippingRate = await ShippingRateModel.findById(request.params.id);
        if (!shippingRate) {
            return response.status(404).json({
                message: "Shipping rate not found",
                error: true,
                success: false
            });
        }
        return response.status(200).json({
            message: "Shipping rate fetched successfully",
            error: false,
            success: true,
            data: shippingRate
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function updateShippingRate(request, response) {
    try {
        const {
            country,
            countryCode,
            regions,
            pricingType,
            flatRate,
            freeShippingThreshold,
            estimatedDeliveryDays,
            currency,
            displayOrder,
            isActive
        } = request.body;

        const existingRate = await ShippingRateModel.findOne({
            $or: [
                { country: { $regex: new RegExp(`^${country}$`, 'i') } },
                { countryCode: countryCode?.toUpperCase() }
            ],
            _id: { $ne: request.params.id }
        });

        if (existingRate) {
            return response.status(400).json({
                message: "Shipping rate for this country already exists",
                error: true,
                success: false
            });
        }

        const shippingRate = await ShippingRateModel.findByIdAndUpdate(
            request.params.id,
            {
                country,
                countryCode: countryCode?.toUpperCase(),
                regions: regions || [],
                pricingType,
                flatRate: flatRate || 0,
                freeShippingThreshold,
                estimatedDeliveryDays,
                currency: currency || 'USD',
                displayOrder: displayOrder || 0,
                isActive
            },
            { new: true }
        );

        if (!shippingRate) {
            return response.status(404).json({
                message: "Shipping rate not found",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            message: "Shipping rate updated successfully",
            error: false,
            success: true,
            data: shippingRate
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function deleteShippingRate(request, response) {
    try {
        const shippingRate = await ShippingRateModel.findByIdAndDelete(request.params.id);
        if (!shippingRate) {
            return response.status(404).json({
                message: "Shipping rate not found",
                error: true,
                success: false
            });
        }
        return response.status(200).json({
            message: "Shipping rate deleted successfully",
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function getShippingRateByCountry(request, response) {
    try {
        const { country, countryCode } = request.query;
        
        let query = {};
        if (countryCode) {
            query.$or = [
                { countryCode: countryCode.toUpperCase() },
                { country: { $regex: new RegExp(`^${country}$`, 'i') } }
            ];
        } else if (country) {
            query.country = { $regex: new RegExp(`^${country}$`, 'i') };
        }

        const shippingRate = await ShippingRateModel.findOne({ ...query, isActive: true });
        
        if (!shippingRate) {
            return response.status(404).json({
                message: "No shipping rate found for this destination",
                error: true,
                success: false
            });
        }

        return response.status(200).json({
            message: "Shipping rate fetched successfully",
            error: false,
            success: true,
            data: shippingRate
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function quickSetupShippingRates(request, response) {
    try {
        const { countries, pricingType, flatRate, freeShippingThreshold, estimatedDeliveryDays, currency, isActive } = request.body;

        if (!countries || !Array.isArray(countries) || countries.length === 0) {
            return response.status(400).json({
                message: "Countries array required",
                error: true,
                success: false
            });
        }

        const countryNames = {
            AF: "Afghanistan", AL: "Albania", DZ: "Algeria", AR: "Argentina", AM: "Armenia", AU: "Australia",
            AT: "Austria", AZ: "Azerbaijan", BH: "Bahrain", BD: "Bangladesh", BY: "Belarus", BE: "Belgium",
            BT: "Bhutan", BO: "Bolivia", BA: "Bosnia", BR: "Brazil", BN: "Brunei", BG: "Bulgaria",
            KH: "Cambodia", CM: "Cameroon", CA: "Canada", CL: "Chile", CN: "China", CO: "Colombia",
            CR: "Costa Rica", HR: "Croatia", CU: "Cuba", CY: "Cyprus", CZ: "Czech Republic", DK: "Denmark",
            DO: "Dominican Republic", EC: "Ecuador", EG: "Egypt", SV: "El Salvador", EE: "Estonia", ET: "Ethiopia",
            FJ: "Fiji", FI: "Finland", FR: "France", GE: "Georgia", DE: "Germany", GH: "Ghana",
            GR: "Greece", GT: "Guatemala", HN: "Honduras", HK: "Hong Kong", HU: "Hungary", IS: "Iceland",
            IN: "India", ID: "Indonesia", IR: "Iran", IQ: "Iraq", IE: "Ireland", IL: "Israel", IT: "Italy",
            JM: "Jamaica", JP: "Japan", JO: "Jordan", KZ: "Kazakhstan", KE: "Kenya", KW: "Kuwait",
            KG: "Kyrgyzstan", LA: "Laos", LV: "Latvia", LB: "Lebanon", LT: "Lithuania", LU: "Luxembourg",
            MO: "Macau", MK: "Macedonia", MY: "Malaysia", MV: "Maldives", MT: "Malta", MX: "Mexico",
            MD: "Moldova", MN: "Mongolia", ME: "Montenegro", MA: "Morocco", MM: "Myanmar", NP: "Nepal",
            NL: "Netherlands", NZ: "New Zealand", NI: "Nicaragua", NG: "Nigeria", KP: "North Korea", NO: "Norway",
            OM: "Oman", PK: "Pakistan", PA: "Panama", PY: "Paraguay", PE: "Peru", PH: "Philippines",
            PL: "Poland", PT: "Portugal", QA: "Qatar", RO: "Romania", RU: "Russia", SA: "Saudi Arabia",
            RS: "Serbia", SG: "Singapore", SK: "Slovakia", SI: "Slovenia", SO: "Somalia", ZA: "South Africa",
            KR: "South Korea", ES: "Spain", LK: "Sri Lanka", SD: "Sudan", SE: "Sweden", CH: "Switzerland",
            SY: "Syria", TW: "Taiwan", TJ: "Tajikistan", TZ: "Tanzania", TH: "Thailand", TN: "Tunisia",
            TR: "Turkey", TM: "Turkmenistan", UA: "Ukraine", AE: "United Arab Emirates", GB: "United Kingdom",
            US: "United States", UY: "Uruguay", UZ: "Uzbekistan", VE: "Venezuela", VN: "Vietnam",
            YE: "Yemen", ZM: "Zambia", ZW: "Zimbabwe"
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

        return response.status(200).json({
            message: `${createdRates.length} shipping rates created`,
            error: false,
            success: true,
            data: createdRates
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function deleteAllShippingRates(request, response) {
    try {
        await ShippingRateModel.deleteMany({});
        return response.status(200).json({
            message: "All shipping rates deleted",
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function toggleShippingRateStatus(request, response) {
    try {
        const shippingRate = await ShippingRateModel.findById(request.params.id);
        if (!shippingRate) {
            return response.status(404).json({
                message: "Shipping rate not found",
                error: true,
                success: false
            });
        }

        shippingRate.isActive = !shippingRate.isActive;
        await shippingRate.save();

        return response.status(200).json({
            message: `Shipping rate ${shippingRate.isActive ? 'activated' : 'deactivated'} successfully`,
            error: false,
            success: true,
            data: shippingRate
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}