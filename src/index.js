// TODO - fix the onlyContries props. Currently expects that as an array of country object, but users should be able to send in array of country isos

import { some, findWhere, reduce, map, filter, any, includes } from 'lodash/collection';
import { findIndex, first, rest } from 'lodash/array';
import { debounce, memoize } from 'lodash/function';
import { trim, startsWith } from 'lodash/string';
import React from 'react';
import countryData from './country_data.js';
import classNames from 'classnames';

let allCountries = countryData.allCountries;

let isModernBrowser = Boolean(document.createElement('input').setSelectionRange);

var style = require('./react-phone-input-style.less');

let keys = {
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

function isNumberValid(inputNumber) {
  let countries = countryData.allCountries;
  return some(countries, function(country) {
    return startsWith(inputNumber, country.dialCode) || startsWith(country.dialCode, inputNumber);
  });
}

function getOnlyCountries(onlyCountriesArray) {
  if (onlyCountriesArray.length === 0) {
    return allCountries;
  } else {
    let selectedCountries = [];
    allCountries.map(function(country) {
      onlyCountriesArray.map(function(selCountry){
        if (country.iso2 === selCountry) {
          selectedCountries.push(country);
        }
      });
    });
    return selectedCountries;
  }
}

function excludeCountries(selectedCountries, excludedCountries) {
  if(excludedCountries.length === 0) {
    return selectedCountries;
  } else {
    let newSelectedCountries = filter(selectedCountries, function(selCountry) {
      return !includes(excludedCountries, selCountry.iso2);
    });
    return newSelectedCountries;
  }
}

class ReactPhoneInput extends React.Component {

  constructor(props) {
    super(props);
    let inputNumber = this.props.value || '';
    let selectedCountryGuess = this.guessSelectedCountry(inputNumber.replace(/\D/g, ''));
    let selectedCountryGuessIndex = findIndex(allCountries, selectedCountryGuess);
    let formattedNumber = this.formatNumber(inputNumber.replace(/\D/g, ''), selectedCountryGuess ? selectedCountryGuess.format : null);
    let preferredCountries = filter(allCountries, function(country) {
      return any(this.props.preferredCountries, function(preferredCountry) {
        return preferredCountry === country.iso2;
      });
    }, this);

    this.getNumber = this.getNumber.bind(this);
    this.getValue = this.getValue.bind(this);
    this.scrollTo = this.scrollTo.bind(this);
    this.formatNumber = this.formatNumber.bind(this);
    this._cursorToEnd = this._cursorToEnd.bind(this);
    this.guessSelectedCountry = this.guessSelectedCountry.bind(this);
    this.getElement = this.getElement.bind(this);
    this.handleFlagDropdownClick = this.handleFlagDropdownClick.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleInputClick = this.handleInputClick.bind(this);
    this.handleFlagItemClick = this.handleFlagItemClick.bind(this);
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this._getHighlightCountryIndex = this._getHighlightCountryIndex.bind(this);
    this._searchCountry = this._searchCountry.bind(this);
    this.searchCountry = this.searchCountry.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleInputKeyDown = this.handleInputKeyDown.bind(this);
    this.getCountryDropDownList = this.getCountryDropDownList.bind(this);

    this.state = {
      preferredCountries: preferredCountries,
      selectedCountry: selectedCountryGuess,
      highlightCountryIndex: selectedCountryGuessIndex,
      formattedNumber: formattedNumber,
      showDropDown: false,
      queryString: '',
      freezeSelection: false,
      debouncedQueryStingSearcher: debounce(this.searchCountry, 100),
      onlyCountries: excludeCountries(getOnlyCountries(this.props.onlyCountries), this.props.excludeCountries)
    };
  }

  getNumber() {
    return this.state.formattedNumber !== '+' ? this.state.formattedNumber : '';
  }

  getValue() {
    return this.getNumber();
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);

    this._cursorToEnd();
    if(typeof this.props.onChange === 'function') {
      this.props.onChange(this.state.formattedNumber);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  scrollTo(country, middle) {
    if(!country) return;

    let container = this.refs.flagDropdownList.getDOMNode();

    if(!container) return;

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
    } else if (elementBottom > containerBottom) {
      // scroll down
      if(middle) {
        newScrollTop += middleOffset;
      }
      var heightDifference = containerHeight - elementHeight;
      container.scrollTop = newScrollTop - heightDifference;
    }
  }

  formatNumber(text, pattern) {
    if(!text || text.length === 0) {
        return '+';
    }

    // for all strings with length less than 3, just return it (1, 2 etc.)
    // also return the same text if the selected country has no fixed format
    if((text && text.length < 2) || !pattern || !this.props.autoFormat) {
      return `+${text}`;
    }

    let formattedObject = reduce(pattern, function(acc, character) {
      if(acc.remainingText.length === 0) {
          return acc;
      }

      if(character !== '.') {
        return {
          formattedText: acc.formattedText + character,
          remainingText: acc.remainingText
        };
      }

      return {
        formattedText: acc.formattedText + first(acc.remainingText),
        remainingText: rest(acc.remainingText)
      };
    }, {formattedText: '', remainingText: text.split('')});
    return formattedObject.formattedText + formattedObject.remainingText.join('');
  }

  // put the cursor to the end of the input (usually after a focus event)
  _cursorToEnd() {
    let input = this.refs.numberInput.getDOMNode();
    input.focus();
    if (isModernBrowser) {
      let len = input.value.length;
      input.setSelectionRange(len, len);
    }
  }

  getElement(index) {
    return this.refs[`flag_no_${index}`].getDOMNode();
  }

  handleFlagDropdownClick() {
    // need to put the highlight on the current selected country if the dropdown is going to open up
    this.setState({
      showDropDown: !this.state.showDropDown,
      highlightCountry: findWhere(this.state.onlyCountries, this.state.selectedCountry),
      highlightCountryIndex: findIndex(this.state.onlyCountries, this.state.selectedCountry)
    }, () => {
      if(this.state.showDropDown) {
        this.scrollTo(this.getElement(this.state.highlightCountryIndex + this.state.preferredCountries.length));
      }
    });
  }

  handleInput(event) {

    let formattedNumber = '+', newSelectedCountry = this.state.selectedCountry, freezeSelection = this.state.freezeSelection;

    //Does not exceed 16 digit phone number limit
    if(event.target.value.replace(/\D/g, '').length > 16) {
      return;
    }

    // if the input is the same as before, must be some special key like enter etc.
    if(event.target.value === this.state.formattedNumber) {
      return;
    }

    // ie hack
    if(event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }

    if(event.target.value.length > 0) {
      // before entering the number in new format, lets check if the dial code now matches some other country
      let inputNumber = event.target.value.replace(/\D/g, '');

      // we don't need to send the whole number to guess the country... only the first 6 characters are enough
      // the guess country function can then use memoization much more effectively since the set of input it gets has drastically reduced
      if(!this.state.freezeSelection || this.state.selectedCountry.dialCode.length > inputNumber.length) {
        newSelectedCountry = this.guessSelectedCountry(inputNumber.substring(0, 6));
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
      selectedCountry: newSelectedCountry.dialCode.length > 0 ? newSelectedCountry : this.state.selectedCountry
    }, function() {
      if(isModernBrowser) {
        if(diff > 0) {
          caretPosition = caretPosition - diff;
        }

        if(caretPosition > 0 && oldFormattedText.length >= formattedNumber.length) {
          this.refs.numberInput.getDOMNode().setSelectionRange(caretPosition, caretPosition);
        }
      }

      if(this.props.onChange) {
        this.props.onChange(this.state.formattedNumber);
      }
    });
  }

  handleInputClick() {
    this.setState({showDropDown: false});
  }

  handleFlagItemClick(country) {
    let currentSelectedCountry = this.state.selectedCountry;
    let nextSelectedCountry = findWhere(this.state.onlyCountries, country);

    if(currentSelectedCountry.iso2 !== nextSelectedCountry.iso2) {
        // TODO - the below replacement is a bug. It will replace stuff from middle too
      let newNumber = this.state.formattedNumber.replace(currentSelectedCountry.dialCode, nextSelectedCountry.dialCode);
      let formattedNumber = this.formatNumber(newNumber.replace(/\D/g, ''), nextSelectedCountry.format);

      this.setState({
        showDropDown: false,
        selectedCountry: nextSelectedCountry,
        freezeSelection: true,
        formattedNumber: formattedNumber
      }, function() {
        this._cursorToEnd();
        if(this.props.onChange) {
          this.props.onChange(formattedNumber);
        }
      });
    }
  }

  handleInputFocus() {
    // if the input is blank, insert dial code of the selected country
    if(this.refs.numberInput.getDOMNode().value === '+') {
      this.setState({formattedNumber: '+' + this.state.selectedCountry.dialCode});
    }
  }

  _getHighlightCountryIndex(direction) {
    // had to write own function because underscore does not have findIndex. lodash has it
    var highlightCountryIndex = this.state.highlightCountryIndex + direction;

    if(highlightCountryIndex < 0
      || highlightCountryIndex >= (this.state.onlyCountries.length  + this.state.preferredCountries.length)) {
      return highlightCountryIndex - direction;
    }

    return highlightCountryIndex;
  }

  searchCountry() {
    const probableCandidate = this._searchCountry(this.state.queryString) || this.state.onlyCountries[0];
    const probableCandidateIndex = findIndex(this.state.onlyCountries, probableCandidate) + this.state.preferredCountries.length;

    this.scrollTo(this.getElement(probableCandidateIndex), true);

    this.setState({
      queryString: '',
      highlightCountryIndex: probableCandidateIndex
    });
  }

  handleKeydown(event) {
    if(!this.state.showDropDown) {
      return;
    }

    // ie hack
    if(event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }

    function _moveHighlight(direction) {
      this.setState({
        highlightCountryIndex: this._getHighlightCountryIndex(direction)
      }, () => {
        this.scrollTo(this.getElement(this.state.highlightCountryIndex), true);
      });
    }

    switch(event.which) {
      case keys.DOWN:
        _moveHighlight(1);
        break;
      case keys.UP:
        _moveHighlight(-1);
        break;
      case keys.ENTER:
        this.handleFlagItemClick(this.state.onlyCountries[this.state.highlightCountryIndex], event);
        break;
      case keys.ESC:
        this.setState({showDropDown: false}, this._cursorToEnd);
        break;
      default:
        if ((event.which >= keys.A && event.which <= keys.Z) || event.which === keys.SPACE) {
          this.setState({
            queryString: this.state.queryString + String.fromCharCode(event.which)
          }, this.state.debouncedQueryStingSearcher);
        }
    }
  }

  handleInputKeyDown(event) {
    if(event.which === keys.ENTER) {
      this.props.onEnterKeyPress(event);
    }
  }

  handleClickOutside() {
    if(this.state.showDropDown) {
      this.setState({
        showDropDown: false
      });
    }
  }

  getCountryDropDownList() {
    let countryDropDownList = map(this.state.preferredCountries.concat(this.state.onlyCountries), function(country, index) {
      let itemClasses = classNames({
        country: true,
        preferred: country.iso2 === 'us' || country.iso2 === 'gb',
        active: country.iso2 === 'us',
        highlight: this.state.highlightCountryIndex === index
      });

      let inputFlagClasses = `flag ${country.iso2}`;

      return (
        <li
          ref={`flag_no_${index}`}
          key={`flag_no_${index}`}
          data-flag-key={`flag_no_${index}`}
          className={itemClasses}
          data-dial-code="1"
          data-country-code={country.iso2}
          onClick={this.handleFlagItemClick.bind(this, country)}>
          <div className={inputFlagClasses} />
          <span className='country-name'>{country.name}</span>
          <span className='dial-code'>{'+' + country.dialCode}</span>
        </li>
      );
    }, this);

    const dashedLi = (<li key={'dashes'} className='divider' />);
    // let's insert a dashed line in between preffered countries and the rest
    countryDropDownList.splice(this.state.preferredCountries.length, 0, dashedLi);

    const dropDownClasses = classNames({
      'country-list': true,
      'hide': !this.state.showDropDown
    });

    return (
      <ul ref="flagDropdownList" className={dropDownClasses}>
        {countryDropDownList}
      </ul>
    );
  }

  render() {
    let arrowClasses = classNames({
      "arrow": true,
      "up": this.state.showDropDown
    });
    let inputClasses = classNames({
      "form-control": true,
      "invalid-number": !this.props.isValid(this.state.formattedNumber.replace(/\D/g, ''))
    });

    let flagViewClasses = classNames({
      "flag-dropdown": true,
      "open-dropdown": this.state.showDropDown
    });

    let inputFlagClasses = `flag ${this.state.selectedCountry.iso2}`;

    return (
      <div className="react-tel-input">
        <input
          onChange={this.handleInput}
          onClick={this.handleInputClick}
          onFocus={this.handleInputFocus}
          onKeyDown={this.handleInputKeyDown}
          value={this.state.formattedNumber}
          ref="numberInput"
          type="tel"
          className={inputClasses}
          placeholder="+1 (702) 123-4567"/>
        <div ref="flagDropDownButton" className={flagViewClasses} onKeyDown={this.handleKeydown} >
          <div ref='selectedFlag' onClick={this.handleFlagDropdownClick} className='selected-flag' title={`${this.state.selectedCountry.name}: + ${this.state.selectedCountry.dialCode}`}>
            <div className={inputFlagClasses}>
              <div className={arrowClasses}></div>
            </div>
          </div>
          {this.state.showDropDown ? this.getCountryDropDownList() : ''}
        </div>
      </div>
    );
  }
}
ReactPhoneInput.prototype._searchCountry = memoize(function(queryString){
  if(!queryString || queryString.length === 0) {
    return null;
  }
  // don't include the preferred countries in search
  let probableCountries = filter(this.state.onlyCountries, function(country) {
    return startsWith(country.name.toLowerCase(), queryString.toLowerCase());
  }, this);
  return probableCountries[0];
});

ReactPhoneInput.prototype.guessSelectedCountry = memoize(function(inputNumber) {
  var secondBestGuess = findWhere(allCountries, {iso2: this.props.defaultCountry}) || this.state.onlyCountries[0];
  if(trim(inputNumber) !== '') {
      var bestGuess = reduce(this.state.onlyCountries, function(selectedCountry, country) {
                      if(startsWith(inputNumber, country.dialCode)) {
                          if(country.dialCode.length > selectedCountry.dialCode.length) {
                              return country;
                          }
                          if(country.dialCode.length === selectedCountry.dialCode.length && country.priority < selectedCountry.priority) {
                              return country;
                          }
                      }

                      return selectedCountry;
                  }, {dialCode: '', priority: 10001}, this);
  } else {
      return secondBestGuess;
  }

  if(!bestGuess.name) {
      return secondBestGuess;
  }

  return bestGuess;
});

ReactPhoneInput.defaultProps = {
  value: '',
  autoFormat: true,
  onlyCountries: [],
  excludeCountries: [],
  defaultCountry: allCountries[0].iso2,
  isValid: isNumberValid,
  flagsImagePath: './flags.png',
  onEnterKeyPress: function () {}
};

ReactPhoneInput.propTypes = {
    value: React.PropTypes.string,
    autoFormat: React.PropTypes.bool,
    defaultCountry: React.PropTypes.string,
    onlyCountries: React.PropTypes.arrayOf(React.PropTypes.string),
    preferredCountries: React.PropTypes.arrayOf(React.PropTypes.string),
    onChange: React.PropTypes.func
};

export default ReactPhoneInput;

// React.render(
//   <ReactPhoneInput defaultCountry={'us'} preferredCountries={['us', 'de']} excludeCountries={'in'}/>,
//   document.getElementById('content'));
