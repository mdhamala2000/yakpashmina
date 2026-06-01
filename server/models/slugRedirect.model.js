import mongoose from 'mongoose';

const slugRedirectSchema = mongoose.Schema({
    oldSlug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    newSlug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    entityType: {
        type: String,
        enum: ['category', 'subcategory', 'product'],
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'entityType'
    },
    httpStatus: {
        type: Number,
        default: 301 // Permanent redirect
    },
    hits: {
        type: Number,
        default: 0
    },
    lastHit: {
        type: Date
    }
}, { timestamps: true });

// Unique index on oldSlug + entityType
slugRedirectSchema.index(
    { oldSlug: 1, entityType: 1 },
    { unique: true, name: 'unique_slug_redirect' }
);

// Static method to find and record redirect
slugRedirectSchema.statics.findAndRecord = async function(slug, entityType) {
    const redirect = await this.findOne({
        oldSlug: slug.toLowerCase(),
        entityType: entityType
    });

    if (redirect) {
        // Record the hit
        redirect.hits += 1;
        redirect.lastHit = new Date();
        await redirect.save();

        return {
            redirect: true,
            newSlug: redirect.newSlug,
            httpStatus: redirect.httpStatus
        };
    }

    return { redirect: false };
};

const SlugRedirectModel = mongoose.model('SlugRedirect', slugRedirectSchema);

export default SlugRedirectModel;