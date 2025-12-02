// src/contexts/GlobalCharacterContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const GlobalCharacterContext = createContext();

export const GlobalCharacterProvider = ({ children }) => {
  // Lấy vị trí từ localStorage hoặc dùng vị trí mặc định (góc phải dưới)
  const [position, setPosition] = useState(() => {
    const savedPos = localStorage.getItem("sen_char_pos");
    return savedPos
      ? JSON.parse(savedPos)
      : { x: window.innerWidth - 150, y: window.innerHeight - 200 };
  });

  const [isVisible, setIsVisible] = useState(true);
  const [isTalking, setIsTalking] = useState(false);

  // Lưu vị trí vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("sen_char_pos", JSON.stringify(position));
  }, [position]);

  const updatePosition = (x, y) => {
    setPosition({ x, y });
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

// Hook để các component khác có thể gọi (ví dụ: muốn Sen nói chuyện khi bấm nút nào đó)
export const useGlobalCharacter = () => {
  return useContext(GlobalCharacterContext);
};
