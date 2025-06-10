const mongoose = require('mongoose');

const MapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  geojson: {
    type: Object,
    required: true
  },
  style: {
    type: String,
    default: 'mapbox://styles/mapbox/streets-v11'
  },
  center: {
    lng: { type: Number, required: true },
    lat: { type: Number, required: true }
  },
  zoom: {
    type: Number,
    default: 9
  },
  isDraft: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Map', MapSchema);