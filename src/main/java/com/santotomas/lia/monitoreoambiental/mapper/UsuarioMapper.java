package com.santotomas.lia.monitoreoambiental.mapper;

import com.santotomas.lia.monitoreoambiental.dto.LoginResponse;
import com.santotomas.lia.monitoreoambiental.model.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {
    UsuarioMapper INSTANCE = Mappers.getMapper(UsuarioMapper.class);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    @Mapping(target = "apellido", source = "apellido")
    @Mapping(target = "correo", source = "correo")
    @Mapping(target = "rol", source = "rol")
    @Mapping(target = "activo", source = "activo")
    @Mapping(target = "rut", source = "rut")
    LoginResponse usuarioToLoginResponse(Usuario usuario);
}
