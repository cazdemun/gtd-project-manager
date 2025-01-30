import React, { useEffect, useState } from 'react';
import { format, parse, isValid, addDays, subDays, isToday } from 'date-fns';
import { AiFillCaretLeft, AiFillCaretRight, AiOutlineClear, AiOutlineReload } from 'react-icons/ai';
import { DATE_FORMAT, isAfterByDay } from '@/utils/dates';

type LinealDatePickerProps = {
  initialValue?: number | undefined;
  onValueChange?: (value: number | undefined) => void;
  rules?: ((date: number) => boolean)[];
  disableGoNextDay?: (date: number | undefined) => boolean;
  disableGoPrevDay?: (date: number | undefined) => boolean;
  disableGoToday?: (date: number | undefined) => boolean;
};

export function doneFilterRule(date: number): boolean {
  // const minDate = new Date(1990, 0, 1); // January 1, 1990
  // return !isAfterByDay(date, new Date()) && !isBefore(date, minDate);
  return !isAfterByDay(date, new Date());
}

export function doneFilterDisableNextDay(date: number | undefined): boolean {
  if (!date) return true;
  return isToday(date) || isAfterByDay(date, new Date());
}

const LinealDatePicker: React.FC<LinealDatePickerProps> = ({ rules: _rules = [], onValueChange, initialValue = undefined, disableGoNextDay, disableGoPrevDay, disableGoToday }) => {
  const rules = [isValid, ..._rules];
  const [isInputValid, setIsInputValid] = useState(true);
  const [inputValue, setInputValue] = useState(initialValue ? format(initialValue, DATE_FORMAT) : '');
  const [numericValue, setNumericValue] = useState<number | undefined>(initialValue);
  const prevDaydisabled = disableGoPrevDay?.(numericValue) ?? false;
  const nextDaydisabled = disableGoNextDay?.(numericValue) ?? false;
  const todayDisabled = disableGoToday?.(numericValue) ?? false;

  const _updateNumericValue = (value: number | undefined) => {
    setNumericValue(value);
    onValueChange?.(value);
  }

  const _updateValues = (value: number) => {
    _updateNumericValue(value);
    setInputValue(format(value, DATE_FORMAT));
  }

  const _setDateToToday = (offset: number = 0) => {
    const today = new Date().setHours(0, 0, 0, 0);
    _updateValues(addDays(today, offset).getTime());
  }

  useEffect(() => {
    if (!initialValue) return;
    setNumericValue(initialValue);
    setInputValue(format(initialValue, DATE_FORMAT));
  }, [initialValue]);

  /**
   * Text must always change, howev
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (e.target.value === '') {
      _updateNumericValue(undefined);
      setIsInputValid(true);
      return
    }

    const parsedDate = parse(e.target.value, DATE_FORMAT, new Date());
    const isValidDate = rules?.every((rule) => rule(parsedDate.getTime())) ?? true;
    if (!isValidDate) setIsInputValid(false);
    if (isValidDate && parsedDate.getTime() !== numericValue) {
      _updateNumericValue(parsedDate.getTime());
      setIsInputValid(true);
    }
  };

  const handleInputBlur = () => {
    const parsedDate = parse(inputValue, DATE_FORMAT, new Date());
    const isValidDate = rules?.every((rule) => rule(parsedDate.getTime())) ?? true;
    if (isValidDate) {
      _updateNumericValue(parsedDate.getTime());
    } else {
      const cachedInputValue = numericValue ? format(numericValue, DATE_FORMAT) : '';
      setInputValue(cachedInputValue);
      setIsInputValid(true);
    }
  };

  const goNextDay = () => {
    if (!numericValue) {
      _setDateToToday(1);
      return;
    }
    const newDate = addDays(numericValue, 1);
    _updateValues(newDate.getTime());
  };

  const goPrevDay = () => {
    if (!numericValue) {
      _setDateToToday(-1);
      return;
    }
    const newDate = subDays(numericValue, 1);
    _updateValues(newDate.getTime());
  };

  const goToday = () => {
    _setDateToToday();
  };

  const clearDate = () => {
    _updateNumericValue(undefined);
    setInputValue('');
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        style={{ width: '100px', border: isInputValid ? '1px solid black' : '1px solid red', padding: '5px', borderRadius: '4px', textAlign: 'right' }}
      />
      <button type='button' className="icon-button" onClick={goPrevDay} disabled={prevDaydisabled}><AiFillCaretLeft /></button>
      <button type='button' className="icon-button" onClick={goNextDay} disabled={nextDaydisabled}><AiFillCaretRight /></button>
      <button type='button' className="icon-button" onClick={goToday} disabled={todayDisabled}><AiOutlineReload /></button>
      <button type='button' className="icon-button" onClick={clearDate}><AiOutlineClear /></button>
    </div>
  );
};

export default LinealDatePicker;