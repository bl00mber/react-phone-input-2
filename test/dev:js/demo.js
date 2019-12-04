import React from 'react';
import { render } from 'react-dom';
import PhoneInput from '../../src/index';
import '../../src/style/style.less';


class Demo extends React.Component {
  state = { country: 'br', value: '12345',
    playgroundProps: {country: 'us', enableAreaCodes: true} }

  playgroundKey = 1

  renderPlayground = (e) => {
    if (e.which === 13) {
      let playgroundProps;
      try { playgroundProps = JSON.parse(e.target.value) }
      catch(error) { console.error(error); e.preventDefault(); e.stopPropagation(); }
      this.setState({ playgroundProps }, () => ++this.playgroundKey)
      e.preventDefault()
      e.stopPropagation()
    }
  }

  render() {
    return (
      <div style={{fontFamily: "'Roboto', sans-serif", fontSize: '15px', padding: '10px 25px', margin: '20px auto', maxWidth: '1500px'}}>
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

          .react-tel-input {
            margin-top: 15px;
          }
        `}} />
        <p style={{fontWeight: '500'}}>Created by <a style={{color: '#000'}}
          href="https://github.com/bl00mber/react-phone-input-2">Nick Reiley</a></p>
        <div style={{display: 'inline-block', verticalAlign: 'top'}}>
          <p>Exclude countries (usa, canada)</p>
          <PhoneInput
            country='no'
            excludeCountries={['us', 'ca']}
          />
          <p>Only countries</p>
          <PhoneInput
            country='gb'
            onlyCountries={['gb', 'es']}
          />
          <p>Preferred countries</p>
          <PhoneInput
            country='it'
            preferredCountries={['it', 'se']}
          />
        </div>

        <div style={{display: 'inline-block', marginLeft: '40px'}}>
          <p>Auto country detect by value</p>
          <PhoneInput
            value='+3802343252'
          />
          <p>Enabled area codes with enableAreaCodes</p>
          <PhoneInput
            country='us'
            enableAreaCodes
          />
          <p>Disabled flag by default</p>
          <p>Customizable placeholder</p>
          <p>Customizable styles</p>
          <PhoneInput
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
          <PhoneInput
            containerClass={'react-tel-input'}
            inputClass={'custom-phone-input'}
            buttonClass={'custom-phone-button'}
            dropdownClass={'custom-dropdown'}
          />
        </div>

        <div style={{display: 'inline-block', marginLeft: '40px', verticalAlign: 'top'}}>
          <p>Custom region selected: {`{'europe'}`}</p>
          <PhoneInput
            country='it'
            regions={'europe'}
            enableAreaCodes
          />
          <p>Custom regions selected: {`{['north-america', 'carribean']}`}</p>
          <PhoneInput
            country='ca'
            regions={['north-america', 'carribean']}
            enableAreaCodes
          />
          <p>Disabled dropdown and country code</p>
          <PhoneInput
            onlyCountries={['us']}
            country='us'
            placeholder='(702) 123-4567'
            disableCountryCode
            disableDropdown
          />
          <p>Localization</p>
          <p>Non-editable country code</p>
          <p>Autofocus</p>
          <PhoneInput
            country='de'
            onlyCountries={['de', 'es']}
            localization={{'Germany': 'Deutschland', 'Spain': 'España'}}
            enableAreaCodes
            countryCodeEditable={false}
            inputExtraProps={{
              name: 'tel',
              required: true,
              autoFocus: true
            }}
          />
        </div>
        <div style={{display: 'inline-block', marginLeft: '40px', verticalAlign: 'top'}}>
          <p>Search using iso2 or country name</p>
          <PhoneInput
            country='nl'
            enableSearch
            enableAreaCodes={['ca']}
          />
          <PhoneInput
            country='it'
            preferredCountries={['us', 'ca']}
            enableSearch
          />
          <PhoneInput
            country='pl'
            searchClass='search-class'
            searchStyle={{margin: '0', width: '97%', height: '30px'}}
            enableSearch
            disableSearchIcon
          />
          <p>Custom masks & area codes</p>
          <PhoneInput
            country='at'
            onlyCountries={['fr', 'at', 'gr', 'us']}
            masks={{fr: '+.. (...) ..-..-..', at: '+.. (....) ...-....', zz: '+.. ... ...'}}
            areaCodes={{gr: ['2694', '2647'], fr: ['369', '463'], us: ['300']}}
          />
          <PhoneInput
            country='eu'
            onlyCountries={['fr', 'at', 'gr', 'us']}
            masks={{fr: '+.. (...) ..-..-..', at: '+.. (....) ...-....', zz: '+.. ... ...'}}
            areaCodes={{gr: ['2694', '2647'], fr: ['369', '463'], us: ['300']}}
          />
          <p>State manipulations</p>
          <PhoneInput
            value={this.state.value}
            onChange={(value, country, e) => {console.log(value, country, e); this.setState({ value })}}
            prefix=''
            enableAreaCodes
          />
          <PhoneInput
            containerStyle={{marginBottom: '15px'}}
            country={this.state.country}
            enableAreaCodes
          />
          <button onClick={() => {
            if (this.state.country == 'br') {this.setState({country: '1205'})}
            else {this.setState({country: 'br'})}
          }}>Change default country</button>
        </div>

        <div>
          <br/><br/>
          <p>Press enter to render</p>
          <textarea name="" id="" cols="55" rows="3" spellCheck="false"
            style={{borderRadius: '5px', fontFamily: 'Roboto', fontSize: '14px'}}
            onKeyDown={this.renderPlayground} defaultValue={JSON.stringify(this.state.playgroundProps)} />

          <PhoneInput key={this.playgroundKey} {...this.state.playgroundProps}/>
        </div>
      </div>
    )
  }
}

export default render(
  <Demo />,
  document.getElementById('root')
);
