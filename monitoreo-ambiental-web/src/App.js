import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, AppBar, Typography } from "@mui/material";
import { Cloud, Home, ShowChart } from "@mui/icons-material";
import MedicionesTable from "./MedicionesTable";
import Graficos from "./Graficos";

const drawerWidth = 220;

function Inicio() {
    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>Bienvenido al Monitoreo Ambiental</Typography>
            <Typography>Selecciona una opción en el menú para comenzar.</Typography>
        </Box>
    );
}

function App() {
    return (
        <Router>
            <Box sx={{ display: "flex" }}>
                <AppBar position="fixed" sx={{ zIndex: 1201 }}>
                    <Toolbar>
                        <Typography variant="h6" noWrap>Monitoreo Ambiental</Typography>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
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
                    </List>
                </Drawer>
                {/* Elimina ml: `${drawerWidth}px` aquí */}
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Toolbar />
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "80vh" }}>
                        <Routes>
                            <Route path="/" element={<Inicio />} />
                            <Route path="/mediciones" element={<MedicionesTable />} />
                            <Route path="/graficos" element={<Graficos />} />
                        </Routes>
                    </Box>
                </Box>
            </Box>
        </Router>
    );
}

export default App;