import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '@/store/slices/uiSlice';
import { RootState } from '@/store';
import './styles.less';

interface LanguageSwitcherProps {
  showText?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ showText = true }) => {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const { language } = useSelector((state: RootState) => state.ui);

  const handleLanguageChange = (lang: string) => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
  };

  return (
    <div className="language-switcher">
      <span
        className={`lang-item ${language === 'vi' ? 'active' : ''}`}
        onClick={() => handleLanguageChange('vi')}
      >
        <img src="https://flagcdn.com/w20/vn.png" alt="VN" className="flag-icon" />
        {showText && <span className="lang-text">VN</span>}
      </span>
      <span className="lang-divider">|</span>
      <span
        className={`lang-item ${language === 'en' ? 'active' : ''}`}
        onClick={() => handleLanguageChange('en')}
      >
        <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="flag-icon" />
        {showText && <span className="lang-text">EN</span>}
      </span>
    </div>
  );
};

export default LanguageSwitcher;
