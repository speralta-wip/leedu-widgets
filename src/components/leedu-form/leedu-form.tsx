import { Component, Prop, State, Event, EventEmitter, h, Watch } from '@stencil/core';
import { schoolYearOptions } from '../../utils/utils';

import { SelectField } from './fragments/SelectField';
import { CheckboxField } from './fragments/CheckboxField';
import { InputField } from './fragments/InputField';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[]; // Per select e radio
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
  };
  defaultValue?: any;
  disabled?: boolean;
  className?: string;
}

export interface FormStyleResource {
  background_color?: string;
  text_color?: string;
  label_color?: string;
  title_color?: string;
  button_color?: string;
  button_text_color?: string;
  checkbox_radio_color?: string;
  field_border_color?: string;
  field_border_radius?: string;
  button_border_radius?: string;
  font_family?: string;
  privacy_text?: string;
  newsletter_text?: string;
  form_title?: string;
  form_intro_text?: string;
  form_footer?: string;
  form_logo?: any;
}

export interface EducationLevelGradesResource {
  data: EducationLevelMap;
}
export type EducationLevelMap = Record<string, EducationLevelBlock>;

export interface EducationLevelBlock {
  label: string;
  classes: Record<string, string>;
}


export interface PublicFormResource {
  id: number;
  name: string;
  title: string;
  events_title: string;
  has_parent_phone: boolean;
  has_birthdate: boolean;
  has_current_school: boolean;
  has_current_grade: boolean;
  has_parent_first_name: boolean;
  has_parent_last_name: boolean;
  has_newsletter_subscription: boolean;
  has_year_of_interest: boolean;
  allow_multiple_events: boolean;
  style?: FormStyleResource;
  schools?: object;
  educationLevelGrades?: EducationLevelGradesResource;
}

export interface FormConfig {
  title?: string;
  form?: PublicFormResource;
}

export interface SelectOption{
  label?:string;
  value?:string
}

@Component({
  tag: 'leedu-form',
  styleUrl: 'leedu-form-style.scss',
  shadow: true,
})
export class LeeduForm {
  @Prop() config: FormConfig;
  @Prop() formUrl: string;
  @Prop() disabled: boolean = false;

  @State() formData: { [key: string]: any } = {};
  @State() errors: { [key: string]: string } = {};
  @State() parsedConfig: FormConfig = {title: ''};

  @State() fields: FormField[] =[];
  @State() schoolYearOptions: SelectOption[] = [];

  @Event() formSubmit: EventEmitter<{ data: any; isValid: boolean }>;
  @Event() formReset: EventEmitter<void>;
  @Event() fieldChange: EventEmitter<{ fieldName: string; value: any; formData: any }>;

  @Watch('formUrl')
  watchConfig() {
    this.parseConfig();
  }

  @Watch('parsedConfig')
  watchParsedConfig(){
    this.updateFields();
    const thisYear = new Date().getFullYear() + 1;
    if (this.parsedConfig?.form?.has_year_of_interest){
      this.schoolYearOptions = schoolYearOptions(thisYear,false);
    }
  }

  componentWillLoad() {
    this.parseConfig();
  }

