package com.santotomas.lia.monitoreoambiental.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class MedicionSseController {
    private static final Set<SseEmitter> emitters = new CopyOnWriteArraySet<>();

    @GetMapping(value = "/api/mediciones/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamMediciones() {
        SseEmitter emitter = new SseEmitter(0L); // Sin timeout
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        return emitter;
    }

    public static void enviarNuevaMedicion(Object medicion) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("nueva-medicion").data(medicion));
            } catch (IOException e) {
                emitter.complete();
                emitters.remove(emitter);
            }
        }
    }
}

