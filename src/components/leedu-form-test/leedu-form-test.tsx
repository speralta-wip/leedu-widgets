import { Component, h, Prop, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'leedu-form-test',
  styleUrl: 'leedu-form-test.scss',
  shadow: true,
})

export class LeeduFormTest {
  @Prop() submitUrl: string

  @Event() formSubmit: EventEmitter<{ data: any; type: 'error'| 'success' }>;


  private handleSubmit = (ev: Event) => {
    ev.preventDefault();

    // @ts-ignore
    const data = new FormData(ev.currentTarget);
    // @ts-ignore
    const formJSON = Object.fromEntries(data.entries());
    if (this.submitUrl){
      fetch(this.submitUrl, {
        method:"POST",
        body: data,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
      })
        .then(resp=> {
          console.log(resp);
          this.formSubmit.emit({
            data: resp,
            type: 'success'
          });
        })
        .catch(err=>{
          console.log(err);
          this.formSubmit.emit({
            data: err,
            type: 'error'
          });
        })
    }
  }

  render() {
    return (
      <form class={'form-container'} action={this.submitUrl} onSubmit={this.handleSubmit}>
        <input type="text" name={'first_name'} placeholder={'nome studente'} />
        <input type="text" name={'last_name'} placeholder={'cognome studente'} />
        <select name="year_of_interest">
          <option value="" disabled selected>Seleziona Anno di interesse</option>
          <option value="2026">2026/2027</option>
          <option value="2027">2027/2028</option>
          <option value="2028">2028/2029</option>
          <option value="2029">2029/2030</option>
          <option value="2030">2030/2031</option>
        </select>
        <input type="email" name={'email'} placeholder={'email genitore'} />

        <label>
          <input type="checkbox" name="privacy_acceptance" value={1} />
          <span>Privacy</span>
        </label>
        <label>
          <input type="checkbox" name="newsletter_subscription" value={1} />
          <span>NL subscription</span>
        </label>
        <button type={'submit'}>Submit</button>
      </form>
    );
  }
}
