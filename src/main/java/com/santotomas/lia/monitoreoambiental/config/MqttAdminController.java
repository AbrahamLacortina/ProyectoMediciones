package com.santotomas.lia.monitoreoambiental.config;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/admin/mqtt")
public class MqttAdminController {
    private final MqttConfig mqttConfig;
    public MqttAdminController(MqttConfig mqttConfig) { this.mqttConfig = mqttConfig; }
    @PostMapping("/recargar")
    @PreAuthorize("hasRole('ADMIN')")
    public String recargar() {
        mqttConfig.recargarSuscripcionesMqtt();
        return "Suscripciones MQTT recargadas";
    }
}
