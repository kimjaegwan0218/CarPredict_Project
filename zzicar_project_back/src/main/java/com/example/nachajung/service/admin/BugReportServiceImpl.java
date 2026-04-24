package com.example.nachajung.service.admin;

import com.example.nachajung.dto.BugReportResponseDto;
import com.example.nachajung.entity.AnalysisRequest;
import com.example.nachajung.repository.AnalysisRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BugReportServiceImpl implements BugReportService {

    private final AnalysisRequestRepository analysisRequestRepository;

    @Override
    public List<BugReportResponseDto> getBugReports() {
        List<AnalysisRequest> requests = analysisRequestRepository.findBugReports();

        return requests.stream()
                .map(this::toDto)
                .toList();
    }

    private BugReportResponseDto toDto(AnalysisRequest request) {
        return new BugReportResponseDto(
                request.getRequestId(),
                request.getUser().getUserId(),
                request.getUser().getName(),
                request.getUser().getEmail(),
                request.getImage().getImageId(),
                request.getImage().getOriginalFilename(),
                request.getStatus().name(),
                request.getErrorMessage(),
                request.getRequestedAt(),
                request.getStartedAt(),
                request.getFinishedAt()
        );
    }
}
