import mongoose from "mongoose";

export const dbConnection = async () => {  

    const MONGODB_URL = process.env.MONGODB_URL
    try {
        const db = await mongoose.connect(MONGODB_URL)
        console.log(`MongoDB connected: ${db.connection.host}`)
    } catch (error) {
        console.log(`Error: ${error.message}`)
        process.exit(1)
    }
}
