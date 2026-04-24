import os
import json
import math
import tempfile
from datetime import datetime

import torch
import torch.nn as nn
import numpy as np
import pandas as pd

from PIL import Image
from torchvision import transforms, models
from ultralytics import YOLO
from catboost import CatBoostRegressor


BASE_DIR = r"C:\zzicar_project\ai-server"


B0_PATH = os.path.join(BASE_DIR, "model_B0_master.pth")
B5_PATH = os.path.join(BASE_DIR, "model_B5_master.pth")
YOLO_PATH = os.path.join(BASE_DIR, "yolov8n.pt")
CATBOOST_PATH = os.path.join(BASE_DIR, "usedcar_catboost_model.cbm")
MAPPING_PATH = os.path.join(BASE_DIR, "model1_model2_mapping_filled.json")
CLASS_DIR = os.path.join(BASE_DIR, "korean_cars")


class CarPricePredictor:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.class_names = self._load_class_names(CLASS_DIR)

        self.model_b0 = self._load_classifier_model("b0", B0_PATH, len(self.class_names))
        self.model_b5 = self._load_classifier_model("b5", B5_PATH, len(self.class_names))
        self.yolo_model = YOLO(YOLO_PATH)

        self.price_model = CatBoostRegressor()
        self.price_model.load_model(CATBOOST_PATH)

        with open(MAPPING_PATH, "r", encoding="utf-8-sig") as f:
            self.mapping = json.load(f)

        self.feature_names = self.price_model.feature_names_

        self.transform_b0 = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225])
        ])

        self.transform_b5 = transforms.Compose([
            transforms.Resize((456, 456)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225])
        ])

    def _load_class_names(self, class_dir):
        return sorted([
            d for d in os.listdir(class_dir)
            if os.path.isdir(os.path.join(class_dir, d))
        ])

    def _load_classifier_model(self, model_type, weight_path, num_classes):
        if model_type == "b0":
            model = models.efficientnet_b0(weights=None)
        elif model_type == "b5":
            model = models.efficientnet_b5(weights=None)
        else:
            raise ValueError(f"지원하지 않는 model_type: {model_type}")

        model.classifier[1] = nn.Linear(model.classifier[1].in_features, num_classes)
        model.load_state_dict(torch.load(weight_path, map_location=self.device))
        model.to(self.device)
        model.eval()
        return model

    def _load_image_pil(self, image_path):
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"이미지 파일이 없습니다: {image_path}")
        try:
            img = Image.open(image_path).convert("RGB")
        except Exception as e:
            raise ValueError(f"PIL 이미지 로드 실패: {image_path}, {e}")
        return img

    def _crop_car_with_yolo(self, full_img, image_path):
        cropped_img = full_img
        used_crop = False

        try:
            results = self.yolo_model(image_path, verbose=False)
            for r in results:
                if r.boxes is None or len(r.boxes) == 0:
                    continue

                car_boxes = []
                for box in r.boxes:
                    cls_id = int(box.cls.item())
                    if cls_id == 2:  # car
                        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                        area = max(0, x2 - x1) * max(0, y2 - y1)
                        car_boxes.append((area, x1, y1, x2, y2))

                if car_boxes:
                    car_boxes.sort(key=lambda x: x[0], reverse=True)
                    _, x1, y1, x2, y2 = car_boxes[0]
                    cropped_img = full_img.crop((x1, y1, x2, y2))
                    used_crop = True
                    break

        except Exception:
            pass

        return cropped_img, used_crop

    @torch.no_grad()
    def _predict_car_model(self, image_path):
        full_img = self._load_image_pil(image_path)

        input_b0 = self.transform_b0(full_img).unsqueeze(0).to(self.device)

        cropped_img, used_crop = self._crop_car_with_yolo(full_img, image_path)
        input_b5 = self.transform_b5(cropped_img).unsqueeze(0).to(self.device)

        out_b0_raw = (self.model_b0(input_b0) + self.model_b0(torch.flip(input_b0, dims=[3]))) / 2
        out_b5_raw = (self.model_b5(input_b5) + self.model_b5(torch.flip(input_b5, dims=[3]))) / 2

        T = 0.7
        out_b0 = torch.softmax(out_b0_raw / T, dim=1)
        out_b5 = torch.softmax(out_b5_raw / T, dim=1)

        final_probs = (out_b0 * 0.2) + (out_b5 * 0.8)

        top5_conf, top5_idx = torch.topk(final_probs, 5)

        top5 = []
        for i in range(5):
            idx = top5_idx[0][i].item()
            name = self.class_names[idx]
            prob = float(top5_conf[0][i].item())
            top5.append((name, prob))

        predicted_label = top5[0][0]
        predicted_conf = top5[0][1]

        return {
            "predicted_label": predicted_label,
            "predicted_confidence": predicted_conf,
            "top5": top5,
            "used_yolo_crop": used_crop
        }

    def _build_model2_input(self, mapping_info, year, mileage):
        current_year = datetime.now().year
        car_age = current_year - year
        if car_age <= 0:
            car_age = 1

        feature_dict = {
            "제조사": mapping_info["manufacturer"],
            "이름": mapping_info["name"],
            "차량나이": car_age,
            "차량나이2": car_age ** 2,
            "주행거리_num": mileage,
            "log_주행거리": math.log1p(mileage),
            "연간주행거리": mileage / car_age
        }

        row = {}
        for col in self.feature_names:
            row[col] = feature_dict[col]

        df = pd.DataFrame([row])
        return df, feature_dict

    def _predict_price(self, input_df):
        pred = self.price_model.predict(input_df)[0]
        return float(pred)

    def _adjust_price_scale(self, raw_price):
        # 현재 네 결과 기준 보정
        return float(raw_price * 100)

    def predict_from_file(self, image_path, year, mileage):
        car_result = self._predict_car_model(image_path)

        predicted_label = car_result["predicted_label"]
        predicted_conf = car_result["predicted_confidence"]
        top5 = car_result["top5"]
        used_crop = car_result["used_yolo_crop"]

        if predicted_label not in self.mapping:
            raise KeyError(f"매핑 JSON에 '{predicted_label}'가 없습니다.")

        mapping_info = self.mapping[predicted_label]
        model2_input_df, _ = self._build_model2_input(mapping_info, year, mileage)

        raw_price = self._predict_price(model2_input_df)
        adjusted_price = self._adjust_price_scale(raw_price)

        return {
            "success": True,
            "predicted_label": predicted_label,
            "predicted_confidence": predicted_conf,
            "manufacturer": int(mapping_info["manufacturer"]),
            "mapped_name": mapping_info["name"],
            "input_year": year,
            "input_mileage": mileage,
            "raw_price": raw_price,
            "adjusted_price_manwon": adjusted_price,
            "adjusted_price_won": int(adjusted_price * 10000),
            "used_yolo_crop": used_crop,
            "top5": [
                {
                    "model_name": name,
                    "confidence": prob
                }
                for name, prob in top5
            ]
        }