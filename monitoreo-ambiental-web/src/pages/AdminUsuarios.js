import React, { useEffect, useState, useCallback } from "react";
import {
    Box, Button, Typography, Table, TableBody, TableCell, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions, Switch, MenuItem, Alert, Fade, TableContainer,
    TablePagination, TableSortLabel
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { formatearRut, validarRut, validarCorreo, validarPassword } from "./validaciones";

// Hook para debounce
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

function AdminUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [open, setOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState("");

    // State for searching and filtering
    const [searchQuery, setSearchQuery] = useState("");
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // State for pagination and sorting
    const [pagination, setPagination] = useState({ page: 0, size: 10, totalElements: 0 });
    const [sort, setSort] = useState({ field: 'nombre', direction: 'asc' });

    const fetchUsuarios = useCallback(async () => {
        const params = new URLSearchParams({
            page: pagination.page,
            size: pagination.size,
            sort: `${sort.field},${sort.direction}`,
            search: debouncedSearchQuery,
        });
        if (showActiveOnly) {
            params.append('activo', 'true');
        }

        try {
            const res = await fetch(`http://localhost:8080/api/usuarios?${params.toString()}`, { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setUsuarios(data.content);
                setPagination(prev => ({ ...prev, totalElements: data.totalElements }));
            } else {
                console.error("Error fetching users");
                setUsuarios([]);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsuarios([]);
        }
    }, [pagination.page, pagination.size, sort.field, sort.direction, debouncedSearchQuery, showActiveOnly]);

    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]);

    const handleSort = (field) => {
        const isAsc = sort.field === field && sort.direction === 'asc';
        setSort({ field, direction: isAsc ? 'desc' : 'asc' });
    };

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
        <Fade in={true} timeout={500}>
            <Box sx={{ maxWidth: 1100, mx: "auto", mt: { xs: 2, md: 4 }, p: { xs: 1, sm: 2 } }}>
                <Typography variant="h5" gutterBottom>Administración de Usuarios</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Button variant="contained" onClick={handleNew}>Registrar Usuario</Button>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <TextField
                            label="Buscar usuario"
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Switch checked={showActiveOnly} onChange={e => setShowActiveOnly(e.target.checked)} />
                            <Typography variant="body2">Solo activos</Typography>
                        </Box>
                    </Box>
                </Box>
                <TableContainer>
                    <Table size="small" aria-label="Tabla de usuarios">
                        <TableHead>
                            <TableRow>
                                {['nombre', 'correo', 'rol'].map(headCell => (
                                    <TableCell key={headCell}>
                                        <TableSortLabel
                                            active={sort.field === headCell}
                                            direction={sort.direction}
                                            onClick={() => handleSort(headCell)}
                                        >
                                            {headCell.charAt(0).toUpperCase() + headCell.slice(1)}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                                <TableCell>Activo</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {usuarios.length > 0 ? (
                                usuarios.map(u => (
                                    <TableRow key={u.id}>
                                        <TableCell>{u.nombre} {u.apellido}</TableCell>
                                        <TableCell>{u.correo}</TableCell>
                                        <TableCell>{u.rol === 1 ? "Admin" : "Usuario"}</TableCell>
                                        <TableCell>{u.activo ? "Sí" : "No"}</TableCell>
                                        <TableCell>
                                            <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(u)}>Editar</Button>
                                            <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(u)}>Eliminar</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                                            <PeopleOutlineIcon sx={{ fontSize: 60 }} />
                                            <Typography variant="h6">No se encontraron usuarios</Typography>
                                            <Typography>Intenta ajustar los filtros de búsqueda.</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={pagination.totalElements}
                    page={pagination.page}
                    onPageChange={(e, newPage) => setPagination(p => ({ ...p, page: newPage }))}
                    rowsPerPage={pagination.size}
                    onRowsPerPageChange={e => setPagination(p => ({ ...p, size: parseInt(e.target.value, 10), page: 0 }))}
                    rowsPerPageOptions={[5, 10, 25]}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`}
                />
                <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>{editUser?.id ? "Editar Usuario" : "Registrar Usuario"}</DialogTitle>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: { xs: 240, sm: 350 } }}>
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
                                const raw = e.target.value.replace(/[^\dkK]/g, "").slice(0, 10);
                                setEditUser({ ...editUser, rut: raw });
                            }}
                            inputProps={{ maxLength: 12 }}
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
        </Fade>
    );
}

export default AdminUsuarios;
