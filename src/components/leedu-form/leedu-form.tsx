import { Component, Prop, State, Event, EventEmitter, h, Watch, Element } from '@stencil/core';
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
  id?: number;
  name?: string;
  title?: string;
  events_title?: string;
  has_parent_phone?: boolean;
  has_birthdate?: boolean;
  has_current_school?: boolean;
  has_current_grade?: boolean;
  has_parent_first_name?: boolean;
  has_parent_last_name?: boolean;
  has_newsletter_subscription?: boolean;
  has_year_of_interest?: boolean;
  allow_multiple_events?: boolean;
  style?: FormStyleResource;
  schools?: object;
  educationLevelGrades?: EducationLevelGradesResource;
}

export interface FormConfig {
  title?: string;
  form?: PublicFormResource;
  recaptcha_key?: string;
  tracking_pixel_url?: string;
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
  @Element() el: HTMLElement;
  private formEl!: HTMLFormElement;
  private recaptchaInput: HTMLInputElement;

  private googleFontsApiBaseUrl = 'https://fonts.googleapis.com';
  private gStaticUrl = 'https://fonts.gstatic.com';

  @Prop() previewOnly: boolean;
  @Prop() config: string;
  @Prop() formUrl: string;
  @Prop() disabled: boolean = false;

  @State() allowMultipleEvents: boolean = false;
  @State() recaptchaKey: string;
  @State() formData: { [key: string]: any } = {};
  @State() errors: { [key: string]: string } = {};
  @State() successMessage: string | null = null;
  @State() parsedConfig: FormConfig = {title: ''};
  @State() fontsMap: Map<string,{source:string; cssFamily: string}> = new Map();
  @State() fontFamily: string;

  @State() schoolYearOptions: SelectOption[] = [];
  @State() utmInputs: HiddenInput[] = [];

  @Event() formSubmit: EventEmitter<{ data: any; isValid: boolean }>;
  @Event() formReset: EventEmitter<void>;
  @Event() fieldChange: EventEmitter<{ fieldName: string; value: any; formData: any }>;

  @Watch('config')
  @Watch('formUrl')
  watchConfig() {
    this.parseConfig();
  }
  @Watch('recaptchaKey')
  watchRecaptchaKey(){
    if (!this.recaptchaKey) return;
    const recaptchaScript: HTMLScriptElement = document.createElement("script");
    recaptchaScript.src = `https://www.google.com/recaptcha/api.js?render=${this.recaptchaKey}`;
    document.head.appendChild(recaptchaScript);
  }

  @Watch('parsedConfig')
  watchParsedConfig(){
    const thisYear = new Date().getFullYear() + 1;
    if (this.parsedConfig?.form?.has_year_of_interest){
      this.schoolYearOptions = schoolYearOptions(thisYear,false);
    }
    if (this.parsedConfig?.recaptcha_key){
      this.recaptchaKey = this.parsedConfig.recaptcha_key
    }

    this.allowMultipleEvents = this.parsedConfig?.form?.allow_multiple_events ?? false;

    this.loadFont();

    if (this.parsedConfig?.tracking_pixel_url && this.parsedConfig?.form?.id){

      this.fetchPixel(this.parsedConfig?.tracking_pixel_url, this.parsedConfig?.form?.id);
    }
  }

  componentWillLoad() {
    this.loadMainFontLinks();
    this.parseConfig();
    this.loadUtmInputs();
  }

  componentDidLoad() {
    this.injectRecaptchaBadgeStyles();
  }

