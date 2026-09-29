package edu.nitt.dbmslab.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Question {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(optional = false) private Lab lab;
  private String title;
  @Column(length = 2000) private String prompt;
  @Column(length = 2000) private String schemaHint;
  @Column(length = 3000) private String expectedQuery;
  private Integer points;
  private String difficulty;
}
