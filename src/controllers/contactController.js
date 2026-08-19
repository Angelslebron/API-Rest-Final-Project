const Contact = require('../models/Contact');

// @desc    Obtener todos los contactos (con búsqueda opcional por ?search=)// @route   GET /api/contactsconst getContacts = async (req, res) => {

  try {

    const { search } = req.query;

    let filter = {};


    if (search) {

      const regex = new RegExp(search, 'i');

      filter = {

        $or: [

          { nombre: regex },

          { correo: regex },

          { empresa: regex },

          { telefono: regex },

        ],

      };

    }


    const contacts = await Contact.find(filter).sort({ createdAt: -1 });


    res.status(200).json({

      success: true,

      count: contacts.length,

      data: contacts,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: 'Error al obtener los contactos',

      error: error.message,

    });

  }

};

// @desc    Obtener un contacto por su ID// @route   GET /api/contacts/:idconst getContactById = async (req, res) => {

  try {

    const contact = await Contact.findById(req.params.id);


    if (!contact) {

      return res.status(404).json({ success: false, message: 'Contacto no encontrado' });

    }


    res.status(200).json({ success: true, data: contact });

  } catch (error) {

    if (error.kind === 'ObjectId') {

      return res.status(400).json({ success: false, message: 'ID de contacto inválido' });

    }

    res.status(500).json({

      success: false,

      message: 'Error al obtener el contacto',

      error: error.message,

    });

  }

};

// @desc    Crear un nuevo contacto// @route   POST /api/contactsconst createContact = async (req, res) => {

  try {

    const { nombre, telefono, correo, empresa, notas } = req.body;


    const newContact = await Contact.create({ nombre, telefono, correo, empresa, notas });


    res.status(201).json({ success: true, data: newContact });

  } catch (error) {

    if (error.name === 'ValidationError') {

      const messages = Object.values(error.errors).map((val) => val.message);

      return res.status(400).json({ success: false, message: messages.join(', ') });

    }

    res.status(500).json({

      success: false,

      message: 'Error al crear el contacto',

      error: error.message,

    });

  }

};

// @desc    Actualizar un contacto existente// @route   PUT /api/contacts/:idconst updateContact = async (req, res) => {

  try {

    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {

      new: true,

      runValidators: true,

    });


    if (!contact) {

      return res.status(404).json({ success: false, message: 'Contacto no encontrado' });

    }


    res.status(200).json({ success: true, data: contact });

  } catch (error) {

    if (error.name === 'ValidationError') {

      const messages = Object.values(error.errors).map((val) => val.message);

      return res.status(400).json({ success: false, message: messages.join(', ') });

    }

    if (error.kind === 'ObjectId') {

      return res.status(400).json({ success: false, message: 'ID de contacto inválido' });

    }

    res.status(500).json({

      success: false,

      message: 'Error al actualizar el contacto',

      error: error.message,

    });

  }

};

// @desc    Eliminar un contacto// @route   DELETE /api/contacts/:idconst deleteContact = async (req, res) => {

  try {

    const contact = await Contact.findByIdAndDelete(req.params.id);


    if (!contact) {

      return res.status(404).json({ success: false, message: 'Contacto no encontrado' });

    }


    res.status(200).json({

      success: true,

      message: 'Contacto eliminado correctamente',

      data: contact,

    });

  } catch (error) {

    if (error.kind === 'ObjectId') {

      return res.status(400).json({ success: false, message: 'ID de contacto inválido' });

    }

    res.status(500).json({

      success: false,

      message: 'Error al eliminar el contacto',

      error: error.message,

    });

  }

};


module.exports = {

  getContacts,

  getContactById,

  createContact,

  updateContact,

  deleteContact,

};