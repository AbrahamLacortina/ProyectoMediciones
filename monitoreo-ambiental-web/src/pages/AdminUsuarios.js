import React, { useEffect, useState } from "react";
import {
    Box, Button, Typography, Table, TableBody, TableCell, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions, Switch, MenuItem, Alert
} from "@mui/material";
import { formatearRut, validarRut, validarCorreo, validarPassword } from "./validaciones";

function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [open, setOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState("");

    const fetchUsuarios = async () => {
        const res = await fetch("http://localhost:8080/api/usuarios", { credentials: "include" });
        if (res.ok) setUsuarios(await res.json());
    };

    useEffect(() => { fetchUsuarios(); }, []);

    const handleEdit = (user) => {
        setEditUser(user);
        setPassword("");
        setPassword2("");
        setError("");
        setOpen(true);
    };

    const handleNew = () => {
        setEditUser({ nombre: "", apellido: "", correo: "", rol: 0, activo: true, rut: "" });
        setPassword("");
        setPassword2("");
        setError("");
        setOpen(true);
    };

    const handleSave = async () => {
        setError("");
        if (!editUser.nombre || !editUser.apellido || !editUser.correo || !editUser.rut) {
            setError("Todos los campos son obligatorios.");
            return;
        }
        if (!validarCorreo(editUser.correo)) {
            setError("Correo inválido.");
            return;
        }
        if (!validarRut(editUser.rut)) {
            setError("RUT inválido.");
            return;
        }
        if (editUser.rol !== 0 && editUser.rol !== 1) {
            setError("Rol inválido.");
            return;
        }
        if (!editUser.id && (!password || !password2)) {
            setError("Debes ingresar y confirmar la contraseña.");
            return;
        }
        if (!editUser.id && !validarPassword(password, password2)) {
            setError("Las contraseñas no coinciden o son muy cortas.");
            return;
        }
        if (editUser.id && password && !validarPassword(password, password2)) {
            setError("Las contraseñas no coinciden o son muy cortas.");
            return;
        }
        const userToSend = { ...editUser };
        if (password) userToSend.password = password;
        const method = editUser.id ? "PUT" : "POST";
        const url = editUser.id
            ? `http://localhost:8080/api/usuarios/${editUser.id}`
            : "http://localhost:8080/api/usuarios";
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(userToSend)
        });
        if (res.ok) {
            setOpen(false);
            fetchUsuarios();
        } else {
            const data = await res.json().catch(() => ({}));
            setError(data.message || "Error al guardar el usuario.");
        }
    };

    const handleDelete = async (user) => {
        if (window.confirm("¿Eliminar usuario?")) {
            await fetch(`http://localhost:8080/api/usuarios/${user.id}/eliminar`, {
                method: "PUT",
                credentials: "include"
            });
            fetchUsuarios();
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Administración de Usuarios</Typography>
            <Button variant="contained" onClick={handleNew} sx={{ mb: 2 }}>Registrar Usuario</Button>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Correo</TableCell>
                        <TableCell>Rol</TableCell>
                        <TableCell>Activo</TableCell>
                        <TableCell>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {usuarios.map(u => (
                        <TableRow key={u.id}>
                            <TableCell>{u.nombre} {u.apellido}</TableCell>
                            <TableCell>{u.correo}</TableCell>
                            <TableCell>{u.rol === 1 ? "Admin" : "Usuario"}</TableCell>
                            <TableCell>{u.activo ? "Sí" : "No"}</TableCell>
                            <TableCell>
                                <Button size="small" onClick={() => handleEdit(u)}>Editar</Button>
                                <Button size="small" color="error" onClick={() => handleDelete(u)}>Eliminar</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>{editUser?.id ? "Editar Usuario" : "Registrar Usuario"}</DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 350 }}>
                    <TextField label="Nombre" value={editUser?.nombre || ""} onChange={e => setEditUser({ ...editUser, nombre: e.target.value })} />
                    <TextField label="Apellido" value={editUser?.apellido || ""} onChange={e => setEditUser({ ...editUser, apellido: e.target.value })} />
                    <TextField
                        label="Correo"
                        value={editUser?.correo || ""}
                        onChange={e => setEditUser({ ...editUser, correo: e.target.value.replace(/\s/g, "") })}
                        error={!!editUser?.correo && !validarCorreo(editUser.correo)}
                        helperText={!!editUser?.correo && !validarCorreo(editUser.correo) ? "Correo inválido" : ""}
                    />
                    <TextField
                        label="RUT"
                        value={formatearRut(editUser?.rut || "")}
                        onChange={e => {
                            // Solo permite hasta 10 caracteres válidos (sin puntos ni guion)
                            const raw = e.target.value.replace(/[^\dkK]/g, "").slice(0, 10);
                            setEditUser({ ...editUser, rut: raw });
                        }}
                        inputProps={{ maxLength: 12 }} // El formateado puede tener hasta 12 caracteres (incluyendo puntos y guion)
                        error={!!editUser?.rut && !validarRut(editUser.rut)}
                        helperText={!!editUser?.rut && !validarRut(editUser.rut) ? "RUT inválido" : ""}
                    />
                    <TextField
                        select
                        label="Rol"
                        value={editUser?.rol ?? 0}
                        onChange={e => setEditUser({ ...editUser, rol: Number(e.target.value) })}
                    >
                        <MenuItem value={0}>Usuario</MenuItem>
                        <MenuItem value={1}>Administrador</MenuItem>
                    </TextField>
                    <Box display="flex" alignItems="center">
                        <Switch checked={editUser?.activo || false} onChange={e => setEditUser({ ...editUser, activo: e.target.checked })} />
                        <Typography>Activo</Typography>
                    </Box>
                    <TextField
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required={!editUser?.id}
                        autoComplete="new-password"
                    />
                    <TextField
                        label="Repetir Contraseña"
                        type="password"
                        value={password2}
                        onChange={e => setPassword2(e.target.value)}
                        required={!editUser?.id}
                        autoComplete="new-password"
                    />
                    {error && <Alert severity="error">{error}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AdminUsuarios;