package com.santotomas.lia.monitoreoambiental.config;

import com.santotomas.lia.monitoreoambiental.service.MedicionAmbientalService;
import com.santotomas.lia.monitoreoambiental.repository.CentralRepository;
import com.santotomas.lia.monitoreoambiental.model.Central;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.core.MessageProducer;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.beans.factory.DisposableBean;

import java.util.List;
import java.util.ArrayList;

@Configuration
public class MqttConfig implements DisposableBean {

    private static final Logger logger = LoggerFactory.getLogger(MqttConfig.class);

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Value("${mqtt.client.id}")
    private String clientId;

    private final MedicionAmbientalService medicionAmbientalService;
    private final CentralRepository centralRepository;
    private MqttPahoMessageDrivenChannelAdapter mqttAdapter;

    public MqttConfig(MedicionAmbientalService medicionAmbientalService, CentralRepository centralRepository) {
        this.medicionAmbientalService = medicionAmbientalService;
        this.centralRepository = centralRepository;
    }

    @Bean
    public MqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();
        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[] { brokerUrl });
        options.setCleanSession(true);
        factory.setConnectionOptions(options);
        return factory;
    }

    @Bean
    public MessageChannel mqttInputChannel() {
        return new DirectChannel();
    }

    @Bean
    public MessageProducer inboundMqttAdapter() {
        this.mqttAdapter = crearNuevoAdapter();
        return this.mqttAdapter;
    }

    public synchronized void recargarSuscripcionesMqtt() {
        if (mqttAdapter != null) {
            logger.info("Desuscribiendo y cerrando adaptador MQTT anterior...");
            mqttAdapter.stop();
        }
        this.mqttAdapter = crearNuevoAdapter();
        this.mqttAdapter.start();
        logger.info("Suscripciones MQTT recargadas dinámicamente.");
    }

    private MqttPahoMessageDrivenChannelAdapter crearNuevoAdapter() {
        List<Central> centrales = centralRepository.findAll();
        List<String> topics = new ArrayList<>();
        for (Central c : centrales) {
            String base = c.getTopicoBase();
            if (base != null && !base.isBlank()) {
                String baseClean = base.replaceAll("/+$", "");
                topics.add(baseClean + "/tt");
                topics.add(baseClean + "/hh");
                topics.add(baseClean + "/pm10");
                topics.add(baseClean + "/pm25");
                topics.add(baseClean + "/fecha");
            }
        }
        if (topics.isEmpty()) {
            logger.warn("No se encontraron tópicos base en la base de datos para suscribirse a MQTT.");
        } else {
            logger.info("Suscribiéndose dinámicamente a los siguientes tópicos MQTT: {}", topics);
        }
        MqttPahoMessageDrivenChannelAdapter adapter =
                new MqttPahoMessageDrivenChannelAdapter(clientId, mqttClientFactory(), topics.toArray(new String[0]));
        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(0);
        adapter.setOutputChannel(mqttInputChannel());
        logger.info("Conectando a MQTT broker: {} con clientId: {}", brokerUrl, clientId);
        return adapter;
    }

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMqttMessage(String payload, @Header(MqttHeaders.RECEIVED_TOPIC) String topic) {
        logger.trace("MQTT recibido - Tópico: [{}], Payload: [{}]", topic, payload);
        // Depuración: log de ingreso de datos por tópico
        logger.info("[MQTT] Mensaje recibido del tópico: {} | Payload: {}", topic, payload);
        try {
            medicionAmbientalService.processMqttMessage(topic, payload);
            logger.debug("Mensaje MQTT procesado correctamente para tópico [{}]", topic);
        } catch (Exception e) {
            logger.error("Error procesando mensaje MQTT. Tópico: [{}], Payload: [{}], Error: {}", topic, payload, e.getMessage(), e);
        }
    }

    // Devuelve los tópicos actuales a los que está suscrito el adaptador MQTT
    public List<String> getCurrentTopicsDebug() {
        if (mqttAdapter == null) return List.of();
        String[] topics = mqttAdapter.getTopic();
        if (topics == null) return List.of();
        return java.util.Arrays.asList(topics);
    }

    @Override
    public void destroy() {
        if (mqttAdapter != null) {
            mqttAdapter.stop();
        }
    }
}

// El controlador REST de administración MQTT se ha movido a un archivo separado: MqttAdminController.java
