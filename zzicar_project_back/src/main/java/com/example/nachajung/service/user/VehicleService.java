package com.example.nachajung.service.user;

import com.example.nachajung.dto.AnalysisReportDetailDto;
import com.example.nachajung.dto.HistoryListItemDto;
import com.example.nachajung.dto.VehicleBrandDto;
import com.example.nachajung.dto.VehicleModelDto;

import java.util.List;

public interface VehicleService {

    List<VehicleBrandDto> getAllBrands();

    List<VehicleModelDto> getModelsByBrand(Long brandId);

    AnalysisReportDetailDto getAnalysisReportDetail(Long requestId);

    List<HistoryListItemDto> getHistoryList(String brandName, String modelName, int page, int size);
}