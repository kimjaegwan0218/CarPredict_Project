import os
import cv2
import torch
import numpy as np
import torchvision.transforms as transforms
from torchvision import models
import segmentation_models_pytorch as smp
from PIL import Image


BASE_DIR = r"C:\zzicar_project\ai-server\Ai_Model3"

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

CLASSIFIER_WEIGHT_PATH = os.path.join(BASE_DIR, "EfficientNetB2_best.pth")
SEGMENTATION_WEIGHT_PATH = os.path.join(BASE_DIR, "DeepLabV3Plus_best.pth")
OUTPUT_MASK_DIR = os.path.join(BASE_DIR, "outputs")

os.makedirs(OUTPUT_MASK_DIR, exist_ok=True)

DAMAGE_CLASSES = ["Scratched", "Crushed", "Breakage"]

CLASS_NAME_KOR = {
    "Breakage": "파손",
    "Crushed": "찌그러짐",
    "Scratched": "스크래치"
}

TYPE_BASE_RATES = {
    "Scratched": 0.02,
    "Crushed": 0.05,
    "Breakage": 0.10
}

AREA_MULTIPLIERS = {
    0: 0.00,
    1: 0.35,
    2: 0.50,
    3: 0.65,
    4: 0.80,
    5: 1.00,
    6: 1.10,
    7: 1.20,
    8: 1.30
}


