package edu.nitt.dbmslab.repository;
import edu.nitt.dbmslab.model.Submission; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface SubmissionRepository extends JpaRepository<Submission, Long> { List<Submission> findByStudentIdOrderBySubmittedAtDesc(Long studentId); }
