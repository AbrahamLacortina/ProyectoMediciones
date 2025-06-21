import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
    Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const AdminCentrales = () => {
    const [centrales, setCentrales] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentCentral, setCurrentCentral] = useState(null);

    useEffect(() => {
        fetchCentrales();
    }, []);

    const fetchCentrales = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/centrales', { withCredentials: true });
            setCentrales(response.data);
        } catch (error) {
            console.error('Error fetching centrales:', error);
        }
    };

    const handleClickOpen = (central = null) => {
        setCurrentCentral(central || { nombreCentral: '', topicoBase: '', descripcion: '', ubicacion: '' });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentCentral(null);
    };

    const handleSave = async () => {
        const url = currentCentral.idCentral
            ? `http://localhost:8080/api/centrales/${currentCentral.idCentral}`
            : 'http://localhost:8080/api/centrales';
        const method = currentCentral.idCentral ? 'put' : 'post';

        try {
            await axios[method](url, currentCentral, { withCredentials: true });
            fetchCentrales();
            handleClose();
        } catch (error) {
            console.error('Error saving central:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/centrales/${id}`, { withCredentials: true });
            fetchCentrales();
        } catch (error) {
            console.error('Error deleting central:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentCentral(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div>
            <Button variant="contained" color="primary" onClick={() => handleClickOpen()}>
                Añadir Central
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Tópico Base</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Ubicación</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {centrales.map((central) => (
                            <TableRow key={central.idCentral}>
                                <TableCell>{central.nombreCentral}</TableCell>
                                <TableCell>{central.topicoBase}</TableCell>
                                <TableCell>{central.descripcion}</TableCell>
                                <TableCell>{central.ubicacion}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleClickOpen(central)}><EditIcon /></IconButton>
                                    <IconButton onClick={() => handleDelete(central.idCentral)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{currentCentral?.idCentral ? 'Editar' : 'Añadir'} Central</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" name="nombreCentral" label="Nombre" type="text" fullWidth value={currentCentral?.nombreCentral} onChange={handleChange} />
                    <TextField margin="dense" name="topicoBase" label="Tópico Base" type="text" fullWidth value={currentCentral?.topicoBase} onChange={handleChange} />
                    <TextField margin="dense" name="descripcion" label="Descripción" type="text" fullWidth value={currentCentral?.descripcion} onChange={handleChange} />
                    <TextField margin="dense" name="ubicacion" label="Ubicación" type="text" fullWidth value={currentCentral?.ubicacion} onChange={handleChange} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default AdminCentrales;

