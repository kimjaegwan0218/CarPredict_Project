import os
import shutil
import tempfile

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.predictor import CarPricePredictor
from app.damage_predictor import DamagePredictor
from app.schemas import PredictResponse, DamagePredictResponse


app = FastAPI(title="Used Car Price API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 나중에 React 주소로 제한 가능
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

predictor = CarPricePredictor()
damage_predictor = DamagePredictor()


@app.get("/")
def root():
    return {"message": "Used Car Price API is running"}


@app.post("/predict", response_model=PredictResponse)
async def predict(
    image: UploadFile = File(...),
    year: int = Form(...),
    mileage: int = Form(...)
):
    if year < 1990:
        raise HTTPException(status_code=400, detail="연식이 너무 오래되었습니다.")
    if mileage < 0:
        raise HTTPException(status_code=400, detail="주행거리는 음수가 될 수 없습니다.")

    suffix = os.path.splitext(image.filename)[1] or ".jpg"

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(image.file, tmp)
            temp_path = tmp.name

        result = predictor.predict_from_file(
            image_path=temp_path,
            year=year,
            mileage=mileage
        )
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)



@app.post("/predict-damage", response_model=DamagePredictResponse)
async def predict_damage(
    image: UploadFile = File(...)
):
    suffix = os.path.splitext(image.filename)[1] or ".jpg"

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(image.file, tmp)
            temp_path = tmp.name

        result = damage_predictor.predict_from_file(temp_path)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)