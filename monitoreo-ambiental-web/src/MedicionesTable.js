import React, { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, CircularProgress, Alert, Typography, Box, Chip, TextField, MenuItem, Button
} from "@mui/material";
import { Cloud, Thermostat, WaterDrop, Search } from "@mui/icons-material";

// Simula estaciones, reemplaza por fetch si tienes endpoint
const estaciones = [
    { value: "Estacion_LIA_SantoTomas", label: "LIA Santo Tomás" },
    { value: "Otra_Estacion", label: "Otra Estación" }
];

const formatFecha = (isoString) =>
    new Date(isoString).toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

const ValorChip = ({ label, value, unidad }) => {
    let color = "default";
    if (label.includes("PM2.5") && value > 25) color = "warning";
    if (label.includes("PM10") && value > 50) color = "error";
    return (
        <Chip
            label={`${value} ${unidad}`}
            color={color}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 500 }}
        />
    );
};

function MedicionesTable() {
    const [mediciones, setMediciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filtros
    const [estacion, setEstacion] = useState(estaciones[0].value);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

    const fetchMediciones = () => {
        setLoading(true);
        setError(null);

        // Construye la URL con filtros
        let url = `http://localhost:8080/api/mediciones/ultimas?estacion=${encodeURIComponent(estacion)}`;
        if (fechaInicio && fechaFin) {
            url = `http://localhost:8080/api/mediciones/rango?estacion=${encodeURIComponent(estacion)}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
        }

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("Error al obtener datos");
                return res.json();
            })
            .then(data => {
                setMediciones(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchMediciones();
        // eslint-disable-next-line
    }, []);

    const handleFiltrar = (e) => {
        e.preventDefault();
        fetchMediciones();
    };

    return (
        <Paper elevation={3} sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Mediciones Recientes
            </Typography>
            {/* Filtros */}
            <Box component="form" onSubmit={handleFiltrar} sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                <TextField
                    select
                    label="Estación"
                    value={estacion}
                    onChange={e => setEstacion(e.target.value)}
                    size="small"
                >
                    {estaciones.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Desde"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={fechaInicio}
                    onChange={e => setFechaInicio(e.target.value)}
                />
                <TextField
                    label="Hasta"
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    value={fechaFin}
                    onChange={e => setFechaFin(e.target.value)}
                />
                <Button type="submit" variant="contained" startIcon={<Search />}>Filtrar</Button>
            </Box>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell><Cloud sx={{ verticalAlign: "middle" }} /> Fecha</TableCell>
                                <TableCell><Thermostat sx={{ verticalAlign: "middle" }} /> Temp. (°C)</TableCell>
                                <TableCell><WaterDrop sx={{ verticalAlign: "middle" }} /> Humedad (%)</TableCell>
                                <TableCell>PM2.5</TableCell>
                                <TableCell>PM10</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mediciones.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell>{formatFecha(m.fechaRegistro)}</TableCell>
                                    <TableCell>
                                        <ValorChip label="Temp" value={m.temperatura} unidad="°C" />
                                    </TableCell>
                                    <TableCell>
                                        <ValorChip label="Humedad" value={m.humedad} unidad="%" />
                                    </TableCell>
                                    <TableCell>
                                        <ValorChip label="PM2.5" value={m.pm25} unidad="µg/m³" />
                                    </TableCell>
                                    <TableCell>
                                        <ValorChip label="PM10" value={m.pm10} unidad="µg/m³" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
}

export default MedicionesTable;