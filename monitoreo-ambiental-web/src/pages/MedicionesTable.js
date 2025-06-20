import React, { useEffect, useState, useMemo } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, CircularProgress, Alert, Typography, Box, Chip, TextField, MenuItem, Button,
} from "@mui/material";
import { Cloud, Thermostat, WaterDrop, Search, InfoOutlined } from "@mui/icons-material";
import ValorChip from "./ValorChip";
import { formatFecha } from "./utils";
import TablePagination from '@mui/material/TablePagination';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';

function MedicionesTable() {
    const [mediciones, setMediciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [estaciones, setEstaciones] = useState([]);
    const [estacion, setEstacion] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(100);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [noMoreData, setNoMoreData] = useState(false);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [nuevaMedicion, setNuevaMedicion] = useState(null);
    const [ultimaMedicionId, setUltimaMedicionId] = useState(null);

    const estacionesMemo = useMemo(() => {
        const cached = localStorage.getItem("estaciones");
        if (cached) {
            return JSON.parse(cached);
        }
        return estaciones;
    }, [estaciones]);

    // Cargar estaciones solo una vez y cachear en localStorage para mejorar velocidad
    useEffect(() => {
        const cached = localStorage.getItem("estaciones");
        if (cached) {
            setEstaciones(JSON.parse(cached));
            setEstacion(JSON.parse(cached)[0]?.value || "");
        } else {
            fetch("http://localhost:8080/api/centrales", { credentials: "include" })
                .then(res => {
                    if (!res.ok) throw new Error("Error al obtener estaciones");
                    return res.json();
                })
                .then(data => {
                    const estacionesData = data.map(c => ({ value: c.nombre_central, label: c.nombre_central }));
                    setEstaciones(estacionesData);
                    setEstacion(estacionesData[0]?.value || "");
                    localStorage.setItem("estaciones", JSON.stringify(estacionesData));
                })
                .catch(() => setEstaciones([]));
        }
    }, []);

    useEffect(() => {
        if (estacion) {
            setPage(0); // Reinicia a la primera página al cambiar estación
            fetchMediciones(0, size);
        }
        // eslint-disable-next-line
    }, [estacion]);

    // useEffect para actualizar la tabla cuando cambian los filtros de fecha, página, tamaño o estación
    useEffect(() => {
        if (!estacion) return;
        fetchMediciones(page, size, fechaInicio, fechaFin);
        // eslint-disable-next-line
    }, [fechaInicio, fechaFin, size, estacion, page]);

    // Al cambiar estación, obtener los últimos 60 registros y ajustar fechas por defecto
    useEffect(() => {
        if (!estacion) return;
        setLoading(true);
        fetch(`http://localhost:8080/api/mediciones/ultimas?central=${encodeURIComponent(estacion)}&limit=60`, { credentials: "include" })
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (data.length > 0) {
                    // Calcular fechas mín y máx
                    const fechas = data.map(m => new Date(m.fecha));
                    const minFecha = new Date(Math.min(...fechas));
                    const maxFecha = new Date(Math.max(...fechas));
                    // 10 días antes y después
                    const fechaInicioDefault = new Date(minFecha);
                    fechaInicioDefault.setDate(fechaInicioDefault.getDate() - 10);
                    const fechaFinDefault = new Date(maxFecha);
                    fechaFinDefault.setDate(fechaFinDefault.getDate() + 10);
                    // Formato yyyy-MM-dd
                    const toYMD = d => d.toISOString().slice(0,10);
                    setFechaInicio(toYMD(fechaInicioDefault));
                    setFechaFin(toYMD(fechaFinDefault));
                    setPage(0); // Reinicia la paginación
                } else {
                    setFechaInicio("");
                    setFechaFin("");
                    setMediciones([]);
                }
                setLoading(false);
            })
            .catch(() => {
                setFechaInicio("");
                setFechaFin("");
                setMediciones([]);
                setLoading(false);
            });
        // eslint-disable-next-line
    }, [estacion]);

    // Cambia fetchMediciones para NO ejecutar si no hay estación seleccionada
    const fetchMediciones = (pageArg = page, sizeArg = size, fechaInicioArg = fechaInicio, fechaFinArg = fechaFin) => {
        if (!estacion) return; // No hacer fetch si no hay estación
        setLoading(true);
        setError(null);
        setNoMoreData(false);
        let url = `http://localhost:8080/api/mediciones/rango?central=${encodeURIComponent(estacion)}&fechaInicio=${fechaInicioArg || '2000-01-01'}&fechaFin=${fechaFinArg || '2100-12-31'}&page=${pageArg}&size=${sizeArg}`;
        fetch(url, { credentials: "include" })
            .then(res => {
                if (!res.ok) throw new Error("Error al obtener datos");
                const total = res.headers.get("X-Total-Pages");
                const totalElems = res.headers.get("X-Total-Elements");
                if (total) setTotalPages(Number(total));
                if (totalElems) setTotalElements(Number(totalElems));
                return res.json();
            })
            .then(data => {
                if (data.length === 0) setNoMoreData(true);
                setMediciones(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    };

    // Polling para nueva medición
    useEffect(() => {
        if (!estacion) return;
        let intervalId;
        const fetchUltimaMedicion = () => {
            fetch(`http://localhost:8080/api/mediciones/ultima?central=${encodeURIComponent(estacion)}`, { credentials: "include" })
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (!data) return;
                    // Si hay mediciones en la tabla, comparar por id o fecha
                    const idActual = mediciones[0]?.id;
                    if (data.id && data.id !== ultimaMedicionId && data.id !== idActual) {
                        setNuevaMedicion(data);
                        setSnackbarVisible(true);
                        setUltimaMedicionId(data.id);
                    }
                })
                .catch(() => {});
        };
        fetchUltimaMedicion();
        intervalId = setInterval(fetchUltimaMedicion, 10000); // cada 10s
        return () => clearInterval(intervalId);
        // eslint-disable-next-line
    }, [estacion, mediciones, ultimaMedicionId]);

    // Actualiza el id de la última medición cuando cambian los datos de la tabla
    useEffect(() => {
        if (mediciones.length > 0) {
            setUltimaMedicionId(mediciones[0].id);
        }
    }, [mediciones]);

    // Mostrar mensaje si no hay estaciones
    if (estacionesMemo.length === 0) {
        return (
            <Alert severity="info" icon={<InfoOutlined />} sx={{ mt: 2 }}>
                No hay estaciones disponibles para mostrar.
            </Alert>
        );
    }

    // Validar fechas antes de fetch
    const handleFiltrar = (e) => {
        e.preventDefault();
        if (!estacion) {
            setError("Debes seleccionar una estación.");
            return;
        }
        if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
            setError("La fecha de inicio no puede ser mayor que la fecha de fin.");
            return;
        }
        fetchMediciones();
    };

    return (
        <Paper elevation={3} sx={{ borderRadius: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Mediciones Recientes
            </Typography>
            <Box component="form" onSubmit={handleFiltrar} sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                <TextField
                    select
                    label="Estación"
                    value={estacion}
                    onChange={e => setEstacion(e.target.value)}
                    size="small"
                >
                    {estacionesMemo.map(opt => (
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
                    label="Tamaño página"
                    type="number"
                    size="small"
                    value={size}
                    onChange={e => setSize(Number(e.target.value))}
                    inputProps={{ min: 10, max: 1000 }}
                    sx={{ width: 120 }}
                />
                <Button type="submit" variant="contained" startIcon={<Search />}>Filtrar</Button>
            </Box>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
                    <MuiAlert elevation={6} variant="filled" severity="error" onClose={() => setError(null)}>
                        {error}
                    </MuiAlert>
                </Snackbar>
            ) : (
                <>
                <TableContainer>
                    <Table size="small" aria-label="Tabla de mediciones ambientales">
                        <TableHead>
                            <TableRow>
                                <TableCell><Tooltip title="Fecha y hora de la medición"><Cloud sx={{ verticalAlign: "middle" }} /> Fecha</Tooltip></TableCell>
                                <TableCell><Tooltip title="Temperatura"><Thermostat sx={{ verticalAlign: "middle" }} /> Temp. (°C)</Tooltip></TableCell>
                                <TableCell><Tooltip title="Humedad relativa"><WaterDrop sx={{ verticalAlign: "middle" }} /> Humedad (%)</Tooltip></TableCell>
                                <TableCell><Tooltip title="Material particulado fino"><span>PM2.5</span></Tooltip></TableCell>
                                <TableCell><Tooltip title="Material particulado grueso"><span>PM10</span></Tooltip></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mediciones.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Alert severity="info" sx={{ my: 2 }}>
                                            No hay mediciones para los filtros seleccionados.
                                        </Alert>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                mediciones.map((m) => (
                                    <TableRow key={m.id}>
                                        <TableCell>{formatFecha(m.fecha)}</TableCell>
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={totalElements}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={size}
                    onRowsPerPageChange={e => { setSize(parseInt(e.target.value, 10)); setPage(0); }}
                    labelRowsPerPage="Filas por página"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : 'más de ' + to} registros`}
                    showFirstButton
                    showLastButton={totalPages > 1}
                    SelectProps={{ inputProps: { 'aria-label': 'Filas por página' }, native: false }}
                    rowsPerPageOptions={[]}
                />
                <Snackbar
                    open={snackbarVisible}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    autoHideDuration={8000}
                    onClose={() => setSnackbarVisible(false)}
                    sx={{
                        animation: snackbarVisible ? 'fadeInRight 0.5s' : undefined,
                        '@keyframes fadeInRight': {
                            from: { opacity: 0, transform: 'translateX(100px)' },
                            to: { opacity: 1, transform: 'translateX(0)' }
                        }
                    }}
                >
                    <MuiAlert
                        elevation={6}
                        variant="filled"
                        severity="info"
                        action={
                            <Button color="inherit" size="small" onClick={() => {
                                setSnackbarVisible(false);
                                fetchMediciones();
                            }}>
                                Ver ahora
                            </Button>
                        }
                        onClose={() => setSnackbarVisible(false)}
                    >
                        {nuevaMedicion && nuevaMedicion.fecha ? (
                            <>Nueva medición disponible en {formatFecha(nuevaMedicion.fecha)}</>
                        ) : (
                            <>Nueva medición disponible</>
                        )}
                    </MuiAlert>
                </Snackbar>
                </>
            )}
        </Paper>
    );
}

export default MedicionesTable;
