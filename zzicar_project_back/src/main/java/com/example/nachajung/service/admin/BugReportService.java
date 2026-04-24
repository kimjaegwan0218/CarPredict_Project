package com.example.nachajung.service.admin;

import com.example.nachajung.dto.BugReportResponseDto;

import java.util.List;

public interface BugReportService {

    List<BugReportResponseDto> getBugReports();
}
