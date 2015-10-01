// TODO - fix the onlyContries props. Currently expects that as an array of country object, but users should be able to send in array of country isos

import _ from 'lodash';
import React from 'react/addons.js';
import countryData from './country_data.js';
let allCountries = countryData.allCountries;

var style = require('./react-phone-input-style.less');

var isModernBrowser = Boolean(document.createElement('input').setSelectionRange);

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

// function to check if string s1 starts with s2
function startsWith(s1, s2) {
  // could have done with s1.indexOf(s2) === 0. But indexOf is O(n)
  return s1.slice(0, s2.length) === s2;
}

function isNumberValid(inputNumber) {
  var countries = countryData.allCountries;
  return _.some(countries, function(country) {
    return startsWith(inputNumber, country.dialCode) || startsWith(country.dialCode, inputNumber);
  });
}

class ReactPhoneInput extends React.Component {

  constructor(props) {
    super(props);
    let selectedCountryGuess, selectedCountryGuessIndex, inputNumber = this.props.value || '';

    if (this.trim(inputNumber) !== '') {
      selectedCountryGuess = this.guessSelectedCountry(inputNumber.replace(/\D/g, ''));

      if (!selectedCountryGuess || !selectedCountryGuess.name) {
        selectedCountryGuess = _.findWhere(allCountries, {iso2: this.props.defaultCountry})  || this.props.onlyCountries[0];
      }
    } else {
      selectedCountryGuess = _.findWhere(allCountries, {iso2: this.props.defaultCountry}) || this.props.onlyCountries[0];
    }

    selectedCountryGuessIndex = _.findIndex(allCountries, selectedCountryGuess);
    let formattedNumber = this.formatNumber(inputNumber.replace(/\D/g, ''), selectedCountryGuess ? selectedCountryGuess.format : null);

    let preferredCountries = _.filter(allCountries, function(country) {
      return _.any(this.props.preferredCountries, function(preferredCountry) {
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
    this.handleBlur = this.handleBlur.bind(this);
    this.isFlagDropDownButtonClicked = this.isFlagDropDownButtonClicked.bind(this);
    this.isFlagItemClicked = this.isFlagItemClicked.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);

    this.state = {
      preferredCountries: preferredCountries,
      selectedCountry: selectedCountryGuess,
      // highlightCountry: selectedCountryGuess,
      highlightCountryIndex: selectedCountryGuessIndex,
      formattedNumber: formattedNumber,
      showDropDown: false,
      queryString: "",
      freezeSelection: false,
      debouncedQueryStingSearcher: _.debounce(this.searchCountry, 300)
    };

  }

  trim(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }

  getNumber() {
    return this.state.formattedNumber !== '+' ? this.state.formattedNumber : '';
  }

  getValue() {
    return this.getNumber();
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('click', this.handleDocumentClick);

    this._cursorToEnd();
    this.props.onChange && this.props.onChange(this.state.formattedNumber);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('click', this.handleDocumentClick);
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
    if (!text || text.length === 0) {
      return '+';
    }

    // for all strings with length less than 3, just return it (1, 2 etc.)
    // also return the same text if the selected country has no fixed format
    if ((text && text.length < 2) || !pattern || !this.props.autoFormat) {
      return '+' + text;
    }

    let formattedObject = _.reduce(pattern, function(formattedObject, character, key) {
      if(formattedObject.remainingText.length === 0) {
        return formattedObject;
      }

      if(character !== '.') {
        return {
          formattedText: formattedObject.formattedText + character,
          remainingText: formattedObject.remainingText
        }
      }

      return {
        formattedText: formattedObject.formattedText + _.first(formattedObject.remainingText),
        remainingText: _.rest(formattedObject.remainingText)
      }
    }, {formattedText: "", remainingText: text.split('')});
    return formattedObject.formattedText + formattedObject.remainingText.join("");
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
    console.log('index of country to jump to: ', index);
    return this.refs['flag_no_'+index].getDOMNode();
  }

  handleFlagDropdownClick() {
    // need to put the highlight on the current selected country if the dropdown is going to open up
    let self = this;
    this.setState({
      showDropDown: !this.state.showDropDown,
      highlightCountry: _.findWhere(this.props.onlyCountries, this.state.selectedCountry),
      highlightCountryIndex: _.findIndex(this.props.onlyCountries, this.state.selectedCountry)
    }, function() {
      self.scrollTo(self.getElement(self.state.highlightCountryIndex + self.state.preferredCountries.length));
    });
  }

  // TODO: handle
  handleInput(event) {

    var formattedNumber = '+', newSelectedCountry = this.state.selectedCountry, freezeSelection = this.state.freezeSelection;


    // if the input is the same as before, must be some special key like enter etc.
    if(event.target.value === this.state.formattedNumber) {
      return;
    }

    // ie hack
    event.preventDefault ? event.preventDefault() : event.returnValue = false;

    if(event.target.value.length > 0) {
      // before entering the number in new format, lets check if the dial code now matches some other country
      var inputNumber = event.target.value.replace(/\D/g, '');

      // we don't need to send the whole number to guess the country... only the first 6 characters are enough
      // the guess country function can then use memoization much more effectively since the set of input it gets has drastically reduced
      if(!this.state.freezeSelection || this.state.selectedCountry.dialCode.length > inputNumber.length) {
        newSelectedCountry = this.guessSelectedCountry(inputNumber.substring(0, 6));
        freezeSelection = false;
      }
      // let us remove all non numerals from the input
      formattedNumber = this.formatNumber(inputNumber, newSelectedCountry.format);
    }

    var caretPosition = event.target.selectionStart;
    var oldFormattedText = this.state.formattedNumber;
    var diff = formattedNumber.length - oldFormattedText.length;

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

  handleFlagItemClick(country, event) {
    var currentSelectedCountry = this.state.selectedCountry;
    // var nextSelectedCountry = this.props.onlyCountries[countryIndex];
    var nextSelectedCountry = _.findWhere(this.props.onlyCountries, country);
    var newNumber = this.state.formattedNumber.replace(currentSelectedCountry.dialCode, nextSelectedCountry.dialCode);
    var formattedNumber = this.formatNumber(newNumber.replace(/\D/g, ''), nextSelectedCountry.format);

    this.setState({
      showDropDown: false,
      selectedCountry: nextSelectedCountry,
      freezeSelection: true,
      formattedNumber: formattedNumber
    }, function() {
      this._cursorToEnd();
      this.props.onChange && this.props.onChange(formattedNumber);
    });
  }

  handleInputFocus() {
    // if the input is blank, insert dial code of the selected country
    if(this.refs.numberInput.getDOMNode().value === '+') {
      this.setState({formattedNumber: '+' + this.state.selectedCountry.dialCode});
    }
  }

  _findIndexOfCountry(allCountries, countryToFind, startIndex) {
    if(!startIndex) startIndex = 0;
    for(var i = startIndex; i < allCountries.length; i++) {
      if(allCountries[i].iso2 === countryToFind.iso2) {
        return i;
      }
    }
    return -1;
  }

  _getHighlightCountryIndex(direction) {
    // had to write own function because underscore does not have findIndex. lodash has it
    var highlightCountryIndex = this.state.highlightCountryIndex + direction;

    if(highlightCountryIndex < 0
      || highlightCountryIndex >= (this.props.onlyCountries.length  + this.state.preferredCountries.length)) {
      return highlightCountryIndex - direction;
    }

    return highlightCountryIndex;
  }

  searchCountry() {
    var probableCandidate = this._searchCountry(this.state.queryString) || this.props.onlyCountries[0];
    var probableCandidateIndex = _.findIndex(this.props.onlyCountries, probableCandidate) + this.state.preferredCountries.length;
    console.log('probable candidate index: ', probableCandidateIndex);
    console.log('preferred country length: ', this.state.preferredCountries.length);
    this.scrollTo(this.getElement(probableCandidateIndex), true);

    this.setState({
      queryString: "",
      highlightCountryIndex: probableCandidateIndex
    });
  }

  handleKeydown(event) {
    if(!this.state.showDropDown) {
      return;
    }

    // ie hack
    event.preventDefault ? event.preventDefault() : event.returnValue = false;
    var self = this;
    function _moveHighlight(direction) {
      self.setState({
        highlightCountryIndex: self._getHighlightCountryIndex(direction)
      }, function() {
        self.scrollTo(self.getElement(self.state.highlightCountryIndex), true);
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
        this.handleFlagItemClick(this.props.onlyCountries[this.state.highlightCountryIndex], event);
        break;
      case keys.ESC:
        this.setState({showDropDown: false}, this._cursorToEnd);
      default:
        if((event.which >= keys.A && event.which <= keys.Z) || event.which === keys.SPACE) {
          this.setState({queryString: this.state.queryString+String.fromCharCode(event.which)},
            this.state.debouncedQueryStingSearcher);
        }
    }
  }

  handleInputKeyDown(event) {
    if(event.which === keys.ENTER) {
      this.props.onEnterKeyPress();
    }
  }

  handleBlur() {
    this.setState({
      showDropDown: false
    });
  }

  isFlagDropDownButtonClicked(target) {
    if(!this.refs.flagDropDownButton) return false;

    var flagDropDownButton = this.refs.flagDropDownButton.getDOMNode();
    return flagDropDownButton == target || target.parentNode == flagDropDownButton;
  }

  isFlagItemClicked(target) {
    if(!this.refs.flagDropdownList) return false;

    var dropDownList = this.refs.flagDropdownList.getDOMNode();
    return dropDownList == target || target.parentNode == dropDownList;
  }

  handleDocumentClick(event) {
    var target = event.target;

    if(!this.isFlagDropDownButtonClicked(target) && !this.isFlagItemClicked(target) && this.state.showDropDown) {
      this.handleBlur();
    }
  }

  render() {
    var cx = React.addons.classSet;
    var dropDownClasses = cx({
      "country-list": true,
      "hide": !this.state.showDropDown
    });
    var arrowClasses = cx({
      "arrow": true,
      "up": this.state.showDropDown
    });
    var inputClasses = cx({
      "form-control": true,
      "invalid-number": !this.props.isValid(this.state.formattedNumber.replace(/\D/g, ''))
    });

    var dashedLi = (<li key={"dashes"} className="divider" />);

    var countryDropDownList = _.map(this.state.preferredCountries.concat(this.props.onlyCountries), function(country, index) {
      var itemClasses = cx({
        "country": true,
        "preferred": country.iso2 === 'us' || country.iso2 === 'gb',
        "active": country.iso2 === 'us',
        "highlight": this.state.highlightCountryIndex === index
      });

      return (
        <li
          ref={"flag_no_" + index}
          key={"flag_no_" + index}
          data-flag-key={"flag_no_" + index}
          className={itemClasses}
          data-dial-code="1"
          data-country-code={country.iso2}
          onClick={this.handleFlagItemClick.bind(this, country)}>
          <div className={"flag " + country.iso2} />
          <span className="country-name">{country.name}</span>
          <span className="dial-code">{'+'+country.dialCode}</span>
        </li>
      );
    }, this);

    // let's insert a dashed line in between preffered countries and the rest
    countryDropDownList.splice(this.state.preferredCountries.length, 0, dashedLi);

    var flagViewClasses = cx({
      "flag-dropdown": true,
      "open-dropdown": this.state.showDropDown
    });

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
          <div ref="selectedFlag" onClick={this.handleFlagDropdownClick} className="selected-flag" title={this.state.selectedCountry.name+": +" + this.state.selectedCountry.dialCode}>
            <div className={"flag "+this.state.selectedCountry.iso2}>
              <div className={arrowClasses}></div>
            </div>
          </div>

          <ul ref="flagDropdownList" className={dropDownClasses}>
            {countryDropDownList}
          </ul>
        </div>
      </div>
    );
  }
}
ReactPhoneInput.prototype._searchCountry = _.memoize(function(queryString){
  if(!queryString || queryString.length === 0) {
    return null;
  }
  // don't include the preferred countries in search
  var probableCountries = _.filter(this.props.onlyCountries, function(country) {
    return startsWith(country.name.toLowerCase(), queryString.toLowerCase());
  }, this);
  return probableCountries[0];
  var self = this;
});

ReactPhoneInput.prototype.guessSelectedCountry = _.memoize(function(inputNumber) {
  return _.reduce(this.props.onlyCountries, function(selectedCountry, country) {
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
});

ReactPhoneInput.defaultProps = {
  value: '',
  autoFormat: true,
  onlyCountries: allCountries,
  defaultCountry: allCountries[0].iso2,
  isValid: isNumberValid
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
//   <ReactPhoneInput defaultCountry={'us'} preferredCountries={['us', 'de']}/>,
//   document.getElementById('content'));
