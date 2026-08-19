// Constantes & Elementos DOM
const API_URL = '/api/contacts';

const contactsGrid = document.getElementById('contacts-grid');
const loadingSpinner = document.getElementById('loading-spinner');
const emptyState = document.getElementById('empty-state');
const totalCount = document.getElementById('total-count');
const alertContainer = document.getElementById('alert-container');

// Buscador
const searchInput = document.getElementById('search-input');
const btnClearSearch = document.getElementById('btn-clear-search');

// Modal Formulario
const contactModal = document.getElementById('contact-modal');
const modalTitle = document.getElementById('modal-title');
const contactForm = document.getElementById('contact-form');
const contactIdInput = document.getElementById('contact-id');
const btnOpenCreate = document.getElementById('btn-open-create');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancel = document.getElementById('btn-cancel');
const btnSubmitText = document.getElementById('btn-submit-text');

// Modal Eliminar
const deleteModal = document.getElementById('delete-modal');
const deleteContactName = document.getElementById('delete-contact-name');
const btnCancelDelete = document.getElementById('btn-cancel-delete');
const btnConfirmDelete = document.getElementById('btn-confirm-delete');

let contactToDeleteId = null;
let searchDebounceTimeout = null;

// 1. CARGA Y RENDERIZADO DE CONTACTOS (GET)


async function fetchContacts(search = '') {
  showLoading(true);
  try {
    const url = search ? `${API_URL}?search=${encodeURIComponent(search)}` : API_URL;
    const res = await fetch(url);
    const result = await res.json();

    if (!res.ok) throw new Error(result.message || 'Error al cargar contactos');

    const contacts = result.data || [];
    renderContacts(contacts);
    totalCount.textContent = contacts.length;
  } catch (error) {
    showAlert(error.message, 'danger');
    renderContacts([]);
  } finally {
    showLoading(false);
  }
}

function renderContacts(contacts) {
  contactsGrid.innerHTML = '';

  if (contacts.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  contacts.forEach((contact) => {
    const initial = contact.nombre ? contact.nombre.charAt(0).toUpperCase() : '?';
    const card = document.createElement('div');
    card.className = 'contact-card';
    card.innerHTML = `
      <div>
        <div class="card-top">
          <div class="avatar">${initial}</div>
          <div class="contact-info">
            <h3>${escapeHtml(contact.nombre)}</h3>
            <span class="contact-company">${contact.empresa ? escapeHtml(contact.empresa) : 'Sin empresa'}</span>
          </div>
        </div>
        <div class="card-details">
          <p><i class="fa-solid fa-phone"></i> ${escapeHtml(contact.telefono)}</p>
          <p><i class="fa-solid fa-envelope"></i> ${escapeHtml(contact.correo)}</p>
          ${contact.notas ? `<div class="notes-box"><i class="fa-regular fa-note-sticky"></i> ${escapeHtml(contact.notas)}</div>` : ''}
        </div>
      </div>
      <div class="card-actions">
        <button class="btn btn-secondary btn-edit" data-id="${contact._id}">
          <i class="fa-solid fa-pen-to-square"></i> Editar
        </button>
        <button class="btn btn-danger btn-delete" data-id="${contact._id}" data-name="${escapeHtml(contact.nombre)}">
          <i class="fa-solid fa-trash-can"></i> Eliminar
        </button>
      </div>
    `;
    contactsGrid.appendChild(card);
  });

  // Listeners para botones dentro de las tarjetas
  document.querySelectorAll('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.id));
  });

  document.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => openDeleteModal(btn.dataset.id, btn.dataset.name));
  });
}


// 2. CREAR Y ACTUALIZAR (POST & PUT)


contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const id = contactIdInput.value;
  const payload = {
    nombre: document.getElementById('nombre').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    correo: document.getElementById('correo').value.trim(),
    empresa: document.getElementById('empresa').value.trim(),
    notas: document.getElementById('notas').value.trim(),
  };

  // Validación básica del lado del cliente
  let hasError = false;
  if (!payload.nombre) {
    showInputError('nombre', 'El nombre es obligatorio');
    hasError = true;
  }
  if (!payload.telefono) {
    showInputError('telefono', 'El teléfono es obligatorio');
    hasError = true;
  }
  if (!payload.correo) {
    showInputError('correo', 'El correo es obligatorio');
    hasError = true;
  }
  if (hasError) return;

  try {
    const isEdit = Boolean(id);
    const url = isEdit ? `${API_URL}/${id}` : API_URL;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || 'Error al procesar la solicitud');
    }

    showAlert(
      isEdit ? 'Contacto actualizado exitosamente' : 'Contacto creado exitosamente',
      'success'
    );
    closeContactModal();
    fetchContacts(searchInput.value.trim());
  } catch (error) {
    showAlert(error.message, 'danger');
  }
});


// 3. ELIMINAR CONTACTO (DELETE)


btnConfirmDelete.addEventListener('click', async () => {
  if (!contactToDeleteId) return;

  try {
    const res = await fetch(`${API_URL}/${contactToDeleteId}`, {
      method: 'DELETE',
    });
    const result = await res.json();

    if (!res.ok) throw new Error(result.message || 'Error al eliminar');

    showAlert('Contacto eliminado correctamente', 'success');
    closeDeleteModal();
    fetchContacts(searchInput.value.trim());
  } catch (error) {
    showAlert(error.message, 'danger');
    closeDeleteModal();
  }
});


// 4. BÚSQUEDA Y FILTRADO


searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  btnClearSearch.classList.toggle('hidden', query === '');

  
  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    fetchContacts(query);
  }, 300);
});

btnClearSearch.addEventListener('click', () => {
  searchInput.value = '';
  btnClearSearch.classList.add('hidden');
  fetchContacts();
});


// 5. MANEJO DE MODALES Y UI


function openCreateModal() {
  contactForm.reset();
  contactIdInput.value = '';
  modalTitle.textContent = 'Nuevo Contacto';
  btnSubmitText.textContent = 'Guardar Contacto';
  clearErrors();
  contactModal.classList.remove('hidden');
}

async function openEditModal(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const result = await res.json();

    if (!res.ok) throw new Error(result.message);

    const contact = result.data;
    contactIdInput.value = contact._id;
    document.getElementById('nombre').value = contact.nombre || '';
    document.getElementById('telefono').value = contact.telefono || '';
    document.getElementById('correo').value = contact.correo || '';
    document.getElementById('empresa').value = contact.empresa || '';
    document.getElementById('notas').value = contact.notas || '';

    modalTitle.textContent = 'Editar Contacto';
    btnSubmitText.textContent = 'Guardar Cambios';
    clearErrors();
    contactModal.classList.remove('hidden');
  } catch (error) {
    showAlert(error.message, 'danger');
  }
}

function closeContactModal() {
  contactModal.classList.add('hidden');
}

function openDeleteModal(id, name) {
  contactToDeleteId = id;
  deleteContactName.textContent = `¿Estás seguro de eliminar a "${name}"?`;
  deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  contactToDeleteId = null;
  deleteModal.classList.add('hidden');
}

btnOpenCreate.addEventListener('click', openCreateModal);
btnCloseModal.addEventListener('click', closeContactModal);
btnCancel.addEventListener('click', closeContactModal);
btnCancelDelete.addEventListener('click', closeDeleteModal);


// UTILIDADES


function showLoading(show) {
  loadingSpinner.classList.toggle('hidden', !show);
  if (show) {
    contactsGrid.innerHTML = '';
    emptyState.classList.add('hidden');
  }
}

function showAlert(message, type = 'success') {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}">
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
      ${escapeHtml(message)}
    </div>
  `;
  setTimeout(() => {
    alertContainer.innerHTML = '';
  }, 4000);
}

function showInputError(fieldId, message) {
  const errorElement = document.getElementById(`error-${fieldId}`);
  if (errorElement) errorElement.textContent = message;
}

function clearErrors() {
  document.querySelectorAll('.error-msg').forEach((el) => (el.textContent = ''));
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


document.addEventListener('DOMContentLoaded', () => fetchContacts());