  private updateFields(){
    const style = this.parsedConfig?.form?.style ?? {};
    this.fields =  [
      {
        id: "first_name",
        type: "text",
        label: "Nome studente",
        required: true,
        validation: {
          minLength: 3,
          maxLength: 20,
          pattern: "^[a-zA-Z0-9_]+$"
        }
      },
      {
        id: "last_name",
        type: "text",
        label: "Cognome studente",
        required: true,
        validation: {
          minLength: 3,
          maxLength: 20,
          pattern: "^[a-zA-Z0-9_]+$"
        }
      },
      {
        id: "birthdate",
        type: "date",
        label: "Data di nascita",
        required: false,
      },
      {
        id: "current_school",
        type: "text",
        label: "Scuola attuale",
        required: false,
        validation: {
          minLength: 3,
          maxLength: 20,
          pattern: "^[a-zA-Z0-9_]+$"
        }
      },
      {
        id: "current_grade",
        type: "select",
        label: "Classe attuale",
        required: false,
      },
      {
        id: "year_of_interest",
        type: "select",
        label: "Scuola attuale",
        required: false,
      },
      {
        id: "email",
        type: "email",
        label: "Email Genitore",
        required: false
      },
      {
        id: "parent_first_name",
        type: "text",
        label: "Nome Genitore",
        required: false,
        validation: {
          minLength: 3,
          maxLength: 20,
          pattern: "^[a-zA-Z0-9_]+$"
        }
      },
      {
        id: "parent_last_name",
        type: "text",
        label: "Cognome Genitore",
        required: false,
        validation: {
          minLength: 3,
          maxLength: 20,
          pattern: "^[a-zA-Z0-9_]+$"
        }
      },
      {
        id: "parent_phone",
        type: "text",
        label: "Telefono Genitore",
        required: false,
        validation: {
          minLength: 3,
          maxLength: 20,
          pattern: "^[a-zA-Z0-9_]+$"
        }
      },
      {
        id: "privacy_acceptance",
        type: "checkbox",
        label: `${style.privacy_text}`,
        defaultValue: false,
        required: true,
      },
      {
        id: "newsletter_subscription",
        type: "checkbox",
        label: `${style.newsletter_text}`,
        defaultValue: false,
      },
    ];
  }

  private parseConfig() {
    if (this.formUrl){
      fetch(`${this.formUrl}/json`)
        .then(resp=> resp.json())
        .then(resp => {
          console.log('RESP', resp);
          this.parsedConfig = resp;
          console.log('RENDER', this.parsedConfig);

        }).catch(err => {
          console.log(err);
          this.parsedConfig = {}
      })
    }
  }

  private handleInputChange = (fieldName: string, value: any) => {
    console.log(fieldName, value);
    this.formData = {
      ...this.formData,
      [fieldName]: value
    };

    this.fieldChange.emit({
      fieldName,
      value,
      formData: this.formData
    });
  }

  private handleSubmit = async(e) => {
    console.log(this.formData);
    e.preventDefault();
    let isValid = true;
    // @ts-ignore
    const data = new FormData(e.currentTarget);
    // @ts-ignore
    const formJSON = Object.fromEntries(data.entries());
    console.log('IS VALID:', isValid, this.errors);
    let response = null;
    let responseJson = null;
    if (this.formUrl && isValid){
      try {
        response = await fetch(this.formUrl, {
          method:"POST",
          body: data,
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
        })
        responseJson = await response?.json();
      } catch (error){
        console.log('There was an error', error);
        this.formSubmit.emit({
          data: error,
          isValid
        });
      }
      if (response?.ok){
        console.log(responseJson);
      }else{
        console.log('status', response, responseJson);
        this.errors = responseJson?.errors ?? {};
      }
    }

    this.formSubmit.emit({
      data: data,
      isValid
    });
  }

  private getFieldObj(fieldId:string): FormField {
    return this.fields.find(f => f.id === fieldId) ?? null;
  }

