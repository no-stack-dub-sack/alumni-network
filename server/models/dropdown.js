import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Dropdown = new Schema({
  id: String,
  items: [{
    key: String,
    text: String,
    value: String
  }]
});

export default mongoose.model('Dropdown', Dropdown);
