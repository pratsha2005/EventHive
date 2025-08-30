<<<<<<< HEAD
=======
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log('Database Connected Successfully')
    } catch (error) {
        console.error('Database Connection Failed: ', error)
        process.exit(1)
    }
}

export default connectDB;
>>>>>>> 64fc7097ca263c340b77a14100b26714cb14b739
