import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface GlobalCharacterContextType {
  position: { x: number; y: number };
  updatePosition: (x: number, y: number) => void;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  isTalking: boolean;
  setIsTalking: (talking: boolean) => void;
}

const GlobalCharacterContext = createContext<GlobalCharacterContextType | null>(null);

export const GlobalCharacterProvider = ({ children }: { children: ReactNode }) => {
  // Load position from localStorage or default
  const savedPos = localStorage.getItem("sen_position");
  const initialPos = savedPos
    ? JSON.parse(savedPos)
    : { x: window.innerWidth - 150, y: window.innerHeight - 200 };

  const [position, setPosition] = useState(initialPos);
  const [isVisible, setIsVisible] = useState(true);
  const [isTalking, setIsTalking] = useState(false);

  const updatePosition = (x: number, y: number) => {
    setPosition({ x, y });
    localStorage.setItem("sen_position", JSON.stringify({ x, y }));
  };

  return (
    <GlobalCharacterContext.Provider
      value={{
        position,
        updatePosition,
        isVisible,
        setIsVisible,
        isTalking,
        setIsTalking,
      }}
    >
      {children}
    </GlobalCharacterContext.Provider>
  );
};

export const useGlobalCharacter = () => useContext(GlobalCharacterContext);
