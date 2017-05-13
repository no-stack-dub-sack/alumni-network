import express from 'express';
import Dropdown from '../models/dropdown';

const router = express.Router();

router.post('/api/add-dropdown-item', (req, res) => {
  const { id, item } = req.body;
  Dropdown.findOne({ id: id }, (err, dropdown) => {
    if (err) console.log(err);
    else {
      dropdown.items.push(item);
      dropdown.save();
      console.log(`${item.value} added to ${id} dropdown options`);
    }
  });
});

router.post('/api/populate-dropdown', (req, res) => {
  const { id } = req.body;
  Dropdown.findOne({ id: id }, (err, dropdown) => {
    const { items } = dropdown;
    if (err) console.log(err);
    else {
      res.send({ items });
    }
  })
})

export default router;
