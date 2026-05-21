import os
import json
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="EmotionLens - 星语小剧场后端", version="1.0.0")

# 允许所有跨域请求（黑客松期间专用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置FastGPT
FASTGPT_API_KEY = "fastgpt-rx6EUmvAYS6bA1RSGHd4KdEB3obZVqF2FR4P1w7MXaxauP9NQ4X4k"
FASTGPT_API_URL = "https://cloud.fastgpt.cn/api/v1/chat/completions"

# 本地兜底场景库（网络不好时自动使用，保证演示不翻车）
LOCAL_SCENES = {
    "生气": {
        "scene": "小红怪正在搭积木，小明把积木推倒了。",
        "question": "小红怪现在心里觉得怎么样呢？",
        "stage": "stage_emotion_naming_angry",
        "is_success": False
    },
    "害怕": {
        "scene": "小黄怪在路上走，突然有辆摩托车开过。",
        "question": "小黄怪现在心里觉得怎么样呢？",
        "stage": "stage_emotion_naming_scared",
        "is_success": False
    },
    "难过": {
        "scene": "小蓝怪的冰淇淋掉在地上了。",
        "question": "小蓝怪现在心里觉得怎么样呢？",
        "stage": "stage_emotion_naming_sad",
        "is_success": False
    },
    "焦虑": {
        "scene": "小绿怪今天要走一条不认识的新路。",
        "question": "小绿怪现在心里觉得怎么样呢？",
        "stage": "stage_emotion_naming_anxious",
        "is_success": False
    }
}

# 定义请求数据格式
class StartAdventureRequest(BaseModel):
    emotion: str
    chatId: str = "autism_child_default_session"

class EvaluateAnswerRequest(BaseModel):
    answer: str
    currentStage: str
    chatId: str = "autism_child_default_session"

# 统一调用FastGPT的函数
def call_fastgpt_workflow(prompt: str, chat_id: str):
    headers = {
        "Authorization": f"Bearer {FASTGPT_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "chatId": chat_id,
        "stream": False,
        "detail": False,
        "messages": [{"role": "user", "content": prompt}]
    }
    try:
        # 超时时间从10秒改成30秒
        response = requests.post(FASTGPT_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        ai_output = response.json()["choices"][0]["message"]["content"]
        
        # 解析AI返回的JSON
        return json.loads(ai_output)
    except Exception as e:
        print(f"FastGPT调用失败，使用本地兜底: {str(e)}")
        # 自动提取情绪词，使用本地场景库
        for emotion in LOCAL_SCENES.keys():
            if emotion in prompt:
                return LOCAL_SCENES[emotion]
        # 默认返回生气场景
        return LOCAL_SCENES["生气"]

# 接口1：开始冒险，生成场景
@app.post("/api/adventure/start")
async def start_adventure(data: StartAdventureRequest):
    prompt = f"孩子选择了【{data.emotion}】怪物。请生成对应的绘本故事场景，并问孩子小怪物的感受。"
    return call_fastgpt_workflow(prompt, data.chatId)

# 接口2：评估孩子的回答（已修复：根据当前场景判断正确情绪）
@app.post("/api/adventure/evaluate")
async def evaluate_answer(data: EvaluateAnswerRequest):
    # 从stage中提取当前情绪
    current_emotion = ""
    if "angry" in data.currentStage:
        current_emotion = "生气"
    elif "scared" in data.currentStage:
        current_emotion = "害怕"
    elif "sad" in data.currentStage:
        current_emotion = "难过"
    elif "anxious" in data.currentStage:
        current_emotion = "焦虑"
    else:
        # 兜底：根据回答内容判断（兼容旧版本）
        if "生气" in data.answer or "愤怒" in data.answer:
            current_emotion = "生气"
        elif "害怕" in data.answer or "恐惧" in data.answer:
            current_emotion = "害怕"
        elif "难过" in data.answer or "伤心" in data.answer or "不开心" in data.answer:
            current_emotion = "难过"
        elif "焦虑" in data.answer or "紧张" in data.answer or "担心" in data.answer:
            current_emotion = "焦虑"

    # 根据当前情绪判断答案是否正确
    if current_emotion == "生气" and ("生气" in data.answer or "愤怒" in data.answer):
        return {
            "scene": "太棒了！你说对了！小红怪很生气。",
            "question": "小红怪可以怎么说呢？跟着姐姐说：我很生气！",
            "stage": "stage_expression_done",
            "is_success": True
        }
    elif current_emotion == "害怕" and ("害怕" in data.answer or "恐惧" in data.answer):
        return {
            "scene": "太棒了！你说对了！小黄怪很害怕。",
            "question": "小黄怪可以怎么说呢？跟着姐姐说：我很害怕！",
            "stage": "stage_expression_done",
            "is_success": True
        }
    elif current_emotion == "难过" and ("难过" in data.answer or "伤心" in data.answer or "不开心" in data.answer):
        return {
            "scene": "太棒了！你说对了！小蓝怪很难过。",
            "question": "小蓝怪可以怎么说呢？跟着姐姐说：我很难过！",
            "stage": "stage_expression_done",
            "is_success": True
        }
    elif current_emotion == "焦虑" and ("焦虑" in data.answer or "紧张" in data.answer or "担心" in data.answer):
        return {
            "scene": "太棒了！你说对了！小绿怪很紧张。",
            "question": "小绿怪可以怎么说呢？跟着姐姐说：我有点紧张！",
            "stage": "stage_expression_done",
            "is_success": True
        }
    else:
        return {
            "scene": "没关系，再想想看。",
            "question": "它现在心里觉得怎么样呢？",
            "stage": data.currentStage,
            "is_success": False
        }
