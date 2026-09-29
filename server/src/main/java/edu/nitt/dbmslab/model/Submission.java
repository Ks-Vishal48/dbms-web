package edu.nitt.dbmslab.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Submission {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  private Long studentId;
  @ManyToOne(optional = false) private Question question;
  @Column(length = 5000) private String queryText;
  private Integer score;
  private boolean passed;
  private LocalDateTime submittedAt;
}
