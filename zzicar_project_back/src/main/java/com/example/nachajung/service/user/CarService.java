package com.example.nachajung.service.user;

import com.example.nachajung.dto.BaseResponse;
import com.example.nachajung.dto.DamageResponse;
import com.example.nachajung.dto.FinalAnalysisResultDto;
import com.example.nachajung.entity.AnalysisRequest;
import com.example.nachajung.entity.ClassificationResult;
import com.example.nachajung.entity.DamageAnalysisResult;
import com.example.nachajung.entity.PricePrediction;
import com.example.nachajung.entity.UploadImage;
import com.example.nachajung.entity.User;
import com.example.nachajung.repository.AnalysisRequestRepository;
import com.example.nachajung.repository.ClassificationResultRepository;
import com.example.nachajung.repository.DamageAnalysisResultRepository;
import com.example.nachajung.repository.PricePredictionRepository;
import com.example.nachajung.repository.UploadedImageRepository;
import com.example.nachajung.repository.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CarService {

    private final AnalysisRequestRepository requestRepo;
    private final UploadedImageRepository imageRepo;
    private final UserRepository userRepository;
    private final ClassificationResultRepository classificationResultRepository;
    private final DamageAnalysisResultRepository damageAnalysisResultRepository;
    private final PricePredictionRepository pricePredictionRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.base-url}")
    private String aiBaseUrl;

    @Value("${app.upload.car-dir}")
    private String carUploadDir;

    @Value("${app.upload.damage-dir}")
    private String damageUploadDir;

    public FinalAnalysisResultDto processAnalysis(
            Long userId,
            MultipartFile carImage,
            MultipartFile[] damageImages,
            Integer year,
            Integer mileage
    ) {
        AnalysisRequest request = null;

        try {
            validateInput(carImage, damageImages, year, mileage);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

            MultipartFile damageImage = damageImages[0];

            // 1. 이미지 저장
            UploadImage savedCarImage = saveImage(user, carImage, carUploadDir);
            UploadImage savedDamageImage = saveImage(user, damageImage, damageUploadDir);

            // 2. 요청 생성
            request = createPendingRequest(user, savedCarImage);
            markStarted(request);

            // 3. FastAPI 호출
            BaseResponse baseResult = callBasePredict(savedCarImage.getStoredPath(), year, mileage);
            DamageResponse damageResult = callDamagePredict(savedDamageImage.getStoredPath());

            // 4. 응답 검증
            validateBaseResult(baseResult);
            validateDamageResult(damageResult);

            // 5. classification_results 저장
            ClassificationResult classification = new ClassificationResult();
            classification.setRequest(request);
            classification.setPredictedLabel(baseResult.getPredictedLabel());
            classification.setMappedName(baseResult.getMappedName());
            classification.setManufacturerCode(baseResult.getManufacturer());
            classification.setManufacturerName(mapManufacturerName(baseResult.getManufacturer()));
            classification.setConfidence(BigDecimal.valueOf(baseResult.getPredictedConfidence()));
            classification.setTopKJson(toJson(baseResult.getTop5()));
            classification.setCreatedAt(LocalDateTime.now());
            classificationResultRepository.saveAndFlush(classification);

            // 6. damage_analysis_results 저장
            DamageAnalysisResult damageAnalysis = new DamageAnalysisResult();
            damageAnalysis.setRequest(request);
            damageAnalysis.setPredictedDamageType(damageResult.getPredictedDamageType());
            damageAnalysis.setPredictedDamageTypeKor(damageResult.getPredictedDamageTypeKor());
            damageAnalysis.setPredictedConfidence(BigDecimal.valueOf(damageResult.getPredictedConfidence()));
            damageAnalysis.setAreaClass(damageResult.getAreaClass());
            damageAnalysis.setDepreciationRate(BigDecimal.valueOf(damageResult.getDepreciationRate()));
            damageAnalysis.setDepreciationAmount(damageResult.getDepreciationAmount());
            damageAnalysis.setCreatedAt(LocalDateTime.now());
            damageAnalysisResultRepository.saveAndFlush(damageAnalysis);

            // 7. price_predictions 저장
            long basePrice = baseResult.getAdjustedPriceWon();
            long depreciationAmount = damageResult.getDepreciationAmount();
            long finalPrice = Math.max(basePrice - depreciationAmount, 0);

            String brandName = mapManufacturerName(baseResult.getManufacturer());
            String modelName = baseResult.getMappedName();

            String resultSummary = String.format(
                    "기본 시세 %,d원에서 감가 %,d원이 반영되어 최종 예상가는 %,d원입니다. 차량은 %s, 파손 유형은 %s입니다.",
                    basePrice,
                    depreciationAmount,
                    finalPrice,
                    modelName,
                    damageResult.getPredictedDamageTypeKor()
            );

            PricePrediction prediction = new PricePrediction();
            prediction.setRequest(request);
            prediction.setBasePriceWon(basePrice);
            prediction.setDepreciationAmount(depreciationAmount);
            prediction.setFinalPriceWon(finalPrice);
            prediction.setMinPrice(null);
            prediction.setMaxPrice(null);
            prediction.setConfidenceScore(BigDecimal.valueOf(baseResult.getPredictedConfidence()));
            prediction.setBrandNameSnapshot(brandName);
            prediction.setModelNameSnapshot(modelName);
            prediction.setModelYear(baseResult.getInputYear());
            prediction.setMileage(baseResult.getInputMileage());
            prediction.setResultSummary(resultSummary);
            prediction.setCreatedAt(LocalDateTime.now());
            pricePredictionRepository.saveAndFlush(prediction);

            // 8. 완료 처리
            markDone(request);

            // 9. 응답
            return new FinalAnalysisResultDto(
                    request.getRequestId(),
                    request.getStatus().name(),
                    brandName,
                    modelName,
                    baseResult.getInputYear(),
                    baseResult.getInputMileage(),
                    basePrice,
                    depreciationAmount,
                    finalPrice,
                    damageResult.getPredictedDamageTypeKor(),
                    damageResult.getAreaClass(),
                    resultSummary,
                    savedCarImage.getStoredPath(),
                    savedDamageImage.getStoredPath()
            );

        } catch (IllegalArgumentException e) {
            markFailedIfPossible(request, "INPUT_ERROR: " + safeMessage(e));
            throw e;

        } catch (EntityNotFoundException e) {
            markFailedIfPossible(request, "USER_ERROR: " + safeMessage(e));
            throw e;

        } catch (ResponseStatusException e) {
            markFailedIfPossible(request, "AI_RESPONSE_ERROR: " + safeMessage(e));
            throw e;

        } catch (RestClientResponseException e) {
            markFailedIfPossible(
                    request,
                    "FASTAPI_HTTP_ERROR: status=" + e.getStatusCode().value() + ", body=" + e.getResponseBodyAsString()
            );
            throw e;

        } catch (RuntimeException e) {
            markFailedIfPossible(request, "RUNTIME_ERROR: " + safeMessage(e));
            throw e;

        } catch (Exception e) {
            markFailedIfPossible(request, "INTERNAL_ERROR: " + safeMessage(e));
            throw new RuntimeException("분석 중 오류가 발생했습니다.", e);
        }
    }

    private void validateInput(MultipartFile carImage, MultipartFile[] damageImages, Integer year, Integer mileage) {
        if (carImage == null || carImage.isEmpty()) {
            throw new IllegalArgumentException("차량 이미지는 필수입니다.");
        }

        if (damageImages == null || damageImages.length == 0) {
            throw new IllegalArgumentException("파손 이미지는 최소 1장 필요합니다.");
        }

        if (damageImages.length > 6) {
            throw new IllegalArgumentException("파손 이미지는 최대 6장까지 가능합니다.");
        }

        if (year == null) {
            throw new IllegalArgumentException("연식은 필수입니다.");
        }

        if (mileage == null) {
            throw new IllegalArgumentException("주행거리는 필수입니다.");
        }
    }

    private AnalysisRequest createPendingRequest(User user, UploadImage savedCarImage) {
        AnalysisRequest request = new AnalysisRequest();
        request.setUser(user);
        request.setImage(savedCarImage);
        request.setStatus(AnalysisRequest.Status.PENDING);
        request.setRequestedAt(LocalDateTime.now());
        return requestRepo.saveAndFlush(request);
    }

    private void markStarted(AnalysisRequest request) {
        request.setStartedAt(LocalDateTime.now());
        requestRepo.saveAndFlush(request);
    }

    private void markDone(AnalysisRequest request) {
        request.setStatus(AnalysisRequest.Status.DONE);
        request.setFinishedAt(LocalDateTime.now());
        request.setErrorMessage(null);
        requestRepo.saveAndFlush(request);
    }

    private void markFailedIfPossible(AnalysisRequest request, String errorMessage) {
        if (request == null || request.getRequestId() == null) {
            return;
        }

        request.setStatus(AnalysisRequest.Status.FAILED);
        request.setFinishedAt(LocalDateTime.now());
        request.setErrorMessage(errorMessage);
        requestRepo.saveAndFlush(request);
    }

    private String safeMessage(Exception e) {
        return (e.getMessage() != null && !e.getMessage().isBlank())
                ? e.getMessage()
                : e.getClass().getSimpleName();
    }

    private void validateBaseResult(BaseResponse baseResult) {
        if (baseResult == null) {
            throw new RuntimeException("BASE_AI_ERROR: baseResult 자체가 null입니다.");
        }
        if (!baseResult.isSuccess()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "기본 차량 분석 실패");
        }
        if (baseResult.getPredictedLabel() == null) {
            throw new RuntimeException("BASE_AI_ERROR: predictedLabel 이 null입니다.");
        }
        if (baseResult.getMappedName() == null) {
            throw new RuntimeException("BASE_AI_ERROR: mappedName 이 null입니다.");
        }
        if (baseResult.getManufacturer() == null) {
            throw new RuntimeException("BASE_AI_ERROR: manufacturer 가 null입니다.");
        }
        if (baseResult.getPredictedConfidence() == null) {
            throw new RuntimeException("BASE_AI_ERROR: predictedConfidence 가 null입니다.");
        }
        if (baseResult.getAdjustedPriceWon() == null) {
            throw new RuntimeException("BASE_AI_ERROR: adjustedPriceWon 이 null입니다.");
        }
        if (baseResult.getInputYear() == null) {
            throw new RuntimeException("BASE_AI_ERROR: inputYear 가 null입니다.");
        }
        if (baseResult.getInputMileage() == null) {
            throw new RuntimeException("BASE_AI_ERROR: inputMileage 가 null입니다.");
        }
    }

    private void validateDamageResult(DamageResponse damageResult) {
        if (damageResult == null) {
            throw new RuntimeException("DAMAGE_AI_ERROR: damageResult 자체가 null입니다.");
        }
        if (!damageResult.isSuccess()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "파손 분석 실패");
        }
        if (damageResult.getPredictedDamageType() == null) {
            throw new RuntimeException("DAMAGE_AI_ERROR: predictedDamageType 이 null입니다.");
        }
        if (damageResult.getPredictedDamageTypeKor() == null) {
            throw new RuntimeException("DAMAGE_AI_ERROR: predictedDamageTypeKor 이 null입니다.");
        }
        if (damageResult.getPredictedConfidence() == null) {
            throw new RuntimeException("DAMAGE_AI_ERROR: predictedConfidence 가 null입니다.");
        }
        if (damageResult.getAreaClass() == null) {
            throw new RuntimeException("DAMAGE_AI_ERROR: areaClass 가 null입니다.");
        }
        if (damageResult.getDepreciationRate() == null) {
            throw new RuntimeException("DAMAGE_AI_ERROR: depreciationRate 가 null입니다.");
        }
        if (damageResult.getDepreciationAmount() == null) {
            throw new RuntimeException("DAMAGE_AI_ERROR: depreciationAmount 가 null입니다.");
        }
    }

    private UploadImage saveImage(User user, MultipartFile file, String targetDir) {
        try {
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("업로드 파일이 비어 있습니다.");
            }

            File dir = new File(targetDir);
            if (!dir.exists()) {
                boolean created = dir.mkdirs();
                if (!created && !dir.exists()) {
                    throw new RuntimeException("업로드 폴더 생성 실패: " + targetDir);
                }
            }

            String originalFilename = file.getOriginalFilename();
            String storedFilename = UUID.randomUUID() + "_" + originalFilename;
            File dest = new File(dir, storedFilename);

            file.transferTo(dest);

            UploadImage img = new UploadImage();
            img.setUser(user);
            img.setOriginalFilename(originalFilename);
            img.setStoredFilename(storedFilename);
            img.setStoredPath(dest.getAbsolutePath());
            img.setFileSize(file.getSize());
            img.setContentType(file.getContentType());
            img.setUploadedAt(LocalDateTime.now());

            return imageRepo.saveAndFlush(img);

        } catch (IOException e) {
            throw new RuntimeException("FILE_SAVE_ERROR: 파일 저장 실패 - " + file.getOriginalFilename(), e);
        }
    }

    private BaseResponse callBasePredict(String imagePath, Integer year, Integer mileage) {
        String url = aiBaseUrl + "/predict";

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", new FileSystemResource(imagePath));
        body.add("year", year);
        body.add("mileage", mileage);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            Map<String, Object> map = response.getBody();

            if (map == null) {
                throw new RuntimeException("BASE_AI_ERROR: 기본 차량 분석 응답이 비어 있습니다.");
            }

            BaseResponse result = new BaseResponse();
            result.setSuccess(Boolean.TRUE.equals(map.get("success")));
            result.setPredictedLabel((String) map.get("predicted_label"));
            result.setMappedName((String) map.get("mapped_name"));

            Object manufacturerObj = map.get("manufacturer");
            if (manufacturerObj instanceof Number n) {
                result.setManufacturer(n.intValue());
            }

            Object predictedConfidenceObj = map.get("predicted_confidence");
            if (predictedConfidenceObj instanceof Number n) {
                result.setPredictedConfidence(n.doubleValue());
            }

            Object adjustedPriceWonObj = map.get("adjusted_price_won");
            if (adjustedPriceWonObj instanceof Number n) {
                result.setAdjustedPriceWon(n.longValue());
            }

            Object inputYearObj = map.get("input_year");
            if (inputYearObj instanceof Number n) {
                result.setInputYear(n.intValue());
            }

            Object inputMileageObj = map.get("input_mileage");
            if (inputMileageObj instanceof Number n) {
                result.setInputMileage(n.intValue());
            }

            Object top5Obj = map.get("top5");
            if (top5Obj instanceof java.util.List<?> list) {
                java.util.List<BaseResponse.Top5Item> top5Items = new java.util.ArrayList<>();
                for (Object itemObj : list) {
                    if (itemObj instanceof Map<?, ?> itemMap) {
                        BaseResponse.Top5Item item = new BaseResponse.Top5Item();
                        item.setModelName((String) itemMap.get("model_name"));

                        Object confObj = itemMap.get("confidence");
                        if (confObj instanceof Number n) {
                            item.setConfidence(n.doubleValue());
                        }

                        top5Items.add(item);
                    }
                }
                result.setTop5(top5Items);
            }

            return result;

        } catch (RestClientResponseException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("BASE_AI_ERROR: 기본 차량 분석 응답 파싱 실패", e);
        }
    }

    private DamageResponse callDamagePredict(String imagePath) {
        String url = aiBaseUrl + "/predict-damage";

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", new FileSystemResource(imagePath));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            Map<String, Object> map = response.getBody();

            if (map == null) {
                throw new RuntimeException("DAMAGE_AI_ERROR: 파손 분석 응답이 비어 있습니다.");
            }

            DamageResponse result = new DamageResponse();
            result.setSuccess(Boolean.TRUE.equals(map.get("success")));
            result.setPredictedDamageType((String) map.get("predicted_damage_type"));
            result.setPredictedDamageTypeKor((String) map.get("predicted_damage_type_kor"));

            Object predictedConfidenceObj = map.get("predicted_confidence");
            if (predictedConfidenceObj instanceof Number n) {
                result.setPredictedConfidence(n.doubleValue());
            }

            Object areaClassObj = map.get("area_class");
            if (areaClassObj instanceof Number n) {
                result.setAreaClass(n.intValue());
            }

            Object depreciationRateObj = map.get("depreciation_rate");
            if (depreciationRateObj instanceof Number n) {
                result.setDepreciationRate(n.doubleValue());
            }

            Object depreciationAmountObj = map.get("depreciation_amount");
            if (depreciationAmountObj instanceof Number n) {
                result.setDepreciationAmount(n.longValue());
            }

            return result;

        } catch (RestClientResponseException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("DAMAGE_AI_ERROR: 파손 분석 응답 파싱 실패", e);
        }
    }

    private String mapManufacturerName(Integer manufacturerCode) {
        if (manufacturerCode == null) return "미상";

        Map<Integer, String> manufacturerMap = Map.of(
                0, "현대",
                1, "기아",
                2, "제네시스",
                3, "쉐보레",
                4, "르노",
                5, "쌍용"
        );

        return manufacturerMap.getOrDefault(manufacturerCode, "미상");
    }

    private String toJson(Object value) {
        return String.valueOf(value);
    }
}