"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { MicrophoneButton } from "./microphone-button"
import { SisterStar } from "./sister-star"
import { ChevronLeft, Keyboard } from "lucide-react"

interface AdventureViewProps {
  monster: string
  onComplete: () => void
  onBack: () => void
}

const storyScenes = [
  {
    image: "🎈",
    text: "小明的气球飞走了...",
    question: "如果你是小明，你会怎么说？"
  },
  {
    image: "🍦",
    text: "冰淇淋掉在地上了...",
    question: "你会对妈妈说什么？"
  },
  {
    image: "🧸",
    text: "你最喜欢的玩具找不到了...",
    question: "你现在的心情是什么？"
  }
]

export function AdventureView({ monster, onComplete, onBack }: AdventureViewProps) {
  const [sceneIndex] = useState(0)
  const [showTextInput, setShowTextInput] = useState(false)
  const [textInput, setTextInput] = useState("")
  
  const scene = storyScenes[sceneIndex]

  const handleRecordingComplete = () => {
    // Simulate processing and move to reward
    setTimeout(() => {
      onComplete()
    }, 500)
  }

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onComplete()
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6">
        <button
          onClick={onBack}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl",
            "bg-secondary hover:bg-secondary/80 transition-colors",
            "focus:outline-none focus:ring-4 focus:ring-primary/50"
          )}
          aria-label="返回主页"
        >
          <ChevronLeft className="w-6 h-6" />
          <span className="text-lg font-semibold">返回</span>
        </button>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent">
          <span className="text-lg font-semibold">
            和{monster}一起冒险
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 p-6 md:p-12">
        {/* Left: Story Card */}
        <div className="w-full max-w-md">
          <div className={cn(
            "bg-white rounded-3xl p-8 shadow-lg",
            "flex flex-col items-center gap-6"
          )}>
            {/* Story Image */}
            <div className="w-full aspect-video rounded-2xl bg-secondary flex items-center justify-center">
              <span className="text-8xl animate-float">{scene.image}</span>
            </div>
            
            {/* Story Text */}
            <p className="text-2xl md:text-3xl font-bold text-foreground text-center leading-relaxed">
              {scene.text}
            </p>
          </div>
        </div>

        {/* Right: Sister Star */}
        <div className="w-full max-w-sm">
          <SisterStar message={scene.question} />
        </div>
      </div>

      {/* Bottom: Microphone Area */}
      <div className="flex flex-col items-center gap-4 pb-12 px-6">
        <MicrophoneButton onRecordingComplete={handleRecordingComplete} />
        
        {/* Backup Text Input Toggle */}
        <button
          onClick={() => setShowTextInput(!showTextInput)}
          className={cn(
            "flex items-center gap-2 text-muted-foreground hover:text-foreground",
            "transition-colors text-sm"
          )}
          aria-label="切换文字输入"
        >
          <Keyboard className="w-4 h-4" />
          <span>使用文字回答</span>
        </button>

        {/* Hidden Text Input */}
        {showTextInput && (
          <div className="w-full max-w-md flex gap-3">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="在这里输入你的答案..."
              className={cn(
                "flex-1 px-6 py-4 text-lg rounded-2xl",
                "bg-white border-2 border-border",
                "focus:outline-none focus:ring-4 focus:ring-primary/50 focus:border-primary"
              )}
              aria-label="文字输入框"
            />
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
              className={cn(
                "px-6 py-4 rounded-2xl font-semibold text-lg",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus:outline-none focus:ring-4 focus:ring-primary/50"
              )}
            >
              发送
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
