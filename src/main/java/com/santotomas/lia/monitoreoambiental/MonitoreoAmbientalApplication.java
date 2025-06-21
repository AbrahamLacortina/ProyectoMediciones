package com.santotomas.lia.monitoreoambiental;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.santotomas.lia.monitoreoambiental.config.MqttConfig;


@SpringBootApplication
public class MonitoreoAmbientalApplication {

	public static void main(String[] args) {
		SpringApplication.run(MonitoreoAmbientalApplication.class, args);
		System.out.println(new BCryptPasswordEncoder().encode("Error404!"));
	}

	@Bean
	public ApplicationRunner mqttDebugRunner(MqttConfig mqttConfig) {
		return args -> {
			System.out.println("[DEBUG] Tópicos MQTT suscritos al iniciar: " + mqttConfig.getCurrentTopicsDebug());
		};
	}
}
