package com.santotomas.lia.monitoreoambiental.dto;

public class MedicionAgrupadaDTO {
    private String nombreCentral;
    private String fecha;
    private Double valor;

    public MedicionAgrupadaDTO(String nombreCentral, String fecha, Double valor) {
        this.nombreCentral = nombreCentral;
        this.fecha = fecha;
        this.valor = valor;
    }

    public String getNombreCentral() {
        return nombreCentral;
    }

    public String getFecha() {
        return fecha;
    }

    public Double getValor() {
        return valor;
    }
}
