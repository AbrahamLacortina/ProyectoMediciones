package com.santotomas.lia.monitoreoambiental.repository;

import com.santotomas.lia.monitoreoambiental.model.Central;
import com.santotomas.lia.monitoreoambiental.model.Medicion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;

import java.sql.Timestamp;
import java.util.List;

@Repository
public interface MedicionRepository extends JpaRepository<Medicion, Integer> {
    List<Medicion> findTop10ByCentralOrderByFechaDesc(Central central);
    List<Medicion> findByCentralAndFechaBetween(Central central, Timestamp start, Timestamp end);
    Page<Medicion> findByCentralAndFechaBetween(Central central, Timestamp start, Timestamp end, Pageable pageable);

    // Devuelve los últimos N registros para una central
    default List<Medicion> findTopNByCentralOrderByFechaDesc(Central central, int n) {
        return findByCentralOrderByFechaDesc(central, org.springframework.data.domain.PageRequest.of(0, n));
    }
    List<Medicion> findByCentralOrderByFechaDesc(Central central, org.springframework.data.domain.Pageable pageable);
}