import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Divider } from "@mui/material";
import { Home, Cloud, ShowChart, Logout, AdminPanelSettings } from "@mui/icons-material";
import { Link } from "react-router-dom";

const drawerWidth = 240;

const Sidebar = ({ user, onLogout }) => (
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
                <ListItem button component={Link} to="/admin/usuarios">
                    <ListItemIcon><AdminPanelSettings /></ListItemIcon>
                    <ListItemText primary="Administración" />
                </ListItem>
            )}
        </List>

        <Divider sx={{ mt: "auto" }} />

        <List>
            <ListItem button onClick={onLogout}>
                <ListItemIcon><Logout /></ListItemIcon>
                <ListItemText primary="Cerrar sesión" />
            </ListItem>
        </List>
    </Drawer>
);

export default Sidebar;