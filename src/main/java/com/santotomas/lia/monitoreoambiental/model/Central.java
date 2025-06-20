package com.santotomas.lia.monitoreoambiental.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "central")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Central {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_central")
    @JsonProperty("id_central")
    private Integer idCentral;

    @Column(name = "nombre_central", unique = true, nullable = false)
    @JsonProperty("nombre_central")
    private String nombreCentral;

    @Column(name = "topico_base", nullable = false)
    @JsonProperty("topico_base")
    private String topicoBase;

    @Column(name = "descripcion")
    @JsonProperty("descripcion")
    private String descripcion;

    @Column(name = "ubicacion")
    @JsonProperty("ubicacion")
    private String ubicacion;

    @OneToMany(mappedBy = "central")
    @JsonManagedReference
    private List<Medicion> mediciones;
}