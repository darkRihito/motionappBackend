import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  key: String,
  value: mongoose.Schema.Types.Mixed
});

const settingsModel = mongoose.model('Settings', settingsSchema);
export default settingsModel;