import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    useTheme,
    Fade,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Grid,
    Grow
} from "@mui/material";

const calidadAireInfo = [
    { min: 0, max: 50, color: "#4CAF50", label: "Bueno" },
    { min: 51, max: 100, color: "#FFEB3B", label: "Moderado" },
    { min: 101, max: 150, color: "#FF9800", label: "No saludable para grupos de riesgo" },
    { min: 151, max: 200, color: "#F44336", label: "No saludable" },
    { min: 201, max: 300, color: "#9C27B0", label: "Muy poco saludable" },
    { min: 301, max: 500, color: "#7E0023", label: "Peligroso" },
];

function getCalidadAire(valor) {
    return calidadAireInfo.find(r => valor >= r.min && valor <= r.max) || calidadAireInfo[calidadAireInfo.length-1];
}

const Inicio = () => {
    const theme = useTheme();
    const [centrales, setCentrales] = useState([]);
    const [central, setCentral] = useState("");
    const [dato, setDato] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch("/api/centrales")
            .then(res => {
                console.log("Respuesta centrales:", res);
                return res.json();
            })
            .then(data => {
                console.log("Centrales recibidas:", data);
                setCentrales(data);
                if (data.length > 0) setCentral(data[0].nombreCentral);
            })
            .catch(err => {
                console.error("Error al obtener centrales:", err);
            });
    }, []);

    useEffect(() => {
        if (!central) return;
        setLoading(true);
        fetch(`/api/mediciones/ultimas?central=${encodeURIComponent(central)}&limit=1`)
            .then(res => {
                console.log("Respuesta mediciones:", res);
                return res.json();
            })
            .then(data => {
                console.log("Mediciones recibidas:", data);
                setDato(data[0] || null);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al obtener mediciones:", err);
                setLoading(false);
            });
    }, [central]);

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
                {/* Selector de central */}
                <Grow in timeout={600}>
                    <Paper elevation={2} sx={{ mb: 3, p: 2, borderRadius: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel id="central-label">Central</InputLabel>
                            <Select
                                labelId="central-label"
                                value={central}
                                label="Central"
                                onChange={e => setCentral(e.target.value)}
                            >
                                {centrales && centrales.length > 0 ? (
                                    centrales.map(c => (
                                        <MenuItem key={c.idCentral} value={c.nombreCentral}>{c.nombreCentral}</MenuItem>
                                    ))
                                ) : (
                                    <MenuItem value="" disabled>No hay centrales disponibles</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    </Paper>
                </Grow>
                {/* Layout principal: Calidad del aire y Resumen en Grid */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Grow in timeout={700}>
                            <Paper elevation={4} sx={{
                                p: 3,
                                borderRadius: 3,
                                mb: 2,
                                bgcolor: dato ? getCalidadAire(dato.indiceCalidadAire || 0).color + '22' : 'background.paper',
                                border: dato ? `2px solid ${getCalidadAire(dato.indiceCalidadAire || 0).color}` : undefined,
                                transition: 'background 0.3s',
                            }}>
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                    <Typography variant="h3" fontWeight={800} color={dato ? getCalidadAire(dato.indiceCalidadAire || 0).color : 'text.primary'}>
                                        {dato ? dato.indiceCalidadAire || "-" : "-"}
                                    </Typography>
                                    <Typography variant="h5" fontWeight={700} color={dato ? getCalidadAire(dato.indiceCalidadAire || 0).color : 'text.primary'}>
                                        {dato ? getCalidadAire(dato.indiceCalidadAire || 0).label : "-"}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                        Contaminante primario: <b>{dato ? dato.contaminantePrimario || "-" : "-"}</b>
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Valor medido: {dato && dato.valorMedido ? `${dato.valorMedido} µg/m³` : "-"}
                                    </Typography>
                                    <Box sx={{ mt: 2, mb: 1, width: '100%' }}>
                                        <Box sx={{ height: 10, width: "100%", borderRadius: 5, background: `linear-gradient(90deg, #4CAF50 0%, #FFEB3B 20%, #FF9800 40%, #F44336 60%, #9C27B0 80%, #7E0023 100%)` }}>
                                            <Box sx={{ position: "relative", top: -10, left: `${(dato?.indiceCalidadAire || 0)/5}%`, width: 20, height: 20, borderRadius: "50%", bgcolor: dato ? getCalidadAire(dato.indiceCalidadAire || 0).color : '#ccc', border: "2px solid #fff" }} />
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">Índice de calidad del aire</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grow>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Grow in timeout={800}>
                            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Resumen</Typography>
                                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                    {dato ? (
                                        getCalidadAire(dato.indiceCalidadAire || 0).label === "No saludable para grupos de riesgo"
                                            ? "Los miembros de grupos sensibles pueden experimentar impactos en la salud. No es probable que el público general se vea afectado."
                                            : getCalidadAire(dato.indiceCalidadAire || 0).label === "Bueno"
                                            ? "La calidad del aire es satisfactoria y presenta poco o ningún riesgo para la salud."
                                            : "Consulte las recomendaciones de salud para su grupo de riesgo."
                                    ) : "-"}
                                </Typography>
                            </Paper>
                        </Grow>
                    </Grid>
                </Grid>
                {/* Indicadores circulares en Grid */}
                <Grow in timeout={900}>
                    <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mt: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Indicadores ambientales</Typography>
                        <Grid container spacing={2}>
                            {/* PM2.5 */}
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                    <Box sx={{ position: "relative", width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CircularProgress variant="determinate" value={dato?.pm25 ? Math.min((dato.pm25/300)*100, 100) : 0} size={60} thickness={5} sx={{ color: '#2196f3', zIndex: 1 }} />
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 2,
                                        }}>
                                            <Typography variant="h6" fontWeight={700} sx={{ color: '#222', fontSize: 20 }}>{dato?.pm25 !== undefined && dato?.pm25 !== null ? dato.pm25 : "-"}</Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body1" fontWeight={600}>PM2.5</Typography>
                                    <Typography variant="body2" color="text.secondary">Partículas finas respirables</Typography>
                                </Box>
                            </Grid>
                            {/* PM10 */}
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                    <Box sx={{ position: "relative", width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CircularProgress variant="determinate" value={dato?.pm10 ? Math.min((dato.pm10/500)*100, 100) : 0} size={60} thickness={5} sx={{ color: '#ff9800', zIndex: 1 }} />
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 2,
                                        }}>
                                            <Typography variant="h6" fontWeight={700} sx={{ color: '#222', fontSize: 20 }}>{dato?.pm10 !== undefined && dato?.pm10 !== null ? dato.pm10 : "-"}</Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body1" fontWeight={600}>PM10</Typography>
                                    <Typography variant="body2" color="text.secondary">Partículas inhalables</Typography>
                                </Box>
                            </Grid>
                            {/* Temperatura */}
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                    <Box sx={{ position: "relative", width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CircularProgress variant="determinate" value={dato?.temperatura !== undefined && dato?.temperatura !== null ? Math.min(((dato.temperatura + 10)/55)*100, 100) : 0} size={60} thickness={5} sx={{ color: '#e91e63', zIndex: 1 }} />
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 2,
                                        }}>
                                            <Typography variant="h6" fontWeight={700} sx={{ color: '#222', fontSize: 20 }}>{dato?.temperatura !== undefined && dato?.temperatura !== null ? dato.temperatura : "-"}</Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body1" fontWeight={600}>Temperatura</Typography>
                                    <Typography variant="body2" color="text.secondary">°C ambiente</Typography>
                                </Box>
                            </Grid>
                            {/* Humedad */}
                            <Grid item xs={12} sm={6} md={3}>
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                                    <Box sx={{ position: "relative", width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CircularProgress variant="determinate" value={dato?.humedad !== undefined && dato?.humedad !== null ? Math.min((dato.humedad/100)*100, 100) : 0} size={60} thickness={5} sx={{ color: '#009688', zIndex: 1 }} />
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 2,
                                        }}>
                                            <Typography variant="h6" fontWeight={700} sx={{ color: '#222', fontSize: 20 }}>{dato?.humedad !== undefined && dato?.humedad !== null ? dato.humedad : "-"}</Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body1" fontWeight={600}>Humedad</Typography>
                                    <Typography variant="body2" color="text.secondary">% relativa</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grow>
                {/* Loading y sin datos */}
                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
                        <CircularProgress />
                    </Box>
                )}
                {!loading && !dato && (
                    <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                        No hay datos disponibles para hoy en la central seleccionada.
                    </Typography>
                )}
            </Box>
        </Fade>
    );
};

export default Inicio;