  private renderField(field: FormField) {
    const commonProps = {
      id: field.id,
      disabled: field.disabled || this.disabled,
      class: `form-field ${field.className || ''}`,
      required: field.required
    };

    const value = this.formData[field.id];
    const hasError = !!this.errors[field.id];

    switch (field.type) {
      case 'textarea':
        return (
          <div class={`field-group ${hasError ? 'has-error' : ''}`}>
            <label htmlFor={field.id}>{field.label}</label>
            <textarea
              {...commonProps}
              placeholder={field.placeholder}
              value={value}
              onInput={(e) => this.handleInputChange(field.id, (e.target as HTMLTextAreaElement).value)}
            />
            {hasError && <span class="error-message">{this.errors[field.id]}</span>}
          </div>
        );

      case 'select':
        return (
          <div class={`field-group ${hasError ? 'has-error' : ''}`}>
            <label htmlFor={field.id}>{field.label}</label>
            <select
              {...commonProps}
              onChange={(e) => this.handleInputChange(field.id, (e.target as HTMLSelectElement).value)}
            >
              <option value="">Seleziona...</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {hasError && <span class="error-message">{this.errors[field.id]}</span>}
          </div>
        );

      case 'checkbox':
        return (
            <div class={{
                'c-public-form-checkbox':true,
                '--error': hasError,
              }}>
              <label class="pub-form-check__wrapper">
                  <span class="pub-form-check__box">
                    <input
                      {...commonProps}
                      type="checkbox"
                      checked={value}
                      required={field?.required ?? false}
                      onChange={(e) => this.handleInputChange(field.id, (e.target as HTMLInputElement).checked)}
                    />
                    <span class="pub-form-check__box__overlay">
                      <svg viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 1L4.75 9L1 5.36364" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                              stroke-linejoin="round"></path>
                      </svg>
                    </span>
                  </span>
                  <span class="pub-form-check__label" innerHTML={field?.label ?? ''}></span>
              </label>
              {hasError && <span class="pub-form-check__error" innerHTML={this.errors[field.id] ?? ''}></span>}
            </div>
        );

      case 'radio':
        return (
          <div class={`field-group radio-group ${hasError ? 'has-error' : ''}`}>
            <fieldset>
              <legend>{field.label}</legend>
              {field.options?.map(option => (
                <label key={option.value} class="radio-label">
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value}
                    checked={value === option.value}
                    disabled={field.disabled || this.disabled}
                    onChange={(e) => this.handleInputChange(field.id, (e.target as HTMLInputElement).value)}
                  />
                  <span class="radio-mark"></span>
                  {option.label}
                </label>
              ))}
            </fieldset>
            {hasError && <span class="error-message">{this.errors[field.id]}</span>}
          </div>
        );

      default:
        return (
          <div class={{
            'c-public-form-input': true,
            '--error': hasError
          }}>
            <label class="pub-form-input__wrapper">
              <span class="pub-form-input__label">
                {field.label ?? ''}
                {Boolean(field?.required) ? '*' : ''}
              </span>
              <span class="pub-form-input__field">
                <input
                  {...commonProps}
                  name={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  min={field.validation?.min}
                  max={field.validation?.max}
                  minLength={field.validation?.minLength}
                  maxLength={field.validation?.maxLength}
                  pattern={field.validation?.pattern}
                  onInput={(e) => this.handleInputChange(field.id, (e.target as HTMLInputElement).value)}
                  value={value}
                />
              </span>
              {hasError && <span class="pub-form-input__error">{this.errors[field.id]}</span>}
            </label>
          </div>
        );
    }
  }

