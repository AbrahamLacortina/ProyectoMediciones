package com.santotomas.lia.monitoreoambiental.controller;

import com.santotomas.lia.monitoreoambiental.dto.LoginResponse;
import com.santotomas.lia.monitoreoambiental.model.Usuario;
import com.santotomas.lia.monitoreoambiental.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/me")
    public LoginResponse me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String correo = ((User) auth.getPrincipal()).getUsername();
        Usuario usuario = usuarioRepository.findByCorreo(correo);
        if (usuario == null) return null;
        LoginResponse resp = new LoginResponse();
        resp.setCorreo(usuario.getCorreo());
        resp.setNombre(usuario.getNombre());
        resp.setRol(usuario.getRol());
        return resp;
    }
}