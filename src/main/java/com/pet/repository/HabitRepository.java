// package com.pet.repository;

// import org.springframework.data.jpa.repository.JpaRepository;

// import com.pet.enitity.Habit;

// import java.util.List;

// public interface HabitRepository extends JpaRepository<Habit, Long> {
//     List<Habit> findByUser_UserId(Long userId);
//     long countByUser_UserId(Long userId); // Used to enforce the 5-task limit
// }
