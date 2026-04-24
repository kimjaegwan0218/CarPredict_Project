import torch
import torch.nn as nn
from torchvision import models

# 🌟 모델 3: 중고차 파손 분석 AI (ResNet 기반)
class DamagePredictor(nn.Module):
    def __init__(self, num_damage_types=4, num_severity_levels=3):
        super(DamagePredictor, self).__init__()
        
        # 1. 강사님이 칠판에 적어주신 ResNet 모델 가져오기 (이미 똑똑한 뇌)
        # pretrained=True로 하면 기본적인 이미지의 특징을 이미 다 알고 있는 상태로 시작해!
        self.backbone = models.resnet18(pretrained=True)
        
        # ResNet의 원래 마지막 출력층(1000개짜리)을 제거하고 우리가 쓸 수 있게 개조
        num_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity() 

        # 2. 첫 번째 머리 (Target 1): 파손 종류 맞히기 (예: 스크래치, 찌그러짐, 파손, 정상)
        self.type_head = nn.Linear(num_features, num_damage_types)

        # 3. 두 번째 머리 (Target 2): 파손 크기/심각도 맞히기 (예: 소, 중, 대)
        self.severity_head = nn.Linear(num_features, num_severity_levels)

    def forward(self, x):
        # 사진(x)이 들어오면 특징을 쫙 뽑아냄
        features = self.backbone(x)
        
        # 뽑아낸 특징으로 두 가지 정답을 동시에 예측!
        damage_type = self.type_head(features)    # 스크래치인지 찌그러짐인지?
        severity = self.severity_head(features)   # 크기가 어느 정도인지?
        
        return damage_type, severity

# --- 모델이 잘 작동하는지 테스트하는 코드 ---
if __name__ == "__main__":
    # 모델 생성
    model = DamagePredictor(num_damage_types=4, num_severity_levels=3)
    
    # 가상의 자동차 사진 데이터 (배치 사이즈 1, 채널 3(RGB), 가로 224, 세로 224)
    dummy_image = torch.randn(1, 3, 224, 224)
    
    # 모델에 사진 넣기
    pred_type, pred_severity = model(dummy_image)
    
    print("✅ 모델 3 생성 완료!")
    print(f"- 파손 종류 예측 결과 형태: {pred_type.shape}") 
    print(f"- 파손 크기 예측 결과 형태: {pred_severity.shape}")