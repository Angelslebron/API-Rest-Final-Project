const express = require('express');
const router = express.Router();

const {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');

// Rutas para /api/contacts
router.route('/')
  .get(getContacts)
  .post(createContact);

// Rutas para /api/contacts/:id
router.route('/:id')
  .get(getContactById)
  .put(updateContact)
  .delete(deleteContact);

module.exports = router;