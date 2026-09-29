package edu.nitt.dbmslab.repository;
import edu.nitt.dbmslab.model.Question; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface QuestionRepository extends JpaRepository<Question, Long> { List<Question> findByLabId(Long labId); }
