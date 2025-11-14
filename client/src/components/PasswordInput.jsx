import { useState } from 'react';
import './PasswordInput.css';

function PasswordInput({ id, name, value, onChange, placeholder, required }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-input-wrapper">
      <input
        type={showPassword ? 'text' : 'password'}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
      <span 
        className="password-toggle"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? '👁️' : '👁️‍🗨️'}
      </span>
    </div>
  );
}

export default PasswordInput;









