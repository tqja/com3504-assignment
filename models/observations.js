let mongoose = require('mongoose');

let Schema = mongoose.Schema;

const locationSchema = new Schema({
    latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
    },
    longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
    }
});

const commentSchema = new Schema({
    username: {
        type: String,
        required: true,
        immutable: true
    },
    comment: {
        type: String,
        required: true,
        immutable: true
    },
    timestamp: {
        type: Date, required: true, immutable: true, max: Date.now()
    }
});

let ObservationSchema = new Schema(
    {
        nickname: {
            type: String, required: true, immutable: true
        },
        image: {
            type: Buffer, required: true, immutable: true
        },
        name: {
            type: String, required: true, maxLength: 100
        },
        status: {
            type: String,
            enum: ["In_progress", "Completed"],
            required: true,
            default: "In_progress"
        },
        dateSeen: {
            type: Date, required: true, immutable: true, max: Date.now()
        },
        description: {
            type: String, required: true, immutable: true, maxLength: 2500
        },
        location: {
            type: locationSchema,
            required: true,
            immutable: true
        },
        comments: [commentSchema],
        height: {
            type: String,
            enum: ['NA', '<0.1m', '0.1-0.5m', '0.5-1m', '1-2m', '2-4m', '4-8m', '8+m'],
            default: 'NA',
            required: true,
            immutable: true
        },
        spread: {
            type: String,
            enum: ['NA', '<0.1m', '0.1-0.5m', '0.5-1m', '1-2m', '2-4m', '4-8m', '8+m'],
            default: 'NA',
            required: true,
            immutable: true
        },
        sunlight: {
            type: String,
            enum: ['NA','Shaded', 'Dappled', 'Partial', 'Full'],
            default: 'NA',
            required: true,
            immutable: true
        },
        soilType: {
            type: String,
            enum: ['NA', 'Chalk', 'Clay', 'Loam', 'Sand'],
            default: 'NA',
            required: true,
            immutable: true
        },
        flowering: { type: Boolean, default: false, immutable: true },
        fragrant:  { type: Boolean, default: false, immutable: true },
        fruiting:  { type: Boolean, default: false, immutable: true },
        native:    { type: Boolean, default: false, immutable: true }
    }
);

ObservationSchema.set('toObject', { getters: true, virtuals: true });

let Observation = mongoose.model('observations', ObservationSchema);

module.exports = Observation;