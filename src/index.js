// TODO - fix the onlyContries props. Currently expects that as an array of country object, but users should be able to send in array of country isos

import {
  some,
  find,
  reduce,
  map,
  filter,
  includes
} from 'lodash/collection';
import { findIndex, head, tail } from 'lodash/array';
import { debounce, memoize } from 'lodash/function';
import { trim, startsWith } from 'lodash/string';
import React from 'react';
import countryData from './country_data.js';
import classNames from 'classnames';
import { render } from 'react-dom';

import './react-phone-input-style.less';

let allCountries = countryData.allCountries;
const isModernBrowser = Boolean(document.createElement('input').setSelectionRange);
const keys = {
  UP: 38,
  DOWN: 40,
  RIGHT: 39,
  LEFT: 37,
  ENTER: 13,
  ESC: 27,
  PLUS: 43,
  A: 65,
  Z: 90,
  SPACE: 32
};

function deleteAreaCodes() {
  allCountries = allCountries.filter((country) => {
    return country.isAreaCode !== true;
  });
}

function isNumberValid(inputNumber) {
  return some(allCountries, function(country) {
    return startsWith(inputNumber, country.dialCode) || startsWith(country.dialCode, inputNumber);
  });
}

function getOnlyCountries(onlyCountriesArray) {
  if (onlyCountriesArray.length === 0) {
    return allCountries;
  }
  else {
    let selectedCountries = [];
    allCountries.map(function(country) {
      onlyCountriesArray.map(function(selCountry) {
        country.iso2 === selCountry && selectedCountries.push(country);
      });
    });
    return selectedCountries;
  }
}

function excludeCountries(selectedCountries, excludedCountries) {
  if (excludedCountries.length === 0) {
    return selectedCountries;
  } else {
    return filter(selectedCountries, function(selCountry) {
      return !includes(excludedCountries, selCountry.iso2);
    });
  }
}

