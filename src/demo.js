import React from 'react';
import { render } from 'react-dom';
import ReactPhoneInput from './index';

export default render(
  <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: '15px' }}>
    <style dangerouslySetInnerHTML={{__html: `
      input[type="tel"].custom-phone-input {
        font-size: 14px;
        border-color: #a0a0a0;
      }

      .custom-phone-button {
        background: rgb(200, 215, 225) !important;
        border-color: #a0a0a0 !important;
      }

      .custom-dropdown {
        margin-top: 0 !important;
      }
    `}} />
    <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
      <p>v1.2.1</p>
      <p>Exclude countries (usa, canada)</p>
      <ReactPhoneInput
        defaultCountry='no'
        excludeCountries={['us', 'ca']}
      />
      <p>Only countries</p>
      <ReactPhoneInput
        defaultCountry='gb'
        onlyCountries={['gb', 'es']}
      />
      <p>Preferred countries</p>
      <ReactPhoneInput
        defaultCountry='it'
        preferredCountries={['it', 'se']}
      />
    </div>

    <div style={{ display: 'inline-block', marginLeft: '40px' }}>
      <p>v2</p>
      <p>Auto country detect by value</p>
      <ReactPhoneInput
        value='+3802343252'
      />
      <p>Disabled area codes with disableAreaCodes</p>
      <ReactPhoneInput
        defaultCountry='us'
        disableAreaCodes={true}
      />
      <p>Disabled flag by default</p>
      <p>Customizable placeholder</p>
      <p>Customizable styles</p>
      <ReactPhoneInput
        disableAreaCodes={true}
        placeholder='Type your phone here'
        inputStyle={{
          width: '300px',
          height: '35px',
          fontSize: '13px',
          paddingLeft: '48px',
          borderRadius: '5px'
        }}
        buttonStyle={{ borderRadius: '5px 0 0 5px' }}
        dropdownStyle={{ width: '300px' }}
      />
      <p>Customizable classes</p>
      <ReactPhoneInput
        containerClass={'react-tel-input'}
        inputClass={'custom-phone-input'}
        buttonClass={'custom-phone-button'}
        dropdownClass={'custom-dropdown'}
      />
    </div>

    <div style={{ display: 'inline-block', marginLeft: '40px', verticalAlign: 'top', marginTop: '35px' }}>
      <p>Custom region selected: {`{'europe'}`}</p>
      <ReactPhoneInput
        defaultCountry='it'
        regions={'europe'}
      />
      <p>Custom regions selected: {`{['north-america', 'carribean']}`}</p>
      <ReactPhoneInput
        defaultCountry='ca'
        regions={['north-america', 'carribean']}
      />
      <p>Disabled dropdown and country code</p>
      <ReactPhoneInput
        onlyCountries={['us']}
        defaultCountry='us'
        disableAreaCodes={true}
        disableCountryCode={true}
        disableDropdown={true}
        placeholder='(702) 123-4567'
      />
      <p>Localization</p>
      <p>Non-editable country code</p>
      <p>Autofocus</p>
      <ReactPhoneInput
        defaultCountry='de'
        onlyCountries={['de', 'es']}
        localization={{'Germany': 'Deutschland', 'Spain': 'España'}}
        countryCodeEditable={false}
        autoFocus={true}
      />
    </div>
  </div>, document.getElementById('root')
);
