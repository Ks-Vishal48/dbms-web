package edu.nitt.dbmslab.controller;

import edu.nitt.dbmslab.model.*;
import edu.nitt.dbmslab.repository.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;
import java.time.LocalDateTime;
import java.util.*;

@RestController @RequestMapping("/api") @CrossOrigin(origins = "http://localhost:5173")
public class PortalController {
  private final UserRepository users; private final LabRepository labs; private final QuestionRepository questions; private final SubmissionRepository submissions; private final JdbcTemplate jdbc;
  public PortalController(UserRepository users, LabRepository labs, QuestionRepository questions, SubmissionRepository submissions, JdbcTemplate jdbc) { this.users=users; this.labs=labs; this.questions=questions; this.submissions=submissions; this.jdbc=jdbc; }

  @GetMapping("/dashboard") public Map<String,Object> dashboard() { return Map.of("labs",labs.findAll(),"questions",questions.findAll(),"students",users.findAll().stream().filter(u->u.getRole()==User.Role.STUDENT).count(),"submissions",submissions.count()); }
  @GetMapping("/labs") public List<Lab> allLabs(){ return labs.findAll(); }
  @PostMapping("/labs") public Lab createLab(@RequestBody Lab lab){ lab.setId(null); return labs.save(lab); }
  @GetMapping("/labs/{id}/questions") public List<Question> questions(@PathVariable Long id){ return questions.findByLabId(id); }
  @PostMapping("/questions") public ResponseEntity<?> createQuestion(@RequestBody Question q){ if(q.getLab()==null || q.getLab().getId()==null) return ResponseEntity.badRequest().body("Lab is required"); q.setLab(labs.findById(q.getLab().getId()).orElseThrow()); q.setId(null); return ResponseEntity.ok(questions.save(q)); }
  @PostMapping("/submissions") public Submission submit(@RequestBody Map<String,Object> body) {
    Long questionId=Long.valueOf(body.get("questionId").toString()); Long studentId=Long.valueOf(body.getOrDefault("studentId",1).toString()); String sql=body.get("queryText").toString().trim();
    Question q=questions.findById(questionId).orElseThrow(); boolean passed=normalise(sql).equals(normalise(q.getExpectedQuery()));
    return submissions.save(Submission.builder().studentId(studentId).question(q).queryText(sql).passed(passed).score(passed?q.getPoints():0).submittedAt(LocalDateTime.now()).build());
  }
  @PostMapping("/query/run") public ResponseEntity<?> runQuery(@RequestBody Map<String,String> body) {
    String sql=body.getOrDefault("query", "").trim(); String lower=sql.toLowerCase();
    if (!lower.startsWith("select") || sql.contains(";") || lower.contains("portal_users") || lower.contains("information_schema")) return ResponseEntity.badRequest().body(Map.of("message","Only one SELECT query against the academic practice tables is allowed."));
    try { List<Map<String,Object>> rows=jdbc.queryForList(sql); return ResponseEntity.ok(Map.of("columns", rows.isEmpty()?List.of():new ArrayList<>(rows.get(0).keySet()), "rows", rows, "count", rows.size())); }
    catch (Exception ex) { return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage())); }
  }
  @PostMapping("/auth/sync")
  public User syncUser(@RequestBody Map<String, String> body) {
    String email = body.getOrDefault("email", "").trim().toLowerCase();
    String name = body.getOrDefault("name", "User").trim();
    String roleStr = body.getOrDefault("role", "STUDENT").toUpperCase();
    User.Role role = User.Role.STUDENT;
    try { role = User.Role.valueOf(roleStr); } catch (Exception ignored) {}
    if (email.contains("admin")) role = User.Role.ADMIN;
    final User.Role finalRole = role;
    return users.findByEmail(email).orElseGet(() -> 
      users.save(User.builder().name(name).email(email).role(finalRole).build())
    );
  }
  @GetMapping("/submissions") public List<Submission> allSubmissions(){ return submissions.findAll(); }
  @GetMapping("/submissions/{studentId}") public List<Submission> history(@PathVariable Long studentId){ return submissions.findByStudentIdOrderBySubmittedAtDesc(studentId); }
  @GetMapping("/users") public List<User> users(){ return users.findAll(); }
  private String normalise(String sql) { return sql.toLowerCase().replaceAll("\\s+", " ").replaceAll(";", "").trim(); }
}
