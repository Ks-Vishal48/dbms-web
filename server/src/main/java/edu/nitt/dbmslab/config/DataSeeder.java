package edu.nitt.dbmslab.config;
import edu.nitt.dbmslab.model.*; import edu.nitt.dbmslab.repository.*; import org.springframework.boot.CommandLineRunner; import org.springframework.context.annotation.*; import java.time.LocalDate;

@Configuration public class DataSeeder {
 @Bean CommandLineRunner seed(UserRepository users, LabRepository labs, QuestionRepository questions) { return args -> { if (users.count()>0) return;
  users.save(User.builder().name("Aarav Sharma").email("student@nitt.edu").role(User.Role.STUDENT).build()); users.save(User.builder().name("Dr. Meera Nair").email("admin@nitt.edu").role(User.Role.ADMIN).build());
  Lab joins=labs.save(Lab.builder().title("Lab 03: Joins & Aggregation").description("Use the academic schema to answer reporting queries using joins, grouping and aggregate functions.").topic("SQL Joins").dueDate(LocalDate.now().plusDays(7)).totalQuestions(4).published(true).build());
  Lab design=labs.save(Lab.builder().title("Lab 04: Relational Design").description("Work with normalized department and employee data.").topic("Normalization").dueDate(LocalDate.now().plusDays(14)).totalQuestions(3).published(true).build());
  questions.save(Question.builder().lab(joins).title("Department strength").prompt("List every department with its name and the number of enrolled students. Include departments with no students.").schemaHint("departments(id, name)\nstudents(id, name, department_id)").expectedQuery("SELECT d.name, COUNT(s.id) AS student_count FROM departments d LEFT JOIN students s ON d.id = s.department_id GROUP BY d.id, d.name").points(10).difficulty("Medium").build());
  questions.save(Question.builder().lab(joins).title("High credit courses").prompt("Find courses that have more than 3 credits.").schemaHint("courses(id, title, credits, department_id)").expectedQuery("SELECT title, credits FROM courses WHERE credits > 3").points(5).difficulty("Easy").build());
  questions.save(Question.builder().lab(design).title("Create an indexed view").prompt("Write a query that shows employee count by department.").schemaHint("employees(id, name, department_id)\ndepartments(id, name)").expectedQuery("SELECT d.name, COUNT(e.id) AS employee_count FROM departments d LEFT JOIN employees e ON d.id = e.department_id GROUP BY d.id, d.name").points(10).difficulty("Medium").build());
 }; }
}