  render() {
    const { title, form } = this.parsedConfig;

    return (
      <div class={`form-container`}>
        {form?.style && (
          <style>
            {
              /* no-delete backtick */
              `
              :host,:root{
                font-size:10px;
              }
              :host{
                  --leedu-form-font-family: ${form.style.font_family};
                  --leedu-form-bg: ${form.style.background_color};
                  --leedu-form-txt-color: ${form.style.text_color};
                  --leedu-form-label-color: ${form.style.label_color};
                  --leedu-form-title-color: ${form.style.title_color};
                  --leedu-form-btn-color: ${form.style.button_color};
                  --leedu-form-btn-text-color: ${form.style.button_text_color};
                  --leedu-form-btn-border-radius: ${form.style.button_border_radius};
                  --leedu-form-check-radio-color: ${form.style.checkbox_radio_color};
                  --leedu-form-field-border-color: ${form.style.field_border_color};
                  --leedu-form-field-border-radius: ${form.style.field_border_radius};
                  
                  --host-font-size: 10px
              }
              ` /* no-delete backtick */
            }
          </style>
        )}

        <form onSubmit={(e) => this.handleSubmit(e)} class="leedu-form c-public-form" method={'POST'}>
          <div class="public-form__wrapper">
            <div class="public-form__title">{title ?? ''}</div>
            <div class="public-form__main-fields">
              <input
                type="hidden"
                name="referrer_url"
                value={document.referrer}
              />
              {/*STUDENT NAME*/}
              <InputField label={'Nome studente'} name={'first_name'} error={this.errors['first_name']?? null} onInputChange={this.handleInputChange} required={true}/>
              {/*STUDENT LAST NAME*/}
              <InputField label={'Cognome studente'} name={'last_name'} error={this.errors['last_name']?? null} onInputChange={this.handleInputChange} required={true}/>
              {/*STUDENT BIRTHDATE */}
              { Boolean(form?.has_birthdate) && (
                <InputField type={'date'} label={'Data di nascita'} name={'birthdate'} error={this.errors['birthdate']?? null} onInputChange={this.handleInputChange}/>
              ) }
              {/*CURRENT SCHOOL */}
              { Boolean(form?.has_current_school) && (
                <InputField label={'Scuola attuale'} name={'current_school'} error={this.errors['current_school']?? null} onInputChange={this.handleInputChange}/>
              ) }
              {/*CURRENT GRADE*/}
              { Boolean(form?.has_current_grade) && (
                <SelectField name={'current_grade'} label={'Classe attuale'}>
                  {Object.entries(
                    form.educationLevelGrades?.data ?? {},
                  ).map(([levelKey, level]) => (
                    <optgroup label={level.label} key={levelKey}>
                      {Object.entries(level.classes).map(
                        ([classKey, classLabel]) => (
                          <option
                            value={classKey}
                            key={classKey}
                          >
                            {classLabel}
                          </option>
                        ),
                      )}
                    </optgroup>
                  ))}
                </SelectField>
              )}
              {/*YEAR OF INTEREST*/}
              { Boolean(form?.has_year_of_interest) && (
                <SelectField name="year_of_interest" label={'Anno di interesse'}>
                  {this.schoolYearOptions.map((year) => (
                    <option value={year.value} key={year.value}>
                      {year.label}
                    </option>
                  ))}
                </SelectField>
              ) }
              {/*PARENT EMAIL*/}
              <InputField type={'email'} label={'Email genitore'} name={'email'} error={this.errors['email']?? null} onInputChange={this.handleInputChange}/>
              {/*PARENT FIRST NAME */}
              { Boolean(form?.has_parent_first_name) && (
                <InputField label={'Nome genitore'} name={'parent_first_name'} error={this.errors['parent_first_name']?? null} onInputChange={this.handleInputChange}/>
              ) }
              {/*PARENT LAST NAME*/}
              { Boolean(form?.has_parent_last_name) && (
                <InputField label={'Cognome genitore'} name={'parent_last_name'} error={this.errors['parent_last_name']?? null} onInputChange={this.handleInputChange}/>
              ) }
              {/*PARENT PHONE */}
              { Boolean(form?.has_parent_phone) && (
                <InputField type={'tel'} label={'Telefono genitore'} name={'parent_phone'} error={this.errors['parent_phone']?? null} onInputChange={this.handleInputChange}/>
              ) }
            </div>

            { Boolean(form?.schools) && (
              <div class="public-form__events">
                <div class="public-form__events__title">
                  {form?.events_title ?? '' }
                </div>
                { Object.values(form.schools ?? {})
                  .filter((school) => school?.events)
                  .map((school) =>(
                    <div class="public-form__checkbox-group" key={school.id}>
                      <div class="public-form__checkbox-group__title">
                        {school?.name ?? ''}
                      </div>
                      {/*{ school.events.length > 0 ? (
                        school.events.map(event => (
                          this.renderField({
                            id: `event_ids_${school.id}`,
                            label:
                          })
                        ))
                      ) : ()}*/}
                    </div>
                  ))}
                {this.errors.event_ids && (
                  <div class={'public-form__events__error'}>
                    {this.errors.event_ids}
                  </div>
                )}
              </div>
            )}

            <div class="public-form__acceptances">
              {/*PRIVACY*/}
              <CheckboxField name={'privacy_acceptance'} label={form?.style?.privacy_text ?? ''} value={1} required={true} onInputChange={this.handleInputChange}/>
              {/*MARKETING*/}
              { Boolean(form?.has_newsletter_subscription) && <CheckboxField name={'newsletter_subscription'} label={form?.style?.newsletter_text ?? ''} value={1} onInputChange={this.handleInputChange}/> }
            </div>
          </div>

          <button
            type="submit"
            class="public-form__submit"
            disabled={this.disabled}
          >
            {'Invia'}
          </button>
        </form>
      </div>
    );
  }
}