  private injectRecaptchaBadgeStyles() {
    if (!document.getElementById('recaptcha-badge-style')) {
      const style = document.createElement('style');
      style.id = 'recaptcha-badge-style';
      style.textContent = `
        .grecaptcha-badge {
          visibility: hidden !important;
          opacity: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  private fetchPixel(pixelUrl: string, formId: string|number){
    if (!pixelUrl) return;
    const urlParams = new URLSearchParams(window.location.search)
    urlParams.set('form_id', `${formId}`)
    urlParams.set('referrer_url', document.referrer)
    const newImgSrc = `${pixelUrl}?${urlParams}`;
    if (sessionStorage.getItem('leeduPixel') === newImgSrc) return;
    const pixelImg = new Image();
    pixelImg.src = newImgSrc;
    sessionStorage.setItem('leeduPixel', pixelImg.src)
  }

  private loadMainFontLinks(){
    const linkTag1 = document.createElement("link");
    linkTag1.rel = "preconnect";
    linkTag1.href = this.googleFontsApiBaseUrl;
    document.head.appendChild(linkTag1);

    const linkTag2 = document.createElement("link");
    linkTag2.rel = "preconnect";
    linkTag2.href = this.gStaticUrl;
    linkTag2.crossOrigin = 'true';
    document.head.appendChild(linkTag2);
  }

  private loadFont() {
    const targetFont = this.parsedConfig?.form?.style?.font_family ?? 'HankenGrotesk';

    this.fontsMap.set('HankenGrotesk', {
      source: '/css2?family=Hanken+Grotesk:ital,wght@0,100..700;1,100..700&display=swap',
      cssFamily: '"Hanken Grotesk", sans-serif'
    });
    this.fontsMap.set('Poppins', {
      source: '/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap',
      cssFamily: '"Poppins", sans-serif'
    });
    this.fontsMap.set('RobotoMono', {
      source: '/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap',
      cssFamily: '"Roboto Mono", monospace'
    });
    this.fontsMap.set('Merriweather', {
      source: '/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..700;1,18..144,300..700&display=swap',
      cssFamily: '"Merriweather", serif'
    });
    this.fontsMap.set('BalsamiqSans', {
      source: '/css2?family=Balsamiq+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap',
      cssFamily: '"Balsamiq Sans", sans-serif'
    });

    if (this.fontsMap.has(targetFont)){
      console.log('loadFont: ',targetFont);
      const font = this.fontsMap.get(targetFont);
      this.fontFamily = font.cssFamily;
      const gFontLink = document.createElement("link");
      gFontLink.href = `${this.googleFontsApiBaseUrl}${font.source}`;
      gFontLink.rel = "stylesheet"
      document.head.appendChild(gFontLink);
    }

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
    }else{
      this.parsedConfig = this.config ? JSON.parse(this.config) : {};
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

  private handleEventsChange = (fieldName: string, value: any, target?: HTMLInputElement) => {
    console.log(fieldName, value, target);
    //this.formData actually just to test but could be useful in a future
    this.formData = {
      ...this.formData,
      [fieldName]: value
    };

    if (!this.allowMultipleEvents){
      const groupEl = target.closest('[data-events-group]');
      const groupInputs = groupEl.querySelectorAll(`input[name="${fieldName}"]`);
      if(target.checked){
        groupInputs.forEach((input:HTMLInputElement) =>{
          if (input.value != value) {
            input.checked = false;
          }
        })
      }
      console.log(groupInputs);
    }

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
    if (this.previewOnly) return;

    // @ts-ignore
    if (this.recaptchaKey && window.recaptcha){
      this.recaptchaInput.value='';
    // @ts-ignore
      window.grecaptcha.ready(()=> {
    // @ts-ignore
        window.grecaptcha.execute( this.recaptchaKey, {action: 'submit'}).then((token)=> {
          console.log('TOKEN',token);
          this.recaptchaInput.value = token;

          this.submitForm();
        });
      });
    } else {
      await this.submitForm();
    }

  }

  private submitForm = async ()=> {
    let response = null;
    let responseJson = null;
    // @ts-ignore
    const formData = new FormData(this.formEl);
    if (this.formUrl){
      try {
        response = await fetch(this.formUrl, {
          method:"POST",
          body: formData,
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
        this.parsedConfig = responseJson?.form ? {...this.parsedConfig, form: responseJson?.form } : this.parsedConfig;
      }
    }

    this.formSubmit.emit({
      data: formData,
      isValid: true,
    });
  }

  render() {
    const { form } = this.parsedConfig;

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
                  --leedu-form-font-family: ${this.fontFamily};
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
            <div class="public-form__title">{form?.title ?? ''}</div>
            <div class="public-form__main-fields">
              { this.recaptchaKey !== null && (
                <input type="hidden" name="g_recaptcha_response" ref={(el)=> this.recaptchaInput = el as HTMLInputElement}/>
              )}
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
                            error={this.errors['birthdate'] ?? null} onInputChange={this.handleInputChange} required={true}/>
              )}
              {/*CURRENT SCHOOL */}
              {Boolean(form?.has_current_school) && (
                <InputField label={'Scuola attuale'} name={'current_school'}
                            error={this.errors['current_school'] ?? null} onInputChange={this.handleInputChange} required={true}/>
              )}
              {/*CURRENT GRADE*/}
              {Boolean(form?.has_current_grade) && (
                <SelectField name={'current_grade'} label={'Classe attuale'} required={true}>
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
                <SelectField name="year_of_interest" label={'Anno scolastico di interesse'} required={true}>
                  {this.schoolYearOptions.map((year) => (
                    <option value={year.value} key={year.value}>
                      {year.label}
                    </option>
                  ))}
                </SelectField>
              )}
              {/*PARENT EMAIL*/}
              <InputField type={'email'} label={'Email genitore'} name={'email'} error={this.errors['email'] ?? null}
                          onInputChange={this.handleInputChange} required={true}/>
              {/*PARENT FIRST NAME */}
              {Boolean(form?.has_parent_first_name) && (
                <InputField label={'Nome genitore'} name={'parent_first_name'}
                            error={this.errors['parent_first_name'] ?? null} required={true} onInputChange={this.handleInputChange} />
              )}
              {/*PARENT LAST NAME*/}
              {Boolean(form?.has_parent_last_name) && (
                <InputField label={'Cognome genitore'} name={'parent_last_name'}
                            error={this.errors['parent_last_name'] ?? null} required={true} onInputChange={this.handleInputChange} />
              )}
              {/*PARENT PHONE */}
              {Boolean(form?.has_parent_phone) && (
                <InputField type={'tel'} label={'Telefono genitore'} name={'parent_phone'} validation={{pattern:'[+]{0,}[0-9]{0,}'}}
                            error={this.errors['parent_phone'] ?? null} required={true} onInputChange={this.handleInputChange} />
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
                    <div class="public-form__checkbox-group" data-events-group={school.id}>
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
                            onInputChange={this.handleEventsChange}
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
                             required={true} onInputChange={this.handleInputChange} error={'privacy_acceptance' in this.errors ? this.errors['privacy_acceptance'] :null}/>
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

            {/*TODO: LDU-489 recaptcha text when recaptcha badge hidden */}
            <div class="recaptcha-terms">
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="https://policies.google.com/privacy">Privacy Policy</a> and{' '}
              <a href="https://policies.google.com/terms">Terms of Service</a> apply.
            </div>

            <div class="public-form__generic-feedbacks">
              {/*RECAPTCHA ERROR*/}
              { 'g_recaptcha_response' in this.errors ? (
                <span class={'error-feedback'}>{this.errors['g_recaptcha_response']}</span>
              ) : null}

            </div>
          </div>
        </form>
      </div>
    );
  }
}