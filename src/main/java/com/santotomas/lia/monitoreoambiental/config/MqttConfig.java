package com.santotomas.lia.monitoreoambiental.config;

import com.santotomas.lia.monitoreoambiental.service.MedicionAmbientalService;
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

@Configuration
public class MqttConfig {

    private static final Logger logger = LoggerFactory.getLogger(MqttConfig.class);

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    @Value("${mqtt.client.id}")
    private String clientId;

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

    private final MedicionAmbientalService medicionAmbientalService;

    public MqttConfig(MedicionAmbientalService medicionAmbientalService) {
        this.medicionAmbientalService = medicionAmbientalService;
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
        MqttPahoMessageDrivenChannelAdapter adapter =
                new MqttPahoMessageDrivenChannelAdapter(clientId, mqttClientFactory(),
                        temperatureTopic, humidityTopic, pm25Topic, pm10Topic, dateTopic);
        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(0);
        adapter.setOutputChannel(mqttInputChannel());
        return adapter;
    }

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMqttMessage(String payload, @Header(MqttHeaders.RECEIVED_TOPIC) String topic) {
        logger.trace("MQTT recibido - Tópico: [{}], Payload: [{}]", topic, payload);
        try {
            medicionAmbientalService.processMqttMessage(topic, payload);
            logger.debug("Mensaje MQTT procesado correctamente para tópico [{}]", topic);
        } catch (Exception e) {
            logger.error("Error procesando mensaje MQTT. Tópico: [{}], Payload: [{}], Error: {}", topic, payload, e.getMessage(), e);
        }
    }
}