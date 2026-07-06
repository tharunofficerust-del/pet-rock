// package com.pet.enitity;

// import jakarta.persistence.*;
// import lombok.Data;

// @Entity
// @Table(name = "Pet_Rock")
// @Data
// public class PetRock {
//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long rockId;

//     @OneToOne
//     @JoinColumn(name = "user_id", referencedColumnName = "userId", unique = true)
//     private User user;

//     private String rockName = "Rocky";
//     private String moodState = "HAPPY";
//     private int healthPoints = 100;
//     private int streakCount = 0;
// }
