import React, { useState, createContext } from "react";

// ============================================
// 1. CHARACTER CONTEXT - Quản lý tất cả nhân vật
// ============================================
export const CharacterContext = createContext<any>(null);

export const CharacterProvider = ({ children }: { children: React.ReactNode }) => {
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

  const removeCharacter = (id: any) => {
    setCharacters((prev) => prev.filter((char) => char.id !== id));
  };

  const updateCharacter = (id: any, updates: any) => {
    setCharacters((prev) =>
      prev.map((char) => (char.id === id ? { ...char, ...updates } : char)),
    );
  };

  const toggleControlMode = (id: any) => {
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
