package edu.nitt.dbmslab.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class AcademicSchemaSeeder {
  @Bean CommandLineRunner academicSchema(JdbcTemplate jdbc) { return args -> {
    jdbc.execute("CREATE TABLE IF NOT EXISTS departments (id BIGINT PRIMARY KEY, name VARCHAR(100) NOT NULL, building VARCHAR(100))");
    jdbc.execute("CREATE TABLE IF NOT EXISTS students (id BIGINT PRIMARY KEY, name VARCHAR(100) NOT NULL, department_id BIGINT, CONSTRAINT fk_student_department FOREIGN KEY (department_id) REFERENCES departments(id))");
    jdbc.execute("CREATE TABLE IF NOT EXISTS courses (id BIGINT PRIMARY KEY, title VARCHAR(150) NOT NULL, credits INT NOT NULL, department_id BIGINT, CONSTRAINT fk_course_department FOREIGN KEY (department_id) REFERENCES departments(id))");
    jdbc.execute("CREATE TABLE IF NOT EXISTS employees (id BIGINT PRIMARY KEY, name VARCHAR(100) NOT NULL, department_id BIGINT, CONSTRAINT fk_employee_department FOREIGN KEY (department_id) REFERENCES departments(id))");
    Integer count=jdbc.queryForObject("SELECT COUNT(*) FROM departments", Integer.class);
    if (count != null && count == 0) {
      jdbc.update("INSERT INTO departments VALUES (1,'Computer Science','Barn Hall'),(2,'Electronics','EEE Block'),(3,'Mechanical','MEC Block'),(4,'Architecture','Architecture Block')");
      jdbc.update("INSERT INTO students VALUES (101,'Aarav Sharma',1),(102,'Diya Menon',1),(103,'Kabir Shah',2),(104,'Nila Krishnan',1),(105,'Rohan Das',3)");
      jdbc.update("INSERT INTO courses VALUES (11,'Database Management Systems',4,1),(12,'Operating Systems',4,1),(13,'Digital Systems',3,2),(14,'Thermodynamics',4,3)");
      jdbc.update("INSERT INTO employees VALUES (501,'Dr. Meera Nair',1),(502,'Dr. Arjun Rao',1),(503,'Dr. S. Iyer',2)");
    }
  }; }
}
