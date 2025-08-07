const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true,
    default: 'Bright Minds Academy'
  },
  email: {
    type: String,
    required: true,
    default: 'info@brightminds.edu'
  },
  phone: {
    type: String,
    default: '(555) 123-4567'
  },
  address: {
    type: String,
    default: '123 Education Lane\nAcademic City, AC 12345'
  },
  website: {
    type: String,
    default: 'https://brightminds.edu'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create a single settings document if it doesn't exist
settingSchema.statics.initializeSettings = async function(userId) {
  const count = await this.countDocuments();
  if (count === 0) {
    return this.create({
      updatedBy: userId
    });
  }
};

module.exports = mongoose.model('Setting', settingSchema);
