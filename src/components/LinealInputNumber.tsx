import React, { useState, useEffect } from 'react';
import { AiFillCaretDown, AiFillCaretUp, AiOutlineClear, AiOutlineReload } from 'react-icons/ai';


type LinealInputNumberProps = {
  initialValue?: number | undefined;
  onValueChange?: (value: number | undefined) => void;
};

const isValid = (input: number): boolean => {
  return !isNaN(input) && Number.isInteger(input) && input >= 0;
};

const LinealInputNumber: React.FC<LinealInputNumberProps> = ({ onValueChange, initialValue = undefined }) => {
  const [isInputValid, setIsInputValid] = useState(true);
  const [inputValue, setInputValue] = useState(initialValue ? initialValue.toString() : '');
  const [numericValue, setNumericValue] = useState<number | undefined>(initialValue);

  useEffect(() => {
    onValueChange?.(numericValue);
  }, [numericValue, onValueChange]);

  const _updateValues = (value: number) => {
    setNumericValue(value);
    setInputValue(value.toString());
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (e.target.value === '') {
      setNumericValue(undefined);
      setIsInputValid(true);
      return
    }

    const parsedInput = Number(e.target.value);
    setIsInputValid(isValid(parsedInput));
    if (isValid(parsedInput) && parsedInput !== numericValue) {
      setNumericValue(parsedInput);
    }
  };

  const handleInputBlur = () => {
    const parsedInput = Number(inputValue);
    if (isValid(parsedInput)) {
      setNumericValue(parsedInput);
    } else {
      const oldInputValue = numericValue ? numericValue.toString() : '';
      setInputValue(oldInputValue);
      setIsInputValid(true);
    }
  };

  const handleGoDown = () => {
    if (numericValue === undefined) {
      handleResetToZero();
      return;
    }
    const newNumericValue = numericValue - 1;
    _updateValues(newNumericValue);
  };

  const handleGoUp = () => {
    if (numericValue === undefined) {
      handleResetToZero();
      return;
    }
    const newNumericValue = numericValue + 1;
    _updateValues(newNumericValue);
  };

  const handleResetToZero = () => {
    const today = 0;
    _updateValues(today);
  };

  const handleClear = () => {
    setNumericValue(undefined);
    setInputValue('');
  }

  const isZero = numericValue ? numericValue < 1 : false;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        style={{ width: '100px', border: isInputValid ? '1px solid black' : '1px solid red', padding: '5px', borderRadius: '4px', textAlign: 'right' }}
      />
      <button type='button' className="icon-button" onClick={handleGoUp}><AiFillCaretUp /></button>
      <button type='button' className="icon-button" onClick={handleGoDown} disabled={isZero}><AiFillCaretDown /></button>
      <button type='button' className="icon-button" onClick={handleResetToZero}><AiOutlineReload /></button>
      <button type='button' className="icon-button" onClick={handleClear}><AiOutlineClear /></button>
    </div>
  );
};

export default LinealInputNumber;