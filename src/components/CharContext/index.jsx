import React, { useState, useEffect, createContext, useContext } from "react";
import { Stage, Container, Graphics } from "@pixi/react";
import {
  Slider,
  Card,
  Row,
  Col,
  Typography,
  Switch,
  Select,
  Divider,
  Button,
  Space,
} from "antd";
import {
  DragOutlined,
  ZoomInOutlined,
  SkinOutlined,
  SmileOutlined,
  SoundOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

// ============================================
// 1. CHARACTER CONTEXT - Quản lý tất cả nhân vật
// ============================================
const CharacterContext = createContext();

export const CharacterProvider = ({ children }) => {
  const [characters, setCharacters] = useState([
    {
      id: "char-1",
      position: { x: 400, y: 400 },
      scale: 0.8,
      accessories: { hat: true, glasses: true, bag: true, coat: true },
      mouthState: "smile",
      isTalking: false,
      controlled: false, // Mặc định là uncontrolled (tự do)
    },
  ]);

  const addCharacter = () => {
    const newChar = {
      id: `char-${Date.now()}`,
      position: { x: Math.random() * 600 + 200, y: Math.random() * 600 + 200 },
      scale: 0.8,
      accessories: { hat: true, glasses: false, bag: false, coat: true },
      mouthState: "smile",
      isTalking: false,
      controlled: false,
    };
    setCharacters((prev) => [...prev, newChar]);
  };

  const removeCharacter = (id) => {
    setCharacters((prev) => prev.filter((char) => char.id !== id));
  };

  const updateCharacter = (id, updates) => {
    setCharacters((prev) =>
      prev.map((char) => (char.id === id ? { ...char, ...updates } : char)),
    );
  };

  const toggleControlMode = (id) => {
    setCharacters((prev) =>
      prev.map((char) =>
        char.id === id ? { ...char, controlled: !char.controlled } : char,
      ),
    );
  };

  return (
    <CharacterContext.Provider
      value={{
        characters,
        addCharacter,
        removeCharacter,
        updateCharacter,
        toggleControlMode,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};
