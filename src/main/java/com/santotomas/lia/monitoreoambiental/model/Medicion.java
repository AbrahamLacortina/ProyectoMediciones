package com.santotomas.lia.monitoreoambiental.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "medicion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medicion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "fecha")
    private LocalDateTime fecha;

    @Column(name = "temperatura")
    private Float temperatura;

    @Column(name = "humedad")
    private Float humedad;

    @Column(name = "pm25")
    private Float pm25;

    @Column(name = "pm10")
    private Float pm10;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_central")
    @JsonBackReference
    private Central central;
}
