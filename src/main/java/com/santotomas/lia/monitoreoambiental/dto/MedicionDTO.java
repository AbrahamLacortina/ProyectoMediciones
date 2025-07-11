package com.santotomas.lia.monitoreoambiental.dto;

import java.time.LocalDateTime;

public class MedicionDTO {
    private Integer id;
    private LocalDateTime fecha;
    private Float temperatura;
    private Float humedad;
    private Float pm25;
    private Float pm10;
    // Nuevos campos para frontend
    private Integer indiceCalidadAire;
    private String contaminantePrimario;
    private Float valorMedido;

    public MedicionDTO(Integer id, LocalDateTime fecha, Float temperatura, Float humedad, Float pm25, Float pm10) {
        this.id = id;
        this.fecha = fecha;
        this.temperatura = temperatura;
        this.humedad = humedad;
        this.pm25 = pm25;
        this.pm10 = pm10;
        // Cálculo de índice de calidad del aire y contaminante primario
        calcularCalidadAire();
    }

    private void calcularCalidadAire() {
        // Determinar contaminante primario y valor medido
        if (pm25 != null && pm10 != null) {
            if (pm25 > pm10) {
                contaminantePrimario = "PM2.5";
                valorMedido = pm25;
            } else {
                contaminantePrimario = "PM10";
                valorMedido = pm10;
            }
        } else if (pm25 != null) {
            contaminantePrimario = "PM2.5";
            valorMedido = pm25;
        } else if (pm10 != null) {
            contaminantePrimario = "PM10";
            valorMedido = pm10;
        } else {
            contaminantePrimario = "-";
            valorMedido = null;
        }
        // Índice de calidad del aire (ejemplo: usar valorMedido redondeado)
        if (valorMedido != null) {
            indiceCalidadAire = Math.round(valorMedido);
        } else {
            indiceCalidadAire = null;
        }
    }

    public Integer getId() { return id; }
    public LocalDateTime getFecha() { return fecha; }
    public Float getTemperatura() { return temperatura; }
    public Float getHumedad() { return humedad; }
    public Float getPm25() { return pm25; }
    public Float getPm10() { return pm10; }
    public Integer getIndiceCalidadAire() { return indiceCalidadAire; }
    public String getContaminantePrimario() { return contaminantePrimario; }
    public Float getValorMedido() { return valorMedido; }
}
