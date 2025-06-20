package com.santotomas.lia.monitoreoambiental.dto;

public class MedicionAgrupadaDTO {
    private String fecha;
    private Double valor;

    public MedicionAgrupadaDTO(String fecha, Double valor) {
        this.fecha = fecha;
        this.valor = valor;
    }

    public String getFecha() {
        return fecha;
    }

    public Double getValor() {
        return valor;
    }
}

