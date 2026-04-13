const API_URL = "https://api-usuarios-sg0g.onrender.com/users";

const userForm = document.getElementById("user-form");
const userIdInput = document.getElementById("user-id");
const nombreInput = document.getElementById("nombre");
const emailInput = document.getElementById("email");
const edadInput = document.getElementById("edad");
const activoInput = document.getElementById("activo");
const usersTableBody = document.getElementById("users-table-body");
const messageElement = document.getElementById("message");
const formTitle = document.getElementById("form-title");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
const reloadBtn = document.getElementById("reload-btn");

function showMessage(text, type = "success") {
  messageElement.textContent = text;
  messageElement.className = `message ${type}`;

  setTimeout(() => {
    messageElement.textContent = "";
    messageElement.className = "message";
  }, 3000);
}

function resetForm() {
  userForm.reset();
  userIdInput.value = "";
  formTitle.textContent = "Crear usuario";
  saveBtn.textContent = "Guardar usuario";
  cancelBtn.classList.add("hidden");
}

function validateUser(user) {
  if (!user.nombre.trim()) {
    throw new Error("El nombre es obligatorio.");
  }

  if (!user.email.trim()) {
    throw new Error("El email es obligatorio.");
  }

  if (!user.email.includes("@")) {
    throw new Error("El email no parece válido.");
  }

  if (Number(user.edad) <= 0 || Number.isNaN(Number(user.edad))) {
    throw new Error("La edad debe ser mayor que 0.");
  }
}

async function getUsers() {
  try {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty">Cargando usuarios...</td>
      </tr>
    `;

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("No se pudieron cargar los usuarios.");
    }

    const users = await response.json();
    renderUsers(users);
  } catch (error) {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty">Error al cargar usuarios</td>
      </tr>
    `;
    showMessage(error.message, "error");
  }
}

function renderUsers(users) {
  if (!Array.isArray(users) || users.length === 0) {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty">No hay usuarios registrados.</td>
      </tr>
    `;
    return;
  }

  usersTableBody.innerHTML = users
    .map(
      (user) => `
        <tr>
          <td>${user.id}</td>
          <td>${user.nombre}</td>
          <td>${user.email}</td>
          <td>${user.edad}</td>
          <td class="${user.activo ? "status-active" : "status-inactive"}">
            ${user.activo ? "Sí" : "No"}
          </td>
          <td>
            <button class="btn edit" onclick="editUser(${user.id}, '${escapeSingleQuotes(user.nombre)}', '${escapeSingleQuotes(user.email)}', ${user.edad}, ${user.activo})">
              Editar
            </button>
            <button class="btn delete" onclick="deleteUser(${user.id})">
              Eliminar
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

function escapeSingleQuotes(text) {
  return String(text).replace(/'/g, "\\'");
}

userForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userData = {
    nombre: nombreInput.value.trim(),
    email: emailInput.value.trim(),
    edad: Number(edadInput.value),
    activo: activoInput.checked,
  };

  try {
    validateUser(userData);

    const id = userIdInput.value;
    const isEditing = Boolean(id);

    const response = await fetch(isEditing ? `${API_URL}/${id}` : API_URL, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.mensaje || "Ocurrió un error al guardar el usuario.");
    }

    showMessage(
      isEditing ? "Usuario actualizado correctamente." : "Usuario creado correctamente.",
      "success"
    );

    resetForm();
    getUsers();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

function editUser(id, nombre, email, edad, activo) {
  userIdInput.value = id;
  nombreInput.value = nombre;
  emailInput.value = email;
  edadInput.value = edad;
  activoInput.checked = activo;

  formTitle.textContent = "Editar usuario";
  saveBtn.textContent = "Actualizar usuario";
  cancelBtn.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

async function deleteUser(id) {
  const confirmed = confirm(`¿Seguro que deseas eliminar el usuario con ID ${id}?`);

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.mensaje || "No se pudo eliminar el usuario.");
    }

    showMessage("Usuario eliminado correctamente.", "success");
    getUsers();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

cancelBtn.addEventListener("click", resetForm);
reloadBtn.addEventListener("click", getUsers);

getUsers();