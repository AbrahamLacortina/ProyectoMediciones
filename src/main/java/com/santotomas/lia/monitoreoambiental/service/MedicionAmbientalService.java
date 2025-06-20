package com.santotomas.lia.monitoreoambiental.service;

import com.santotomas.lia.monitoreoambiental.model.Central;
import com.santotomas.lia.monitoreoambiental.model.Medicion;
import com.santotomas.lia.monitoreoambiental.model.MedicionTemp;
import com.santotomas.lia.monitoreoambiental.repository.CentralRepository;
import com.santotomas.lia.monitoreoambiental.repository.MedicionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class MedicionAmbientalService {

    private static final Logger logger = LoggerFactory.getLogger(MedicionAmbientalService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private final MedicionRepository medicionRepository;
    private final CentralRepository centralRepository;

    private final Map<String, MedicionTemp> currentMeasurements = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    @Value("${mqtt.topics.temperature}")
    private String temperatureTopic;

    @Value("${mqtt.topics.humidity}")
    private String humidityTopic;

    @Value("${mqtt.topics.pm25}")
    private String pm25Topic;

    @Value("${mqtt.topics.pm10}")
    private String pm10Topic;

    @Value("${mqtt.topics.fecha}")
    private String dateTopic;

    private static final String DEFAULT_CENTRAL_NAME = "LIA";
    private Central defaultCentral;

    public MedicionAmbientalService(MedicionRepository medicionRepository, CentralRepository centralRepository) {
        this.medicionRepository = medicionRepository;
        this.centralRepository = centralRepository;
    }

    @PostConstruct
    public void init() {
        logger.trace("Inicializando MedicionAmbientalService...");
        defaultCentral = centralRepository.findByNombreCentral(DEFAULT_CENTRAL_NAME);
        if (defaultCentral == null) {
            logger.error("Central '{}' no encontrada en la base de datos. Por favor, asegúrese de insertarla.", DEFAULT_CENTRAL_NAME);
            throw new IllegalStateException("Central por defecto no encontrada: " + DEFAULT_CENTRAL_NAME);
        }
        logger.info("Central por defecto cargada: {}", defaultCentral.getNombreCentral());
        scheduler.scheduleAtFixedRate(this::cleanOldIncompleteMeasurements, 5, 5, TimeUnit.MINUTES);
    }

    public void processMqttMessage(String topic, String payload) {
        logger.trace("Procesando mensaje MQTT - Tópico: [{}], Payload: [{}]", topic, payload);
        // Extraer nombre de estación del tópico: /colegio1/Aire/tt → colegio1
        String[] parts = topic.split("/");
        if (parts.length < 3) {
            logger.warn("Tópico MQTT inesperado: {}", topic);
            return;
        }
        String nombreEstacion = parts[1];
        String tipoDato = parts[3-1]; // ej: 'tt', 'hh', 'pm25', 'pm10', 'fecha'
        currentMeasurements.putIfAbsent(nombreEstacion, new MedicionTemp());
        MedicionTemp tempMeasurement = currentMeasurements.get(nombreEstacion);
        tempMeasurement.setLastUpdateTime(System.currentTimeMillis());

        try {
            if (tipoDato.equals("tt")) {
                tempMeasurement.setTemperatura(Float.valueOf(payload));
                logger.debug("Temperatura recibida: {} para {}", payload, nombreEstacion);
            } else if (tipoDato.equals("hh")) {
                tempMeasurement.setHumedad(Float.valueOf(payload));
                logger.debug("Humedad recibida: {} para {}", payload, nombreEstacion);
            } else if (tipoDato.equals("pm25")) {
                tempMeasurement.setPm25(Float.valueOf(payload));
                logger.debug("PM2.5 recibido: {} para {}", payload, nombreEstacion);
            } else if (tipoDato.equals("pm10")) {
                tempMeasurement.setPm10(Float.valueOf(payload));
                logger.debug("PM10 recibido: {} para {}", payload, nombreEstacion);
            } else if (tipoDato.equals("fecha")) {
                tempMeasurement.setFechaStr(payload);
                logger.debug("Fecha recibida: {} para {}", payload, nombreEstacion);
            } else {
                logger.warn("Tipo de dato desconocido en tópico: {}", topic);
                return;
            }

            logger.trace("Estado actual de MedicionTemp para {}: {}", nombreEstacion, tempMeasurement);

            if (tempMeasurement.isReadyToPersist()) {
                logger.info("Todos los datos recibidos para {}. Persistiendo medición...", nombreEstacion);
                persistMeasurement(nombreEstacion, tempMeasurement);
                currentMeasurements.remove(nombreEstacion);
            }
        } catch (NumberFormatException e) {
            logger.error("Error al parsear payload '{}' del tópico '{}': {}", payload, topic, e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Error inesperado al procesar mensaje MQTT del tópico '{}': {}", topic, e.getMessage(), e);
        }
    }

    private void persistMeasurement(String nombreEstacion, MedicionTemp tempMeasurement) {
        try {
            logger.trace("Persistiendo medición para {}: {}", nombreEstacion, tempMeasurement);
            Central central = centralRepository.findByNombreCentral(nombreEstacion);
            if (central == null) {
                logger.error("Central '{}' no encontrada en la base de datos. No se guardará la medición.", nombreEstacion);
                return;
            }
            Medicion medicion = new Medicion();
            medicion.setCentral(central);
            medicion.setTemperatura(tempMeasurement.getTemperatura());
            medicion.setHumedad(tempMeasurement.getHumedad());
            medicion.setPm25(tempMeasurement.getPm25());
            medicion.setPm10(tempMeasurement.getPm10());
            medicion.setFecha(java.sql.Timestamp.valueOf(LocalDateTime.parse(tempMeasurement.getFechaStr(), DATE_FORMATTER)));

            medicionRepository.save(medicion);
            logger.info("Medición guardada para central '{}' en {}", central.getNombreCentral(), medicion.getFecha());
        } catch (Exception e) {
            logger.error("Error al guardar la medición: {}", e.getMessage(), e);
        }
    }

    private void cleanOldIncompleteMeasurements() {
        long threshold = System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(10);
        currentMeasurements.entrySet().removeIf(entry -> {
            if (entry.getValue().getLastUpdateTime() < threshold && !entry.getValue().isReadyToPersist()) {
                logger.warn("Limpiando medición incompleta antigua para la clave '{}' (última actualización hace más de 10 min).", entry.getKey());
                return true;
            }
            return false;
        });
    }
}