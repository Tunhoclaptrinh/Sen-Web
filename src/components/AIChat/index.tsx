import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Spin, Modal, List, Avatar, Tabs, Popover, Tooltip, message, Image } from "antd";
import { 
    SendOutlined, 
    CloseOutlined, 
    SoundOutlined, 
    AudioOutlined,
    PauseCircleOutlined,
    SettingOutlined,
    PlusOutlined,
    UserOutlined,
    EditOutlined,
    DeleteOutlined,
    BulbOutlined,
    InfoCircleOutlined,
    PaperClipOutlined,
    ReadOutlined,
    QuestionCircleOutlined,
    CheckOutlined,
    LoadingOutlined
} from "@ant-design/icons";
import { Stage, Sprite } from "@pixi/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  sendChatMessage,
  fetchChatHistory,
  fetchCharacters,
  addUserMessage,
  setCurrentCharacter,
  clearChatHistory,
  transcribeAudio,
  updateSenSettings,
} from "@/store/slices/aiSlice";
import type { ChatMessage } from "@/types";
import SenChibi from "@/components/SenChibi";
import type { SenChibiGesture, SenChibiMouthState, SenChibiEyeState } from "@/components/SenChibi/types";
import SenCharacter from "@/components/SenCharacter";
import { SenCustomizationSettings } from "@/components/common";
import "./styles.less";

interface AIChatProps {
  open: boolean;
  onClose: () => void;
  position?: 'fixed' | 'absolute';
}

// Parse markdown links and convert to clickable HTML
const renderMessageWithLinks = (text: string) => {
  // Regex to match markdown links: [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  while ((match = markdownLinkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add the clickable link
    const linkText = match[1];
    const url = match[2];
    parts.push(
      <a 
        key={match.index}
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ color: '#1890ff', textDecoration: 'underline' }}
      >
        {linkText}
      </a>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
};

