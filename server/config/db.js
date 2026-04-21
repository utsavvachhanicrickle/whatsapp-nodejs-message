import mongoose from 'mongoose';

const coonectionDB = async()=>{
    try {
        const response = await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongodb connected");
    } catch (error) {
        console.log("mongodb is not connecting",error)
    }
}

export default coonectionDB;