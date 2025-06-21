import React from "react";
import { Chip, Tooltip, Badge, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Fade } from "@mui/material";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const labelTooltip = {
    "Temp": "Temperatura",
    "Humedad": "Humedad relativa",
    "PM2.5": "Material particulado fino (PM2.5)",
    "PM10": "Material particulado grueso (PM10)"
};

// Umbrales por defecto
const defaultThresholds = {
    pm25: 25,
    pm10: 50,
    temperatura: 35,
    humedad: 80
};

export function getThresholds() {
    const saved = localStorage.getItem('umbral_mediciones');
    return saved ? JSON.parse(saved) : defaultThresholds;
}

export function setThresholds(newThresholds) {
    localStorage.setItem('umbral_mediciones', JSON.stringify(newThresholds));
}

export function ThresholdConfigDialog({ open, onClose, onSave }) {
    const [values, setValues] = React.useState(getThresholds());
    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: Number(e.target.value) });
    };
    const handleSave = () => {
        setThresholds(values);
        onSave && onSave(values);
        onClose();
    };
    return (
        <Dialog open={open} onClose={onClose} TransitionComponent={Fade} keepMounted>
            <DialogTitle>Configurar umbrales de alerta</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
                <TextField label="PM2.5 crítico (µg/m³)" name="pm25" type="number" value={values.pm25} onChange={handleChange} />
                <TextField label="PM10 crítico (µg/m³)" name="pm10" type="number" value={values.pm10} onChange={handleChange} />
                <TextField label="Temperatura crítica (°C)" name="temperatura" type="number" value={values.temperatura} onChange={handleChange} />
                <TextField label="Humedad crítica (%)" name="humedad" type="number" value={values.humedad} onChange={handleChange} />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Guardar</Button>
            </DialogActions>
        </Dialog>
    );
}

export default function ValorChip({ label, value, unidad }) {
    const thresholds = getThresholds();
    let color = "default";
    let displayValue = value;
    let showWarning = false;
    if (value === null || value === undefined || isNaN(value)) {
        displayValue = "N/A";
        color = "default";
    } else if (label.includes("PM2.5")) {
        color = value > thresholds.pm25 ? "warning" : "success";
        showWarning = value > thresholds.pm25;
    } else if (label.includes("PM10")) {
        color = value > thresholds.pm10 ? "error" : "success";
        showWarning = value > thresholds.pm10;
    } else if (label.includes("Temp")) {
        color = value > thresholds.temperatura ? "warning" : "primary";
        showWarning = value > thresholds.temperatura;
    } else if (label.includes("Humedad")) {
        color = value > thresholds.humedad ? "warning" : "info";
        showWarning = value > thresholds.humedad;
    }
    return (
        <Tooltip title={labelTooltip[label] || label} arrow>
            <Box display="inline-flex" alignItems="center">
                <Chip
                    label={`${displayValue} ${unidad}`}
                    color={color}
                    variant="outlined"
                    size="small"
                    aria-label={labelTooltip[label] || label}
                    sx={{ fontWeight: 500, fontSize: { xs: 13, sm: 15 }, px: 1.2, minWidth: 70 }}
                />
                {showWarning && <WarningAmberIcon color="warning" fontSize="small" sx={{ ml: 0.5 }} />}
            </Box>
        </Tooltip>
    );
}

// Componente atómico reutilizable para chips de valor con umbral y alerta
export function ValorChipAtomico({ label, value, unidad }) {
    const thresholds = getThresholds();
    let color = "default";
    let displayValue = value;
    let showWarning = false;
    if (value === null || value === undefined || isNaN(value)) {
        displayValue = "N/A";
        color = "default";
    } else if (label.includes("PM2.5")) {
        color = value > thresholds.pm25 ? "warning" : "success";
        showWarning = value > thresholds.pm25;
    } else if (label.includes("PM10")) {
        color = value > thresholds.pm10 ? "error" : "success";
        showWarning = value > thresholds.pm10;
    } else if (label.includes("Temp")) {
        color = value > thresholds.temperatura ? "warning" : "primary";
        showWarning = value > thresholds.temperatura;
    } else if (label.includes("Humedad")) {
        color = value > thresholds.humedad ? "warning" : "info";
        showWarning = value > thresholds.humedad;
    }
    return (
        <Tooltip title={labelTooltip[label] || label} arrow>
            <Box display="inline-flex" alignItems="center">
                <Chip
                    label={`${displayValue} ${unidad}`}
                    color={color}
                    variant="outlined"
                    size="small"
                    aria-label={labelTooltip[label] || label}
                    sx={{ fontWeight: 500, fontSize: { xs: 13, sm: 15 }, px: 1.2, minWidth: 70 }}
                />
                {showWarning && <WarningAmberIcon color="warning" fontSize="small" sx={{ ml: 0.5 }} />}
            </Box>
        </Tooltip>
    );
}