class ReactPhoneInput extends React.Component {
  constructor(props) {
    super(props);
    let inputNumber = this.props.value || '';

    const isAreaCodeDisabled = this.props.disableAreaCodes;
    isAreaCodeDisabled && deleteAreaCodes();

    let onlyCountries = excludeCountries(getOnlyCountries(props.onlyCountries), props.excludeCountries);

    let preferredCountries = filter(allCountries, (country) => {
      return some(this.props.preferredCountries, (preferredCountry) => {
        return preferredCountry === country.iso2;
      });
    });

    let selectedCountryGuess;
    if (inputNumber.length > 1) {
      // Country detect by value field
      selectedCountryGuess = this.guessSelectedCountry(inputNumber.substring(1, 6), onlyCountries, this.props.defaultCountry);
    } else if (this.props.defaultCountry) {
      // Default country
      selectedCountryGuess = find(onlyCountries, {iso2: this.props.defaultCountry});
    } else {
      // Empty params
      selectedCountryGuess = 0;
    }

    let selectedCountryGuessIndex = findIndex(allCountries, selectedCountryGuess);
    let dialCode = (
      inputNumber.length < 2 &&
      selectedCountryGuess &&
      !startsWith(inputNumber.replace(/\D/g, ''), selectedCountryGuess.dialCode)
    ) ? selectedCountryGuess.dialCode : '';

    let formattedNumber = (inputNumber === '' && selectedCountryGuess === 0) ? '' :
      this.formatNumber(dialCode + inputNumber.replace(/\D/g, ''), selectedCountryGuess ? selectedCountryGuess.format : null);

    this.state = {
      formattedNumber,
      placeholder: this.props.placeholder,
      preferredCountries,
      onlyCountries,
      defaultCountry: props.defaultCountry,
      selectedCountry: selectedCountryGuess,
      highlightCountryIndex: selectedCountryGuessIndex,
      queryString: '',
      showDropDown: false,
      freezeSelection: false,
      debouncedQueryStingSearcher: debounce(this.searchCountry, 100)
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultCountry && nextProps.defaultCountry !== this.state.defaultCountry) {
      this.updateDefaultCountry(nextProps.defaultCountry);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  updateDefaultCountry = (country) => {
    const newSelectedCountry = find(this.state.onlyCountries, {iso2: country});
    this.setState({
      defaultCountry: country,
      selectedCountry: newSelectedCountry,
      formattedNumber: '+' + newSelectedCountry.dialCode
    });
  }

  scrollTo = (country, middle) => {
    if (!country)
      return;

    let container = this.flagDropdownList;

    if (!container)
      return;

    let containerHeight = container.offsetHeight;
    let containerOffset = container.getBoundingClientRect();
    let containerTop = containerOffset.top + document.body.scrollTop;
    let containerBottom = containerTop + containerHeight;

    let element = country;
    let elementOffset = element.getBoundingClientRect();

    let elementHeight = element.offsetHeight;
    let elementTop = elementOffset.top + document.body.scrollTop;
    let elementBottom = elementTop + elementHeight;
    let newScrollTop = elementTop - containerTop + container.scrollTop;
    let middleOffset = (containerHeight / 2) - (elementHeight / 2);

    if (elementTop < containerTop) {
      // scroll up
      if (middle) {
        newScrollTop -= middleOffset;
      }
      container.scrollTop = newScrollTop;
    }
    else if (elementBottom > containerBottom) {
      // scroll down
      if (middle) {
        newScrollTop += middleOffset;
      }
      let heightDifference = containerHeight - elementHeight;
      container.scrollTop = newScrollTop - heightDifference;
    }
  }

  formatNumber = (text, pattern) => {
    if (!text || text.length === 0) {
      return '+';
    }

    // for all strings with length less than 3, just return it (1, 2 etc.)
    // also return the same text if the selected country has no fixed format
    if ((text && text.length < 2) || !pattern || !this.props.autoFormat) {
      return `+${text}`;
    }

    let formattedObject = reduce(pattern, function(acc, character) {
      if (acc.remainingText.length === 0) {
        return acc;
      }

      if (character !== '.') {
        return {
          formattedText: acc.formattedText + character,
          remainingText: acc.remainingText
        };
      }

      return {
        formattedText: acc.formattedText + head(acc.remainingText),
        remainingText: tail(acc.remainingText)
      };
    }, {
      formattedText: '',
      remainingText: text.split('')
    });
    return formattedObject.formattedText + formattedObject.remainingText.join('');
  }

  // put the cursor to the end of the input (usually after a focus event)
  cursorToEnd = () => {
    let input = this.numberInput;
    input.focus();
    if (isModernBrowser) {
      let len = input.value.length;
      input.setSelectionRange(len, len);
    }
  }

  getElement = (index) => {
    return this[`flag_no_${index}`];
  }

  handleFlagDropdownClick = () => {
    // need to put the highlight on the current selected country if the dropdown is going to open up
    this.setState({
      showDropDown: !this.state.showDropDown,
      highlightCountry: find(this.state.onlyCountries, this.state.selectedCountry),
      highlightCountryIndex: findIndex(this.state.onlyCountries, this.state.selectedCountry)
    }, () => {
      if (this.state.showDropDown) {
        this.scrollTo(this.getElement(this.state.highlightCountryIndex + this.state.preferredCountries.length));
      }
    });
  }

  handleInput = (event) => {
    let formattedNumber = '+',
      newSelectedCountry = this.state.selectedCountry,
      freezeSelection = this.state.freezeSelection;

    //Does not exceed 16 digit phone number limit
    if (event.target.value.replace(/\D/g, '').length > 16) {
      return;
    }

    // if the input is the same as before, must be some special key like enter etc.
    if (event.target.value === this.state.formattedNumber) {
      return;
    }

    // ie hack
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }

    if (event.target.value.length > 0) {
      // before entering the number in new format, lets check if the dial code now matches some other country
      let inputNumber = event.target.value.replace(/\D/g, '');

      // we don't need to send the whole number to guess the country... only the first 6 characters are enough
      // the guess country function can then use memoization much more effectively since the set of input it
      // gets has drastically reduced
      if (!this.state.freezeSelection || this.state.selectedCountry.dialCode.length > inputNumber.length) {
        newSelectedCountry = this.guessSelectedCountry(inputNumber.substring(0, 6), this.state.onlyCountries, this.state.defaultCountry);
        freezeSelection = false;
      }
      // let us remove all non numerals from the input
      formattedNumber = this.formatNumber(inputNumber, newSelectedCountry.format);
    }

    let caretPosition = event.target.selectionStart;
    let oldFormattedText = this.state.formattedNumber;
    let diff = formattedNumber.length - oldFormattedText.length;

    this.setState({
      formattedNumber: formattedNumber,
      freezeSelection: freezeSelection,
      selectedCountry: newSelectedCountry.dialCode
        ? newSelectedCountry
        : this.state.selectedCountry
    }, () => {
      if (isModernBrowser) {
        if (diff > 0) {
          caretPosition = caretPosition - diff;
        }

        if (caretPosition > 0 && oldFormattedText.length >= formattedNumber.length) {
          this.numberInput.setSelectionRange(caretPosition, caretPosition);
        }
      }

      if (this.props.onChange) {
        this.props.onChange(this.state.formattedNumber);
      }
    });
  }

  handleInputClick = (e) => {
    this.setState({showDropDown: false});
    if (this.props.onClick) {
      this.props.onClick(e)
    }
  }

  handleFlagItemClick = (country) => {
    let currentSelectedCountry = this.state.selectedCountry;
    let nextSelectedCountry = find(this.state.onlyCountries, country);

    if (currentSelectedCountry.iso2 !== nextSelectedCountry.iso2) {
      // TODO - the below replacement is a bug. It will replace stuff from middle too
      let newNumber = this.state.formattedNumber.replace(currentSelectedCountry.dialCode, nextSelectedCountry.dialCode);
      let formattedNumber = this.formatNumber(newNumber.replace(/\D/g, ''), nextSelectedCountry.format);

      this.setState({
        showDropDown: false,
        selectedCountry: nextSelectedCountry,
        freezeSelection: true,
        formattedNumber: formattedNumber
      }, function() {
        this.cursorToEnd();
        if (this.props.onChange) {
          this.props.onChange(formattedNumber);
        }
      });
    }
  }

  handleInputFocus = (e) => {
    // if the input is blank, insert dial code of the selected country
    if (this.numberInput.value === '+' && this.state.selectedCountry) {
      this.setState({
        formattedNumber: '+' + this.state.selectedCountry.dialCode
      }, () => setTimeout(this.cursorToEnd, 10));
    }

    this.setState({ placeholder: '' });

    this.props.onFocus && this.props.onFocus(e);
    setTimeout(this.cursorToEnd, 10);
  }

  handleInputBlur = (e) => {
    if (!e.target.value) {
      this.setState({ placeholder: this.props.placeholder });
    }
  }

  getHighlightCountryIndex = (direction) => {
    // had to write own function because underscore does not have findIndex. lodash has it
    let highlightCountryIndex = this.state.highlightCountryIndex + direction;

    if (highlightCountryIndex < 0 || highlightCountryIndex >= (this.state.onlyCountries.length + this.state.preferredCountries.length)) {
      return highlightCountryIndex - direction;
    }

    return highlightCountryIndex;
  }

  searchCountry = () => {
    const probableCandidate = this.searchCountry(this.state.queryString) || this.state.onlyCountries[0];
    const probableCandidateIndex = findIndex(this.state.onlyCountries, probableCandidate) + this.state.preferredCountries.length;

    this.scrollTo(this.getElement(probableCandidateIndex), true);

    this.setState({queryString: '', highlightCountryIndex: probableCandidateIndex});
  }

  handleKeydown = (event) => {
    if (!this.state.showDropDown) {
      return;
    }

    // ie hack
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }

    const moveHighlight = (direction) => {
      this.setState({
        highlightCountryIndex: this.getHighlightCountryIndex(direction)
      }, () => {
        this.scrollTo(this.getElement(
          this.state.highlightCountryIndex + this.state.preferredCountries.length
        ), true);
      });
    }

    switch (event.which) {
      case keys.DOWN:
        moveHighlight(1);
        break;
      case keys.UP:
        moveHighlight(-1);
        break;
      case keys.ENTER:
        this.handleFlagItemClick(this.state.onlyCountries[this.state.highlightCountryIndex], event);
        break;
      case keys.ESC:
        this.setState({
          showDropDown: false
        }, this.cursorToEnd);
        break;
      default:
        if ((event.which >= keys.A && event.which <= keys.Z) || event.which === keys.SPACE) {
          this.setState({
            queryString: this.state.queryString + String.fromCharCode(event.which)
          }, this.state.debouncedQueryStingSearcher);
        }
    }
  }

