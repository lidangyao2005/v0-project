"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mic } from "lucide-react";

// 情绪选项
const emotions = [
  { name: "生气", color: "bg-red-100 text-red-800", emoji: "😠" },
  { name: "害怕", color: "bg-yellow-100 text-yellow-800", emoji: "😨" },
  { name: "难过", color: "bg-blue-100 text-blue-800", emoji: "😢" },
  { name: "焦虑", color: "bg-green-100 text-green-800", emoji: "😰" },
];

export default function Home() {
  const [gameState, setGameState] = useState<"select" | "playing" | "success">("select");
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [currentScene, setCurrentScene] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [currentStage, setCurrentStage] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // 开始冒险
  const startAdventure = async (emotion: string) => {
    setSelectedEmotion(emotion);
    setLoading(true);
    try {
      const response = await fetch("/api/adventure/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emotion: emotion }),
      });
      const result = await response.json();
      setCurrentScene(result.scene);
      setCurrentQuestion(result.question);
      setCurrentStage(result.stage);
      setGameState("playing");
    } catch (error) {
      console.error("生成场景失败:", error);
      // 本地兜底
      const localScenes: Record<string, any> = {
        "生气": { scene: "小红怪正在搭积木，小明把积木推倒了。", question: "小红怪现在心里觉得怎么样呢？", stage: "stage_emotion_naming_angry" },
        "害怕": { scene: "小黄怪在路上走，突然有辆摩托车开过。", question: "小黄怪现在心里觉得怎么样呢？", stage: "stage_emotion_naming_scared" },
        "难过": { scene: "小蓝怪的冰淇淋掉在地上了。", question: "小蓝怪现在心里觉得怎么样呢？", stage: "stage_emotion_naming_sad" },
        "焦虑": { scene: "小绿怪今天要走一条不认识的新路。", question: "小绿怪现在心里觉得怎么样呢？", stage: "stage_emotion_naming_anxious" },
      };
      const scene = localScenes[emotion] || localScenes["生气"];
      setCurrentScene(scene.scene);
      setCurrentQuestion(scene.question);
      setCurrentStage(scene.stage);
      setGameState("playing");
    } finally {
      setLoading(false);
    }
  };

  // 提交回答
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/adventure/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: userAnswer, currentStage: currentStage }),
      });
      const result = await response.json();
      setCurrentScene(result.scene);
      setCurrentQuestion(result.question);
      setCurrentStage(result.stage);
      setIsSuccess(result.is_success);
      
      if (result.is_success && result.stage === "stage_expression_done") {
        setTimeout(() => {
          setGameState("success");
        }, 2000);
      }
    } catch (error) {
      console.error("评估失败:", error);
      // 本地兜底评估
      let currentEmotion = "";
      if (currentStage.includes("angry")) currentEmotion = "生气";
      else if (currentStage.includes("scared")) currentEmotion = "害怕";
      else if (currentStage.includes("sad")) currentEmotion = "难过";
      else if (currentStage.includes("anxious")) currentEmotion = "焦虑";

      let success = false;
      if (currentEmotion === "生气" && (userAnswer.includes("生气") || userAnswer.includes("愤怒"))) {
        setCurrentScene("太棒了！你说对了！小红怪很生气。");
        setCurrentQuestion("小红怪可以怎么说呢？跟着姐姐说：我很生气！");
        setCurrentStage("stage_expression_done");
        success = true;
      } else if (currentEmotion === "害怕" && (userAnswer.includes("害怕") || userAnswer.includes("恐惧"))) {
        setCurrentScene("太棒了！你说对了！小黄怪很害怕。");
        setCurrentQuestion("小黄怪可以怎么说呢？跟着姐姐说：我很害怕！");
        setCurrentStage("stage_expression_done");
        success = true;
      } else if (currentEmotion === "难过" && (userAnswer.includes("难过") || userAnswer.includes("伤心") || userAnswer.includes("不开心"))) {
        setCurrentScene("太棒了！你说对了！小蓝怪很难过。");
        setCurrentQuestion("小蓝怪可以怎么说呢？跟着姐姐说：我很难过！");
        setCurrentStage("stage_expression_done");
        success = true;
      } else if (currentEmotion === "焦虑" && (userAnswer.includes("焦虑") || userAnswer.includes("紧张") || userAnswer.includes("担心"))) {
        setCurrentScene("太棒了！你说对了！小绿怪很紧张。");
        setCurrentQuestion("小绿怪可以怎么说呢？跟着姐姐说：我有点紧张！");
        setCurrentStage("stage_expression_done");
        success = true;
      } else {
        setCurrentScene("没关系，再想想看。");
        setCurrentQuestion("它现在心里觉得怎么样呢？");
        success = false;
      }
      
      setIsSuccess(success);
      if (success) {
        setTimeout(() => {
          setGameState("success");
        }, 2000);
      }
    } finally {
      setLoading(false);
      setUserAnswer("");
    }
  };

  // 下一关
  const nextLevel = () => {
    setGameState("select");
    setCurrentScene("");
    setCurrentQuestion("");
    setCurrentStage("");
    setIsSuccess(false);
  };

  // 返回首页
  const goBack = () => {
    setGameState("select");
    setCurrentScene("");
    setCurrentQuestion("");
    setCurrentStage("");
    setIsSuccess(false);
  };

  return (
    <main className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4">
      {/* 选择情绪页面 */}
      {gameState === "select" && (
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold text-amber-800 mb-8">星语小剧场</h1>
          <p className="text-xl text-amber-700 mb-12">选择一个情绪小怪物，开始你的冒险吧！</p>
          
          <div className="grid grid-cols-2 gap-6">
            {emotions.map((emotion) => (
              <Card
                key={emotion.name}
                className={`p-8 cursor-pointer transition-all hover:scale-105 ${emotion.color}`}
                onClick={() => startAdventure(emotion.name)}
              >
                <div className="text-6xl mb-4">{emotion.emoji}</div>
                <h2 className="text-2xl font-bold">{emotion.name}</h2>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 游戏进行页面 */}
      {gameState === "playing" && (
        <div className="max-w-3xl w-full">
          <Button variant="ghost" className="mb-6" onClick={goBack}>
            ← 返回
          </Button>

          <div className="flex flex-col items-center">
            <Card className="p-8 mb-8 w-full max-w-md text-center">
              <div className="text-6xl mb-4">🎈</div>
              <p className="text-2xl font-medium text-gray-800">{currentScene}</p>
            </Card>

            <div className="mb-8 text-center">
              <div className="inline-block bg-white rounded-full px-6 py-3 shadow-md mb-2">
                <p className="text-xl text-gray-800">{currentQuestion}</p>
              </div>
              <p className="text-sm text-gray-500">星星姐姐</p>
            </div>

            <div className="w-full max-w-md">
              <Button
                className="w-full h-20 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xl mb-4"
                disabled={loading}
              >
                <Mic className="mr-2 h-6 w-6" />
                点击话筒说出你的答案
              </Button>
              
              <p className="text-center text-sm text-gray-500 mb-4">
                或使用文字回答
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="输入你的答案"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
                  className="h-12 text-lg"
                  disabled={loading}
                />
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={loading || !userAnswer.trim()}
                  className="h-12 px-6"
                >
                  发送
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 成功页面 */}
      {gameState === "success" && (
        <div className="max-w-md w-full text-center">
          <Card className="p-12">
            <div className="text-6xl mb-6">💎</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">太棒了！</h2>
            <h3 className="text-2xl text-blue-500 mb-6">你成功了！</h3>
            <p className="text-gray-600 mb-8">你表达得真好！继续加油哦～</p>
            <Button
              onClick={nextLevel}
              className="w-full h-12 text-lg bg-green-100 text-green-800 hover:bg-green-200"
            >
              下一关 →
            </Button>
          </Card>
        </div>
      )}

      {/* 右上角标识 */}
      <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-full">
        和红红一起冒险
      </div>
    </main>
  );
}
