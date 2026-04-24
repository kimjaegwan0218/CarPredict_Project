package com.example.nachajung.controller.user;

import com.example.nachajung.dto.AnalysisReportDetailDto;
import com.example.nachajung.dto.HistoryListItemDto;
import com.example.nachajung.dto.VehicleBrandDto;
import com.example.nachajung.dto.VehicleModelDto;
import com.example.nachajung.service.user.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/car")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping("/brands")
    public ResponseEntity<List<VehicleBrandDto>> getBrands() {
        return ResponseEntity.ok(vehicleService.getAllBrands());
    }

    @GetMapping("/models")
    public ResponseEntity<List<VehicleModelDto>> getModels(@RequestParam Long brandId) {
        return ResponseEntity.ok(vehicleService.getModelsByBrand(brandId));
    }

    @GetMapping("/results/{id}")
    public ResponseEntity<AnalysisReportDetailDto> getResultDetail(@PathVariable("id") Long id) {
        return ResponseEntity.ok(vehicleService.getAnalysisReportDetail(id));
    }

    @GetMapping("/history")
    public ResponseEntity<List<HistoryListItemDto>> getHistory(
            @RequestParam(required = false) String brandName,
            @RequestParam(required = false) String modelName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        return ResponseEntity.ok(vehicleService.getHistoryList(brandName, modelName, page, size));
    }
}