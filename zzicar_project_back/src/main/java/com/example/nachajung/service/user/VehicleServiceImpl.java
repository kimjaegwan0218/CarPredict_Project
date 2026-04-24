package com.example.nachajung.service.user;

import com.example.nachajung.dto.AnalysisReportDetailDto;
import com.example.nachajung.dto.HistoryListItemDto;
import com.example.nachajung.dto.VehicleBrandDto;
import com.example.nachajung.dto.VehicleModelDto;
import com.example.nachajung.repository.VehicleBrandRepository;
import com.example.nachajung.repository.VehicleModelRepository;
import com.example.nachajung.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleBrandRepository brandRepository;
    private final VehicleModelRepository modelRepository;

    @Value("${app.upload.car-dir}")
    private String carDir;

    @Value("${app.upload.damage-dir}")
    private String damageDir;

    @Override
    @Transactional(readOnly = true)
    public List<VehicleBrandDto> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(brand -> new VehicleBrandDto(
                        brand.getBrandId(),
                        brand.getBrandName()
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleModelDto> getModelsByBrand(Long brandId) {
        return modelRepository.findByBrand_BrandId(brandId).stream()
                .map(model -> new VehicleModelDto(
                        model.getModelId(),
                        model.getBrand().getBrandId(),
                        model.getModelName()
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AnalysisReportDetailDto getAnalysisReportDetail(Long requestId) {
        AnalysisReportDetailDto dto = vehicleRepository.findReportDetailByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("해당 ID(" + requestId + ")의 분석 결과를 찾을 수 없습니다."));

        dto.setImagePath(toWebImagePath(dto.getImagePath()));
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistoryListItemDto> getHistoryList(String brandName, String modelName, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<HistoryListItemDto> result = vehicleRepository.findHistoryListWithFilter(brandName, modelName, pageable);

        result.forEach(item -> item.setImagePath(toWebImagePath(item.getImagePath())));
        return result;
    }

    private String toWebImagePath(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) {
            return null;
        }

        String normalizedStoredPath = normalizePath(storedPath);
        String normalizedCarDir = normalizePath(carDir);
        String normalizedDamageDir = normalizePath(damageDir);

        if (normalizedStoredPath.startsWith(normalizedCarDir)) {
            String fileName = Paths.get(storedPath).getFileName().toString();
            return "/uploads/car/" + fileName;
        }

        if (normalizedStoredPath.startsWith(normalizedDamageDir)) {
            String fileName = Paths.get(storedPath).getFileName().toString();
            return "/uploads/damage/" + fileName;
        }

        return null;
    }

    private String normalizePath(String path) {
        return Paths.get(path).normalize().toString().replace("\\", "/");
    }
}