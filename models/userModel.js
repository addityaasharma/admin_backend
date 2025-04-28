import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
    },
    password : {
        type : String,
        required : true,
    },
    // panelData : {
    //     type : Object,
    //     default : {}
    // },
})

export const userAuth = mongoose.model('Credentials',userSchema);
