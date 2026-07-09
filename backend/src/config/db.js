import mongoose from "mongoose";


export const connectDB = async () => {
    try {
       await mongoose.connect(process.env.MONGO_URI)
       console.log("MONGODB CONNECTED SUCCESSFULLY!")

    } catch(err) {
        console.error("Error Connecting to MONGODB", err);
        process.exit(1);  //exit with failure   0 is sucess
    }

};