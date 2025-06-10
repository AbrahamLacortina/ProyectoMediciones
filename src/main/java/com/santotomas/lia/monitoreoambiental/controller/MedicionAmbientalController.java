package com.santotomas.lia.monitoreoambiental.controller;
import java.time.LocalDateTime;
import com.santotomas.lia.monitoreoambiental.model.Estacion;
import com.santotomas.lia.monitoreoambiental.model.MedicionAmbiental;
import com.santotomas.lia.monitoreoambiental.repository.EstacionRepository;
import com.santotomas.lia.monitoreoambiental.repository.MedicionAmbientalRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/mediciones")
public class MedicionAmbientalController {

    private final MedicionAmbientalRepository medicionRepo;
    private final EstacionRepository estacionRepo;

    public MedicionAmbientalController(MedicionAmbientalRepository medicionRepo, EstacionRepository estacionRepo) {
        this.medicionRepo = medicionRepo;
        this.estacionRepo = estacionRepo;
    }

    @GetMapping("/ultimas")
    public List<MedicionAmbiental> ultimasMediciones(@RequestParam String estacion) {
        Estacion est = estacionRepo.findByNombre(estacion);
        return medicionRepo.findTop10ByEstacionOrderByFechaRegistroDesc(est);
    }
    @GetMapping("/rango")
    public List<MedicionAmbiental> medicionesPorRango(
            @RequestParam String estacion,
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin) {
        Estacion est = estacionRepo.findByNombre(estacion);
        // Ajusta el formato según cómo envías las fechas desde el frontend (yyyy-MM-dd)
        LocalDateTime inicio = LocalDateTime.parse(fechaInicio + "T00:00:00");
        LocalDateTime fin = LocalDateTime.parse(fechaFin + "T23:59:59");
        return medicionRepo.findByEstacionAndFechaRegistroBetween(est, inicio, fin);
    }
}