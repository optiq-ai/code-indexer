import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonGroup, Tooltip } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // Opcjonalnie zapisz preferencję języka w localStorage
    localStorage.setItem('preferredLanguage', lng);
  };

  return (
    <ButtonGroup size="small" aria-label="language switcher">
      <Tooltip title="Polski">
        <Button 
          variant={i18n.language === 'pl' ? 'contained' : 'outlined'}
          onClick={() => changeLanguage('pl')}
          startIcon={<LanguageIcon />}
        >
          PL
        </Button>
      </Tooltip>
      <Tooltip title="English">
        <Button 
          variant={i18n.language === 'en' ? 'contained' : 'outlined'}
          onClick={() => changeLanguage('en')}
          startIcon={<LanguageIcon />}
        >
          EN
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
};

export default LanguageSwitcher;
