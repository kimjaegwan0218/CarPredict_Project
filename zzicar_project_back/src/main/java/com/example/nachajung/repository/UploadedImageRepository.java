package com.example.nachajung.repository;
import com.example.nachajung.entity.UploadImage;
import org.springframework.data.jpa.repository.JpaRepository;


public interface UploadedImageRepository extends JpaRepository<UploadImage, Long> {

}