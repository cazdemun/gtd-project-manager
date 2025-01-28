import React, { useState } from 'react';
import { format, parse, isValid as _isValid, isAfter, addDays, subDays, isSameDay, isBefore } from 'date-fns';
import { AiFillCaretLeft, AiFillCaretRight, AiOutlineClear, AiOutlineReload } from 'react-icons/ai';
import { DATE_FORMAT } from '@/utils/dates';

type LinealDatePickerProps = {
  initialValue?: number | undefined;
  mode?: 'filter' | 'input';
  onValueChange?: (value: number | undefined) => void;
};

// TODO: isValid should be a configurable rule, not a hardcoded one
const isValid = (date: Date, mode: 'filter' | 'input' = 'filter'): boolean => {
  if (mode === 'input') {
    return _isValid(date);
  }
  const minDate = new Date(1990, 0, 1); // January 1, 1990
  return _isValid(date) && !isAfter(date, new Date()) && !isBefore(date, minDate);
};

const LinealDatePicker: React.FC<LinealDatePickerProps> = ({ onValueChange, initialValue = undefined, mode = 'filter' }) => {
  const [isInputValid, setIsInputValid] = useState(true);
  const [inputValue, setInputValue] = useState(initialValue ? format(initialValue, DATE_FORMAT) : '');
  const [numericValue, setNumericValue] = useState<number | undefined>(initialValue);

  const _updateNumericValue = (value: number | undefined) => {
    setNumericValue(value);
    onValueChange?.(value);
  }

  const _updateValues = (value: number) => {
    _updateNumericValue(value);
    setInputValue(format(value, DATE_FORMAT));
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (e.target.value === '') {
      _updateNumericValue(undefined);
      setIsInputValid(true);
      return
    }

    const parsedDate = parse(e.target.value, DATE_FORMAT, new Date());
    setIsInputValid(isValid(parsedDate, mode));
    if (isValid(parsedDate, mode) && parsedDate.getTime() !== numericValue) {
      _updateNumericValue(parsedDate.getTime());
    }
  };

  const handleInputBlur = () => {
    const parsedDate = parse(inputValue, DATE_FORMAT, new Date());
    if (isValid(parsedDate, mode)) {
      _updateNumericValue(parsedDate.getTime());
    } else {
      const cachedInputValue = numericValue ? format(numericValue, DATE_FORMAT) : '';
      setInputValue(cachedInputValue);
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
    _updateNumericValue(undefined);
    setInputValue('');
  }

  const isToday = numericValue && mode === 'filter' ? isSameDay(numericValue, new Date()) : false;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        style={{ width: '100px', border: isInputValid ? '1px solid black' : '1px solid red', padding: '5px', borderRadius: '4px', textAlign: 'right' }}
      />
      <button type='button' className="icon-button" onClick={handleGoPrev}><AiFillCaretLeft /></button>
      <button type='button' className="icon-button" onClick={handleGoNext} disabled={isToday}><AiFillCaretRight /></button>
      <button type='button' className="icon-button" onClick={handleResetToToday}><AiOutlineReload /></button>
      <button type='button' className="icon-button" onClick={handleClear}><AiOutlineClear /></button>
    </div>
  );
};

export default LinealDatePicker;