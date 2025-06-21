import React from "react";
import {
    Box,
    Typography,
    Grid,
    Paper,
    Divider,
    useTheme,
    Fade
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

const Inicio = () => {
    const theme = useTheme();
    return (
        <Fade in={true} timeout={500}>
            <Box
                sx={{
                    maxWidth: 900,
                    mx: "auto",
                    mt: { xs: 2, md: 6 },
                    mb: { xs: 2, md: 4 },
                    px: { xs: 1, sm: 3 },
                    py: { xs: 2, sm: 4 },
                    bgcolor: "background.paper",
                    borderRadius: 4,
                    boxShadow: 3,
                }}
            >
                <Typography
                    variant="h3"
                    align="center"
                    fontWeight={700}
                    gutterBottom
                    sx={{ color: "primary.main", letterSpacing: 1, fontSize: { xs: 28, sm: 36, md: 44 } }}
                >
                    Sistema de Monitoreo Ambiental
                </Typography>
                <Typography
                    variant="h6"
                    align="center"
                    color="text.secondary"
                    sx={{ mb: { xs: 3, sm: 5 }, fontSize: { xs: 16, sm: 20 } }}
                >
                    A continuación se muestran las funcionalidades principales disponibles en el menú lateral. Selecciona una opción en la barra lateral para comenzar.
                </Typography>

                <Grid container spacing={3} justifyContent="center">
                    {features.map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Paper
                                elevation={4}
                                sx={{
                                    p: { xs: 2, sm: 4 },
                                    borderRadius: 3,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    height: "100%",
                                    transition: "0.3s",
                                    bgcolor: "background.default",
                                    minHeight: 220,
                                    '&:hover': {
                                        transform: "translateY(-6px) scale(1.03)",
                                        boxShadow: 8,
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : "#f1f5f9",
                                    },
                                }}
                            >
                                {item.icon}
                                <Typography variant="h6" mt={2} fontWeight={600} align="center" sx={{ fontSize: { xs: 16, sm: 20 }, color: 'text.primary' }}>
                                    {item.title}
                                </Typography>
                                <Divider sx={{ width: "40%", my: 1, borderColor: 'divider' }} />
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: { xs: 13, sm: 15 } }}>
                                    {item.description}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Fade>
    );
};

export default Inicio;