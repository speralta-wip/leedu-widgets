import { FunctionalComponent, h } from '@stencil/core';

interface CheckboxFieldProps {
  name?: string;
  label?: string;
  value?: any;
  required?: boolean;
  error?: string;
  className?: string;
  checked?: boolean;
  onInputChange?: (name: string, value: any) => void;
}

export const CheckboxField: FunctionalComponent<CheckboxFieldProps> = ({
                                                                         name,
                                                                         label,
                                                                         value,
                                                                         required,
                                                                         error,
                                                                         checked,
                                                                         onInputChange,
                                                                       }) => {
  const handleCheckbox = (e) => {
    const target = (e.target as HTMLInputElement);
    let value = 0;
    if (target.checked) {
      value = 1;
    }
    typeof onInputChange === 'function' ? onInputChange(name, value) : null;
  };
  return (
    <div class={{
      'c-public-form-checkbox': true,
      '--error': Boolean(error),
    }}>
      <label class="pub-form-check__wrapper">
          <span class="pub-form-check__box">
            <input
              type="checkbox"
              name={name}
              checked={checked ?? false}
              required={required ?? false}
              value={value}
              onInput={handleCheckbox}
            />
            <span class="pub-form-check__box__overlay">
              <svg viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 1L4.75 9L1 5.36364" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round"></path>
              </svg>
            </span>
          </span>
        <span class="pub-form-check__label" innerHTML={label ?? ''}></span>
      </label>
      {Boolean(error) &&
        <span class="pub-form-check__error" innerHTML={error ?? ''}></span>}
    </div>
  );
};
