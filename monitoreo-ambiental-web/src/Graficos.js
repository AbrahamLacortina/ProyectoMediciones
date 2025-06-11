import React, { useState, useEffect } from "react";
import { Paper, Typography, Box, TextField, MenuItem, Button, CircularProgress, Alert } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const estaciones = [
    { value: "Estacion_LIA_SantoTomas", label: "LIA Santo Tomás" },
    { value: "Otra_Estacion", label: "Otra Estación" }
];

const topicos = [
    { value: "temperatura", label: "Temperatura (°C)", color: "#ff9800" },
    { value: "humedad", label: "Humedad (%)", color: "#2196f3" },
    { value: "pm25", label: "PM2.5 (µg/m³)", color: "#4caf50" },
    { value: "pm10", label: "PM10 (µg/m³)", color: "#f44336" }
];

function Graficos() {
    const [estacion, setEstacion] = useState(estaciones[0].value);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [topico, setTopico] = useState(topicos[0].value);
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDatos = () => {
        setLoading(true);
        setError(null);
        let url = `http://localhost:8080/api/mediciones/ultimas?estacion=${encodeURIComponent(estacion)}`;
        if (fechaInicio && fechaFin) {
            url = `http://localhost:8080/api/mediciones/rango?estacion=${encodeURIComponent(estacion)}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
        }
        fetch(url, { credentials: "include" })
            .then(res => {
                if (!res.ok) throw new Error("Error al obtener datos");
                return res.json();
            })
            .then(data => {
                setDatos(data.reverse());
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchDatos();
        // eslint-disable-next-line
    }, []);

    const handleFiltrar = (e) => {
        e.preventDefault();
        fetchDatos();
    };

    const formatFecha = (isoString) =>
        new Date(isoString).toLocaleString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit"
        });

    const topicoActual = topicos.find(t => t.value === topico);

    return (
        <Paper elevation={3} sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Gráfico de {topicoActual.label}
            </Typography>
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
                <TextField
                    select
                    label="Tópico"
                    value={topico}
                    onChange={e => setTopico(e.target.value)}
                    size="small"
                >
                    {topicos.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                </TextField>
                <Button type="submit" variant="contained">Filtrar</Button>
            </Box>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            ) : (
                <Box>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={datos}>
                            <XAxis dataKey="fechaRegistro" tickFormatter={formatFecha} />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey={topico}
                                stroke={topicoActual.color}
                                name={topicoActual.label}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            )}
        </Paper>
    );
}

export default Graficos;