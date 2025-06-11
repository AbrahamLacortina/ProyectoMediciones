package com.santotomas.lia.monitoreoambiental.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private boolean activo;

    @Column(length = 255)
    private String apellido;

    @Column(length = 255, unique = true)
    private String correo;

    @Column(length = 255)
    private String nombre;

    @Column(length = 255)
    private String password;

    @Column
    private int rol;

    @Column(length = 255, unique = true)
    private String rut;
}