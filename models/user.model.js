import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required:true,
    }    ,
    appliedJobs: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Job' // Reference to the Job model
        }
      ]      
},{timestamps:true});
export const User = mongoose.model('User', userSchema);