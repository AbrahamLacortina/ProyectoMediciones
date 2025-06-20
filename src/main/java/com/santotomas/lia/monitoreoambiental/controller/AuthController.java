package com.santotomas.lia.monitoreoambiental.controller;

import com.santotomas.lia.monitoreoambiental.dto.LoginRequest;
import com.santotomas.lia.monitoreoambiental.dto.LoginResponse;
import com.santotomas.lia.monitoreoambiental.model.Usuario;
import com.santotomas.lia.monitoreoambiental.repository.UsuarioRepository;
import com.santotomas.lia.monitoreoambiental.mapper.UsuarioMapper;
import com.santotomas.lia.monitoreoambiental.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioMapper usuarioMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/me")
    public LoginResponse me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String correo = ((User) auth.getPrincipal()).getUsername();
        Usuario usuario = usuarioRepository.findByCorreo(correo);
        if (usuario == null) return null;
        return usuarioMapper.usuarioToLoginResponse(usuario);
    }

    @PostMapping("/jwt-login")
    public ResponseEntity<?> jwtLogin(@RequestBody LoginRequest loginRequest) {
        Usuario usuario = usuarioRepository.findByCorreo(loginRequest.getCorreo());
        if (usuario == null || !usuario.isActivo() || !passwordEncoder.matches(loginRequest.getPassword(), usuario.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
        }
        String token = jwtUtil.generateToken(usuario.getCorreo(), usuario.getRol());
        LoginResponse response = usuarioMapper.usuarioToLoginResponse(usuario);
        return ResponseEntity.ok(Map.of(
            "token", token,
            "usuario", response
        ));
    }
}