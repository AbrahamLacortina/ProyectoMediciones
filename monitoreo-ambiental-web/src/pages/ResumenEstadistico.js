import React from "react";
import { Paper, Typography, Box, Tooltip, useTheme } from "@mui/material";
import { Sparklines, SparklinesLine } from "react-sparklines";
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';

export default function ResumenEstadistico({ resumen, mediciones }) {
    const theme = useTheme();

    const variables = [
        {
            key: "temperatura",
            label: "Temperatura (°C)",
            icon: <ThermostatIcon color="primary" fontSize="small" />, color: "#004F45"
        },
        {
            key: "humedad",
            label: "Humedad (%)",
            icon: <WaterDropIcon color="info" fontSize="small" />, color: theme.palette.info.main
        },
        {
            key: "pm25",
            label: "PM2.5 (µg/m³)",
            icon: <AirIcon color="warning" fontSize="small" />, color: "#43a047"
        },
        {
            key: "pm10",
            label: "PM10 (µg/m³)",
            icon: <AirIcon color="error" fontSize="small" />, color: "#d32f2f"
        }
    ];

    if (!resumen) return null;
    return (
        <Box display="flex" gap={3} mb={2} flexWrap="wrap">
            {variables.map(v => (
                <Paper key={v.key} elevation={2} sx={{ p: 2, minWidth: 200, flex: '1 1 220px', maxWidth: 260 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        {v.icon}
                        <Typography variant="subtitle2">{v.label}</Typography>
                    </Box>
                    <Typography variant="body2">Promedio: <b>{resumen[v.key]?.promedio}</b></Typography>
                    <Typography variant="body2">Máx: <b>{resumen[v.key]?.max}</b></Typography>
                    <Typography variant="body2">Mín: <b>{resumen[v.key]?.min}</b></Typography>
                    {Array.isArray(mediciones) && mediciones.length > 1 && (
                        <Tooltip title="Tendencia reciente" arrow>
                            <Box mt={1}>
                                <Sparklines data={mediciones.map(m => m[v.key]).filter(x => x !== null && x !== undefined && !isNaN(x))} height={32} width={100} margin={4}>
                                    <SparklinesLine color={v.color} style={{ fill: "none" }} />
                                </Sparklines>
                            </Box>
                        </Tooltip>
                    )}
                </Paper>
            ))}
        </Box>
    );
}
