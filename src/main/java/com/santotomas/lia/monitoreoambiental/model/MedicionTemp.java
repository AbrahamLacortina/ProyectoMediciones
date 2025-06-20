package com.santotomas.lia.monitoreoambiental.model;

import lombok.Data;

@Data
public class MedicionTemp {
    private Float temperatura;
    private Float humedad;
    private Float pm25;
    private Float pm10;
    private String fechaStr;
    private long lastUpdateTime;

    public boolean isReadyToPersist() {
        return temperatura != null && humedad != null && pm25 != null && pm10 != null && fechaStr != null;
    }
}
