import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()


if (!process.env.MONGODB_URI) {
    throw new Error(
        "Please provide MONGODB_URI in the .env file"
    )
}

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("connect DB")
        
        // Fix orphaned handle index on startup
        try {
            const db = mongoose.connection.db;
            const collection = db.collection('products');
            const indexes = await collection.indexes();
            
            for (const idx of indexes) {
                if (idx.name.includes('handle')) {
                    await collection.dropIndex(idx.name);
                    console.log('Dropped orphaned index:', idx.name);
                }
            }
        } catch (idxError) {
            console.log('Index fix:', idxError.message);
        }
    } catch (error) {
        console.log("Mongodb connect error", error)
        process.exit(1);
    }
}

export default connectDB;