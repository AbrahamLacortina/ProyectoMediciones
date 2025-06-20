package com.santotomas.lia.monitoreoambiental.controller;

import com.santotomas.lia.monitoreoambiental.model.Central;
import com.santotomas.lia.monitoreoambiental.repository.CentralRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/centrales")
public class CentralController {
    private final CentralRepository centralRepository;

    public CentralController(CentralRepository centralRepository) {
        this.centralRepository = centralRepository;
    }

    @GetMapping
    public List<Central> listarCentrales() {
        return centralRepository.findAll();
    }
}
