import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Divider, IconButton, useTheme, useMediaQuery, Button, Box } from "@mui/material";
import { Home, Cloud, AdminPanelSettings, Menu as MenuIcon, Apartment } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

const drawerWidth = 240;

export default function Sidebar({ user }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = React.useState(false);
    const location = useLocation();

    const navItems = [
        { to: "/", label: "Inicio", icon: <Home /> },
        { to: "/mediciones", label: "Mediciones", icon: <Cloud /> },
    ];
    if (user?.rol === 1) {
        navItems.push({ to: "/admin/usuarios", label: "Admin Usuarios", icon: <AdminPanelSettings /> });
        navItems.push({ to: "/admin/centrales", label: "Admin Estaciones", icon: <Apartment /> });
    }

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
            <Toolbar />
            <List sx={{
                bgcolor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                transition: 'background-color 0.4s, color 0.4s',
                flex: 1,
                px: 1,
                overflow: 'auto',
            }}>
                {navItems.map(item => (
                    <ListItem
                        button
                        key={item.to}
                        component={Link}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        selected={location.pathname === item.to}
                        sx={{
                            borderRadius: 2,
                            my: 0.5,
                            mx: 0.5,
                            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.2s',
                            boxShadow: location.pathname === item.to ? `0 2px 8px 0 ${theme.palette.action.selected}` : 'none',
                            '&:hover': {
                                boxShadow: `0 2px 12px 0 ${theme.palette.primary.main}22`,
                                transform: 'scale(1.03)',
                            },
                        }}
                    >
                        <ListItemIcon sx={{
                            minWidth: 36,
                            color: location.pathname === item.to ? 'inherit' : 'text.secondary'
                        }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    if (isMobile) {
        return (
            <>
                <IconButton
                    color="inherit"
                    aria-label="Abrir menú lateral"
                    onClick={() => setOpen(true)}
                    sx={{ position: 'fixed', top: 16, left: 16, zIndex: 2001 }}
                >
                    <MenuIcon />
                </IconButton>
                <Drawer
                    variant="temporary"
                    open={open}
                    onClose={() => setOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        [`& .MuiDrawer-paper`]: {
                            width: drawerWidth,
                            boxSizing: "border-box",
                            bgcolor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                            transition: 'background-color 0.4s, color 0.4s',
                            borderRight: `1px solid ${theme.palette.divider}`,
                            boxShadow: '2px 0 12px 0 rgba(0,79,69,0.10)',
                            borderTopRightRadius: 18,
                            borderBottomRightRadius: 18,
                            marginTop: 8,
                            marginBottom: 8,
                            overflow: 'visible',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            </>
        );
    }
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: "border-box",
                    bgcolor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    transition: 'background-color 0.4s, color 0.4s',
                    borderRight: `1px solid ${theme.palette.divider}`,
                    boxShadow: '2px 0 12px 0 rgba(0,79,69,0.10)',
                    borderTopRightRadius: 18,
                    borderBottomRightRadius: 18,
                    marginTop: 8,
                    marginBottom: 8,
                    overflow: 'visible',
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );
}
