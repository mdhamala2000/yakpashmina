import mongoose from "mongoose";

const processedWebhookEventSchema = new mongoose.Schema({
    eventId: {
        type: String,
        required: true,
        unique: true
    },
    source: {
        type: String,
        enum: ['stripe', 'paypal', 'airwallex'],
        required: true
    },
    processedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

processedWebhookEventSchema.index({ processedAt: 1 }, { expireAfterSeconds: 86400 });

const ProcessedWebhookEvent = mongoose.model('ProcessedWebhookEvent', processedWebhookEventSchema);

export default ProcessedWebhookEvent;
