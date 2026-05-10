import mongoose from "mongoose";

const newsletterSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, "Provide email"],
        unique: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["active", "unsubscribed"],
        default: "active"
    }
});

const Newsletter = mongoose.model("newsletter", newsletterSchema);

export default Newsletter;