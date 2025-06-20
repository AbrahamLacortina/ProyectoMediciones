import React from "react";
import { Chip, Tooltip } from "@mui/material";

const labelTooltip = {
    "Temp": "Temperatura",
    "Humedad": "Humedad relativa",
    "PM2.5": "Material particulado fino (PM2.5)",
    "PM10": "Material particulado grueso (PM10)"
};

export default function ValorChip({ label, value, unidad }) {
    let color = "default";
    let displayValue = value;
    if (value === null || value === undefined || isNaN(value)) {
        displayValue = "N/A";
        color = "default";
    } else if (label.includes("PM2.5")) {
        color = value > 25 ? "warning" : "success";
    } else if (label.includes("PM10")) {
        color = value > 50 ? "error" : "success";
    } else if (label.includes("Temp")) {
        color = "primary";
    } else if (label.includes("Humedad")) {
        color = "info";
    }
    return (
        <Tooltip title={labelTooltip[label] || label} arrow>
            <Chip
                label={`${displayValue} ${unidad}`}
                color={color}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 500 }}
                aria-label={labelTooltip[label] || label}
            />
        </Tooltip>
    );
}

