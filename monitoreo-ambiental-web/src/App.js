// App.js

import React, { useState, useEffect, forwardRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
    Box, Drawer, List, ListItem, ListItemIcon, ListItemText,
    Toolbar, AppBar, Typography, Dialog, DialogTitle, DialogContent,
    Button, Avatar, Stack, Fade, CssBaseline
} from "@mui/material";
import { Cloud, Home, ShowChart } from "@mui/icons-material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import MedicionesTable from "./MedicionesTable";
import Graficos from "./Graficos";
import Login from "./Login";
import { AuthProvider, useAuth } from "./AuthContext";

const drawerWidth = 240;

// Componente de Bienvenida con Fade + Avatar
const BienvenidaDialog = ({ open, onClose, nombre }) => {
    useEffect(() => {
        if (open) {
            const timer = setTimeout(onClose, 1000); // Cierra el diálogo después de 1.6 segundos
            return () => clearTimeout(timer);
        }
    }, [open, onClose]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionComponent={Fade}
            keepMounted
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    px: 3,
                    py: 2,
                    textAlign: 'center',
                    minWidth: 300,
                }
            }}
        >
            <DialogTitle sx={{ fontWeight: 600, fontSize: '1.6rem' }}>
                ¡Bienvenido!
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: "#1976d2", width: 56, height: 56 }}>
                        {nombre ? nombre[0].toUpperCase() : "U"}
                    </Avatar>
                    <Typography variant="body1">
                        {`Bienvenido${nombre ? `, ${nombre}` : ""}. Nos alegra verte nuevamente.`}
                    </Typography>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

// Pantalla principal del sistema
const Inicio = () => (
    <Box p={3}>
        <Typography variant="h4" gutterBottom>
            Sistema de Monitoreo Ambiental
        </Typography>
        <Typography variant="body1">
            Selecciona una opción del menú para comenzar.
        </Typography>
    </Box>
);

// Layout principal con AppBar y Drawer
const MainApp = ({ onLogout, user, showBienvenida, onCloseBienvenida }) => {
    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: 1201 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                        Monitoreo Ambiental
                    </Typography>
                    <Button onClick={onLogout} color="inherit" size="small" sx={{ textTransform: "none" }}>
                        Cerrar sesión
                    </Button>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: "border-box"
                    },
                }}
            >
                <Toolbar />
                <List>
                    <ListItem button component={Link} to="/">
                        <ListItemIcon><Home /></ListItemIcon>
                        <ListItemText primary="Inicio" />
                    </ListItem>
                    <ListItem button component={Link} to="/mediciones">
                        <ListItemIcon><Cloud /></ListItemIcon>
                        <ListItemText primary="Mediciones" />
                    </ListItem>
                    <ListItem button component={Link} to="/graficos">
                        <ListItemIcon><ShowChart /></ListItemIcon>
                        <ListItemText primary="Gráficos" />
                    </ListItem>
                    {user?.rol === 1 && (
                        <ListItem button component={Link} to="/admin">
                            <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                            <ListItemText primary="Administración" />
                        </ListItem>
                    )}
                </List>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "80vh" }}>
                    <Routes>
                        <Route path="/" element={<Inicio />} />
                        <Route path="/mediciones" element={<MedicionesTable />} />
                        <Route path="/graficos" element={<Graficos />} />
                        {/* Puedes agregar la ruta de administración aquí */}
                    </Routes>
                </Box>
            </Box>

            <BienvenidaDialog open={showBienvenida} onClose={onCloseBienvenida} nombre={user?.nombre} />
        </Box>
    );
};

// Controla la sesión del usuario
const AppContent = () => {
    const { user, login, logout } = useAuth();
    const [showBienvenida, setShowBienvenida] = useState(false);
    const [prevUser, setPrevUser] = useState(null);

    useEffect(() => {
        if (user && !prevUser) {
            setShowBienvenida(true);
        }
        setPrevUser(user);
    }, [user, prevUser]);

    if (!user) return <Login onLogin={login} />;

    return (
        <MainApp
            onLogout={logout}
            user={user}
            showBienvenida={showBienvenida}
            onCloseBienvenida={() => setShowBienvenida(false)}
        />
    );
};

// Punto de entrada de la app
const App = () => (
    <AuthProvider>
        <Router>
            <AppContent />
        </Router>
    </AuthProvider>
);

export default App;
