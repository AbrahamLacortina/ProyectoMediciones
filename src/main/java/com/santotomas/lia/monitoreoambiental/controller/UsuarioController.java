package com.santotomas.lia.monitoreoambiental.controller;

import com.santotomas.lia.monitoreoambiental.model.Usuario;
import com.santotomas.lia.monitoreoambiental.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    @PostMapping
    public Usuario crear(@RequestBody Usuario usuario) {
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

        return usuarioRepository.save(usuario);
    }

    @PutMapping("/{id}")
    public Usuario editar(@PathVariable Long id, @RequestBody Usuario usuario) {
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

        return usuarioRepository.save(existente);
    }

    // Eliminado lógico
    @PutMapping("/{id}/eliminar")
    public Usuario eliminar(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();
        usuario.setActivo(false);
        return usuarioRepository.save(usuario);
    }
}