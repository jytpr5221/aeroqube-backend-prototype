import mongoose from "mongoose";


const imageSchema = new mongoose.Schema({

    filename: {
        type: String,
        required: true
    },
    local_path: {
        type: String,
        required: true
    },
    position:{
        type: Number,
        required: true
    },
    url:{
        type: String,
        required: true
    }
})
// const translatedSchema = new mongoose.Schema({
//     language: {
//         type: String,
//         required: true
//     },
//     translatedText: {
//         type: String,
//         required: true
//     },
//     audioFile:{
//         type:String,
//         // required:true
//     }
// }) 
const newsSchema = new mongoose.Schema({

    headline:{
        type:String,
        required:true,
       
    },
    content:{
        type:String,
        required:true
    },
    summary:{
        type:String,
        required:true
    },
    extraction_time:{
        type:Date,
        validate: {
            validator: function (value) {
                return value instanceof Date && !isNaN(value);
            },
            message: 'scrappedAt must be a valid date'
        },

    },
    publication_date:{
        type:Date,
        validate: {
            validator: function (value) {
                return value instanceof Date && !isNaN(value);
            },
            message: 'publication_date must be a valid date'
        },
    },
    publication_time: {
        type: String,
        validate: {
            validator: function (value) {
                return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(value);
            },
            message: 'publication_time must be in HH:mm:ss format'
        }
    },
    
    category:{
        type:String,
        required:true
    },
    source:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    images:[
        imageSchema
    ],

    main_image:{
        imageSchema
    },
    // translatedNews:[translatedSchema],

    voice_file:{
        cloud_url:{
            type:String,
            // required:true
        },
        local_path:{
            type:String,
            // required:true
        },
    },
    tags:{
        type:[String],
        // required:true
    },
    status:{
        type:String,
        enum:['pending','published'],
        default:'pending'
    },
},{timestamps:true})


export const News = mongoose.model("News", newsSchema);