const express = require("express");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json()); 
const filePath = "./data/users.json";

// get 
const getUsers = () => {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
};

// save 
const saveUsers = (users) => {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
};

// get todos los usuarios
app.get("/users", (req, res) => {
  const users = getUsers();
  res.status(200).json(users);
});

// get un usuario por id
app.get("/users/:id", (req, res) => {
  const users = getUsers();
  const user = users.find(u => u.id == req.params.id);

  if (!user) {
    return res.status(404).json({ mensaje: "Usuario no encontrado" });
  }

  res.json(user);
});

// create
app.post("/users", (req, res) => {
  const { nombre, email, edad, activo } = req.body;

  // Vaerify
  if (!nombre || !email || edad <= 0 || typeof activo !== "boolean") {
    return res.status(400).json({ mensaje: "Datos inválidos" });
  }

  const users = getUsers();

  const newUser = {
    id: users.length + 1,
    nombre,
    email,
    edad,
    activo
  };

  users.push(newUser);
  saveUsers(users);

  res.status(201).json(newUser);
});

// upadate
app.put("/users/:id", (req, res) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id == req.params.id);

  if (index === -1) {
    return res.status(404).json({ mensaje: "Usuario no encontrado" });
  }

  const { nombre, email, edad, activo } = req.body;

  if (!nombre || !email || edad <= 0 || typeof activo !== "boolean") {
    return res.status(400).json({ mensaje: "Datos inválidos" });
  }

  users[index] = { id: users[index].id, nombre, email, edad, activo };

  saveUsers(users);

  res.json(users[index]);
});

// Delete
app.delete("/users/:id", (req, res) => {
  let users = getUsers();
  const newUsers = users.filter(u => u.id != req.params.id);

  if (users.length === newUsers.length) {
    return res.status(404).json({ mensaje: "Usuario no encontrado" });
  }

  saveUsers(newUsers);

  res.json({ mensaje: "Usuario eliminado" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});