const AIChat: React.FC<AIChatProps> = ({ open, onClose, position = 'fixed' }) => {
  const dispatch = useAppDispatch();
  const { chatHistory, currentCharacter, characters, chatLoading, isMuted, senSettings, activeContext } = useAppSelector((state) => state.ai);
  const { user } = useAppSelector((state) => state.auth);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [shouldHideCoat, setShouldHideCoat] = useState(false); // 👔 Control coat visibility
  const [isListening, setIsListening] = useState(false);
  const emotionResetTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 🎭 Timeout để reset emotion
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranscriptionSuccess, setIsTranscriptionSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dataHistoryRef = useRef<number[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start/Stop Microphone monitoring & recording
  useEffect(() => {
    if (isListening) {
      const startMonitoring = async () => {
        try {
          // Request permissions and stream
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          
          // --- ANALYZER SETUP (Existing Visualization Logic) ---
          const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          audioContextRef.current = audioContext;
          
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.5;
          source.connect(analyser);
          analyserRef.current = analyser;

          // --- MEDIA RECORDER SETUP (New Recording Logic) ---
          // Use a MIME type that is widely supported. 'audio/webm' is standard for Chrome/Firefox.
          const mimeType = 'audio/webm'; 
          const mediaRecorder = new MediaRecorder(stream, { mimeType });
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
              }
          };

          mediaRecorder.start();

          // Initialize Visualization Loop
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const BAR_WIDTH = 3;
          const BAR_GAP = 3;
          const STEP = BAR_WIDTH + BAR_GAP;
          let lastDrawTime = 0;
          const FRAME_INTERVAL = 32;

          const draw = (timestamp: number) => {
            if (!canvasRef.current || !analyserRef.current) return;
            
            if (timestamp - lastDrawTime < FRAME_INTERVAL) {
                animationFrameRef.current = requestAnimationFrame(draw);
                return;
            }
            lastDrawTime = timestamp;
            
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
                 canvas.width = rect.width * dpr;
                 canvas.height = rect.height * dpr;
                 ctx.scale(dpr, dpr);
            }
            
            analyserRef.current.getByteTimeDomainData(dataArray);
            
            let sumSquares = 0;
            for (let i = 0; i < dataArray.length; i++) {
                const deviation = dataArray[i] - 128;
                sumSquares += deviation * deviation;
            }
            
            const rms = Math.sqrt(sumSquares / dataArray.length);
            
            const maxBars = Math.floor(rect.width / STEP) + 2;
            const history = dataHistoryRef.current;
            history.push(rms);
            if (history.length > maxBars) {
                while (history.length > maxBars) {
                     history.shift();
                }
            }
            
            ctx.clearRect(0, 0, rect.width, rect.height);
            const centerY = rect.height / 2;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            
            for (let i = 0; i < history.length; i++) {
                const vol = history[i];
                const isSilence = vol < 2; 
                const x = rect.width - ((history.length - 1 - i) * STEP) - 10;
                
                if (x + BAR_WIDTH < 0) continue;
                
                if (isSilence) {
                    ctx.beginPath();
                    ctx.arc(x + BAR_WIDTH/2, centerY, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    const GAIN = 0.06; 
                    const softScale = Math.tanh(vol * GAIN);
                    const maxHeight = rect.height; 
                    const height = Math.max(4, softScale * maxHeight);
                    const y = centerY - height / 2;
                    
                    ctx.beginPath();
                    ctx.roundRect(x, y, BAR_WIDTH, height, 2);
                    ctx.fill();
                }
            }

            animationFrameRef.current = requestAnimationFrame(draw);
          };
          
          requestAnimationFrame(draw);
        } catch (err) {
          console.error('Error accessing microphone:', err);
          message.error("Không thể truy cập microphone");
          setIsListening(false);
        }
      };
      
      startMonitoring();
    } else {
      // Cleanup
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      
      // Stop MediaRecorder if running and NOT triggered by confirm (which handles its own stop)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) audioContextRef.current.close();
      
      dataHistoryRef.current = [];
    }
  }, [isListening]);

  // Handle Cancel Recording
  const handleCancelRecording = () => {
     if (mediaRecorderRef.current) {
         mediaRecorderRef.current.onstop = null; // Prevent any processing
         mediaRecorderRef.current.stop();
     }
     setIsListening(false);
  };

  // Handle Confirm Recording (Transcribe -> Input)
  const handleConfirmRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          // Define what happens when recording stops
          mediaRecorderRef.current.onstop = async () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              
              // Instead of closing immediately, we switch to transcribing mode
              setIsTranscribing(true);
              
              try {
                  // Dispatch Transcription Action
                  const resultAction = await dispatch(transcribeAudio(audioBlob));
                  
                  if (transcribeAudio.fulfilled.match(resultAction)) {
                      const text = resultAction.payload;
                      if (text) {
                          // Append to existing input or replace? usually voice dictation appends or replaces if empty.
                          // Let's append with a space if there is existing text.
                          setInput((prev) => prev ? `${prev} ${text}` : text);
                          
                          // Show success state
                          setIsTranscribing(false);
                          setIsTranscriptionSuccess(true);
                          
                          // Wait 1.5s before closing
                          setTimeout(() => {
                              setIsTranscriptionSuccess(false);
                              setIsListening(false);
                          }, 1500);
                      } else {
                        message.warning("Không nghe rõ lời bạn nói.");
                        setIsTranscribing(false);
                        setIsListening(false);
                      }
                  } else {
                      message.error("Lỗi nhận diện giọng nói: " + (resultAction.payload || "Unknown error"));
                      setIsTranscribing(false);
                      setIsListening(false);
                  }
              } catch (err) {
                  console.error("Transcription error:", err);
                  message.error("Có lỗi xảy ra khi xử lý âm thanh.");
                  setIsTranscribing(false);
                  setIsListening(false);
              }
          };
          
          mediaRecorderRef.current.stop();
      } else {
          setIsListening(false);
      }
  };
  const [audioPlaying, setAudioPlaying] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pendingSwitchCharacter, setPendingSwitchCharacter] = useState<typeof currentCharacter>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [streamingText, setStreamingText] = useState("");
  const [dimensions, setDimensions] = useState({
    width: 1000, // Default fallback
    height: 800,
  });

  const topMargin = (dimensions.height * 0.2) + (35 * (senSettings?.scale || 0.2));

  // Fetch history when opening
  useEffect(() => {
    if (open && user && currentCharacter) {
      dispatch(fetchChatHistory({ 
        characterId: currentCharacter.id, 
        limit: 50,
        levelId: activeContext?.levelId 
      }));
    }
  }, [open, user, currentCharacter, activeContext?.levelId, dispatch]);

  // Set default character if not present or force Sen on open
  useEffect(() => {
    if (open) {
      // Helper to set Sen
      const setSen = (chars: typeof characters) => {
          const sen = chars.find((c) => c.name === 'Sen' || c.isDefault);
          if (sen) {
             dispatch(setCurrentCharacter(sen));
          } else if (chars.length > 0 && !currentCharacter) {
             dispatch(setCurrentCharacter(chars[0]));
          }
      };

      if (characters.length === 0) {
        dispatch(fetchCharacters()).then((action) => {
          const chars = action.payload;
          if (chars && Array.isArray(chars)) {
            setSen(chars);
          }
        });
      } else {
         // If characters already loaded, force Sen
         setSen(characters);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dispatch]);

  // Audio & Sync Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const targetTextRef = useRef<string>("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const charPerMsRef = useRef<number>(0.1); // Default: 1 char per 10ms
  const pausedDurationRef = useRef<number>(0);
  const activePauseEndTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);
  const lastPunctuationIndexRef = useRef<number>(-1);

  const PUNCTUATION_PAUSES: Record<string, number> = {
    '.': 600, '!': 600, '?': 600,
    ',': 300, ';': 300, ':': 300
  };

  const [streamingRecommendation, setStreamingRecommendation] = useState<{title: string, url: string} | undefined>(undefined);
  
  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    // Validate type
    if (!file.type.startsWith('image/')) {
        message.error('Vui lòng chỉ chọn file ảnh!');
        return;
    }

    // Validate size (5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
        message.error('Ảnh phải nhỏ hơn 5MB!');
        return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        processFile(file);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const items = event.clipboardData?.items;
    if (items) {
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    processFile(file);
                    event.preventDefault(); // Prevent pasting the image filename/metadata as text
                }
                break; // Only take the first image
            }
        }
    }
  };

  const removeFile = () => {
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  // Clean up object URL
  useEffect(() => {
    return () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
    };
  }, [previewUrl]);

  // Cleanup emotion reset timeout on unmount
  useEffect(() => {
    return () => {
        if (emotionResetTimeoutRef.current) {
            clearTimeout(emotionResetTimeoutRef.current);
        }
    };
  }, []);

  const renderAttachmentMenu = () => {
    const isSen = currentCharacter?.name?.toLowerCase().includes('sen');
    
    return (
        <div className="attachment-menu">
            <Tooltip 
                title="Hỗ trợ ảnh (JPG, PNG) tối đa 5MB" 
                placement="right" 
                overlayStyle={{ zIndex: 20005 }}
            >
                <div className="menu-item" onClick={() => {
                    fileInputRef.current?.click();
                }}>
                    <PaperClipOutlined />
                    <span>Thêm ảnh, tệp đính kèm</span>
                </div>
            </Tooltip>
            
            <div className="menu-divider" />
            
            <Tooltip 
                title="Sen, đóng vai trò là giáo viên, giúp bạn hiểu kiến thức từng bước, giải thích rõ ràng, có ví dụ minh họa và điều chỉnh theo trình độ của bạn." 
                placement="right"
                overlayStyle={{ maxWidth: 300, zIndex: 20005 }}
            >
                <div className={`menu-item ${!isSen ? 'disabled' : ''}`} onClick={() => {
                    if (isSen) {
                        setInput("Kích hoạt chế độ: Học có hướng dẫn");
                        // handleSend(); // Optional: Auto send
                    }
                }}>
                    <ReadOutlined />
                    <span>Học có hướng dẫn</span>
                    {!isSen && <span className="lock-icon">🔒</span>}
                </div>
            </Tooltip>

            <Tooltip 
                title="Sen, đóng vai trò là người kiểm tra, đưa ra câu hỏi phù hợp để đánh giá mức độ hiểu bài và đưa nhận xét ngắn gọn sau mỗi câu trả lời." 
                placement="right"
                overlayStyle={{ maxWidth: 300, zIndex: 20005 }}
            >
                <div className={`menu-item ${!isSen ? 'disabled' : ''}`} onClick={() => {
                    if (isSen) {
                       setInput("Kích hoạt chế độ: Câu đố kiểm tra");
                       // handleSend();
                    }
                }}>
                    <QuestionCircleOutlined />
                    <span>Câu đố</span>
                    {!isSen && <span className="lock-icon">🔒</span>}
                </div>
            </Tooltip>
        </div>
    );
  };

  useEffect(() => {
    if (!open || !containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    updateSize();

    return () => observer.disconnect();
  }, [open]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [chatHistory, streamingText, open]);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!open) {
      stopAll();
    }
    return () => stopAll();
  }, [open]);

  const stopAll = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setAudioPlaying(null);
    startTimeRef.current = 0;
    setStreamingRecommendation(undefined);
  };

  const playMessageAudio = (audioBase64: string, messageId: number) => {
    if (audioPlaying === messageId && audioRef.current) {
        audioRef.current.pause();
        return;
    }
    stopAll();
    if (!audioBase64) return;

    // 🎭 Restore emotion từ message khi replay
    const message = chatHistory.find(m => m.id === messageId);
    if (message?.emotion) {
      dispatch(updateSenSettings({
        gesture: (message.emotion.gesture || 'normal') as 'normal' | 'hello' | 'point' | 'like' | 'flag' | 'hand_back',
        mouthState: (message.emotion.mouthState || 'smile') as 'smile' | 'smile_2' | 'sad' | 'open' | 'close' | 'half' | 'tongue' | 'angry',
        eyeState: (message.emotion.eyeState || 'normal') as 'normal' | 'blink' | 'close' | 'half' | 'like' | 'sleep',
      }));
    }

    const audioSrc = audioBase64.startsWith("data:") ? audioBase64 : `data:audio/mp3;base64,${audioBase64}`;
    const audio = new Audio(audioSrc);
    audio.muted = isMuted;
    audioRef.current = audio;

    audio.onplay = () => {
        // ✅ Mấp máy môi khi phát lại audio
        setIsSpeaking(true);
        setShouldHideCoat(true); // 👔 Ẩn áo khi bắt đầu nói
        setAudioPlaying(messageId);
    };
    audio.onended = () => {
        setIsSpeaking(false);
        setShouldHideCoat(false); // 👔 Hiện áo lại khi dừng
        setAudioPlaying(null);
        
        // 🎭 Reset về emotion mặc định sau khi phát xong
        dispatch(updateSenSettings({
          gesture: 'normal',
          mouthState: 'smile',
          eyeState: 'normal',
        }));
    };
    audio.onpause = () => {
        setIsSpeaking(false);
        setShouldHideCoat(false); // 👔 Hiện áo lại khi pause
        setAudioPlaying(null);
        
        // 🎭 Reset về emotion mặc định khi pause
        dispatch(updateSenSettings({
          gesture: 'normal',
          mouthState: 'smile',
          eyeState: 'normal',
        }));
    };
    audio.onerror = () => {
        setIsSpeaking(false);
        setShouldHideCoat(false); // 👔 Hiện áo lại khi lỗi
        setAudioPlaying(null);
    };

    audio.play().catch(console.error);
  };

  const startStreaming = () => {
    if (intervalRef.current) return;
    
    if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
    }

    intervalRef.current = setInterval(() => {
      const targetText = targetTextRef.current;
      if (!targetText) {
          stopAll();
          return;
      }

      const now = Date.now();

      // Handle active pause (punctuation)
      if (activePauseEndTimeRef.current > 0) {
          if (now < activePauseEndTimeRef.current) {
              setIsSpeaking(false); // Stop mouth movement during pause
              return;
          }
          // Pause finished - continue streaming
          pausedDurationRef.current += (activePauseEndTimeRef.current - pauseStartTimeRef.current);
          activePauseEndTimeRef.current = 0;
          pauseStartTimeRef.current = 0;
      }

      const speed = charPerMsRef.current > 0 ? charPerMsRef.current : 0.1;
      const effectiveElapsed = Math.max(0, now - startTimeRef.current - pausedDurationRef.current);
      let charsToShow = Math.floor(effectiveElapsed * speed);
      
      // Check for next punctuation pause
      const currentLen = streamingText.length;
      if (charsToShow > currentLen && charsToShow <= targetText.length) {
          for (let i = currentLen; i < charsToShow; i++) {
              const char = targetText[i];
              if (PUNCTUATION_PAUSES[char] && i > lastPunctuationIndexRef.current) {
                  charsToShow = i + 1;
                  activePauseEndTimeRef.current = now + PUNCTUATION_PAUSES[char];
                  pauseStartTimeRef.current = now;
                  lastPunctuationIndexRef.current = i;
                  setIsSpeaking(false); // ✅ Dừng miệng khi pause - giữ smile tĩnh
                  break;
              }
          }
      }

      if (charsToShow < targetText.length) {
        setStreamingText(targetText.substring(0, charsToShow));
        // Only set isSpeaking if we actually have real text content (not placeholder "..." or loading)
        const isRealContent = charsToShow > 0 && targetText !== '...' && targetText.trim().length > 0;
        if (activePauseEndTimeRef.current === 0 && isRealContent) {
            setIsSpeaking(true); // ENABLED - mouth opens only when real text renders
            setShouldHideCoat(true); // 👔 Ẩn áo khi bắt đầu nói
        } else {
            setIsSpeaking(false); // Ensure mouth closed when no real content yet
        }
      } else {
        // Complete
        setStreamingText(targetText);
        setIsSpeaking(false); // Stop mouth animation
        setShouldHideCoat(false); // 👔 Hiện áo lại khi streaming xong
        
        // 🎭 Reset emotion về default sau 6 giây
        if (emotionResetTimeoutRef.current) {
            clearTimeout(emotionResetTimeoutRef.current);
        }
        emotionResetTimeoutRef.current = setTimeout(() => {
            dispatch(updateSenSettings({
                gesture: 'normal' as const,
                mouthState: 'smile' as const,
                eyeState: 'normal' as const,
            }));
        }, 6000); // 6 seconds
        
        // Clear local streaming text but DO NOT stop audio (stopAll)
        // Let audio finish naturally
        setTimeout(() => {
            setStreamingText("");
             if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }, 500);
      }
    }, 16); 
  };

  const streamText = (fullText: string, audioBase64?: string, recommendation?: {title: string, url: string}) => {
    targetTextRef.current = fullText;
    setStreamingText("");
    setStreamingRecommendation(recommendation);
    startTimeRef.current = Date.now();
    pausedDurationRef.current = 0;
    activePauseEndTimeRef.current = 0;
    lastPunctuationIndexRef.current = -1;
    charPerMsRef.current = 0.05; // Fallback

    if (audioBase64) {
        const audioSrc = audioBase64.startsWith("data:") ? audioBase64 : `data:audio/mp3;base64,${audioBase64}`;
        const audio = new Audio(audioSrc);
        audio.muted = isMuted; // Set initial mute state
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
            const durationMs = audio.duration * 1000;
            if (durationMs > 0 && fullText.length > 0) {
                let totalPauseTime = 0;
                for (const char of fullText) {
                    if (PUNCTUATION_PAUSES[char]) totalPauseTime += PUNCTUATION_PAUSES[char];
                }
                const activeDuration = durationMs - totalPauseTime;
                const safeDuration = activeDuration > (durationMs * 0.2) ? activeDuration : durationMs * 0.8; 
                charPerMsRef.current = fullText.length / (safeDuration * 0.95);
            }
            audio.play();
            startStreaming();
        };

        audio.onended = () => {
             audioRef.current = null;
             setShouldHideCoat(false); // 👔 Hiện áo lại khi audio kết thúc
        };

        audio.onerror = () => startStreaming();
    } else {
    startStreaming();
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || loading || !currentCharacter) return;

    if (selectedFile) {
        // Implement upload logic here later
    }

    if (!input.trim() && !selectedFile) return; // If only file was sent, and input is empty, we might want to return here if file upload is handled separately.
                                                // However, based on the structure, it seems we proceed if either input or file exists.
                                                // The previous guard `((!input.trim() && !selectedFile) || loading || !currentCharacter)` already handles the "nothing to send" case.
                                                // This line might be redundant or intended for a different flow. I will keep it as per instruction.

    setLoading(true);
    setStreamingText("");

    const userText = input.trim();
    setInput("");
    // setLoading(true); // This was already set above, removing redundancy based on instruction's placement.

    // Add user message to Redux
    dispatch(addUserMessage(userText));

    try {
      const response = await dispatch(sendChatMessage({
        characterId: currentCharacter.id,
        message: userText,
        context: activeContext || undefined,
      })).unwrap();

      // Extract from ChatResponse - message is a ChatMessage object
      const messageObj = response.message;
      const fullResponse = messageObj?.content || "Xin lỗi, mình không thể trả lời câu hỏi này.";
      const audioBase64 = messageObj?.audioBase64;
      const recommendation = messageObj?.recommendation; // Extract recommendation
      
      // 🎭 Extract emotion metadata from message object (mapped from service)
      const emotionData = messageObj?.emotion;
      
      if (emotionData) {
        // Cancel any pending emotion reset
        if (emotionResetTimeoutRef.current) {
            clearTimeout(emotionResetTimeoutRef.current);
            emotionResetTimeoutRef.current = null;
        }
        // Update Sen settings with AI-suggested emotion
        dispatch(updateSenSettings({
          gesture: (emotionData.gesture || 'normal') as 'normal' | 'hello' | 'point' | 'like' | 'flag' | 'hand_back',
          mouthState: (emotionData.mouthState || 'smile') as 'smile' | 'smile_2' | 'sad' | 'open' | 'close' | 'half' | 'tongue' | 'angry',
          eyeState: (emotionData.eyeState || 'normal') as 'normal' | 'blink' | 'close' | 'half' | 'like' | 'sleep',
        }));
      } else {
        console.warn("⚠️ No emotion data found in message object");
      }
      
      setLoading(false);
      streamText(fullResponse, audioBase64, recommendation);
    } catch (error) {
      console.error("AI Chat Error Detail:", error);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          key="ai-chat-overlay"
          ref={containerRef}
          className={`ai-chat-overlay ${position === 'fixed' ? 'is-fixed' : 'is-absolute'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="ai-chat-container"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="controls-group">
                <Button 
                    className="control-button delete-button"
                    icon={<DeleteOutlined />} 
                    onClick={() => {
                        if (currentCharacter) {
                            dispatch(clearChatHistory({ 
                                characterId: currentCharacter.id, 
                                levelId: activeContext?.levelId 
                            }));
                        }
                    }}
                    type="text"
                    disabled={chatHistory.length === 0}
                />
                <Button 
                    className="control-button setting-button"
                    icon={<SettingOutlined />} 
                    onClick={() => setIsSettingsOpen(true)}
                    type="text"
                />
                <Button 
                    className="control-button close-button"
                    icon={<CloseOutlined />} 
                    onClick={onClose}
                    type="text"
                />
            </div>

            <div className="chat-scene">
              <div className="scene-background" />
              
              <div className="character-layer">
                <Stage
                  width={dimensions.width * 0.4}
                  height={dimensions.height}
                  options={{ backgroundAlpha: 0, antialias: true }}
                >
                  {(currentCharacter?.isDefault || currentCharacter?.name?.toLowerCase().includes('sen')) ? (
                    senSettings.isChibi ? (
                        <SenChibi
                            x={dimensions.width * 0.2}
                            y={topMargin} 
                            scale={senSettings.scale * 1.45} 
                            origin="head"
                            isTalking={isSpeaking}
                            gesture={senSettings.gesture as SenChibiGesture}
                            eyeState={senSettings.eyeState as SenChibiEyeState}
                            mouthState={senSettings.mouthState as SenChibiMouthState}
                            showHat={senSettings.accessories.hat}
                            showGlasses={senSettings.accessories.glasses}
                            showCoat={senSettings.accessories.coat && !shouldHideCoat}
                            isBlinking={senSettings.isBlinking}
                        />
                    ) : (
                        <SenCharacter
                            x={dimensions.width * 0.2}
                            y={topMargin}
                            scale={senSettings.scale * 1.45}
                            origin="head"
                            isTalking={isSpeaking}
                            eyeState={senSettings.eyeState as SenChibiEyeState}
                            mouthState={senSettings.mouthState as SenChibiMouthState}
                            showHat={senSettings.accessories.hat}
                            showGlasses={senSettings.accessories.glasses}
                            showCoat={senSettings.accessories.coat && !shouldHideCoat}
                            showBag={senSettings.accessories.bag}
                            isBlinking={senSettings.isBlinking}
                            draggable={false}
                            onPositionChange={() => { }}
                            onClick={() => { }}
                        />
                    )
                  ) : (
                    <Sprite
                        image={currentCharacter?.avatar || "https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sen"}
                        x={dimensions.width * 0.2}
                        y={topMargin}
                        anchor={0.5}
                        scale={0.8} 
                    />
                  )}
                </Stage>
              </div>

              <div className="messages-overlay">
                <div className="messages-container">
                  {chatHistory.length === 0 && !loading && !streamingText && (
                    <div className="message assistant">
                      <div className="message-content">
                        <div className="message-bubble">
                          Xin chào! Mình là trợ lý Sen. Mình sẽ hướng dẫn bạn khám phá di sản văn hóa Việt Nam! 🌸
                        </div>
                      </div>
                    </div>
                  )}
                  {chatHistory
                    .slice()
                    .map((message: ChatMessage, index: number) => {
                      // Tránh hiển thị trùng lặp khi đang stream tin nhắn mới nhất
                      const isLastAssistantMessage = 
                        index === chatHistory.length - 1 && 
                        message.role === "assistant" && 
                        streamingText;
                        
                      if (isLastAssistantMessage) return null;

                      return (
                        <div key={message.id ?? `msg-${index}`} className={`message ${message.role}`}>
                          <div className="message-content">
                            <div className="message-bubble">
                              <div className="message-text">{renderMessageWithLinks(message.content)}</div>
                              <div className="message-footer">
                                <span className="timestamp">
                                  {new Date(message.timestamp).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                                {message.role === "assistant" && message.audioBase64 && (
                                  <Button
                                    className="audio-replay-btn"
                                    icon={audioPlaying === message.id ? <PauseCircleOutlined /> : <SoundOutlined />}
                                    size="small"
                                    onClick={() => playMessageAudio(message.audioBase64!, message.id)}
                                  />
                                )}
                              </div>

                              {message.role === 'assistant' && (message.recommendation?.url || message.context?.recommendation?.url) && (
                                <div style={{ marginTop: 8 }}>
                                    <Button 
                                        type="primary" 
                                        ghost 
                                        size="small"
                                        href={(message.recommendation || message.context?.recommendation)?.url}
                                        target="_blank"
                                        icon={<InfoCircleOutlined />}
                                    >
                                        {(message.recommendation || message.context?.recommendation)?.title}
                                    </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {streamingText && (
                    <div className="message assistant">
                      <div className="message-content">
                        <div className="message-bubble">
                          <div className="message-text">
                            {renderMessageWithLinks(streamingText)}
                            <span className="cursor">|</span>
                          </div>
                          {streamingRecommendation && (
                            <div style={{ marginTop: 8 }}>
                                <Button 
                                    type="primary" 
                                    ghost 
                                    size="small"
                                    href={streamingRecommendation.url}
                                    target="_blank"
                                    icon={<InfoCircleOutlined />}
                                >
                                    {streamingRecommendation.title}
                                </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {loading && !streamingText && (
                    <div className="message assistant">
                      <div className="message-content">
                        <div className="message-bubble">
                          <Spin size="small" />
                        </div>
                      </div>
                    </div>
                  )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

              {/* Suggestions Overlay */}
              <div className="suggestions-overlay">
                <div className="suggestions-container">
                    {position === 'absolute' && activeContext?.levelId && (
                        <div className="suggestion-chip" onClick={() => { setInput("Gợi ý giúp mình với"); handleSend(); }}>
                            <BulbOutlined /> Gợi ý bài học
                        </div>
                    )}
                    {(activeContext?.artifactId || activeContext?.heritageSiteId) && (
                        <div className="suggestion-chip" onClick={() => { setInput("Bạn hãy giải thích thêm về nội dung này"); handleSend(); }}>
                            <InfoCircleOutlined /> Giải thích thêm
                        </div>
                    )}
                </div>
              </div>
            </div>

            <div className="input-container" style={{ pointerEvents: 'auto' }}>
              <div className="styled-input-wrapper">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                  {isListening ? (
                    <div className="listening-input-wrapper">
                        {isTranscribing ? (
                            <div className="transcribing-state" style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '100%', 
                                gap: '10px',
                                color: 'white'
                            }}>
                                <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: 'white' }} spin />} />
                                <span style={{ fontFamily: 'Cinzel', fontSize: '16px' }}>Đang nhận diện...</span>
                            </div>
                        ) : isTranscriptionSuccess ? (
                            <div className="transcribing-state" style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '100%', 
                                gap: '10px',
                                color: '#52c41a' // Success Green
                            }}>
                                <CheckOutlined style={{ fontSize: 24 }} />
                                <span style={{ fontFamily: 'Cinzel', fontSize: '16px' }}>Đã nhận diện</span>
                            </div>
                        ) : (
                            <>
                                <Button 
                                    type="text" 
                                    icon={<PlusOutlined />} 
                                    className="input-prefix-btn"
                                    style={{ color: 'white', opacity: 0.5, cursor: 'default' }}
                                />
                                <div className="listening-dots-container">
                                    <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
                                </div>
                                <div className="listening-actions">
                                    <div className="control-btn cancel-btn" onClick={handleCancelRecording}>
                                        <CloseOutlined />
                                    </div>
                                    <div className="control-btn confirm-btn" onClick={handleConfirmRecording}>
                                        <CheckOutlined />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                  ) : (
                    <>
                      {previewUrl && (
                        <div className="file-preview-container">
                            <div className="preview-image-wrapper">
                                <Image 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className="preview-image" 
                                    width={80}
                                    height={80}
                                    style={{ objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                                    preview={{ zIndex: 20010 }}
                                />
                                <div className="remove-file-btn" onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile();
                                }}>
                                    <CloseOutlined />
                                </div>
                            </div>
                        </div>
                      )}

                      <Input
                        autoFocus
                        placeholder={user ? "Hỏi về di sản văn hóa Việt Nam..." : "Vui lòng đăng nhập để trò chuyện"}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onPressEnter={handleSend}
                        onPaste={handlePaste}
                        disabled={loading || chatLoading || !user}
                        style={{ fontSize: '18px' }}
                        prefix={
                            <Tooltip title="Thêm tệp đính kèm" placement="top" overlayStyle={{ zIndex: 20005 }}>
                                <Popover 
                                    content={renderAttachmentMenu()} 
                                    trigger="click" 
                                    placement="topLeft"
                                    overlayClassName="attachment-popover"
                                    arrow={false}
                                    overlayStyle={{ zIndex: 20000 }}
                                >
                                    <Button 
                                        type="text" 
                                        icon={<PlusOutlined />} 
                                        className="input-prefix-btn"
                                        style={{ color: 'white', opacity: 0.7 }}
                                    />
                                </Popover>
                            </Tooltip>
                        }
                        suffix={
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Button
                                type="text"
                                icon={<AudioOutlined style={{ fontSize: '22px' }} />}
                                className="input-suffix-btn"
                                style={{ color: 'white', opacity: user ? 1 : 0.5 }}
                                onClick={() => user && setIsListening(true)}
                                disabled={!user}
                            />
                            
                            {(input.trim() || selectedFile) ? (
                                <Button
                                    type="text"
                                    icon={<SendOutlined />}
                                    onClick={handleSend}
                                    disabled={loading || chatLoading || (!input.trim() && !selectedFile)}
                                    className="input-suffix-btn send-btn"
                                    style={{ color: "#d24040" }} // Sen Red
                                />
                            ) : (
                                <div className="wave-icon-wrapper">
                                    <div className="waveform-icon">
                                        <div className="bar"></div>
                                        <div className="bar"></div>
                                        <div className="bar"></div>
                                        <div className="bar"></div>
                                    </div>
                                </div>
                            )}
                          </div>
                        }
                      />
                    </>
                  )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Modal
        key="settings-modal"
        title="Cài đặt AI"
        open={isSettingsOpen}
        onCancel={() => setIsSettingsOpen(false)}
        footer={null}
        width={600}
        zIndex={10000}
        className="character-settings-modal"
      >
        <Tabs
            defaultActiveKey="select"
            items={[
                {
                    key: 'select',
                    label: (
                        <span>
                            <UserOutlined style={{ marginRight: '8px' }} />
                            Nhân vật
                        </span>
                    ),
                    children: (
                        <List
                            itemLayout="horizontal"
                            dataSource={characters}
                            renderItem={(character) => (
                                <List.Item
                                    className={`character-item ${currentCharacter?.id === character.id ? 'active' : ''}`}
                                    onClick={() => {
                                        // Skip nếu đang chọn nhân vật này
                                        if (currentCharacter?.id === character.id) return;
                                        
                                        // Hiện modal xác nhận chuyển nhân vật
                                        setPendingSwitchCharacter(character);
                                    }}
                                    style={{ cursor: 'pointer', padding: '12px', borderRadius: '8px' }}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={character.avatar} size="large" />}
                                        title={character.name}
                                        description={character.description}
                                    />
                                    {currentCharacter?.id === character.id && (
                                        <div className="active-badge">Đang chọn</div>
                                    )}
                                </List.Item>
                            )}
                        />
                    )
                },
                ...(currentCharacter?.name?.toLowerCase().includes('sen') ? [{
                    key: 'customize',
                    label: (
                        <span>
                            <EditOutlined style={{ marginRight: '8px' }} />
                            Tùy chỉnh SEN
                        </span>
                    ),
                    children: (
                        <div style={{ padding: '0 12px 12px 12px', maxHeight: '60vh', overflowY: 'auto' as const }}>
                            <SenCustomizationSettings compact />
                        </div>
                    )
                }] : [])
            ]}
        />
      </Modal>

      {/* Modal xác nhận chuyển nhân vật */}
      <Modal
        key="character-switch-modal"
        title="Đổi nhân vật trò chuyện"
        open={!!pendingSwitchCharacter}
        onOk={() => {
          if (pendingSwitchCharacter) {
            dispatch(setCurrentCharacter(pendingSwitchCharacter));
            setIsSettingsOpen(false);
          }
          setPendingSwitchCharacter(null);
        }}
        onCancel={() => setPendingSwitchCharacter(null)}
        okText="Đồng ý"
        cancelText="Hủy"
        zIndex={10001}
      >
        <p>
          Vì tính cách của mỗi nhân vật là khác nhau, chúng tôi đã thiết kế mỗi nhân vật 
          sẽ có một đoạn chat riêng.
        </p>
        <p>
          Nếu đổi sang <strong>{pendingSwitchCharacter?.name}</strong>, cuộc trò chuyện hiện 
          tại với <strong>{currentCharacter?.name}</strong> sẽ được lưu lại.
        </p>
        <p>Bạn có muốn tiếp tục?</p>
      </Modal>
    </AnimatePresence>
  );
};

export default AIChat;