  handleInputKeyDown = (event) => {
    if (event.which === keys.ENTER) {
      this.props.onEnterKeyPress(event);
    }

    if (this.props.onKeyDown) {
      this.props.onKeyDown(event)
    }
  }

  handleClickOutside = () => {
    if (this.state.showDropDown) {
      this.setState({showDropDown: false});
    }
  }

  getCountryDropDownList = () => {
    let countryDropDownList = map(this.state.preferredCountries.concat(this.state.onlyCountries), (country, index) => {
      let itemClasses = classNames({
        country: true,
        preferred: country.iso2 === 'us' || country.iso2 === 'gb',
        active: country.iso2 === 'us',
        highlight: this.state.highlightCountryIndex === index - this.state.preferredCountries.length
      });

      let inputFlagClasses = `flag ${country.iso2}`;

      return (
        <li
          ref={el => this[`flag_no_${index}`] = el}
          key={`flag_no_${index}`}
          data-flag-key={`flag_no_${index}`}
          className={itemClasses}
          data-dial-code="1"
          data-country-code={country.iso2}
          onClick={this.handleFlagItemClick.bind(this, country)}
        >
          <div className={inputFlagClasses}/>
          <span className='country-name'>{country.name}</span>
          <span className='dial-code'>{'+' + country.dialCode}</span>
        </li>
      );
    });

    const dashedLi = (<li key={'dashes'} className='divider'/>);
    // let's insert a dashed line in between preffered countries and the rest
    countryDropDownList.splice(this.state.preferredCountries.length, 0, dashedLi);

    const dropDownClasses = classNames({
      'country-list': true,
      'hide': !this.state.showDropDown
    });

    return (
      <ul
        ref={el => this.flagDropdownList = el}
        className={dropDownClasses}>
        {countryDropDownList}
      </ul>
    );
  }

