import { useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Avatar,
    Stack,
    Fade
} from "@mui/material";

const BienvenidaDialog = ({ open, onClose, nombre }) => {
    useEffect(() => {
        if (open) {
            const timer = setTimeout(onClose, 1000);
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
                    <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56, fontSize: 24 }}>
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

export default BienvenidaDialog;
