'use client';

import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useI18n, supportedLocales } from '../i18n-provider';

const { Option } = Select;

// 语言显示名称映射
const localeNames: Record<string, string> = {
  zh: '简体中文',
  en: 'English',
  ja: '日本語',
};


export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  
  const handleLocaleChange = (value: string) => {
    setLocale(value);
  };
  
  return (
    <Select
      value={locale}
      onChange={handleLocaleChange}
      style={{ width: 100 }}
      dropdownStyle={{ zIndex: 2000 }}
      prefixCls="language-selector"
      bordered={false}
      suffixIcon={<GlobalOutlined style={{ fontSize: '16px' }} />}
    >
      {supportedLocales.map((localeCode) => (
        <Option key={localeCode} value={localeCode}>
          {localeNames[localeCode]}
        </Option>
      ))}
    </Select>
  );
} 