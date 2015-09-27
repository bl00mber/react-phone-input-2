// TODO - fix the onlyContries props. Currently expects that as an array of country object, but users should be able to send in array of country isos

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _reactAddonsJs = require('react/addons.js');

var _reactAddonsJs2 = _interopRequireDefault(_reactAddonsJs);

var _country_dataJs = require('./country_data.js');

var _country_dataJs2 = _interopRequireDefault(_country_dataJs);

var allCountries = _country_dataJs2['default'].allCountries;

var isModernBrowser = Boolean(document.createElement('input').setSelectionRange);

var keys = {
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
  var countries = _country_dataJs2['default'].allCountries;
  return _lodash2['default'].some(countries, function (country) {
    return startsWith(inputNumber, country.dialCode) || startsWith(country.dialCode, inputNumber);
  });
}

var ReactPhoneInput = (function (_React$Component) {
  _inherits(ReactPhoneInput, _React$Component);

  function ReactPhoneInput(props) {
    _classCallCheck(this, ReactPhoneInput);

    _get(Object.getPrototypeOf(ReactPhoneInput.prototype), 'constructor', this).call(this, props);
    var selectedCountryGuess = undefined,
        selectedCountryGuessIndex = undefined,
        inputNumber = this.props.value || '';

    if (this.trim(inputNumber) !== '') {
      selectedCountryGuess = this.guessSelectedCountry(inputNumber.replace(/\D/g, ''));

      if (!selectedCountryGuess || !selectedCountryGuess.name) {
        selectedCountryGuess = _lodash2['default'].findWhere(allCountries, { iso2: this.props.defaultCountry }) || this.props.onlyCountries[0];
      }
    } else {
      selectedCountryGuess = _lodash2['default'].findWhere(allCountries, { iso2: this.props.defaultCountry }) || this.props.onlyCountries[0];
    }

    selectedCountryGuessIndex = _lodash2['default'].findIndex(allCountries, selectedCountryGuess);
    var formattedNumber = this.formatNumber(inputNumber.replace(/\D/g, ''), selectedCountryGuess ? selectedCountryGuess.format : null);

    var preferredCountries = _lodash2['default'].filter(allCountries, function (country) {
      return _lodash2['default'].any(this.props.preferredCountries, function (preferredCountry) {
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
      debouncedQueryStingSearcher: _lodash2['default'].debounce(this.searchCountry, 300)
    };
  }

  _createClass(ReactPhoneInput, [{
    key: 'trim',
    value: function trim(str) {
      return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }
  }, {
    key: 'getNumber',
    value: function getNumber() {
      return this.state.formattedNumber !== '+' ? this.state.formattedNumber : '';
    }
  }, {
    key: 'getValue',
    value: function getValue() {
      return this.getNumber();
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      document.addEventListener('keydown', this.handleKeydown);
      document.addEventListener('click', this.handleDocumentClick);

      this._cursorToEnd();
      this.props.onChange && this.props.onChange(this.state.formattedNumber);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      document.removeEventListener('keydown', this.handleKeydown);
      document.removeEventListener('click', this.handleDocumentClick);
    }
  }, {
    key: 'scrollTo',
    value: function scrollTo(country, middle) {
      if (!country) return;

      var container = this.refs.flagDropdownList.getDOMNode();

      if (!container) return;

      var containerHeight = container.offsetHeight;
      var containerOffset = container.getBoundingClientRect();
      var containerTop = containerOffset.top + document.body.scrollTop;
      var containerBottom = containerTop + containerHeight;

      var element = country;
      var elementOffset = element.getBoundingClientRect();

      var elementHeight = element.offsetHeight;
      var elementTop = elementOffset.top + document.body.scrollTop;
      var elementBottom = elementTop + elementHeight;
      var newScrollTop = elementTop - containerTop + container.scrollTop;
      var middleOffset = containerHeight / 2 - elementHeight / 2;

      if (elementTop < containerTop) {
        // scroll up
        if (middle) {
          newScrollTop -= middleOffset;
        }
        container.scrollTop = newScrollTop;
      } else if (elementBottom > containerBottom) {
        // scroll down
        if (middle) {
          newScrollTop += middleOffset;
        }
        var heightDifference = containerHeight - elementHeight;
        container.scrollTop = newScrollTop - heightDifference;
      }
    }
  }, {
    key: 'formatNumber',
    value: function formatNumber(text, pattern) {
      if (!text || text.length === 0) {
        return '+';
      }

      // for all strings with length less than 3, just return it (1, 2 etc.)
      // also return the same text if the selected country has no fixed format
      if (text && text.length < 2 || !pattern || !this.props.autoFormat) {
        return '+' + text;
      }

      var formattedObject = _lodash2['default'].reduce(pattern, function (formattedObject, character, key) {
        if (formattedObject.remainingText.length === 0) {
          return formattedObject;
        }

        if (character !== '.') {
          return {
            formattedText: formattedObject.formattedText + character,
            remainingText: formattedObject.remainingText
          };
        }

        return {
          formattedText: formattedObject.formattedText + _lodash2['default'].first(formattedObject.remainingText),
          remainingText: _lodash2['default'].rest(formattedObject.remainingText)
        };
      }, { formattedText: "", remainingText: text.split('') });
      return formattedObject.formattedText + formattedObject.remainingText.join("");
    }

    // put the cursor to the end of the input (usually after a focus event)
  }, {
    key: '_cursorToEnd',
    value: function _cursorToEnd() {
      var input = this.refs.numberInput.getDOMNode();
      input.focus();
      if (isModernBrowser) {
        var len = input.value.length;
        input.setSelectionRange(len, len);
      }
    }
  }, {
    key: 'getElement',
    value: function getElement(index) {
      console.log('index of country to jump to: ', index);
      return this.refs['flag_no_' + index].getDOMNode();
    }
  }, {
    key: 'handleFlagDropdownClick',
    value: function handleFlagDropdownClick() {
      // need to put the highlight on the current selected country if the dropdown is going to open up
      var self = this;
      this.setState({
        showDropDown: !this.state.showDropDown,
        highlightCountry: _lodash2['default'].findWhere(this.props.onlyCountries, this.state.selectedCountry),
        highlightCountryIndex: _lodash2['default'].findIndex(this.props.onlyCountries, this.state.selectedCountry)
      }, function () {
        self.scrollTo(self.getElement(self.state.highlightCountryIndex + self.state.preferredCountries.length));
      });
    }

    // TODO: handle
  }, {
    key: 'handleInput',
    value: function handleInput(event) {

      var formattedNumber = '+',
          newSelectedCountry = this.state.selectedCountry,
          freezeSelection = this.state.freezeSelection;

      // if the input is the same as before, must be some special key like enter etc.
      if (event.target.value === this.state.formattedNumber) {
        return;
      }

      // ie hack
      event.preventDefault ? event.preventDefault() : event.returnValue = false;

      if (event.target.value.length > 0) {
        // before entering the number in new format, lets check if the dial code now matches some other country
        var inputNumber = event.target.value.replace(/\D/g, '');

        // we don't need to send the whole number to guess the country... only the first 6 characters are enough
        // the guess country function can then use memoization much more effectively since the set of input it gets has drastically reduced
        if (!this.state.freezeSelection || this.state.selectedCountry.dialCode.length > inputNumber.length) {
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
      }, function () {
        if (isModernBrowser) {
          if (diff > 0) {
            caretPosition = caretPosition - diff;
          }

          if (caretPosition > 0 && oldFormattedText.length >= formattedNumber.length) {
            this.refs.numberInput.getDOMNode().setSelectionRange(caretPosition, caretPosition);
          }
        }

        if (this.props.onChange) {
          this.props.onChange(this.state.formattedNumber);
        }
      });
    }
  }, {
    key: 'handleInputClick',
    value: function handleInputClick() {
      this.setState({ showDropDown: false });
    }
  }, {
    key: 'handleFlagItemClick',
    value: function handleFlagItemClick(country, event) {
      var currentSelectedCountry = this.state.selectedCountry;
      // var nextSelectedCountry = this.props.onlyCountries[countryIndex];
      var nextSelectedCountry = _lodash2['default'].findWhere(this.props.onlyCountries, country);
      var newNumber = this.state.formattedNumber.replace(currentSelectedCountry.dialCode, nextSelectedCountry.dialCode);
      var formattedNumber = this.formatNumber(newNumber.replace(/\D/g, ''), nextSelectedCountry.format);

      this.setState({
        showDropDown: false,
        selectedCountry: nextSelectedCountry,
        freezeSelection: true,
        formattedNumber: formattedNumber
      }, function () {
        this._cursorToEnd();
        this.props.onChange && this.props.onChange(formattedNumber);
      });
    }
  }, {
    key: 'handleInputFocus',
    value: function handleInputFocus() {
      // if the input is blank, insert dial code of the selected country
      if (this.refs.numberInput.getDOMNode().value === '+') {
        this.setState({ formattedNumber: '+' + this.state.selectedCountry.dialCode });
      }
    }
  }, {
    key: '_findIndexOfCountry',
    value: function _findIndexOfCountry(allCountries, countryToFind, startIndex) {
      if (!startIndex) startIndex = 0;
      for (var i = startIndex; i < allCountries.length; i++) {
        if (allCountries[i].iso2 === countryToFind.iso2) {
          return i;
        }
      }
      return -1;
    }
  }, {
    key: '_getHighlightCountryIndex',
    value: function _getHighlightCountryIndex(direction) {
      // had to write own function because underscore does not have findIndex. lodash has it
      var highlightCountryIndex = this.state.highlightCountryIndex + direction;

      if (highlightCountryIndex < 0 || highlightCountryIndex >= this.props.onlyCountries.length + this.state.preferredCountries.length) {
        return highlightCountryIndex - direction;
      }

      return highlightCountryIndex;
    }
  }, {
    key: 'searchCountry',
    value: function searchCountry() {
      var probableCandidate = this._searchCountry(this.state.queryString) || this.props.onlyCountries[0];
      var probableCandidateIndex = _lodash2['default'].findIndex(this.props.onlyCountries, probableCandidate) + this.state.preferredCountries.length;
      console.log('probable candidate index: ', probableCandidateIndex);
      console.log('preferred country length: ', this.state.preferredCountries.length);
      this.scrollTo(this.getElement(probableCandidateIndex), true);

      this.setState({
        queryString: "",
        highlightCountryIndex: probableCandidateIndex
      });
    }
  }, {
    key: 'handleKeydown',
    value: function handleKeydown(event) {
      if (!this.state.showDropDown) {
        return;
      }

      // ie hack
      event.preventDefault ? event.preventDefault() : event.returnValue = false;
      var self = this;
      function _moveHighlight(direction) {
        self.setState({
          highlightCountryIndex: self._getHighlightCountryIndex(direction)
        }, function () {
          self.scrollTo(self.getElement(self.state.highlightCountryIndex), true);
        });
      }

      switch (event.which) {
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
          this.setState({ showDropDown: false }, this._cursorToEnd);
        default:
          if (event.which >= keys.A && event.which <= keys.Z || event.which === keys.SPACE) {
            this.setState({ queryString: this.state.queryString + String.fromCharCode(event.which) }, this.state.debouncedQueryStingSearcher);
          }
      }
    }
  }, {
    key: 'handleInputKeyDown',
    value: function handleInputKeyDown(event) {
      if (event.which === keys.ENTER) {
        this.props.onEnterKeyPress();
      }
    }
  }, {
    key: 'handleBlur',
    value: function handleBlur() {
      this.setState({
        showDropDown: false
      });
    }
  }, {
    key: 'isFlagDropDownButtonClicked',
    value: function isFlagDropDownButtonClicked(target) {
      if (!this.refs.flagDropDownButton) return false;

      var flagDropDownButton = this.refs.flagDropDownButton.getDOMNode();
      return flagDropDownButton == target || target.parentNode == flagDropDownButton;
    }
  }, {
    key: 'isFlagItemClicked',
    value: function isFlagItemClicked(target) {
      if (!this.refs.flagDropdownList) return false;

      var dropDownList = this.refs.flagDropdownList.getDOMNode();
      return dropDownList == target || target.parentNode == dropDownList;
    }
  }, {
    key: 'handleDocumentClick',
    value: function handleDocumentClick(event) {
      var target = event.target;

      if (!this.isFlagDropDownButtonClicked(target) && !this.isFlagItemClicked(target) && this.state.showDropDown) {
        this.handleBlur();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var cx = _reactAddonsJs2['default'].addons.classSet;
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

      var dashedLi = _reactAddonsJs2['default'].createElement('li', { key: "dashes", className: 'divider' });

      var countryDropDownList = _lodash2['default'].map(this.state.preferredCountries.concat(this.props.onlyCountries), function (country, index) {
        var itemClasses = cx({
          "country": true,
          "preferred": country.iso2 === 'us' || country.iso2 === 'gb',
          "active": country.iso2 === 'us',
          "highlight": this.state.highlightCountryIndex === index
        });

        return _reactAddonsJs2['default'].createElement(
          'li',
          {
            ref: "flag_no_" + index,
            key: "flag_no_" + index,
            'data-flag-key': "flag_no_" + index,
            className: itemClasses,
            'data-dial-code': '1',
            'data-country-code': country.iso2,
            onClick: this.handleFlagItemClick.bind(this, country) },
          _reactAddonsJs2['default'].createElement('div', { className: "flag " + country.iso2 }),
          _reactAddonsJs2['default'].createElement(
            'span',
            { className: 'country-name' },
            country.name
          ),
          _reactAddonsJs2['default'].createElement(
            'span',
            { className: 'dial-code' },
            '+' + country.dialCode
          )
        );
      }, this);

      // let's insert a dashed line in between preffered countries and the rest
      countryDropDownList.splice(this.state.preferredCountries.length, 0, dashedLi);

      var flagViewClasses = cx({
        "flag-dropdown": true,
        "open-dropdown": this.state.showDropDown
      });

      return _reactAddonsJs2['default'].createElement(
        'div',
        { className: 'react-tel-input' },
        _reactAddonsJs2['default'].createElement('input', {
          onChange: this.handleInput,
          onClick: this.handleInputClick,
          onFocus: this.handleInputFocus,
          onKeyDown: this.handleInputKeyDown,
          value: this.state.formattedNumber,
          ref: 'numberInput',
          type: 'tel',
          className: inputClasses,
          placeholder: '+1 (702) 123-4567' }),
        _reactAddonsJs2['default'].createElement(
          'div',
          { ref: 'flagDropDownButton', className: flagViewClasses, onKeyDown: this.handleKeydown },
          _reactAddonsJs2['default'].createElement(
            'div',
            { ref: 'selectedFlag', onClick: this.handleFlagDropdownClick, className: 'selected-flag', title: this.state.selectedCountry.name + ": +" + this.state.selectedCountry.dialCode },
            _reactAddonsJs2['default'].createElement(
              'div',
              { className: "flag " + this.state.selectedCountry.iso2 },
              _reactAddonsJs2['default'].createElement('div', { className: arrowClasses })
            )
          ),
          _reactAddonsJs2['default'].createElement(
            'ul',
            { ref: 'flagDropdownList', className: dropDownClasses },
            countryDropDownList
          )
        )
      );
    }
  }]);

  return ReactPhoneInput;
})(_reactAddonsJs2['default'].Component);

ReactPhoneInput.prototype._searchCountry = _lodash2['default'].memoize(function (queryString) {
  if (!queryString || queryString.length === 0) {
    return null;
  }
  // don't include the preferred countries in search
  var probableCountries = _lodash2['default'].filter(this.props.onlyCountries, function (country) {
    return startsWith(country.name.toLowerCase(), queryString.toLowerCase());
  }, this);
  return probableCountries[0];
  var self = this;
});

ReactPhoneInput.prototype.guessSelectedCountry = _lodash2['default'].memoize(function (inputNumber) {
  return _lodash2['default'].reduce(this.props.onlyCountries, function (selectedCountry, country) {
    if (startsWith(inputNumber, country.dialCode)) {
      if (country.dialCode.length > selectedCountry.dialCode.length) {
        return country;
      }
      if (country.dialCode.length === selectedCountry.dialCode.length && country.priority < selectedCountry.priority) {
        return country;
      }
    }
    return selectedCountry;
  }, { dialCode: '', priority: 10001 }, this);
});

ReactPhoneInput.defaultProps = {
  value: '',
  autoFormat: true,
  onlyCountries: allCountries,
  defaultCountry: allCountries[0].iso2,
  isValid: isNumberValid
};

ReactPhoneInput.propTypes = {
  value: _reactAddonsJs2['default'].PropTypes.string,
  autoFormat: _reactAddonsJs2['default'].PropTypes.bool,
  defaultCountry: _reactAddonsJs2['default'].PropTypes.string,
  onlyCountries: _reactAddonsJs2['default'].PropTypes.arrayOf(_reactAddonsJs2['default'].PropTypes.string),
  preferredCountries: _reactAddonsJs2['default'].PropTypes.arrayOf(_reactAddonsJs2['default'].PropTypes.string),
  onChange: _reactAddonsJs2['default'].PropTypes.func
};

exports['default'] = ReactPhoneInput;
module.exports = exports['default'];

