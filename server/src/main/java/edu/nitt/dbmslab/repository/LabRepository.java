package edu.nitt.dbmslab.repository;
import edu.nitt.dbmslab.model.Lab; import org.springframework.data.jpa.repository.JpaRepository;
public interface LabRepository extends JpaRepository<Lab, Long> { }
