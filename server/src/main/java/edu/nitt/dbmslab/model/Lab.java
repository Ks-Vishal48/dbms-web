package edu.nitt.dbmslab.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Lab {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false) private String title;
  @Column(length = 1200) private String description;
  private String topic;
  private LocalDate dueDate;
  private Integer totalQuestions;
  private boolean published;
}
