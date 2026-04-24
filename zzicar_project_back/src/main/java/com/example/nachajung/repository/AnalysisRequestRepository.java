package com.example.nachajung.repository;

import com.example.nachajung.entity.AnalysisRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AnalysisRequestRepository extends JpaRepository<AnalysisRequest, Long> {

    @Query("""
           select ar
           from AnalysisRequest ar
           join fetch ar.user u
           join fetch ar.image i
           where ar.status = com.example.nachajung.entity.AnalysisRequest$Status.FAILED
           order by ar.requestedAt desc
           """)
    List<AnalysisRequest> findBugReports();
}