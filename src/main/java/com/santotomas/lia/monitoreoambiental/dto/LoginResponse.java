package com.santotomas.lia.monitoreoambiental.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private String correo;
    private String nombre;
    private int rol;
}