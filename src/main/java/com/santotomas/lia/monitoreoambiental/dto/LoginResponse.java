package com.santotomas.lia.monitoreoambiental.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private Long id;
    private String nombre;
    private String apellido;
    private String correo;
    private int rol;
    private boolean activo;
    private String rut;
}