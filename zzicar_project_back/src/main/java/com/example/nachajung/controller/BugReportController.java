package com.example.nachajung.controller;

import com.example.nachajung.dto.BugReportResponseDto;
import com.example.nachajung.service.admin.BugReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/bug-reports")
public class BugReportController {

    private final BugReportService bugReportService;

    @GetMapping
    public List<BugReportResponseDto> getBugReports() {
        return bugReportService.getBugReports();
    }
}
