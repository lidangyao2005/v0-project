import httpx
import os
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

API_KEY = os.getenv("FASTGPT_API_KEY")
API_URL = os.getenv("FASTGPT_URL")
MODEL = os.getenv("FASTGPT_MODEL")

print("=== FastGPT 配置信息 ===")
print("API Key:", API_KEY[:10] + "..." if API_KEY else "未读取到")
print("API URL:", API_URL if API_URL else "未读取到")
print("Model:", MODEL if MODEL else "未读取到")

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

payload = {
    "model": MODEL,
    "messages": [{"role": "user", "content": "帮我写一个6岁孩子的难过情绪小故事，3句话以内。"}]
}

print("\n=== 正在调用 FastGPT ===")
try:
    response = httpx.post(API_URL, headers=headers, json=payload, timeout=30.0)
    print("状态码:", response.status_code)
    print("响应内容:", response.text)
except Exception as e:
    print("调用失败:", str(e))