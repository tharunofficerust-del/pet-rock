// package com.pet.enitity;


// import jakarta.persistence.*;
// import lombok.Data;
// import java.time.LocalDateTime;

// @Entity
// @Table(name = "Habits")
// @Data
// public class Habit {
//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long habitId;

//     @ManyToOne
//     @JoinColumn(name = "user_id", referencedColumnName = "userId")
//     private User user;

//     @Column(nullable = false)
//     private String title;

//     private boolean isCompletedToday = false;
//     private LocalDateTime createdAt = LocalDateTime.now();
// }
