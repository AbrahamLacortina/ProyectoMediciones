package com.santotomas.lia.monitoreoambiental.model;

import jakarta.persistence.*; // Usa 'javax.persistence.*' si tu Spring Boot es v2.x
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "mediciones_ambientales")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicionAmbiental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Usamos Long porque en la BD es BIGINT

    @ManyToOne(fetch = FetchType.LAZY) // Muchas mediciones pueden pertenecer a una estación
    @JoinColumn(name = "estacion_id", nullable = false) // Nombre de la columna de la clave foránea
    private Estacion estacion;

    @Column
    private Float temperatura;

    @Column
    private Float humedad;

    @Column(name = "pm2_5") // Mapea a la columna pm2_5
    private Float pm25;

    @Column(name = "pm10") // Mapea a la columna pm10
    private Float pm10;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;
}