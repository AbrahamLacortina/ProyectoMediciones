import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

const Header = () => (
    <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                Monitoreo Ambiental
            </Typography>
        </Toolbar>
    </AppBar>
);

export default Header;