  render() {
    const { selectedCountry, showDropDown, formattedNumber } = this.state;

    let arrowClasses = classNames({"arrow": true, "up": showDropDown});
    let inputClasses = classNames({
      "form-control": true,
      "invalid-number": !this.props.isValid(formattedNumber.replace(/\D/g, ''))
    });

    let flagViewClasses = classNames({"flag-dropdown": true, "open-dropdown": showDropDown});
    let inputFlagClasses = `flag ${selectedCountry.iso2}`;

    return (
      <div className="react-tel-input">
        <input
          placeholder={this.state.placeholder}
          onChange={this.handleInput}
          onClick={this.handleInputClick}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
          onKeyDown={this.handleInputKeyDown}
          value={formattedNumber}
          ref={el => this.numberInput = el}
          type="tel"
          className={inputClasses}
        />

        <div
          className={flagViewClasses}
          onKeyDown={this.handleKeydown}
        >
          <div
            onClick={this.handleFlagDropdownClick}
            className='selected-flag'
            title={selectedCountry ? `${selectedCountry.name}: + ${selectedCountry.dialCode}` : ''}
          >
            <div className={inputFlagClasses}>
              <div className={arrowClasses}></div>
            </div>
          </div>

          {showDropDown && this.getCountryDropDownList()}
        </div>
      </div>
    );
  }
}

ReactPhoneInput.prototype.searchCountry = memoize(function(queryString) {
  if (!queryString || queryString.length === 0) {
    return null;
  }
  // don't include the preferred countries in search
  let probableCountries = filter(this.state.onlyCountries, function(country) {
    return startsWith(country.name.toLowerCase(), queryString.toLowerCase());
  }, this);
  return probableCountries[0];
});

ReactPhoneInput.prototype.guessSelectedCountry = memoize(function(inputNumber, onlyCountries, defaultCountry) {
  let secondBestGuess = find(allCountries, {iso2: defaultCountry}) || {};
  let bestGuess;

  if (trim(inputNumber) !== '') {
    bestGuess = reduce(onlyCountries, function(selectedCountry, country) {
      if (startsWith(inputNumber, country.dialCode)) {
        if (country.dialCode.length > selectedCountry.dialCode.length) {
          return country;
        }
        if (country.dialCode.length === selectedCountry.dialCode.length && country.priority < selectedCountry.priority) {
          return country;
        }
      }

      return selectedCountry;
    }, {dialCode: '', priority: 10001}, this);
  } else {
    return secondBestGuess;
  }

  if (!bestGuess.name) {
    return secondBestGuess;
  }

  return bestGuess;
});

ReactPhoneInput.defaultProps = {
  value: '',
  placeholder: '+1 (702) 123-4567',
  autoFormat: true,
  disableAreaCodes: false,
  onlyCountries: [],
  excludeCountries: [],
  defaultCountry: '',
  isValid: isNumberValid,
  flagsImagePath: './flags.png',
  onEnterKeyPress: function() {}
};

ReactPhoneInput.propTypes = {
  value: React.PropTypes.string,
  placeholder: React.PropTypes.string,
  autoFormat: React.PropTypes.bool,
  disableAreaCodes: React.PropTypes.bool,
  defaultCountry: React.PropTypes.string,
  onlyCountries: React.PropTypes.arrayOf(React.PropTypes.string),
  preferredCountries: React.PropTypes.arrayOf(React.PropTypes.string),
  onChange: React.PropTypes.func,
  onFocus: React.PropTypes.func,
  onClick: React.PropTypes.func,
  onKeyDown: React.PropTypes.func
};

export default ReactPhoneInput;

if (__DEV__) {
  render(
    <div>
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
    <p>v2.0.0</p>
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
    <p>Custom placeholder</p>
      <ReactPhoneInput
        disableAreaCodes={true}
        placeholder='Type your phone here'
      />
    </div>, document.getElementById('content')
  );
}
