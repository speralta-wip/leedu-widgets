import { Component, Prop, State, Event, EventEmitter, h, Watch } from '@stencil/core';
import { schoolYearOptions } from '../../utils/utils';

import { SelectField } from './fragments/SelectField';
import { CheckboxField } from './fragments/CheckboxField';
import { InputField } from './fragments/InputField';


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

export interface HiddenInput{
  name: string;
  value?: string | number;
}

@Component({
  tag: 'leedu-form',
  styleUrl: 'leedu-form-style.scss',
  shadow: true,
})

export class LeeduForm {

  formEl!: HTMLFormElement;

  @Prop() config: FormConfig;
  @Prop() formUrl: string;
  @Prop() disabled: boolean = false;

  @State() formData: { [key: string]: any } = {};
  @State() errors: { [key: string]: string } = {};
  @State() successMessage: string | null = null;
  @State() parsedConfig: FormConfig = {title: ''};

  @State() schoolYearOptions: SelectOption[] = [];
  @State() utmInputs: HiddenInput[] = [];

  @Event() formSubmit: EventEmitter<{ data: any; isValid: boolean }>;
  @Event() formReset: EventEmitter<void>;
  @Event() fieldChange: EventEmitter<{ fieldName: string; value: any; formData: any }>;

  @Watch('formUrl')
  watchConfig() {
    this.parseConfig();
  }

  @Watch('parsedConfig')
  watchParsedConfig(){
    const thisYear = new Date().getFullYear() + 1;
    if (this.parsedConfig?.form?.has_year_of_interest){
      this.schoolYearOptions = schoolYearOptions(thisYear,false);
    }
  }

  componentWillLoad() {
    this.parseConfig();
    this.loadUtmInputs();
  }

  private parseConfig() {
    this.parsedConfig = this.config ?? {};
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

  private loadUtmInputs() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = new URLSearchParams();
    let inputsData =[];

    for (const [key, value] of urlParams) {
      if (key.toLowerCase().startsWith('utm_')) {
        utmParams.append(key, value);
        inputsData.push({
          name: key,
          value,
        })
      }
    }
    this.utmInputs = inputsData;
  }

