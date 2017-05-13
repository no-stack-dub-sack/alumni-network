import DROPDOWNS from './dropdownData';
import Dropdown from '../models/dropdown';

(function populateDropdowns() {
  DROPDOWNS.forEach(dropdownTemplate => {
    const { id, items } = dropdownTemplate;
    Dropdown.findOne({ id: id }, (err, dropdown) => {
      if (err) console.log(err);
      else if (!dropdown) {
        dropdown = new Dropdown({
          id: id,
          items: items
        });
        dropdown.save();
        console.log(`populated ${id} dropdown data`);
      }
    })
  });
})();
