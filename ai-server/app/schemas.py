from pydantic import BaseModel
from typing import List


class TopCandidate(BaseModel):
    model_name: str
    confidence: float


class PredictResponse(BaseModel):
    success: bool

    predicted_label: str
    predicted_confidence: float

    manufacturer: int
    mapped_name: str

    input_year: int
    input_mileage: int

    raw_price: float
    adjusted_price_manwon: float
    adjusted_price_won: int

    used_yolo_crop: bool
    top5: List[TopCandidate]


class DamageTopProb(BaseModel):
    class_name: str
    confidence: float


class DamagePredictResponse(BaseModel):
    success: bool

    predicted_damage_type: str
    predicted_damage_type_kor: str
    predicted_confidence: float
    top1_top2_margin: float

    raw_area_pixels: int
    refined_area_pixels: int
    area_class: int

    base_rate: float
    area_multiplier: float
    depreciation_rate: float
    depreciation_amount: int

    output_mask_path: str
    probs: List[DamageTopProb]