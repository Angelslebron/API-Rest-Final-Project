const express = require('express');const router = express.Router();

const {

  getContacts,

  getContactById,

  createContact,

  updateContact,

  deleteContact,

} = require('../controllers/contactController');


router.route('/')

  .get(getContacts)      // GET    /api/contacts?search=texto  .post(createContact);  // POST   /api/contacts

router.route('/:id')

  .get(getContactById)   // GET    /api/contacts/:id  .put(updateContact)    // PUT    /api/contacts/:id  .delete(deleteContact); // DELETE /api/contacts/:id

module.exports = router;