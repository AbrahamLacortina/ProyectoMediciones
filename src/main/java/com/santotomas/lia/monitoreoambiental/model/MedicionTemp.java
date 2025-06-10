package com.santotomas.lia.monitoreoambiental.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicionTemp {
    private String fechaStr; // Para almacenar la fecha como String hasta que tengamos todos los datos
    private Float temperatura;
    private Float humedad;
    private Float pm25;
    private Float pm10;
    private long lastUpdateTime; // Timestamp para saber cuándo se actualizó por última vez
    private boolean isComplete; // Indicador si todos los datos principales han llegado

    public boolean isReadyToPersist() {
        return temperatura != null && humedad != null && pm25 != null && pm10 != null && fechaStr != null;
    }
}