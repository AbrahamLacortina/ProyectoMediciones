package com.santotomas.lia.monitoreoambiental.repository;

import com.santotomas.lia.monitoreoambiental.model.Estacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstacionRepository extends JpaRepository<Estacion, Integer> {
    // Spring Data JPA generará automáticamente métodos para operaciones CRUD básicas.
    // Podemos añadir métodos personalizados aquí si los necesitamos,
    // por ejemplo: Estacion findByNombre(String nombre);
    Estacion findByNombre(String nombre);
}