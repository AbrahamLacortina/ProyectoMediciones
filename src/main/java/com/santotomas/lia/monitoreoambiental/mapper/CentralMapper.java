package com.santotomas.lia.monitoreoambiental.mapper;

import com.santotomas.lia.monitoreoambiental.dto.CentralDTO;
import com.santotomas.lia.monitoreoambiental.model.Central;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface CentralMapper {
    CentralMapper INSTANCE = Mappers.getMapper(CentralMapper.class);

    CentralDTO toCentralDTO(Central central);

    Central toCentral(CentralDTO centralDTO);
}

