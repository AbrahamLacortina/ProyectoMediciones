package com.santotomas.lia.monitoreoambiental;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;


@SpringBootApplication
public class MonitoreoAmbientalApplication {

	public static void main(String[] args) {
		SpringApplication.run(MonitoreoAmbientalApplication.class, args);
		System.out.println(new BCryptPasswordEncoder().encode("Error404!"));
	}


}
