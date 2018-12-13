var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const treeSchema = new Schema({
    geometry: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  });
  

module.exports = mongoose.model('point', treeSchema);