  private handleInputChange = (fieldName: string, value: any) => {
    console.log(fieldName, value);
    //this.formData actually just to test but could be useful in a future
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
    this.errors = {};
    // @ts-ignore
    const data = new FormData(this.formEl);
    // @ts-ignore
    const formJSON = Object.fromEntries(data.entries());
    console.log('IS VALID:', this.errors);
    let response = null;
    let responseJson = null;
    if (this.formUrl){
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
          isValid:false,
        });
      }
      if (response?.ok){
        console.log(responseJson);
        this.successMessage = responseJson?.success ?? '';
        setTimeout(()=>{
          this.successMessage = null;
          this.formEl.reset();
        },4000)
      }else{
        console.log('status', response, responseJson);
        this.errors = responseJson?.errors ?? {};
      }
    }

    this.formSubmit.emit({
      data: data,
      isValid: true,
    });
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

        <form onSubmit={(e) => this.handleSubmit(e)} class="leedu-form c-public-form" method={'POST'} ref={(el) => this.formEl = el as HTMLFormElement}>
          <div class="public-form__wrapper">
            <div class="public-form__title">{title ?? ''}</div>
            <div class="public-form__main-fields">
              <input
                type="hidden"
                name="referrer_url"
                value={document.referrer}
              />
              {/*UTM INPUTS*/}
              {this.utmInputs.length > 0 && this.utmInputs.map(input => (
                <input type="hidden" name={input.name} value={input.value} />
              ))}
              {/*STUDENT NAME*/}
              <InputField label={'Nome studente'} name={'first_name'} error={this.errors['first_name'] ?? null}
                          onInputChange={this.handleInputChange} required={true} />
              {/*STUDENT LAST NAME*/}
              <InputField label={'Cognome studente'} name={'last_name'} error={this.errors['last_name'] ?? null}
                          onInputChange={this.handleInputChange} required={true} />
              {/*STUDENT BIRTHDATE */}
              {Boolean(form?.has_birthdate) && (
                <InputField type={'date'} label={'Data di nascita'} name={'birthdate'}
                            error={this.errors['birthdate'] ?? null} onInputChange={this.handleInputChange} />
              )}
              {/*CURRENT SCHOOL */}
              {Boolean(form?.has_current_school) && (
                <InputField label={'Scuola attuale'} name={'current_school'}
                            error={this.errors['current_school'] ?? null} onInputChange={this.handleInputChange} />
              )}
              {/*CURRENT GRADE*/}
              {Boolean(form?.has_current_grade) && (
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
              {Boolean(form?.has_year_of_interest) && (
                <SelectField name="year_of_interest" label={'Anno di interesse'}>
                  {this.schoolYearOptions.map((year) => (
                    <option value={year.value} key={year.value}>
                      {year.label}
                    </option>
                  ))}
                </SelectField>
              )}
              {/*PARENT EMAIL*/}
              <InputField type={'email'} label={'Email genitore'} name={'email'} error={this.errors['email'] ?? null}
                          onInputChange={this.handleInputChange} />
              {/*PARENT FIRST NAME */}
              {Boolean(form?.has_parent_first_name) && (
                <InputField label={'Nome genitore'} name={'parent_first_name'}
                            error={this.errors['parent_first_name'] ?? null} onInputChange={this.handleInputChange} />
              )}
              {/*PARENT LAST NAME*/}
              {Boolean(form?.has_parent_last_name) && (
                <InputField label={'Cognome genitore'} name={'parent_last_name'}
                            error={this.errors['parent_last_name'] ?? null} onInputChange={this.handleInputChange} />
              )}
              {/*PARENT PHONE */}
              {Boolean(form?.has_parent_phone) && (
                <InputField type={'tel'} label={'Telefono genitore'} name={'parent_phone'}
                            error={this.errors['parent_phone'] ?? null} onInputChange={this.handleInputChange} />
              )}
            </div>

            {Boolean(form?.schools) && (
              <div class="public-form__events">
                <div class="public-form__events__title">
                  {form?.events_title ?? ''}
                </div>
                {Object.values(form.schools ?? {})
                  .filter((school) => school?.events)
                  .map((school) => (
                    <div class="public-form__checkbox-group" key={school.id}>
                      <div class="public-form__checkbox-group__title">
                        {school?.name ?? ''}
                      </div>
                      {school.events.length > 0 ? (
                        school.events.map((event: any) => (
                          <CheckboxField
                            name={`event_ids[${school.id}][]`}
                            disabled={!event?.available}
                            label={
                              event.description +
                              (event?.available
                                ? ''
                                : ' ' +
                                '(Posti esauriti)')
                            }
                            value={event.id}
                            checked={false}
                            onInputChange={this.handleInputChange}
                          />
                        ))
                      ) : (
                        <CheckboxField
                          name={`event_ids[${school.id}][]`}
                          label={'Vorrei essere contattato per informazioni'}
                          value={0}
                          checked={false}
                          onInputChange={this.handleInputChange}
                        />
                      )}
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
              <CheckboxField name={'privacy_acceptance'} label={form?.style?.privacy_text ?? ''} value={1}
                             required={true} onInputChange={this.handleInputChange} />
              {/*MARKETING*/}
              {Boolean(form?.has_newsletter_subscription) &&
                <CheckboxField name={'newsletter_subscription'} label={form?.style?.newsletter_text ?? ''} value={1}
                               onInputChange={this.handleInputChange} />}
            </div>

            <button
              type="submit"
              class="public-form__submit"
              disabled={this.successMessage !== null}
            >
              { this.successMessage ?? 'Invia'}
            </button>
          </div>
        </form>
      </div>
    );
  }
}