package com.santotomas.lia.monitoreoambiental.service;

import com.santotomas.lia.monitoreoambiental.dto.CentralDTO;
import com.santotomas.lia.monitoreoambiental.model.Central;
import com.santotomas.lia.monitoreoambiental.repository.CentralRepository;
import com.santotomas.lia.monitoreoambiental.mapper.CentralMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CentralService {

    @Autowired
    private CentralRepository centralRepository;

    public List<CentralDTO> findAll() {
        return centralRepository.findAll().stream()
                .map(CentralMapper.INSTANCE::toCentralDTO)
                .collect(Collectors.toList());
    }

    public Optional<CentralDTO> findById(Integer id) {
        return centralRepository.findById(id)
                .map(CentralMapper.INSTANCE::toCentralDTO);
    }

    public CentralDTO save(CentralDTO centralDTO) {
        Central central = CentralMapper.INSTANCE.toCentral(centralDTO);
        central = centralRepository.save(central);
        return CentralMapper.INSTANCE.toCentralDTO(central);
    }

    public void deleteById(Integer id) {
        centralRepository.deleteById(id);
    }
}

