package com.santotomas.lia.monitoreoambiental.controller;

import com.santotomas.lia.monitoreoambiental.model.Usuario;
import com.santotomas.lia.monitoreoambiental.repository.UsuarioRepository;
import com.santotomas.lia.monitoreoambiental.mapper.UsuarioMapper;
import com.santotomas.lia.monitoreoambiental.dto.LoginResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@Validated
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UsuarioMapper usuarioMapper;

    @GetMapping
    public List<LoginResponse> listar() {
        return usuarioRepository.findAll().stream()
            .map(usuarioMapper::usuarioToLoginResponse)
            .toList();
    }

    @PostMapping
    public LoginResponse crear(@Valid @RequestBody Usuario usuario) {
        usuario.setId(null);

        // Validar rol permitido
        if (usuario.getRol() != 0 && usuario.getRol() != 1) {
            throw new IllegalArgumentException("Rol inválido");
        }

        // Validar correo único
        if (usuarioRepository.findByCorreo(usuario.getCorreo()) != null) {
            throw new IllegalArgumentException("Correo ya registrado");
        }

        // Validar rut único
        if (usuario.getRut() != null && !usuario.getRut().isBlank()) {
            List<Usuario> usuarios = usuarioRepository.findAll();
            for (Usuario u : usuarios) {
                if (u.getRut() != null && u.getRut().equals(usuario.getRut())) {
                    throw new IllegalArgumentException("RUT ya registrado");
                }
            }
        }

        // Encriptar contraseña si viene
        if (usuario.getPassword() != null && !usuario.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }

        return usuarioMapper.usuarioToLoginResponse(usuarioRepository.save(usuario));
    }

    @PutMapping("/{id}")
    public LoginResponse editar(@PathVariable Long id, @Valid @RequestBody Usuario usuario) {
        Usuario existente = usuarioRepository.findById(id).orElseThrow();

        // Validar rol permitido
        if (usuario.getRol() != 0 && usuario.getRol() != 1) {
            throw new IllegalArgumentException("Rol inválido");
        }

        // Validar correo único (excepto el propio)
        Usuario otro = usuarioRepository.findByCorreo(usuario.getCorreo());
        if (otro != null && !otro.getId().equals(id)) {
            throw new IllegalArgumentException("Correo ya registrado");
        }

        // Validar rut único (excepto el propio)
        if (usuario.getRut() != null && !usuario.getRut().isBlank()) {
            List<Usuario> usuarios = usuarioRepository.findAll();
            for (Usuario u : usuarios) {
                if (u.getRut() != null && u.getRut().equals(usuario.getRut()) && !u.getId().equals(id)) {
                    throw new IllegalArgumentException("RUT ya registrado");
                }
            }
        }

        existente.setNombre(usuario.getNombre());
        existente.setApellido(usuario.getApellido());
        existente.setCorreo(usuario.getCorreo());
        existente.setRut(usuario.getRut());
        existente.setRol(usuario.getRol());
        existente.setActivo(usuario.isActivo());

        // Si se envía una nueva contraseña, encriptar
        if (usuario.getPassword() != null && !usuario.getPassword().isBlank()) {
            existente.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }

        return usuarioMapper.usuarioToLoginResponse(usuarioRepository.save(existente));
    }

    // Eliminado lógico
    @PutMapping("/{id}/eliminar")
    public LoginResponse eliminar(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();
        usuario.setActivo(false);
        return usuarioMapper.usuarioToLoginResponse(usuarioRepository.save(usuario));
    }
}