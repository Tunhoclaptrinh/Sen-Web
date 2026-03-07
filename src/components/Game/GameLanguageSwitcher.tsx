import React from 'react';
import { Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '@/store/slices/uiSlice';
import { RootState } from '@/store';
import { GlobalOutlined } from '@ant-design/icons';
import './GameLanguageSwitcher.less';

const { Option } = Select;

interface Props {
  className?: string;
  size?: 'small' | 'middle' | 'large';
}

const GameLanguageSwitcher: React.FC<Props> = ({ className = '', size = 'small' }) => {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const { language } = useSelector((state: RootState) => state.ui);

  const handleLanguageChange = (lang: string) => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
  };

  return (
    <div className={`game-language-switcher ${className}`}>
      <Select
        value={language}
        onChange={handleLanguageChange}
        size={size}
        dropdownClassName="game-lang-dropdown"
        className="game-lang-select"
        suffixIcon={<GlobalOutlined style={{ color: '#c5a065' }} />}
        bordered={false}
      >
        <Option value="vi">
          <div className="lang-option">
            <img src="https://flagcdn.com/w20/vn.png" alt="VN" className="flag-icon" />
            <span className="lang-label">Tiếng Việt</span>
          </div>
        </Option>
        <Option value="en">
          <div className="lang-option">
            <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="flag-icon" />
            <span className="lang-label">English</span>
          </div>
        </Option>
      </Select>
    </div>
  );
};

export default GameLanguageSwitcher;
