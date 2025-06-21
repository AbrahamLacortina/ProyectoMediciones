import React from "react";
import { AppBar, Toolbar, Typography, Box, Avatar, IconButton, Menu, MenuItem } from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useAuth } from "../AuthContext";

const Header = ({ mode, setMode }) => {
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
    };

    return (
        <AppBar position="fixed" sx={{
            zIndex: 1201,
            boxShadow: '0 2px 8px rgba(0,79,69,0.15)',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            transition: 'background-color 0.4s, color 0.4s, box-shadow 0.3s',
        }}>
            <Toolbar>
                <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 700 }}>
                    Monitoreo Ambiental
                </Typography>
                {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>
                            Hola, {user.nombre}
                        </Typography>

                        <IconButton
                            color="inherit"
                            aria-label="Alternar modo claro/oscuro"
                            onClick={() => {
                                const newMode = mode === 'dark' ? 'light' : 'dark';
                                setMode(newMode);
                                localStorage.setItem('colorMode', newMode);
                            }}
                        >
                            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>

                        <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                            <Avatar sx={{ bgcolor: '#fff', color: 'primary.main' }}>
                                {user.nombre ? user.nombre[0].toUpperCase() : 'U'}
                            </Avatar>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
                        </Menu>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;