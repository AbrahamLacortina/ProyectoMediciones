import React, { useEffect, useState, useMemo } from "react";
import mqtt from 'mqtt';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    TablePagination, CircularProgress, Typography, Box, Alert, IconButton, Collapse, TableSortLabel,
    Fade, Button, TextField, MenuItem, Skeleton
} from '@mui/material';
import { Cloud, Thermostat, WaterDrop, Search, InfoOutlined, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import ValorChip, { ThresholdConfigDialog, getThresholds } from "./ValorChip";
import { formatFecha, formatFechaLocal } from "./utils";
import { Sparklines, SparklinesLine } from "react-sparklines";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SettingsIcon from '@mui/icons-material/Settings';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import ResumenEstadistico from "./ResumenEstadistico";
import { visuallyHidden } from '@mui/utils';

function exportToCSV(data, filename = "mediciones.csv") {
    const header = ["Fecha", "Temperatura", "Humedad", "PM2.5", "PM10"];
    const rows = data.map(m => [
        formatFechaLocal(m.fecha),
        m.temperatura,
        m.humedad,
        m.pm25,
        m.pm10
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function exportToExcel(data) {
    import("xlsx").then(XLSX => {
        const ws = XLSX.utils.json_to_sheet(data.map(m => ({
            Fecha: formatFechaLocal(m.fecha),
            Temperatura: m.temperatura,
            Humedad: m.humedad,
            "PM2.5": m.pm25,
            "PM10": m.pm10
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Mediciones");
        XLSX.writeFile(wb, "mediciones.xlsx");
    });
}

function exportToPDF(data) {
    import("jspdf").then(jsPDF => {
        import("jspdf-autotable").then(() => {
            const doc = new jsPDF.jsPDF();
            doc.text("Mediciones", 14, 10);
            doc.autoTable({
                head: [["Fecha", "Temperatura", "Humedad", "PM2.5", "PM10"]],
                body: data.map(m => [
                    formatFechaLocal(m.fecha),
                    m.temperatura,
                    m.humedad,
                    m.pm25,
                    m.pm10
                ]),
                startY: 20
            });
            doc.save("mediciones.pdf");
        });
    });
}

const MedicionesTable = () => {
    const [mediciones, setMediciones] = useState([]);
    const [newMedicion, setNewMedicion] = useState(null);
    const [lastShownMedicionId, setLastShownMedicionId] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('fecha');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [estaciones, setEstaciones] = useState([]);
    const [estacion, setEstacion] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

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
        fetch("http://localhost:8080/api/centrales", { credentials: "include" })
            .then(res => {
                if (!res.ok) throw new Error("Error al obtener estaciones");
                return res.json();
            })
            .then(data => {
                const estacionesData = data.map(c => ({ value: c.nombre_central, label: c.nombre_central }));
                setEstaciones(estacionesData);
                if (estacionesData.length > 0) {
                    setEstacion(estacionesData[0].value);
                }
            })
            .catch(() => setEstaciones([]));
    }, []);

    useEffect(() => {
        if (estacion) {
            setPage(0); // Reinicia a la primera página al cambiar estación
            fetchMediciones(0, rowsPerPage);
        }
        // eslint-disable-next-line
    }, [estacion]);

    // useEffect para actualizar la tabla cuando cambian los filtros de fecha, página, tamaño o estación
    useEffect(() => {
        if (!estacion) return;
        fetchMediciones(page, rowsPerPage, fechaInicio, fechaFin);
        // eslint-disable-next-line
    }, [fechaInicio, fechaFin, rowsPerPage, estacion, page]);

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

    // Modificar fetchMediciones para incluir filtros avanzados
    const fetchMediciones = (pageArg = page, sizeArg = rowsPerPage, fechaInicioArg = fechaInicio, fechaFinArg = fechaFin) => {
        if (!estacion) return;
        setLoading(true);
        setError(null);
        setNoMoreData(false);
        let url = `http://localhost:8080/api/mediciones/rango?central=${encodeURIComponent(estacion)}&fechaInicio=${fechaInicioArg || '2000-01-01'}&fechaFin=${fechaFinArg || '2100-12-31'}&page=${pageArg}&size=${sizeArg}`;
        Object.entries(filtros).forEach(([k, v]) => { if (v !== '') url += `&${k}=${v}`; });
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

    // Conexión MQTT para nuevas mediciones
    useEffect(() => {
        const client = mqtt.connect('ws://localhost:8083/mqtt');

        client.on('connect', () => {
            console.log('Conectado al broker MQTT');
            client.subscribe('mediciones/nuevas', (err) => {
                if (err) {
                    console.error('Error al suscribirse al topic:', err);
                }
            });
        });

        client.on('message', (topic, message) => {
            const medicion = JSON.parse(message.toString());
            console.log('Nuevo mensaje MQTT:', medicion);

            // Si hay mediciones en la tabla, comparar por id o fecha
            const idActual = mediciones[0]?.id;
            if (medicion.id && medicion.id !== ultimaMedicionId && medicion.id !== idActual) {
                setNuevaMedicion(medicion);
                setSnackbarVisible(true);
                setUltimaMedicionId(medicion.id);
            }
        });

        return () => {
            if (client) {
                client.end();
            }
        };
        // eslint-disable-next-line
    }, [mediciones, ultimaMedicionId]);

    // Actualiza el id de la última medición cuando cambian los datos de la tabla
    useEffect(() => {
        if (mediciones.length > 0) {
            setUltimaMedicionId(mediciones[0].id);
        }
    }, [mediciones]);

    // Mueve los hooks fuera de cualquier condicional
    const [showThresholdDialog, setShowThresholdDialog] = useState(false);
    const [filtros, setFiltros] = useState({
        temperaturaMin: '', temperaturaMax: '',
        humedadMin: '', humedadMax: '',
        pm25Min: '', pm25Max: '',
        pm10Min: '', pm10Max: ''
    });
    const resumen = useMemo(() => {
        if (!mediciones.length) return null;
        const calc = key => {
            const vals = mediciones.map(m => m[key]).filter(x => x !== null && x !== undefined && !isNaN(x));
            if (!vals.length) return { promedio: '-', min: '-', max: '-' };
            return {
                promedio: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2),
                min: Math.min(...vals).toFixed(2),
                max: Math.max(...vals).toFixed(2)
            };
        };
        return {
            temperatura: calc('temperatura'),
            humedad: calc('humedad'),
            pm25: calc('pm25'),
            pm10: calc('pm10')
        };
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

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const createSortHandler = (property) => (event) => {
        handleRequestSort(event, property);
    };

    const descendingComparator = (a, b, orderBy) => {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    };

    const getComparator = (order, orderBy) => {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    };

    // This method is created for cross-browser compatibility, if you don't
    // need to support IE11, you can use Array.prototype.sort() directly
    const stableSort = (array, comparator) => {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) {
                return order;
            }
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    const headCells = [
        { id: 'fecha', numeric: false, label: 'Fecha', icon: <Cloud sx={{ verticalAlign: "middle" }} />, tooltip: 'Fecha y hora de la medición' },
        { id: 'temperatura', numeric: true, label: 'Temp. (°C)', icon: <Thermostat sx={{ verticalAlign: "middle" }} />, tooltip: 'Temperatura' },
        { id: 'humedad', numeric: true, label: 'Humedad (%)', icon: <WaterDrop sx={{ verticalAlign: "middle" }} />, tooltip: 'Humedad relativa' },
        { id: 'pm25', numeric: true, label: 'PM2.5', tooltip: 'Material particulado fino' },
        { id: 'pm10', numeric: true, label: 'PM10', tooltip: 'Material particulado grueso' },
    ];

    return (
        <Fade in={true} timeout={500}>
            <Paper elevation={3} sx={{ borderRadius: 3, p: { xs: 1, sm: 2 } }}>
                <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} mb={2} gap={2}>
                    <Typography variant="h6">Mediciones Recientes</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => exportToCSV(mediciones)} size="small">CSV</Button>
                        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => exportToExcel(mediciones)} size="small">Excel</Button>
                        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => exportToPDF(mediciones)} size="small">PDF</Button>
                        <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => setShowThresholdDialog(true)} size="small">Umbrales</Button>
                    </Box>
                </Box>
                {/* Resumen estadístico y tendencias */}
                <ResumenEstadistico resumen={resumen} mediciones={mediciones} />
                <Box component="form" onSubmit={handleFiltrar} sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2, alignItems: "center" }}>
                    <TextField select label="Estación" value={estacion} onChange={e => setEstacion(e.target.value)} size="small" sx={{ minWidth: 140, flex: '1 1 120px' }}>
                        {estacionesMemo.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </TextField>
                    <TextField label="Desde" type="date" size="small" InputLabelProps={{ shrink: true }} value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} sx={{ minWidth: 120 }} />
                    <TextField label="Hasta" type="date" size="small" InputLabelProps={{ shrink: true }} value={fechaFin} onChange={e => setFechaFin(e.target.value)} sx={{ minWidth: 120 }} />
                    {/* Filtros avanzados */}
                    <TextField label="Temp. mín" type="number" size="small" value={filtros.temperaturaMin} onChange={e => setFiltros(f => ({ ...f, temperaturaMin: e.target.value }))} sx={{ width: 100 }} />
                    <TextField label="Temp. máx" type="number" size="small" value={filtros.temperaturaMax} onChange={e => setFiltros(f => ({ ...f, temperaturaMax: e.target.value }))} sx={{ width: 100 }} />
                    <TextField label="Humedad mín" type="number" size="small" value={filtros.humedadMin} onChange={e => setFiltros(f => ({ ...f, humedadMin: e.target.value }))} sx={{ width: 110 }} />
                    <TextField label="Humedad máx" type="number" size="small" value={filtros.humedadMax} onChange={e => setFiltros(f => ({ ...f, humedadMax: e.target.value }))} sx={{ width: 110 }} />
                    <TextField label="PM2.5 mín" type="number" size="small" value={filtros.pm25Min} onChange={e => setFiltros(f => ({ ...f, pm25Min: e.target.value }))} sx={{ width: 110 }} />
                    <TextField label="PM2.5 máx" type="number" size="small" value={filtros.pm25Max} onChange={e => setFiltros(f => ({ ...f, pm25Max: e.target.value }))} sx={{ width: 110 }} />
                    <TextField label="PM10 mín" type="number" size="small" value={filtros.pm10Min} onChange={e => setFiltros(f => ({ ...f, pm10Min: e.target.value }))} sx={{ width: 100 }} />
                    <TextField label="PM10 máx" type="number" size="small" value={filtros.pm10Max} onChange={e => setFiltros(f => ({ ...f, pm10Max: e.target.value }))} sx={{ width: 100 }} />
                    <TextField label="Tamaño página" type="number" size="small" value={rowsPerPage} onChange={e => setRowsPerPage(Number(e.target.value))} inputProps={{ min: 10, max: 1000 }} sx={{ width: 110 }} />
                    <Button type="submit" variant="contained" startIcon={<Search />} sx={{ minWidth: 120 }}>Filtrar</Button>
                </Box>
                <Box sx={{ width: "100%", overflowX: "auto" }}>
                    <TableContainer>
                        <Table size="small" aria-label="Tabla de mediciones ambientales" sx={{
                            transition: 'background-color 0.4s, color 0.4s',
                            bgcolor: (theme) => theme.palette.background.paper,
                            color: (theme) => theme.palette.text.primary
                        }}>
                            <TableHead>
                                <TableRow>
                                    {headCells.map((headCell) => (
                                        <TableCell
                                            key={headCell.id}
                                            align={headCell.numeric ? 'right' : 'left'}
                                            sortDirection={orderBy === headCell.id ? order : false}
                                        >
                                            <Tooltip title={headCell.tooltip}>
                                                <TableSortLabel
                                                    active={orderBy === headCell.id}
                                                    direction={orderBy === headCell.id ? order : 'asc'}
                                                    onClick={createSortHandler(headCell.id)}
                                                >
                                                    {headCell.icon} {headCell.label}
                                                    {orderBy === headCell.id ? (
                                                        <Box component="span" sx={visuallyHidden}>
                                                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                                        </Box>
                                                    ) : null}
                                                </TableSortLabel>
                                            </Tooltip>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    Array.from(new Array(rowsPerPage)).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell><Skeleton animation="wave" /></TableCell>
                                            <TableCell><Skeleton animation="wave" /></TableCell>
                                            <TableCell><Skeleton animation="wave" /></TableCell>
                                            <TableCell><Skeleton animation="wave" /></TableCell>
                                            <TableCell><Skeleton animation="wave" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : mediciones.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                                                <InfoOutlined sx={{ fontSize: 60 }} />
                                                <Typography variant="h6">No se encontraron mediciones</Typography>
                                                <Typography>Prueba a cambiar los filtros o selecciona otra estación.</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    stableSort(mediciones, getComparator(order, orderBy))
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((m) => (
                                            <TableRow key={m.id}>
                                                <TableCell>{formatFecha(m.fecha)}</TableCell>
                                                <TableCell align="right">
                                                    <ValorChip label="Temp" value={m.temperatura} unidad="°C" />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <ValorChip label="Humedad" value={m.humedad} unidad="%" />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <ValorChip label="PM2.5" value={m.pm25} unidad="µg/m³" />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <ValorChip label="PM10" value={m.pm10} unidad="µg/m³" />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
                <TablePagination
                    component="div"
                    count={totalElements}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    labelRowsPerPage="Filas por página"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count !== -1 ? count : 'más de ' + to} registros`}
                    showFirstButton
                    showLastButton={totalPages > 1}
                    SelectProps={{ inputProps: { 'aria-label': 'Filas por página' }, native: false }}
                    rowsPerPageOptions={[]}
                    sx={{ mt: 1, mb: 1, '& .MuiTablePagination-toolbar': { flexWrap: 'wrap' } }}
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
                <ThresholdConfigDialog open={showThresholdDialog} onClose={() => setShowThresholdDialog(false)} onSave={() => {}} />
            </Paper>
        </Fade>
    );
}

export default MedicionesTable;
