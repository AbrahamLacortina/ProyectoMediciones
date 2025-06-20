package com.santotomas.lia.monitoreoambiental.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @Column(length = 255, unique = true)
    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Correo inválido")
    private String correo;

    @Column(length = 255)
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @Column(length = 255)
    @NotBlank(message = "La contraseña es obligatoria")
    private String password;

    @Column
    private int rol;

    @Column(length = 255, unique = true)
    private String rut;
}