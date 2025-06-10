package com.santotomas.lia.monitoreoambiental.service;

import com.santotomas.lia.monitoreoambiental.model.Estacion;
import com.santotomas.lia.monitoreoambiental.model.MedicionAmbiental;
import com.santotomas.lia.monitoreoambiental.model.MedicionTemp;
import com.santotomas.lia.monitoreoambiental.repository.EstacionRepository;
import com.santotomas.lia.monitoreoambiental.repository.MedicionAmbientalRepository;
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

    private final MedicionAmbientalRepository medicionAmbientalRepository;
    private final EstacionRepository estacionRepository;

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

    private static final String DEFAULT_STATION_NAME = "Estacion_LIA_SantoTomas";
    private Estacion defaultStation;

    public MedicionAmbientalService(MedicionAmbientalRepository medicionAmbientalRepository, EstacionRepository estacionRepository) {
        this.medicionAmbientalRepository = medicionAmbientalRepository;
        this.estacionRepository = estacionRepository;
    }

    @PostConstruct
    public void init() {
        logger.trace("Inicializando MedicionAmbientalService...");
        defaultStation = estacionRepository.findByNombre(DEFAULT_STATION_NAME);
        if (defaultStation == null) {
            logger.error("Estación '{}' no encontrada en la base de datos. Por favor, asegúrese de insertarla.", DEFAULT_STATION_NAME);
            throw new IllegalStateException("Estación por defecto no encontrada: " + DEFAULT_STATION_NAME);
        }
        logger.info("Estación por defecto cargada: {}", defaultStation.getNombre());
        scheduler.scheduleAtFixedRate(this::cleanOldIncompleteMeasurements, 5, 5, TimeUnit.MINUTES);
    }

    public void processMqttMessage(String topic, String payload) {
        logger.trace("Procesando mensaje MQTT - Tópico: [{}], Payload: [{}]", topic, payload);
        currentMeasurements.putIfAbsent(DEFAULT_STATION_NAME, new MedicionTemp());
        MedicionTemp tempMeasurement = currentMeasurements.get(DEFAULT_STATION_NAME);
        tempMeasurement.setLastUpdateTime(System.currentTimeMillis());

        try {
            if (topic.equals(temperatureTopic)) {
                tempMeasurement.setTemperatura(Float.valueOf(payload));
                logger.debug("Temperatura recibida: {}", payload);
            } else if (topic.equals(humidityTopic)) {
                tempMeasurement.setHumedad(Float.valueOf(payload));
                logger.debug("Humedad recibida: {}", payload);
            } else if (topic.equals(pm25Topic)) {
                tempMeasurement.setPm25(Float.valueOf(payload));
                logger.debug("PM2.5 recibido: {}", payload);
            } else if (topic.equals(pm10Topic)) {
                tempMeasurement.setPm10(Float.valueOf(payload));
                logger.debug("PM10 recibido: {}", payload);
            } else if (topic.equals(dateTopic)) {
                tempMeasurement.setFechaStr(payload);
                logger.debug("Fecha recibida: {}", payload);
            } else {
                logger.warn("Tópico MQTT desconocido: {}", topic);
                return;
            }

            logger.trace("Estado actual de MedicionTemp: {}", tempMeasurement);

            if (tempMeasurement.isReadyToPersist()) {
                logger.info("Todos los datos recibidos. Persistiendo medición...");
                persistMeasurement(tempMeasurement);
                currentMeasurements.remove(DEFAULT_STATION_NAME);
            }
        } catch (NumberFormatException e) {
            logger.error("Error al parsear payload '{}' del tópico '{}': {}", payload, topic, e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Error inesperado al procesar mensaje MQTT del tópico '{}': {}", topic, e.getMessage(), e);
        }
    }

    private void persistMeasurement(MedicionTemp tempMeasurement) {
        try {
            logger.trace("Persistiendo medición: {}", tempMeasurement);
            MedicionAmbiental medicion = new MedicionAmbiental();
            medicion.setEstacion(defaultStation);
            medicion.setTemperatura(tempMeasurement.getTemperatura());
            medicion.setHumedad(tempMeasurement.getHumedad());
            medicion.setPm25(tempMeasurement.getPm25());
            medicion.setPm10(tempMeasurement.getPm10());
            medicion.setFechaRegistro(LocalDateTime.parse(tempMeasurement.getFechaStr(), DATE_FORMATTER));

            medicionAmbientalRepository.save(medicion);
            logger.info("Medición guardada para estación '{}' en {}", defaultStation.getNombre(), medicion.getFechaRegistro());
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