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
import java.util.Arrays;
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
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(required = false) Float temperaturaMin,
            @RequestParam(required = false) Float temperaturaMax,
            @RequestParam(required = false) Float humedadMin,
            @RequestParam(required = false) Float humedadMax,
            @RequestParam(required = false) Float pm25Min,
            @RequestParam(required = false) Float pm25Max,
            @RequestParam(required = false) Float pm10Min,
            @RequestParam(required = false) Float pm10Max
    ) {
        // Permitir múltiples estaciones separadas por coma
        String[] centralesArr = central.split(",");
        List<Integer> centralesIds = java.util.Arrays.stream(centralesArr)
                .map(nombre -> {
                    Central c = centralRepo.findByNombreCentral(nombre);
                    return c != null ? c.getIdCentral() : null;
                })
                .filter(java.util.Objects::nonNull)
                .toList();
        if (centralesIds.isEmpty()) {
            return ResponseEntity.ok().body(List.of());
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        LocalDateTime inicio = LocalDateTime.parse(fechaInicio + "T00:00:00", formatter);
        LocalDateTime fin = LocalDateTime.parse(fechaFin + "T23:59:59", formatter);
        // Consulta dinámica con JPQL
        StringBuilder jpql = new StringBuilder("SELECT m FROM Medicion m WHERE m.central.idCentral IN :centrales AND m.fecha BETWEEN :inicio AND :fin");
        if (temperaturaMin != null) jpql.append(" AND m.temperatura >= :temperaturaMin");
        if (temperaturaMax != null) jpql.append(" AND m.temperatura <= :temperaturaMax");
        if (humedadMin != null) jpql.append(" AND m.humedad >= :humedadMin");
        if (humedadMax != null) jpql.append(" AND m.humedad <= :humedadMax");
        if (pm25Min != null) jpql.append(" AND m.pm25 >= :pm25Min");
        if (pm25Max != null) jpql.append(" AND m.pm25 <= :pm25Max");
        if (pm10Min != null) jpql.append(" AND m.pm10 >= :pm10Min");
        if (pm10Max != null) jpql.append(" AND m.pm10 <= :pm10Max");
        jpql.append(" ORDER BY m.fecha DESC");
        Query query = entityManager.createQuery(jpql.toString(), Medicion.class);
        query.setParameter("centrales", centralesIds);
        query.setParameter("inicio", inicio);
        query.setParameter("fin", fin);
        if (temperaturaMin != null) query.setParameter("temperaturaMin", temperaturaMin);
        if (temperaturaMax != null) query.setParameter("temperaturaMax", temperaturaMax);
        if (humedadMin != null) query.setParameter("humedadMin", humedadMin);
        if (humedadMax != null) query.setParameter("humedadMax", humedadMax);
        if (pm25Min != null) query.setParameter("pm25Min", pm25Min);
        if (pm25Max != null) query.setParameter("pm25Max", pm25Max);
        if (pm10Min != null) query.setParameter("pm10Min", pm10Min);
        if (pm10Max != null) query.setParameter("pm10Max", pm10Max);
        query.setFirstResult(page * size);
        query.setMaxResults(size);
        List<Medicion> result = query.getResultList();
        // Para paginación total
        // Corregir la consulta de conteo para incluir FROM Medicion m
        String countJpqlStr = jpql.toString().replaceFirst("SELECT m FROM Medicion m", "SELECT COUNT(m) FROM Medicion m").replaceFirst("ORDER BY m.fecha DESC", "");
        // Si la consulta no contiene FROM Medicion m, asegúrate de agregarlo correctamente
        if (!countJpqlStr.contains("FROM Medicion m")) {
            int idx = countJpqlStr.indexOf("WHERE");
            if (idx != -1) {
                countJpqlStr = "SELECT COUNT(m) FROM Medicion m " + countJpqlStr.substring(idx);
            } else {
                countJpqlStr = "SELECT COUNT(m) FROM Medicion m";
            }
        }
        Query countQuery = entityManager.createQuery(countJpqlStr);
        countQuery.setParameter("centrales", centralesIds);
        countQuery.setParameter("inicio", inicio);
        countQuery.setParameter("fin", fin);
        if (temperaturaMin != null) countQuery.setParameter("temperaturaMin", temperaturaMin);
        if (temperaturaMax != null) countQuery.setParameter("temperaturaMax", temperaturaMax);
        if (humedadMin != null) countQuery.setParameter("humedadMin", humedadMin);
        if (humedadMax != null) countQuery.setParameter("humedadMax", humedadMax);
        if (pm25Min != null) countQuery.setParameter("pm25Min", pm25Min);
        if (pm25Max != null) countQuery.setParameter("pm25Max", pm25Max);
        if (pm10Min != null) countQuery.setParameter("pm10Min", pm10Min);
        if (pm10Max != null) countQuery.setParameter("pm10Max", pm10Max);
        long totalElements = (long) countQuery.getSingleResult();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        List<MedicionDTO> dtos = result.stream()
            .map(m -> new MedicionDTO(m.getId(), m.getFecha(), m.getTemperatura(), m.getHumedad(), m.getPm25(), m.getPm10()))
            .collect(Collectors.toList());
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Total-Pages", String.valueOf(totalPages));
        headers.add("X-Total-Elements", String.valueOf(totalElements));
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
        String[] centralesArr = central.split(",");
        List<Integer> centralesIds = Arrays.stream(centralesArr)
                .map(nombre -> {
                    Central c = centralRepo.findByNombreCentral(nombre);
                    if (c == null) throw new IllegalArgumentException("Central no encontrada: " + nombre);
                    return c.getIdCentral();
                })
                .collect(Collectors.toList());

        if (centralesIds.isEmpty()) {
            return List.of();
        }

        String campo = switch (topico) {
            case "temperatura" -> "temperatura";
            case "humedad" -> "humedad";
            case "pm25" -> "pm25";
            case "pm10" -> "pm10";
            default -> throw new IllegalArgumentException("Tópico no válido: " + topico);
        };

        String dateExpression;
        switch (intervalo) {
            case "hora" -> dateExpression = "DATE_FORMAT(fecha, '%Y-%m-%dT%H:00:00')";
            case "dia" -> dateExpression = "DATE(fecha)";
            case "semana" -> dateExpression = "DATE(DATE_SUB(fecha, INTERVAL WEEKDAY(fecha) DAY))";
            case "mes" -> dateExpression = "DATE_FORMAT(fecha, '%Y-%m')";
            default -> throw new IllegalArgumentException("Intervalo no válido: " + intervalo);
        }

        StringBuilder sql = new StringBuilder("SELECT id_central, ")
                .append(dateExpression).append(" as fecha_agrupada, AVG(").append(campo).append(") as valor ")
                .append("FROM medicion WHERE id_central IN (:centralesIds)");

        if (fechaInicio != null && !fechaInicio.isEmpty() && fechaFin != null && !fechaFin.isEmpty()) {
            sql.append(" AND fecha BETWEEN :inicio AND :fin");
        }

        sql.append(" GROUP BY id_central, fecha_agrupada ORDER BY id_central, fecha_agrupada ASC");

        Query query = entityManager.createNativeQuery(sql.toString());
        query.setParameter("centralesIds", centralesIds);

        if (fechaInicio != null && !fechaInicio.isEmpty() && fechaFin != null && !fechaFin.isEmpty()) {
            query.setParameter("inicio", fechaInicio + " 00:00:00");
            query.setParameter("fin", fechaFin + " 23:59:59");
        }

        List<Object[]> resultados = query.getResultList();

        return resultados.stream()
                .map(r -> {
                    Integer idCentral = ((Number) r[0]).intValue();
                    String nombreCentral = centralRepo.findById(idCentral).map(Central::getNombreCentral).orElse("?");
                    return new MedicionAgrupadaDTO(nombreCentral, r[1].toString(), r[2] != null ? ((Number) r[2]).doubleValue() : null);
                })
                .collect(Collectors.toList());
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