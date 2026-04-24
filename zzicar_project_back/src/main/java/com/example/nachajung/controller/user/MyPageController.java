package com.example.nachajung.controller.user;

import com.example.nachajung.dto.user.MyPredictionHistoryDto;
import com.example.nachajung.service.user.MyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageController {

    private final MyPageService myPageService;

    @GetMapping("/{userId}/predictions")
    public List<MyPredictionHistoryDto> getMyPredictions(@PathVariable Long userId) {
        return myPageService.getMyPredictionHistory(userId);
    }
}