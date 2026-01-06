package com.deepika.musixapp.model;

import com.deepika.musixapp.model.ERole;
import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ERole name; // This MUST be named 'name' for role.getName() to work

    public Role() {}

    public Role(ERole name) {
        this.name = name;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public ERole getName() { return name; }
    public void setName(ERole name) { this.name = name; }
}