package com.santotomas.lia.monitoreoambiental.dto;

import java.sql.Timestamp;

public class MedicionDTO {
    private Integer id;
    private Timestamp fecha;
    private Float temperatura;
    private Float humedad;
    private Float pm25;
    private Float pm10;

    public MedicionDTO(Integer id, Timestamp fecha, Float temperatura, Float humedad, Float pm25, Float pm10) {
        this.id = id;
        this.fecha = fecha;
        this.temperatura = temperatura;
        this.humedad = humedad;
        this.pm25 = pm25;
        this.pm10 = pm10;
    }

    public Integer getId() { return id; }
    public Timestamp getFecha() { return fecha; }
    public Float getTemperatura() { return temperatura; }
    public Float getHumedad() { return humedad; }
    public Float getPm25() { return pm25; }
    public Float getPm10() { return pm10; }
}

