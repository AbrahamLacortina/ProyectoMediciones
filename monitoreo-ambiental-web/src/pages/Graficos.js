import React, { useState, useEffect } from "react";
import { Paper, Typography, Box, TextField, MenuItem, Button, Alert, Fade, Skeleton } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import BarChartIcon from '@mui/icons-material/BarChart';
dayjs.extend(utc);

const topicos = [
    { value: "temperatura", label: "Temperatura (°C)", color: "#004F45" },
    { value: "humedad", label: "Humedad (%)", color: "#1976d2" },
    { value: "pm25", label: "PM2.5 (µg/m³)", color: "#43a047" },
    { value: "pm10", label: "PM10 (µg/m³)", color: "#d32f2f" }
];

function Graficos() {
    const [estaciones, setEstaciones] = useState([]);
    const [estacionSeleccionada, setEstacionSeleccionada] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [topico, setTopico] = useState(topicos[0].value);
    const [intervalo, setIntervalo] = useState("hora");
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar estaciones solo una vez
    useEffect(() => {
        const cached = localStorage.getItem("estaciones");
        if (cached) {
            const estacionesData = JSON.parse(cached);
            setEstaciones(estacionesData);
            if (estacionesData.length > 0) {
                setEstacionSeleccionada(estacionesData[0].value);
            }
        } else {
            fetch("http://localhost:8080/api/centrales", { credentials: "include" })
                .then(res => res.ok ? res.json() : Promise.reject("Error al obtener estaciones"))
                .then(data => {
                    const estacionesData = data.map(c => ({ value: c.nombre_central, label: c.nombre_central }));
                    setEstaciones(estacionesData);
                    if (estacionesData.length > 0) {
                        setEstacionSeleccionada(estacionesData[0].value);
                    }
                    localStorage.setItem("estaciones", JSON.stringify(estacionesData));
                })
                .catch(() => setEstaciones([]));
        }
    }, []);

    // Ajustar fechas por defecto al cambiar de estación
    useEffect(() => {
        if (!estacionSeleccionada) return;

        fetch(`http://localhost:8080/api/mediciones/ultimas?central=${encodeURIComponent(estacionSeleccionada)}&limit=1`, { credentials: "include" })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                const lastDate = data.length > 0 ? dayjs(data[0].fecha) : dayjs();
                setFechaFin(lastDate.format('YYYY-MM-DD'));
                setFechaInicio(lastDate.subtract(7, 'day').format('YYYY-MM-DD'));
            })
            .catch(() => {
                const today = dayjs();
                setFechaFin(today.format('YYYY-MM-DD'));
                setFechaInicio(today.subtract(7, 'day').format('YYYY-MM-DD'));
            });
    }, [estacionSeleccionada]);

    // Determinar el intervalo automáticamente basado en el rango de fechas
    useEffect(() => {
        if (fechaInicio && fechaFin) {
            const start = dayjs(fechaInicio);
            const end = dayjs(fechaFin);
            const diffDays = end.diff(start, 'day');

            if (diffDays <= 2) setIntervalo('hora');
            else if (diffDays <= 62) setIntervalo('dia');
            else if (diffDays <= 365) setIntervalo('semana');
            else setIntervalo('mes');
        }
    }, [fechaInicio, fechaFin]);

    // Cargar datos cuando los filtros cambian
    useEffect(() => {
        if (estacionSeleccionada && topico && intervalo && fechaInicio && fechaFin) {
            fetchDatos();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [estacionSeleccionada, topico, intervalo]); // Se ejecuta cuando el intervalo (y por ende las fechas) cambia

    const fetchDatos = () => {
        setLoading(true);
        setError(null);
        const url = `http://localhost:8080/api/mediciones/agrupadas?central=${encodeURIComponent(estacionSeleccionada)}&topico=${topico}&intervalo=${intervalo}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;

        fetch(url, { credentials: "include" })
            .then(res => {
                if (!res.ok) throw new Error("Error al obtener datos del servidor (verifique el estado del backend)");
                return res.json();
            })
            .then(data => {
                const chartData = data.map(item => ({
                    fecha: item.fecha,
                    valor: item.valor !== null ? parseFloat(parseFloat(item.valor).toFixed(2)) : null,
                }));
                setDatos(chartData);
            })
            .catch(err => {
                setError(err.message);
                setDatos([]);
            })
            .finally(() => setLoading(false));
    };

    const handleFiltrar = (e) => {
        e.preventDefault();
        fetchDatos();
    };

    const formatFechaEjeX = (fecha) => {
        if (!fecha) return "";
        if (/T\d{2}/.test(fecha)) return dayjs.utc(fecha).format("DD/MM HH:mm");
        if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return dayjs.utc(fecha).format("DD/MM/YYYY");
        if (/^\d{4}-\d{2}$/.test(fecha)) return dayjs.utc(fecha + "-01").format("MM/YYYY");
        return fecha;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const topicInfo = topicos.find(t => t.value === topico);
            return (
                <Paper sx={{ p: 1.5, background: 'rgba(255, 255, 255, 0.9)', borderRadius: 2, boxShadow: 3 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        {formatFechaEjeX(label)}
                    </Typography>
                    {payload.map((entry, idx) => (
                        <Box key={idx} display="flex" alignItems="center" gap={1} sx={{ mt: 0.5 }}>
                            <span style={{ width: 12, height: 12, background: entry.color, borderRadius: '50%', display: 'inline-block', border: '1px solid #fff' }} />
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {topicInfo?.label.split(' ')[0]}:
                                <span style={{ fontWeight: 'normal' }}> {entry.value !== null ? entry.value : "N/A"}</span>
                            </Typography>
                        </Box>
                    ))}
                </Paper>
            );
        }
        return null;
    };

    return (
        <Fade in={true} timeout={500}>
            <Paper elevation={3} sx={{ borderRadius: 3, p: { xs: 1, sm: 2 } }}>
                <Typography variant="h6" gutterBottom>
                    Gráfico de {topicos.find(t => t.value === topico)?.label || ''} en {estacionSeleccionada}
                </Typography>
                <Box component="form" onSubmit={handleFiltrar} sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
                    <TextField select label="Estación" value={estacionSeleccionada} onChange={e => setEstacionSeleccionada(e.target.value)} size="small" sx={{ minWidth: 160, flex: '1 1 120px' }}>
                        {estaciones.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                    </TextField>
                    <TextField label="Desde" type="date" size="small" InputLabelProps={{ shrink: true }} value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} sx={{ minWidth: 140 }} />
                    <TextField label="Hasta" type="date" size="small" InputLabelProps={{ shrink: true }} value={fechaFin} onChange={e => setFechaFin(e.target.value)} sx={{ minWidth: 140 }} />
                    <TextField select label="Tópico" value={topico} onChange={e => setTopico(e.target.value)} size="small" sx={{ minWidth: 150 }}>
                        {topicos.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                    </TextField>
                    <Button type="submit" variant="contained" sx={{ minWidth: 120 }}>Filtrar</Button>
                </Box>
                {loading ? (
                    <Box sx={{ p: 2 }}><Skeleton variant="rectangular" width="100%" height={400} animation="wave" /></Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                ) : datos.length === 0 ? (
                    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="200px" color="text.secondary">
                        <BarChartIcon sx={{ fontSize: 60 }} />
                        <Typography variant="h6">No hay datos para mostrar</Typography>
                        <Typography>Seleccione un rango de fechas diferente o verifique la disponibilidad de datos.</Typography>
                    </Box>
                ) : (
                    <Box sx={{ width: "100%", minHeight: 300, overflowX: "auto" }}>
                        <ResponsiveContainer width="100%" height={400} minWidth={320}>
                            <LineChart data={datos} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                                <XAxis dataKey="fecha" tickFormatter={formatFechaEjeX} minTickGap={25} angle={-10} textAnchor="end" />
                                <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    key={topico}
                                    type="monotone"
                                    dataKey="valor"
                                    stroke={topicos.find(t => t.value === topico)?.color || '#8884d8'}
                                    name={topicos.find(t => t.value === topico)?.label}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                )}
            </Paper>
        </Fade>
    );
}

export default Graficos;
