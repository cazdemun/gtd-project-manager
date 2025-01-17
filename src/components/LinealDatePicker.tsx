import React, { useState, useEffect } from 'react';
import { format, parse, isValid as _isValid, isAfter, addDays, subDays, isSameDay, isBefore } from 'date-fns';
import { AiFillCaretLeft, AiFillCaretRight, AiOutlineClear, AiOutlineReload } from 'react-icons/ai';
import { DATE_FORMAT } from '@/utils/dates';

type LinealDatePickerProps = {
  initialValue?: number | undefined;
  onValueChange?: (value: number | undefined) => void;
};

const isValid = (date: Date): boolean => {
  const minDate = new Date(1990, 0, 1); // January 1, 1990
  return _isValid(date) && !isAfter(date, new Date()) && !isBefore(date, minDate);
};

const LinealDatePicker: React.FC<LinealDatePickerProps> = ({ onValueChange, initialValue = undefined }) => {
  const [isInputValid, setIsInputValid] = useState(true);
  const [inputValue, setInputValue] = useState(initialValue ? format(initialValue, DATE_FORMAT) : '');
  const [numericValue, setNumericValue] = useState<number | undefined>(initialValue);

  useEffect(() => {
    onValueChange?.(numericValue);
  }, [numericValue, onValueChange]);

  const _updateValues = (value: number) => {
    setNumericValue(value);
    setInputValue(format(value, DATE_FORMAT));
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (e.target.value === '') {
      setNumericValue(undefined);
      setIsInputValid(true);
      return
    }

    const parsedDate = parse(e.target.value, DATE_FORMAT, new Date());
    setIsInputValid(isValid(parsedDate));
    if (isValid(parsedDate) && parsedDate.getTime() !== numericValue) {
      setNumericValue(parsedDate.getTime());
    }
  };

  const handleInputBlur = () => {
    const parsedDate = parse(inputValue, DATE_FORMAT, new Date());
    if (isValid(parsedDate)) {
      setNumericValue(parsedDate.getTime());
    } else {
      const oldInputValue = numericValue ? format(numericValue, DATE_FORMAT) : '';
      setInputValue(oldInputValue);
      setIsInputValid(true);
    }
  };

  const handleGoNext = () => {
    if (!numericValue) {
      handleResetToToday();
      return;
    }
    const newDate = addDays(numericValue, 1);
    _updateValues(newDate.getTime());
  };

  const handleGoPrev = () => {
    if (!numericValue) {
      handleResetToToday();
      return;
    }
    const newDate = subDays(numericValue, 1);
    _updateValues(newDate.getTime());
  };

  const handleResetToToday = () => {
    const today = new Date().setHours(0, 0, 0, 0);
    _updateValues(today);
  };

  const handleClear = () => {
    setNumericValue(undefined);
    setInputValue('');
  }

  const isToday = numericValue ? isSameDay(numericValue, new Date()) : false;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        style={{ width: '100px', border: isInputValid ? '1px solid black' : '1px solid red', padding: '5px', borderRadius: '4px', textAlign: 'right' }}
      />
      <button className="icon-button" onClick={handleGoPrev}><AiFillCaretLeft /></button>
      <button className="icon-button" onClick={handleGoNext} disabled={isToday}><AiFillCaretRight /></button>
      <button className="icon-button" onClick={handleResetToToday}><AiOutlineReload /></button>
      <button className="icon-button" onClick={handleClear}><AiOutlineClear /></button>
    </div>
  );
};

export default LinealDatePicker;