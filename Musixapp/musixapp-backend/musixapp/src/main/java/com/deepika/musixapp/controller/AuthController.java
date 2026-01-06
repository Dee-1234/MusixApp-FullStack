package com.deepika.musixapp.controller;


import com.deepika.musixapp.model.User;
import com.deepika.musixapp.payload.request.LoginRequest;
import com.deepika.musixapp.payload.request.SignupRequest;
import com.deepika.musixapp.payload.response.JwtResponse;
import com.deepika.musixapp.payload.response.MessageResponse;
import com.deepika.musixapp.repository.RoleRepository;
import com.deepika.musixapp.repository.UserRepository;
import com.deepika.musixapp.security.JwtUtils;
import com.deepika.musixapp.security.service.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
public class AuthController {

    @Autowired
    UserRepository userRepository;
    @Autowired
    PasswordEncoder encoder;
    @Autowired
    JwtUtils jwtUtils;
    @Autowired
    RoleRepository roleRepository;
    @Autowired
    AuthenticationManager authenticationManager;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Username taken!"));
        }

        // 1. Create the user object
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        // 2. Get roles from request
        Set<String> strRoles = signUpRequest.getRole();
        Set<String> roles = new HashSet<>(); // Notice this is now Set<String>

        // 3. Map the strings directly
        if (strRoles == null || strRoles.isEmpty()) {
            roles.add("ROLE_USER");
        } else {
            strRoles.forEach(role -> {
                switch (role.toLowerCase()) {
                    case "admin":
                        roles.add("ROLE_ADMIN");
                        break;
                    case "mod":
                        roles.add("ROLE_MODERATOR");
                        break;
                    default:
                        roles.add("ROLE_USER");
                }
            });
        }

        // 4. Save to the User object (this matches your User.java now!)
        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        // 1. You must create this 'authentication' object first!
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        // 2. Set it in the Security Context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. NOW you can pass it to your jwtUtils without an error
        String jwt = jwtUtils.generateJwtToken(authentication);

        // 4. Get UserDetails to send back in the response
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());


        return ResponseEntity.ok(new JwtResponse(
                jwt,                     // 1. String token
                userDetails.getId(),     // 2. Long id
                userDetails.getUsername(),// 3. String username
                userDetails.getEmail(),    // 4. String email
                roles                    // 5. List<String> roles
        ));
    }
}