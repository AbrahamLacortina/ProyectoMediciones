package com.santotomas.lia.monitoreoambiental.repository;

import com.santotomas.lia.monitoreoambiental.model.Central;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CentralRepository extends JpaRepository<Central, Integer> {
    Central findByNombreCentral(String nombreCentral);
    Central findByTopicoBase(String topicoBase);
}
