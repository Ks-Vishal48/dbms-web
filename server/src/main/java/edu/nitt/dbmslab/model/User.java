package edu.nitt.dbmslab.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "portal_users") @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false) private String name;
  @Column(unique = true, nullable = false) private String email;
  @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role;
  public enum Role { STUDENT, FACULTY, ADMIN }
}
