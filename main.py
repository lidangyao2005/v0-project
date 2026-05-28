from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

# 本地加载.env，线上读平台环境变量
if os.path.exists(".env"):
    load_dotenv(override=True)

app = FastAPI(
    title="EmotionLens 情绪识别后端",
    description="为自闭症儿童情绪识别项目提供场景生成接口",
    version="1.0"
)

# 全开跨域，局域网/前端正常访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 读取密钥配置
FASTGPT_API_KEY = os.getenv("FASTGPT_API_KEY")
FASTGPT_URL = os.getenv("FASTGPT_URL")
FASTGPT_MODEL = os.getenv("FASTGPT_MODEL")

class EmotionSceneRequest(BaseModel):
    emotion: str
    age: int = 6

def call_fastgpt(prompt: str):
    if not FASTGPT_API_KEY or not FASTGPT_URL or not FASTGPT_MODEL:
        raise HTTPException(status_code=500, detail="FastGPT 密钥配置缺失")

    headers = {
        "Authorization": f"Bearer {FASTGPT_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": FASTGPT_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.7
    }

    try:
        response = requests.post(FASTGPT_URL, headers=headers, json=payload, timeout=120.0)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        print("调用报错：", str(e))
        raise HTTPException(status_code=500, detail=f"AI 接口调用失败")

# 健康检测
@app.get("/")
async def root():
    return {"status": "success", "message": "后端正常运行"}

@app.get("/health")
async def health():
    return {"status": "ok"}

# 核心生成接口
@app.post("/api/generate_scene")
async def generate_scene(request: EmotionSceneRequest):
    prompt = f"""
你现在是一名儿童情绪引导老师，专为{request.age}岁低龄儿童编写{request.emotion}情绪小故事。
要求：
1. 语言简单直白，短句为主，避免复杂词汇
2. 故事简短，3-5句话讲完，贴近校园、家庭等孩子熟悉的场景
3. 明确表达用户指定的情绪，结尾温和引导孩子正确认识和表达情绪
4. 全程使用标准中文，语气亲切温柔，适合儿童阅读
"""
    story = call_fastgpt(prompt)
    return {"scene": story}

# 启动：监听 0.0.0.0 允许局域网所有设备访问
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))  # 改成 8001 避开之前 10048 端口冲突
    uvicorn.run(app, host="0.0.0.0", port=port)