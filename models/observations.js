let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let ObservationSchema = new Schema(
    {
        posterNickname: { type: String, required: true, immutable: true },
        image: { type: Buffer, required: true, immutable: true },
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
            type: String,
            required: true,
            immutable: true
        },
        comments: [{ username: String, comment: String, timestamp: Date }],
        height: { type: Number, immutable: true }, // Make into enums...
        spread: { type: Number, immutable: true }, // ...
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
        flowering: { type: Boolean, immutable: true },
        fragrant: { type: Boolean, immutable: true },
        fruiting: { type: Boolean, immutable: true },
        native: { type: Boolean, immutable: true }
    }
);

ObservationSchema.set('toObject', { getters: true, virtuals: true });

let Observation = mongoose.model('observations', ObservationSchema);

module.exports = Observation;