class DamagePredictor:
    def __init__(self):
        self.classifier_model = self.build_classifier(num_classes=3)
        self.classifier_model = self.load_checkpoint_safely(
            self.classifier_model, CLASSIFIER_WEIGHT_PATH
        )

        self.seg_model = self.build_segmentation_model()
        self.seg_model = self.load_checkpoint_safely(
            self.seg_model, SEGMENTATION_WEIGHT_PATH
        )

        self.classifier_transform = transforms.Compose([
            transforms.Resize((260, 260)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

        self.segmentation_transform = transforms.Compose([
            transforms.Resize((320, 320)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def build_classifier(self, num_classes=3):
        model = models.efficientnet_b2(weights=None)
        in_features = model.classifier[1].in_features
        model.classifier[1] = torch.nn.Linear(in_features, num_classes)
        return model

    def build_segmentation_model(self):
        model = smp.DeepLabV3Plus(
            encoder_name="resnet50",
            encoder_weights=None,
            in_channels=3,
            classes=1
        )
        return model

    def load_checkpoint_safely(self, model, weight_path):
        checkpoint = torch.load(weight_path, map_location=DEVICE)

        if isinstance(checkpoint, dict):
            if "state_dict" in checkpoint:
                state_dict = checkpoint["state_dict"]
            elif "model_state_dict" in checkpoint:
                state_dict = checkpoint["model_state_dict"]
            else:
                state_dict = checkpoint
        else:
            state_dict = checkpoint

        new_state_dict = {}
        for k, v in state_dict.items():
            if k.startswith("module."):
                new_state_dict[k.replace("module.", "", 1)] = v
            else:
                new_state_dict[k] = v

        model.load_state_dict(new_state_dict, strict=True)
        model.to(DEVICE)
        model.eval()
        return model

    def load_image_bgr(self, image_path):
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"이미지 로드 실패: {image_path}")
        return image

    @torch.no_grad()
    def predict_damage_type(self, bgr_image):
        rgb = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb)

        x = self.classifier_transform(pil_img).unsqueeze(0).to(DEVICE)

        logits = self.classifier_model(x)
        probs = torch.softmax(logits, dim=1)[0].cpu().numpy()

        class_probs = {}
        for idx, class_name in enumerate(DAMAGE_CLASSES):
            class_probs[class_name] = float(probs[idx])

        pred_idx = int(np.argmax(probs))
        pred_label = DAMAGE_CLASSES[pred_idx]
        pred_conf = float(probs[pred_idx])

        sorted_probs = sorted(class_probs.items(), key=lambda x: x[1], reverse=True)
        margin = sorted_probs[0][1] - sorted_probs[1][1]

        return pred_label, pred_conf, class_probs, margin

    @torch.no_grad()
    def predict_damage_mask(self, bgr_image, threshold=0.6):
        orig_h, orig_w = bgr_image.shape[:2]
        rgb = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb)

        x = self.segmentation_transform(pil_img).unsqueeze(0).to(DEVICE)
        logits = self.seg_model(x)
        probs = torch.sigmoid(logits)[0, 0].cpu().numpy()

        mask = (probs > threshold).astype(np.uint8)
        mask = cv2.resize(mask, (orig_w, orig_h), interpolation=cv2.INTER_NEAREST)

        kernel = np.ones((5, 5), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
        filtered_mask = np.zeros_like(mask)

        for i in range(1, num_labels):
            area = stats[i, cv2.CC_STAT_AREA]
            if 20 <= area <= 12000:
                filtered_mask[labels == i] = 1

        return filtered_mask

    def calculate_damage_area_pixels(self, mask):
        return int(np.sum(mask > 0))

    def area_to_class(self, area_pixels):
        if area_pixels == 0:
            return 0, 0

        if area_pixels < 50:
            return 1, area_pixels
        elif area_pixels < 150:
            return 2, area_pixels
        elif area_pixels < 300:
            return 3, area_pixels
        elif area_pixels < 600:
            return 4, area_pixels
        elif area_pixels < 1000:
            return 5, area_pixels
        elif area_pixels < 1600:
            return 6, area_pixels
        elif area_pixels < 2400:
            return 7, area_pixels
        else:
            refined = min(area_pixels, 4000)
            return 8, refined

    def calculate_depreciation(self, damage_type, area_class, car_price=20000000):
        if area_class == 0:
            return {
                "base_rate": 0.0,
                "area_mult": 0.0,
                "depreciation_rate": 0.0,
                "depreciation_amount": 0
            }

        base_rate = TYPE_BASE_RATES[damage_type]
        area_mult = AREA_MULTIPLIERS[area_class]

        depreciation_rate = base_rate * area_mult
        depreciation_amount = int(car_price * depreciation_rate)

        return {
            "base_rate": base_rate,
            "area_mult": area_mult,
            "depreciation_rate": depreciation_rate,
            "depreciation_amount": depreciation_amount
        }

    def save_mask_overlay(self, original_bgr, mask, save_path):
        overlay = original_bgr.copy()
        red = np.zeros_like(original_bgr)
        red[:, :, 2] = 255

        mask_bool = (mask > 0)
        if np.any(mask_bool):
            blended = cv2.addWeighted(
                original_bgr.astype(np.uint8), 0.4,
                red.astype(np.uint8), 0.6,
                0
            )
            overlay[mask_bool] = blended[mask_bool]

        cv2.imwrite(save_path, overlay)

    def predict_from_file(self, image_path):
        image = self.load_image_bgr(image_path)

        damage_type, damage_conf, class_probs, margin = self.predict_damage_type(image)
        mask = self.predict_damage_mask(image, threshold=0.6)

        raw_area_pixels = self.calculate_damage_area_pixels(mask)
        area_class, refined_area_pixels = self.area_to_class(raw_area_pixels)

        result = self.calculate_depreciation(
            damage_type=damage_type,
            area_class=area_class,
            car_price=20000000
        )

        filename = os.path.basename(image_path)
        save_path = os.path.join(OUTPUT_MASK_DIR, f"overlay_{filename}")
        self.save_mask_overlay(image, mask, save_path)

        probs = []
        for cls_name in DAMAGE_CLASSES:
            probs.append({
                "class_name": cls_name,
                "confidence": class_probs.get(cls_name, 0.0)
            })

        return {
            "success": True,
            "predicted_damage_type": damage_type,
            "predicted_damage_type_kor": CLASS_NAME_KOR.get(damage_type, damage_type),
            "predicted_confidence": damage_conf,
            "top1_top2_margin": margin,
            "raw_area_pixels": raw_area_pixels,
            "refined_area_pixels": refined_area_pixels,
            "area_class": area_class,
            "base_rate": result["base_rate"],
            "area_multiplier": result["area_mult"],
            "depreciation_rate": result["depreciation_rate"],
            "depreciation_amount": result["depreciation_amount"],
            "output_mask_path": save_path,
            "probs": probs
        }