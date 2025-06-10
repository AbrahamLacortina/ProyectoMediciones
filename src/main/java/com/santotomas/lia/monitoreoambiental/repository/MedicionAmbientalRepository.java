package com.santotomas.lia.monitoreoambiental.repository;

import com.santotomas.lia.monitoreoambiental.model.Estacion;
import com.santotomas.lia.monitoreoambiental.model.MedicionAmbiental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MedicionAmbientalRepository extends JpaRepository<MedicionAmbiental, Long> {
    // Ejemplo: encontrar mediciones por estación y rango de fechas
    List<MedicionAmbiental> findByEstacionAndFechaRegistroBetween(Estacion estacion, LocalDateTime startDate, LocalDateTime endDate);

    // Ejemplo: encontrar las últimas N mediciones de una estación
    List<MedicionAmbiental> findTop10ByEstacionOrderByFechaRegistroDesc(Estacion estacion);
}