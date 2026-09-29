import dns from 'dns';
import mongoose from 'mongoose';

dns.setServers(['1.1.1.1']);

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MONGODB CONNECTED SUCCESSFULLY!");
    } catch (err) {
        console.error("Error Connecting to MONGODB", err);
        process.exit(1); // 0 = success
    }
};
