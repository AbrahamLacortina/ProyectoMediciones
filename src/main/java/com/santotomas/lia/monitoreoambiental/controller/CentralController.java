package com.santotomas.lia.monitoreoambiental.controller;

import com.santotomas.lia.monitoreoambiental.dto.CentralDTO;
import com.santotomas.lia.monitoreoambiental.service.CentralService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/centrales")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CentralController {

    @Autowired
    private CentralService centralService;

    @GetMapping
    public List<CentralDTO> getAllCentrales() {
        return centralService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CentralDTO> getCentralById(@PathVariable Integer id) {
        return centralService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public CentralDTO createCentral(@RequestBody CentralDTO centralDTO) {
        return centralService.save(centralDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CentralDTO> updateCentral(@PathVariable Integer id, @RequestBody CentralDTO centralDTO) {
        return centralService.findById(id)
                .map(existingCentral -> {
                    centralDTO.setIdCentral(id);
                    return ResponseEntity.ok(centralService.save(centralDTO));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteCentral(@PathVariable Integer id) {
        return centralService.findById(id)
                .map(existingCentral -> {
                    centralService.deleteById(id);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

