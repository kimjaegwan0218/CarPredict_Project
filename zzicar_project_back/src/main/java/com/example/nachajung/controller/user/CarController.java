package com.example.nachajung.controller.user;

import com.example.nachajung.dto.FinalAnalysisResultDto;
import com.example.nachajung.service.user.CarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/car")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CarController {

    private final CarService carService;

    @PostMapping("/analyze")
    public ResponseEntity<FinalAnalysisResultDto> analyze(
            @RequestParam("userId") Long userId,
            @RequestParam("carImage") MultipartFile carImage,
            @RequestParam("damageImages") MultipartFile[] damageImages,
            @RequestParam("year") Integer year,
            @RequestParam("mileage") Integer mileage
    ) {
        FinalAnalysisResultDto result =
                carService.processAnalysis(userId, carImage, damageImages, year, mileage);

        return ResponseEntity.ok(result);
    }
}