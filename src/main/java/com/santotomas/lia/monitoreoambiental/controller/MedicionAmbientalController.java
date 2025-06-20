package com.santotomas.lia.monitoreoambiental.controller;

import com.santotomas.lia.monitoreoambiental.dto.MedicionAgrupadaDTO;
import com.santotomas.lia.monitoreoambiental.dto.MedicionDTO;
import com.santotomas.lia.monitoreoambiental.model.Central;
import com.santotomas.lia.monitoreoambiental.model.Medicion;
import com.santotomas.lia.monitoreoambiental.repository.CentralRepository;
import com.santotomas.lia.monitoreoambiental.repository.MedicionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/mediciones")
public class MedicionAmbientalController {

    private final MedicionRepository medicionRepo;
    private final CentralRepository centralRepo;

    @PersistenceContext
    private EntityManager entityManager;

    public MedicionAmbientalController(MedicionRepository medicionRepo, CentralRepository centralRepo) {
        this.medicionRepo = medicionRepo;
        this.centralRepo = centralRepo;
    }

    @GetMapping("/ultimas")
    public List<MedicionDTO> ultimasMediciones(@RequestParam String central, @RequestParam(required = false, defaultValue = "60") int limit) {
        Central c = centralRepo.findByNombreCentral(central);
        // Consulta dinámica para obtener los últimos N registros
        var lista = medicionRepo.findTopNByCentralOrderByFechaDesc(c, limit);
        return lista.stream()
                .map(m -> new MedicionDTO(m.getId(), m.getFecha(), m.getTemperatura(), m.getHumedad(), m.getPm25(), m.getPm10()))
                .collect(Collectors.toList());
    }

    @GetMapping("/rango")
    public ResponseEntity<List<MedicionDTO>> medicionesPorRango(
            @RequestParam String central,
            @RequestParam String fechaInicio,
            @RequestParam String fechaFin,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        Central c = centralRepo.findByNombreCentral(central);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        LocalDateTime inicio = LocalDateTime.parse(fechaInicio + "T00:00:00", formatter);
        LocalDateTime fin = LocalDateTime.parse(fechaFin + "T23:59:59", formatter);
        var pageResult = medicionRepo.findByCentralAndFechaBetween(
                c,
                java.sql.Timestamp.valueOf(inicio),
                java.sql.Timestamp.valueOf(fin),
                PageRequest.of(page, size)
        );
        List<MedicionDTO> dtos = pageResult.stream()
            .map(m -> new MedicionDTO(m.getId(), m.getFecha(), m.getTemperatura(), m.getHumedad(), m.getPm25(), m.getPm10()))
            .collect(Collectors.toList());
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Total-Pages", String.valueOf(pageResult.getTotalPages()));
        headers.add("X-Total-Elements", String.valueOf(pageResult.getTotalElements()));
        // LOGS PARA DEPURACIÓN
        System.out.println("[API/rango] Central: " + central + ", FechaInicio: " + fechaInicio + ", FechaFin: " + fechaFin + ", page: " + page + ", size: " + size);
        System.out.println("[API/rango] Total registros encontrados: " + pageResult.getTotalElements());
        return ResponseEntity.ok().headers(headers).body(dtos);
    }

    @GetMapping("/agrupadas")
    public List<MedicionAgrupadaDTO> medicionesAgrupadas(
            @RequestParam String central,
            @RequestParam String topico,
            @RequestParam String intervalo,
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin
    ) {
        Central c = centralRepo.findByNombreCentral(central);
        String campo = switch (topico) {
            case "temperatura" -> "temperatura";
            case "humedad" -> "humedad";
            case "pm25" -> "pm25";
            case "pm10" -> "pm10";
            default -> throw new IllegalArgumentException("Tópico no válido");
        };
        String formatoFecha = switch (intervalo) {
            case "hora" -> "%Y-%m-%dT%H";
            case "dia" -> "%Y-%m-%d";
            case "semana" -> "%Y-S%u";
            case "mes" -> "%Y-%m";
            default -> "%Y-%m-%d";
        };
        StringBuilder sql = new StringBuilder("SELECT DATE_FORMAT(fecha, :formato) as fecha, AVG(" + campo + ") as valor FROM medicion WHERE id_central = :idCentral");
        if (fechaInicio != null && fechaFin != null) {
            sql.append(" AND fecha BETWEEN :inicio AND :fin");
        }
        sql.append(" GROUP BY fecha ORDER BY fecha ASC");
        Query query = entityManager.createNativeQuery(sql.toString());
        query.setParameter("formato", formatoFecha);
        query.setParameter("idCentral", c.getIdCentral());
        if (fechaInicio != null && fechaFin != null) {
            query.setParameter("inicio", fechaInicio + " 00:00:00");
            query.setParameter("fin", fechaFin + " 23:59:59");
        }
        List<Object[]> resultados = query.getResultList();
        // Limitar a 1000 puntos
        int maxPuntos = 1000;
        return resultados.stream().limit(maxPuntos)
                .map(r -> new MedicionAgrupadaDTO((String) r[0], r[1] != null ? ((Number) r[1]).doubleValue() : null))
                .toList();
    }

    @GetMapping("/ultima")
    public MedicionDTO ultimaMedicion(@RequestParam String central) {
        Central c = centralRepo.findByNombreCentral(central);
        var lista = medicionRepo.findTop10ByCentralOrderByFechaDesc(c);
        if (lista.isEmpty()) return null;
        var m = lista.get(0);
        return new MedicionDTO(m.getId(), m.getFecha(), m.getTemperatura(), m.getHumedad(), m.getPm25(), m.getPm10());
    }
}