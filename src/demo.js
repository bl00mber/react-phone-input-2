import React from 'react';
import { render } from 'react-dom';
import ReactPhoneInput from './index';

export default render(
  <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: '15px' }}>
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

    <div style={{ display: 'inline-block', marginLeft: '30px' }}>
      <p>v2</p>
      <p>Auto detect through value field</p>
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
      <p>Custom regions selected: {`{'europe'}`}</p>
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
    </div>
  </div>, document.getElementById('root')
);
