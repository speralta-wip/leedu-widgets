import { FunctionalComponent, h } from '@stencil/core';

interface SelectFieldProps {
  name?: string;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  placeholder?: string;
}

export const SelectField: FunctionalComponent<SelectFieldProps> = ({
                                                                     name,
                                                                     required,
                                                                     error,
                                                                     className,
                                                                     label = '',
                                                                     placeholder,
                                                                   }, children) => {
  return (
    <div class={{
      'c-public-form-select': true,
      '--error': Boolean(error),
      [className]: Boolean(className),
    }}>
      <label class={'pub-form-input__wrapper'}>
        <span class={'pub-form-input__label'}>{label ?? ''}{Boolean(required) ? '*' : ''}</span>
        <span class="pub-form-input__field">
                <select
                  name={name}
                  required={Boolean(required)}
                  onChange={(ev) => {
                    console.log((ev.currentTarget as HTMLInputElement).value);
                  }}
                >
                  {placeholder && (
                    <option value="" disabled>
                      {placeholder}
                    </option>
                  )}
                  {children}
                </select>
                <span class="icon">
                  <svg id="chevron-down" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round"></path>
                  </svg>
                </span>
              </span>
        {
          Boolean(error) && (
            <span class={'pub-form-input__error'}>
              {error}
            </span>
          )
        }
      </label>
    </div>
  );
};