import React from "react";
import {
    Box,
    Typography,
    Grid,
    Paper,
    Divider
} from "@mui/material";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import TimelineIcon from "@mui/icons-material/Timeline";
import InsightsIcon from "@mui/icons-material/Insights";

const features = [
    {
        icon: <MonitorHeartIcon fontSize="large" color="primary" />,
        title: "Monitoreo en tiempo real",
        description: "Visualiza las condiciones ambientales actuales desde sensores conectados.",
    },
    {
        icon: <TimelineIcon fontSize="large" color="primary" />,
        title: "Historial detallado",
        description: "Consulta registros anteriores para análisis comparativos y auditorías.",
    },
    {
        icon: <InsightsIcon fontSize="large" color="primary" />,
        title: "Visualización avanzada",
        description: "Accede a gráficos dinámicos para identificar patrones y anomalías.",
    }
];

const Inicio = () => (
    <Box
        sx={{
            maxWidth: 900,
            mx: "auto",
            mt: 6,
            mb: 4,
            px: 3,
            py: 4,
            bgcolor: "#fff",
            borderRadius: 4,
            boxShadow: 3,
        }}
    >
        <Typography
            variant="h3"
            align="center"
            fontWeight={700}
            gutterBottom
            sx={{ color: "primary.main", letterSpacing: 1 }}
        >
            Sistema de Monitoreo Ambiental
        </Typography>
        <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 5 }}
        >
            A continuación se muestran las funcionalidades principales disponibles en el menú lateral. Selecciona una opción en la barra lateral para comenzar.
        </Typography>

        <Grid container spacing={4} justifyContent="center">
            {features.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                        elevation={4}
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            height: "100%",
                            transition: "0.3s",
                            bgcolor: "#f8fafc",
                            "&:hover": {
                                transform: "translateY(-6px) scale(1.03)",
                                boxShadow: 8,
                                bgcolor: "#f1f5f9",
                            },
                        }}
                    >
                        {item.icon}
                        <Typography variant="h6" mt={2} fontWeight={600} align="center">
                            {item.title}
                        </Typography>
                        <Divider sx={{ width: "40%", my: 1 }} />
                        <Typography variant="body2" color="text.secondary" align="center">
                            {item.description}
                        </Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    </Box>
);

export default Inicio;