import { FunctionalComponent, h } from '@stencil/core';

interface InputFieldProps {
  name?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'url';
  placeholder?: string;
  label?: string;
  value?: any;
  required?: boolean;
  error?: string;
  className?: string;
  onInputChange?: (name: string, value: any) => void;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
}

export const InputField: FunctionalComponent<InputFieldProps> = ({
                                                                   name,
                                                                   type = 'text',
                                                                   placeholder,
                                                                   label,
                                                                   value,
                                                                   required,
                                                                   error,
                                                                   validation,
                                                                   onInputChange,
                                                                 }) => {
  return (
    <div class={{
      'c-public-form-input': true,
      '--error': Boolean(error),
    }}>
      <label class="pub-form-input__wrapper">
        <span class="pub-form-input__label">
          {label ?? ''}
          {required ? '*' : ''}
        </span>
        <span class="pub-form-input__field">
            <input
              name={name}
              type={type}
              placeholder={placeholder}
              min={validation?.min}
              max={validation?.max}
              minLength={validation?.minLength}
              maxLength={validation?.maxLength}
              pattern={validation?.pattern}
              onInput={(e) => typeof onInputChange === 'function' ? onInputChange(name, (e.target as HTMLInputElement).value) : null}
              value={value}
              required={required}
            />
        </span>
        {error && <span class="pub-form-input__error" innerHTML={error}></span>}
      </label>
    </div>
  );
};
