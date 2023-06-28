import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import memoize from 'lodash.memoize';
import reduce from 'lodash.reduce';
import startsWith from 'lodash.startswith';
import classNames from 'classnames';
import './utils/prototypes'

import CountryData from './CountryData.js';

class PhoneInput extends React.Component {
  static propTypes = {
    country: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    value: PropTypes.string,

    onlyCountries: PropTypes.arrayOf(PropTypes.string),
    preferredCountries: PropTypes.arrayOf(PropTypes.string),
    excludeCountries: PropTypes.arrayOf(PropTypes.string),

    placeholder: PropTypes.string,
    searchPlaceholder: PropTypes.string,
    searchNotFound: PropTypes.string,
    disabled: PropTypes.bool,

    containerStyle: PropTypes.object,
    inputStyle: PropTypes.object,
    buttonStyle: PropTypes.object,
    dropdownStyle: PropTypes.object,
    searchStyle: PropTypes.object,

    containerClass: PropTypes.string,
    inputClass: PropTypes.string,
    buttonClass: PropTypes.string,
    dropdownClass: PropTypes.string,
    searchClass: PropTypes.string,
    // for styled-components
    className: PropTypes.string,

    autoFormat: PropTypes.bool,

    enableAreaCodes: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    enableTerritories: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.arrayOf(PropTypes.string)
    ]),

    disableCountryCode: PropTypes.bool,
    disableDropdown: PropTypes.bool,
    enableLongNumbers: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.number
    ]),
    countryCodeEditable: PropTypes.bool,
    enableSearch: PropTypes.bool,
    disableSearchIcon: PropTypes.bool,
    disableInitialCountryGuess: PropTypes.bool,
    disableCountryGuess: PropTypes.bool,

    regions: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),

    inputProps: PropTypes.object,
    localization: PropTypes.object,
    masks: PropTypes.object,
    areaCodes: PropTypes.object,

    preserveOrder: PropTypes.arrayOf(PropTypes.string),

    defaultMask: PropTypes.string,
    alwaysDefaultMask: PropTypes.bool,
    prefix: PropTypes.string,
    copyNumbersOnly: PropTypes.bool,
    renderStringAsFlag: PropTypes.string,
    autocompleteSearch: PropTypes.bool,
    jumpCursorToEnd: PropTypes.bool,
    priority: PropTypes.object,
    enableAreaCodeStretch: PropTypes.bool,
    enableClickOutside: PropTypes.bool,
    showDropdown: PropTypes.bool,

    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onClick: PropTypes.func,
    onKeyDown: PropTypes.func,
    onEnterKeyPress: PropTypes.func,
    onMount: PropTypes.func,
    isValid: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.func,
    ]),
    defaultErrorMessage: PropTypes.string,
    specialLabel: PropTypes.string,
  }

  static defaultProps = {
    country: '',
    value: '',

    onlyCountries: [],
    preferredCountries: [],
    excludeCountries: [],

    placeholder: '1 (702) 123-4567',
    searchPlaceholder: 'search',
    searchNotFound: 'No entries to show',
    flagsImagePath: './flags.png',
    disabled: false,

    containerStyle: {},
    inputStyle: {},
    buttonStyle: {},
    dropdownStyle: {},
    searchStyle: {},

    containerClass: '',
    inputClass: '',
    buttonClass: '',
    dropdownClass: '',
    searchClass: '',
    className: '',

    autoFormat: true,
    enableAreaCodes: false,
    enableTerritories: false,
    disableCountryCode: false,
    disableDropdown: false,
    enableLongNumbers: false,
    countryCodeEditable: true,
    enableSearch: false,
    disableSearchIcon: false,
    disableInitialCountryGuess: false,
    disableCountryGuess: false,

    regions: '',

    inputProps: {},
    localization: {},

    masks: null,
    priority: null,
    areaCodes: null,

    preserveOrder: [],

    defaultMask: '... ... ... ... ..', // prefix+dialCode+' '+defaultMask
    alwaysDefaultMask: false,
    prefix: '+',
    copyNumbersOnly: true,
    renderStringAsFlag: '',
    autocompleteSearch: false,
    jumpCursorToEnd: true,
    enableAreaCodeStretch: false,
    enableClickOutside: true,
    showDropdown: false,

    isValid: true, // (value, selectedCountry, onlyCountries, hiddenAreaCodes) => true | false | 'Message'
    defaultErrorMessage: '',
    specialLabel: 'Phone',

    onEnterKeyPress: null, // null or function

    keys: {
      UP: 38, DOWN: 40, RIGHT: 39, LEFT: 37, ENTER: 13,
      ESC: 27, PLUS: 43, A: 65, Z: 90, SPACE: 32, TAB: 9,
    }
  }

  constructor(props) {
    super(props);
    const { onlyCountries, preferredCountries, hiddenAreaCodes } = new CountryData(
      props.enableAreaCodes, props.enableTerritories, props.regions,
      props.onlyCountries, props.preferredCountries, props.excludeCountries, props.preserveOrder,
      props.masks, props.priority, props.areaCodes, props.localization,
      props.prefix, props.defaultMask, props.alwaysDefaultMask,
    );

    const inputNumber = props.value ? props.value.replace(/\D/g, '') : '';

    let countryGuess;
    if (props.disableInitialCountryGuess) {
      countryGuess = 0;
    } else if (inputNumber.length > 1) {
      // Country detect by phone
      countryGuess = this.guessSelectedCountry(inputNumber.substring(0, 6), props.country, onlyCountries, hiddenAreaCodes) || 0;
    } else if (props.country) {
      // Default country
      countryGuess = onlyCountries.find(o => o.iso2 == props.country) || 0;
    } else {
      // Empty params
      countryGuess = 0;
    }

    const dialCode = (
      inputNumber.length < 2 &&
      countryGuess &&
      !startsWith(inputNumber, countryGuess.dialCode)
    ) ? countryGuess.dialCode : '';

    let formattedNumber;
    formattedNumber = (inputNumber === '' && countryGuess === 0) ? '' :
    this.formatNumber(
      (props.disableCountryCode ? '' : dialCode) + inputNumber,
      countryGuess.name ? countryGuess : undefined
    );

    const highlightCountryIndex = onlyCountries.findIndex(o => o == countryGuess);

    this.state = {
      showDropdown: props.showDropdown,

      formattedNumber,
      onlyCountries,
      preferredCountries,
      hiddenAreaCodes,
      selectedCountry: countryGuess,
      highlightCountryIndex,

      queryString: '',
      freezeSelection: false,
      debouncedQueryStingSearcher: debounce(this.searchCountry, 250),
      searchValue: '',
    };
  }

  componentDidMount() {
    if (document.addEventListener && this.props.enableClickOutside) {
      document.addEventListener('mousedown', this.handleClickOutside);
    }
    if(this.props.onMount){
        this.props.onMount(this.state.formattedNumber.replace(/[^0-9]+/g,''), this.getCountryData(), this.state.formattedNumber)
    }
  }

  componentWillUnmount() {
    if (document.removeEventListener && this.props.enableClickOutside) {
      document.removeEventListener('mousedown', this.handleClickOutside);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.country !== this.props.country) {
      this.updateCountry(this.props.country);
    }
    else if (prevProps.value !== this.props.value) {
      this.updateFormattedNumber(this.props.value);
    }
  }

  getProbableCandidate = memoize((queryString) => {
    if (!queryString || queryString.length === 0) {
      return null;
    }
    // don't include the preferred countries in search
    const probableCountries = this.state.onlyCountries.filter((country) => {
      return startsWith(country.name.toLowerCase(), queryString.toLowerCase());
    }, this);
    return probableCountries[0];
  });

  guessSelectedCountry = memoize((inputNumber, country, onlyCountries, hiddenAreaCodes) => {
    // if enableAreaCodes == false, try to search in hidden area codes to detect area code correctly
    // then search and insert main country which has this area code
    // https://github.com/bl00mber/react-phone-input-2/issues/201
    if (this.props.enableAreaCodes === false) {
      let mainCode;
      hiddenAreaCodes.some(country => {
        if (startsWith(inputNumber, country.dialCode)) {
          onlyCountries.some(o => {
            if (country.iso2 === o.iso2 && o.mainCode) {
              mainCode = o;
              return true;
            }
          })
          return true;
        }
      })
      if (mainCode) return mainCode;
    }

    const secondBestGuess = onlyCountries.find(o => o.iso2 == country);
    if (inputNumber.trim() === '') return secondBestGuess;

    const bestGuess = onlyCountries.reduce((selectedCountry, country) => {
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

    if (!bestGuess.name) return secondBestGuess;
    return bestGuess;
  });

  // Hooks for updated props
  updateCountry = (country) => {
    const { onlyCountries } = this.state
    let newSelectedCountry;
    if (country.indexOf(0) >= '0' && country.indexOf(0) <= '9') { // digit
      newSelectedCountry = onlyCountries.find(o => o.dialCode == +country);
    } else {
      newSelectedCountry = onlyCountries.find(o => o.iso2 == country);
    }
    if (newSelectedCountry && newSelectedCountry.dialCode) {
      this.setState({
        selectedCountry: newSelectedCountry,
        formattedNumber: this.props.disableCountryCode ? '' : this.formatNumber(newSelectedCountry.dialCode, newSelectedCountry),
      });
    }
  }

  updateFormattedNumber(value) {
    if (value === null) return this.setState({ selectedCountry: 0, formattedNumber: '' });

    const { onlyCountries, selectedCountry, hiddenAreaCodes } = this.state;
    const { country, prefix } = this.props;

    if (value === '') return this.setState({ selectedCountry, formattedNumber: '' });

    let inputNumber = value.replace(/\D/g, '');
    let newSelectedCountry, formattedNumber;

    // if new value start with selectedCountry.dialCode, format number, otherwise find newSelectedCountry
    if (selectedCountry && startsWith(value, prefix + selectedCountry.dialCode)) {
      formattedNumber = this.formatNumber(inputNumber, selectedCountry);
      this.setState({ formattedNumber });
    }
    else {
      if (this.props.disableCountryGuess) {newSelectedCountry = selectedCountry;}
      else {
        newSelectedCountry = this.guessSelectedCountry(inputNumber.substring(0, 6), country, onlyCountries, hiddenAreaCodes) || selectedCountry;
      }
      const dialCode = newSelectedCountry && startsWith(inputNumber, prefix + newSelectedCountry.dialCode) ? newSelectedCountry.dialCode : '';

      formattedNumber = this.formatNumber(
        (this.props.disableCountryCode ? '' : dialCode) + inputNumber,
        newSelectedCountry ? (newSelectedCountry) : undefined
      );
      this.setState({ selectedCountry: newSelectedCountry, formattedNumber });
    }
  }

  // View methods
  scrollTo = (country, middle) => {
    if (!country) return;
    const container = this.dropdownRef;
    if (!container || !document.body) return;

    const containerHeight = container.offsetHeight;
    const containerOffset = container.getBoundingClientRect();
    const containerTop = containerOffset.top + document.body.scrollTop;
    const containerBottom = containerTop + containerHeight;

    const element = country;
    const elementOffset = element.getBoundingClientRect();

    const elementHeight = element.offsetHeight;
    const elementTop = elementOffset.top + document.body.scrollTop;
    const elementBottom = elementTop + elementHeight;

    let newScrollTop = elementTop - containerTop + container.scrollTop;
    const middleOffset = (containerHeight / 2) - (elementHeight / 2);

    if (this.props.enableSearch ? elementTop < containerTop + 32 : elementTop < containerTop) {
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
      const heightDifference = containerHeight - elementHeight;
      container.scrollTop = newScrollTop - heightDifference;
    }
  }

  scrollToTop = () => {
    const container = this.dropdownRef;
    if (!container || !document.body) return;
    container.scrollTop = 0;
  }

  formatNumber = (text, country) => {
    if (!country) return text;

    const { format } = country;
    const { disableCountryCode, enableAreaCodeStretch, enableLongNumbers, autoFormat } = this.props;

    let pattern;
    if (disableCountryCode) {
      pattern = format.split(' ');
      pattern.shift();
      pattern = pattern.join(' ');
    } else {
      if (enableAreaCodeStretch && country.isAreaCode) {
        pattern = format.split(' ');
        pattern[1] = pattern[1].replace(/\.+/, ''.padEnd(country.areaCodeLength, '.'))
        pattern = pattern.join(' ');
      } else {
        pattern = format;
      }
    }

    if (!text || text.length === 0) {
      return disableCountryCode ? '' : this.props.prefix;
    }

    // for all strings with length less than 3, just return it (1, 2 etc.)
    // also return the same text if the selected country has no fixed format
    if ((text && text.length < 2) || !pattern || !autoFormat) {
      return disableCountryCode ? text : this.props.prefix+text;
    }

    const formattedObject = reduce(pattern, (acc, character) => {
      if (acc.remainingText.length === 0) {
        return acc;
      }

      if (character !== '.') {
        return {
          formattedText: acc.formattedText + character,
          remainingText: acc.remainingText
        };
      }

      const [ head, ...tail ] = acc.remainingText;

      return {
        formattedText: acc.formattedText + head,
        remainingText: tail
      };
    }, {
      formattedText: '',
      remainingText: text.split('')
    });

    let formattedNumber;
    if (enableLongNumbers) {
      formattedNumber = formattedObject.formattedText + formattedObject.remainingText.join('');
    } else {
      formattedNumber = formattedObject.formattedText;
    }

    // Always close brackets
    if (formattedNumber.includes('(') && !formattedNumber.includes(')')) formattedNumber += ')';
    return formattedNumber;
  }

  // Put the cursor to the end of the input (usually after a focus event)
  cursorToEnd = () => {
    const input = this.numberInputRef;
    if (document.activeElement !== input) return;
    input.focus();
    let len = input.value.length;
    if (input.value.charAt(len-1)=== ')') len = len-1;
    input.setSelectionRange(len, len);
  }

  getElement = (index) => {
    return this[`flag_no_${index}`];
  }

  // return country data from state
  getCountryData = () => {
    if (!this.state.selectedCountry) return {}
    return {
      name: this.state.selectedCountry.name || '',
      dialCode: this.state.selectedCountry.dialCode || '',
      countryCode: this.state.selectedCountry.iso2 || '',
      format: this.state.selectedCountry.format || ''
    }
  }



  handleFlagDropdownClick = (e) => {
    e.preventDefault();
    if (!this.state.showDropdown && this.props.disabled) return;
    const { preferredCountries, onlyCountries, selectedCountry } = this.state
    const allCountries = this.concatPreferredCountries(preferredCountries, onlyCountries);

    const highlightCountryIndex = allCountries.findIndex(o =>
      o.dialCode === selectedCountry.dialCode && o.iso2 === selectedCountry.iso2);

    this.setState({
      showDropdown: !this.state.showDropdown,
      highlightCountryIndex,
    }, () => {
      if (this.state.showDropdown) {
        this.scrollTo(this.getElement(this.state.highlightCountryIndex));
      }
    });
  }

  handleInput = (e) => {
    const { value } = e.target;
    const { prefix, onChange } = this.props;

    let formattedNumber = this.props.disableCountryCode ? '' : prefix;
    let newSelectedCountry = this.state.selectedCountry;
    let freezeSelection = this.state.freezeSelection;

    if (!this.props.countryCodeEditable) {
      const mainCode = newSelectedCountry.hasAreaCodes ?
        this.state.onlyCountries.find(o => o.iso2 === newSelectedCountry.iso2 && o.mainCode).dialCode :
        newSelectedCountry.dialCode;

      const updatedInput = prefix+mainCode;
      if (value.slice(0, updatedInput.length) !== updatedInput) return;
    }

    if (value === prefix) {
      // we should handle change when we delete the last digit
      if (onChange) onChange('', this.getCountryData(), e, '');
      return this.setState({ formattedNumber: '' });
    }

    // Does exceed default 15 digit phone number limit
    if (value.replace(/\D/g, '').length > 15) {
      if (this.props.enableLongNumbers === false) return;
      if (typeof this.props.enableLongNumbers === 'number') {
        if (value.replace(/\D/g, '').length > this.props.enableLongNumbers) return;
      }
    }

    // if the input is the same as before, must be some special key like enter etc.
    if (value === this.state.formattedNumber) return;

    // ie hack
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }

    const { country } = this.props
    const { onlyCountries, selectedCountry, hiddenAreaCodes } = this.state

    if (onChange) e.persist();

    if (value.length > 0) {
      // before entering the number in new format, lets check if the dial code now matches some other country
      const inputNumber = value.replace(/\D/g, '');

      // we don't need to send the whole number to guess the country... only the first 6 characters are enough
      // the guess country function can then use memoization much more effectively since the set of input it
      // gets has drastically reduced
      if (!this.state.freezeSelection || (!!selectedCountry && selectedCountry.dialCode.length > inputNumber.length) || (!!selectedCountry && !startsWith(inputNumber, selectedCountry.dialCode))) {
        if (this.props.disableCountryGuess) {newSelectedCountry = selectedCountry;}
        else {
          newSelectedCountry = this.guessSelectedCountry(inputNumber.substring(0, 6), country, onlyCountries, hiddenAreaCodes) || selectedCountry;
        }
        freezeSelection = false;
      }
      formattedNumber = this.formatNumber(inputNumber, newSelectedCountry);
      newSelectedCountry = newSelectedCountry.dialCode ? newSelectedCountry : selectedCountry;
    }

    const oldCaretPosition = e.target.selectionStart;
    let caretPosition = e.target.selectionStart;
    const oldFormattedText = this.state.formattedNumber;
    const diff = formattedNumber.length - oldFormattedText.length;

    this.setState({
      formattedNumber,
      freezeSelection,
      selectedCountry: newSelectedCountry,
    }, () => {
      if (diff > 0) {
        caretPosition = caretPosition - diff;
      }

      const lastChar = formattedNumber.charAt(formattedNumber.length - 1);

      if (lastChar == ')') {
        this.numberInputRef.setSelectionRange(formattedNumber.length - 1, formattedNumber.length - 1);
      } else if (caretPosition > 0 && oldFormattedText.length >= formattedNumber.length) {
        this.numberInputRef.setSelectionRange(caretPosition, caretPosition);
      } else if (oldCaretPosition < oldFormattedText.length) {
        this.numberInputRef.setSelectionRange(oldCaretPosition, oldCaretPosition);
      }

      if (onChange) onChange(formattedNumber.replace(/[^0-9]+/g,''), this.getCountryData(), e, formattedNumber);
    });
  }

  handleInputClick = (e) => {
    this.setState({ showDropdown: false });
    if (this.props.onClick) this.props.onClick(e, this.getCountryData());
  }

  handleDoubleClick = (e) => {
    const len = e.target.value.length;
    e.target.setSelectionRange(0, len);
  }

  handleFlagItemClick = (country, e) => {
    const currentSelectedCountry = this.state.selectedCountry;
    const newSelectedCountry = this.state.onlyCountries.find(o => o == country);
    if (!newSelectedCountry) return;

    const unformattedNumber = this.state.formattedNumber.replace(' ', '').replace('(', '').replace(')', '').replace('-', '');
    const newNumber = unformattedNumber.length > 1 ? unformattedNumber.replace(currentSelectedCountry.dialCode, newSelectedCountry.dialCode) : newSelectedCountry.dialCode;
    const formattedNumber = this.formatNumber(newNumber.replace(/\D/g, ''), newSelectedCountry);

    this.setState({
      showDropdown: false,
      selectedCountry: newSelectedCountry,
      freezeSelection: true,
      formattedNumber,
      searchValue: ''
    }, () => {
      this.cursorToEnd();
      if (this.props.onChange) this.props.onChange(formattedNumber.replace(/[^0-9]+/g,''), this.getCountryData(), e, formattedNumber);
    });
  }

  handleInputFocus = (e) => {
    // if the input is blank, insert dial code of the selected country
    if (this.numberInputRef) {
      if (this.numberInputRef.value === this.props.prefix && this.state.selectedCountry && !this.props.disableCountryCode) {
        this.setState({
          formattedNumber: this.props.prefix + this.state.selectedCountry.dialCode
        }, () => {this.props.jumpCursorToEnd && setTimeout(this.cursorToEnd, 0)});
      }
    }

    this.setState({ placeholder: '' });

    this.props.onFocus && this.props.onFocus(e, this.getCountryData());
    this.props.jumpCursorToEnd && setTimeout(this.cursorToEnd, 0);
  }

  handleInputBlur = (e) => {
    if (!e.target.value) this.setState({ placeholder: this.props.placeholder });
    this.props.onBlur && this.props.onBlur(e, this.getCountryData());
  }

  handleInputCopy = (e) => {
    if (!this.props.copyNumbersOnly) return;
    const text = window.getSelection().toString().replace(/[^0-9]+/g,'');
    e.clipboardData.setData('text/plain', text);
    e.preventDefault();
  }

  getHighlightCountryIndex = (direction) => {
    // had to write own function because underscore does not have findIndex. lodash has it
    const highlightCountryIndex = this.state.highlightCountryIndex + direction;

    if (highlightCountryIndex < 0 || highlightCountryIndex >= (this.state.onlyCountries.length + this.state.preferredCountries.length)) {
      return highlightCountryIndex - direction;
    }

    if (this.props.enableSearch && highlightCountryIndex > this.getSearchFilteredCountries().length) return 0; // select first country
    return highlightCountryIndex;
  }

  searchCountry = () => {
    const probableCandidate = this.getProbableCandidate(this.state.queryString) || this.state.onlyCountries[0];
    const probableCandidateIndex = this.state.onlyCountries.findIndex(o => o == probableCandidate) + this.state.preferredCountries.length;

    this.scrollTo(this.getElement(probableCandidateIndex), true);

    this.setState({queryString: '', highlightCountryIndex: probableCandidateIndex});
  }

  handleKeydown = (e) => {
    const { keys } = this.props;
    const { target: { className } } = e;

    if (className.includes('selected-flag') && e.which === keys.ENTER && !this.state.showDropdown) return this.handleFlagDropdownClick(e);
    if (className.includes('form-control') && (e.which === keys.ENTER || e.which === keys.ESC)) return e.target.blur();

    if (!this.state.showDropdown || this.props.disabled) return;
    if (className.includes('search-box')) {
      if (e.which !== keys.UP && e.which !== keys.DOWN && e.which !== keys.ENTER) {
        if (e.which === keys.ESC && e.target.value === '') {
         // do nothing // if search field is empty, pass event (close dropdown)
       } else {
         return; // don't process other events coming from the search field
       }
      }
    }

    // ie hack
    if (e.preventDefault) { e.preventDefault(); }
    else { e.returnValue = false; }

    const moveHighlight = (direction) => {
      this.setState({
        highlightCountryIndex: this.getHighlightCountryIndex(direction)
      }, () => {
        this.scrollTo(this.getElement(this.state.highlightCountryIndex), true);
      });
    }

    switch (e.which) {
      case keys.DOWN:
        moveHighlight(1);
        break;
      case keys.UP:
        moveHighlight(-1);
        break;
      case keys.ENTER:
        if (this.props.enableSearch) {
          this.handleFlagItemClick(this.getSearchFilteredCountries()[this.state.highlightCountryIndex] || this.getSearchFilteredCountries()[0], e);
        } else {
          this.handleFlagItemClick([...this.state.preferredCountries, ...this.state.onlyCountries][this.state.highlightCountryIndex], e);
        }
        break;
      case keys.ESC:
      case keys.TAB:
        this.setState({
          showDropdown: false
        }, this.cursorToEnd);
        break;
      default:
        if ((e.which >= keys.A && e.which <= keys.Z) || e.which === keys.SPACE) {
          this.setState({
            queryString: this.state.queryString + String.fromCharCode(e.which)
          }, this.state.debouncedQueryStingSearcher);
        }
    }
  }

  handleInputKeyDown = (e) => {
    const { keys, onEnterKeyPress, onKeyDown } = this.props;
    if (e.which === keys.ENTER) {
      if (onEnterKeyPress) onEnterKeyPress(e);
    }
    if (onKeyDown) onKeyDown(e);
  }

  handleClickOutside = (e) => {
    if (this.dropdownRef && !this.dropdownContainerRef.contains(e.target)) {
      this.state.showDropdown && this.setState({ showDropdown: false });
    }
  }

  handleSearchChange = (e) => {
    const { currentTarget: { value: searchValue } } = e;
    const { preferredCountries, selectedCountry } = this.state
    let highlightCountryIndex = 0;

    if (searchValue === '' && selectedCountry) {
      const { onlyCountries } = this.state
      highlightCountryIndex = this.concatPreferredCountries(preferredCountries, onlyCountries).findIndex(o => o == selectedCountry);
      // wait asynchronous search results re-render, then scroll
      setTimeout(() => this.scrollTo(this.getElement(highlightCountryIndex)), 100)
    }
    this.setState({ searchValue, highlightCountryIndex });
  }

  concatPreferredCountries = (preferredCountries, onlyCountries) => {
    if (preferredCountries.length > 0) { return [...new Set(preferredCountries.concat(onlyCountries))] }
    else { return onlyCountries }
  }

  getDropdownCountryName = (country) => {
    return country.localName || country.name;
  }

  getSearchFilteredCountries = () => {
    const { preferredCountries, onlyCountries, searchValue } = this.state
    const { enableSearch } = this.props
    const allCountries = this.concatPreferredCountries(preferredCountries, onlyCountries);
    const sanitizedSearchValue = searchValue.trim().toLowerCase().replace('+','');
    if (enableSearch && sanitizedSearchValue) {
      // [...new Set()] to get rid of duplicates
      // firstly search by iso2 code
      if (/^\d+$/.test(sanitizedSearchValue)) { // contains digits only
         // values wrapped in ${} to prevent undefined
        return allCountries.filter(({ dialCode }) =>
          [`${dialCode}`].some(field => field.toLowerCase().includes(sanitizedSearchValue)))
      } else {
        const iso2countries = allCountries.filter(({ iso2 }) =>
          [`${iso2}`].some(field => field.toLowerCase().includes(sanitizedSearchValue)))
        // || '' - is a fix to prevent search of 'undefined' strings
        // Since all the other values shouldn't be undefined, this fix was accepte
        // but the structure do not looks very good
        const searchedCountries = allCountries.filter(({ name, localName, iso2 }) =>
          [`${name}`, `${localName || ''}`].some(field => field.toLowerCase().includes(sanitizedSearchValue)))
        this.scrollToTop()
        return [...new Set([].concat(iso2countries, searchedCountries))]
      }
    } else {
      return allCountries
    }
  }

  getCountryDropdownList = () => {
    const { preferredCountries, highlightCountryIndex, showDropdown, searchValue } = this.state;
    const { disableDropdown, prefix } = this.props
    const { enableSearch, searchNotFound, disableSearchIcon, searchClass, searchStyle, searchPlaceholder, autocompleteSearch } = this.props;

    const searchedCountries = this.getSearchFilteredCountries()

    let countryDropdownList = searchedCountries.map((country, index) => {
      const highlight = highlightCountryIndex === index;
      const itemClasses = classNames({
        country: true,
        preferred: country.iso2 === 'us' || country.iso2 === 'gb',
        active: country.iso2 === 'us',
        highlight
      });

      const inputFlagClasses = `flag ${country.iso2}`;

      return (
        <li
          ref={el => this[`flag_no_${index}`] = el}
          key={`flag_no_${index}`}
          data-flag-key={`flag_no_${index}`}
          className={itemClasses}
          data-dial-code='1'
          tabIndex={disableDropdown ? '-1' : '0'}
          data-country-code={country.iso2}
          onClick={(e) => this.handleFlagItemClick(country, e)}
          role='option'
          {... highlight ? { "aria-selected": true } : {}}
        >
          <div className={inputFlagClasses}/>
          <span className='country-name'>{this.getDropdownCountryName(country)}</span>
          <span className='dial-code'>{country.format ? this.formatNumber(country.dialCode, country) : (prefix+country.dialCode)}</span>
        </li>
      );
    });

    const dashedLi = (<li key={'dashes'} className='divider'/>);
    // let's insert a dashed line in between preffered countries and the rest
    (preferredCountries.length > 0) && (!enableSearch || enableSearch && !searchValue.trim()) &&
    countryDropdownList.splice(preferredCountries.length, 0, dashedLi);

    const dropDownClasses = classNames({
      'country-list': true,
      'hide': !showDropdown,
      [this.props.dropdownClass]: true,
    });

    return (
      <ul
        ref={el => {
          !enableSearch && el && el.focus();
          return (this.dropdownRef = el);
        }}
        className={dropDownClasses}
        style={this.props.dropdownStyle}
        role='listbox'
        tabIndex='0'
      >
        {enableSearch && (
          <li
            className={classNames({
              search: true,
              [searchClass]: searchClass,
            })}
          >
            {!disableSearchIcon &&
              <span
                className={classNames({
                  'search-emoji': true,
                  [`${searchClass}-emoji`]: searchClass,
                })}
                role='img'
                aria-label='Magnifying glass'
              >
                &#128270;
              </span>}
            <input
              className={classNames({
                'search-box': true,
                [`${searchClass}-box`]: searchClass,
              })}
              style={searchStyle}
              type='search'
              placeholder={searchPlaceholder}
              autoFocus={true}
              autoComplete={autocompleteSearch ? 'on' : 'off'}
              value={searchValue}
              onChange={this.handleSearchChange}
            />
          </li>
        )}
        {countryDropdownList.length > 0
          ? countryDropdownList
          : (
            <li className='no-entries-message'>
              <span>{searchNotFound}</span>
            </li>
          )}
      </ul>
    );
  }

  render() {
    const { onlyCountries, selectedCountry, showDropdown, formattedNumber, hiddenAreaCodes } = this.state;
    const { disableDropdown, renderStringAsFlag, isValid, defaultErrorMessage, specialLabel } = this.props;

    let isValidValue, errorMessage;
    if (typeof isValid === 'boolean') {
      isValidValue = isValid;
    } else {
      const isValidProcessed = isValid(formattedNumber.replace(/\D/g, ''), selectedCountry, onlyCountries, hiddenAreaCodes)
      if (typeof isValidProcessed === 'boolean') {
        isValidValue = isValidProcessed;
        if (isValidValue === false) errorMessage = defaultErrorMessage
      } else { // typeof === 'string'
        isValidValue = false;
        errorMessage = isValidProcessed;
      }
    }

    const containerClasses = classNames({
      [this.props.containerClass]: true,
      'react-tel-input': true,
    });
    const arrowClasses = classNames({'arrow': true, 'up': showDropdown});
    const inputClasses = classNames({
      'form-control': true,
      'invalid-number': !isValidValue,
      'open': showDropdown,
      [this.props.inputClass]: true,
    });
    const selectedFlagClasses = classNames({
      'selected-flag': true,
      'open': showDropdown,
    });
    const flagViewClasses = classNames({
      'flag-dropdown': true,
      'invalid-number': !isValidValue,
      'open': showDropdown,
      [this.props.buttonClass]: true,
    });
    const inputFlagClasses = `flag ${selectedCountry && selectedCountry.iso2}`;

    return (
      <div
        className={`${containerClasses} ${this.props.className}`}
        style={this.props.style || this.props.containerStyle}
        onKeyDown={this.handleKeydown}>
        {specialLabel && <div className='special-label'>{specialLabel}</div>}
        {errorMessage && <div className='invalid-number-message'>{errorMessage}</div>}
        <input
          className={inputClasses}
          style={this.props.inputStyle}
          onChange={this.handleInput}
          onClick={this.handleInputClick}
          onDoubleClick={this.handleDoubleClick}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
          onCopy={this.handleInputCopy}
          value={formattedNumber}
          onKeyDown={this.handleInputKeyDown}
          placeholder={this.props.placeholder}
          disabled={this.props.disabled}
          type='tel'
          {...this.props.inputProps}
          ref={el => {
            this.numberInputRef = el;
            if (typeof this.props.inputProps.ref === 'function') {
              this.props.inputProps.ref(el);
            } else if (typeof this.props.inputProps.ref === 'object') {
              this.props.inputProps.ref.current = el;
            }
          }}
        />

        <div
          className={flagViewClasses}
          style={this.props.buttonStyle}
          ref={el => this.dropdownContainerRef = el}
        >
          {renderStringAsFlag ?
          <div className={selectedFlagClasses}>{renderStringAsFlag}</div>
          :
          <div
            onClick={disableDropdown ? undefined : this.handleFlagDropdownClick}
            className={selectedFlagClasses}
            title={selectedCountry ? `${selectedCountry.localName || selectedCountry.name}: + ${selectedCountry.dialCode}` : ''}
            tabIndex={disableDropdown ? '-1' : '0'}
            role='button'
            aria-haspopup="listbox"
            aria-expanded={showDropdown ? true : undefined}
          >
            <div className={inputFlagClasses}>
              {!disableDropdown && <div className={arrowClasses}></div>}
            </div>
          </div>}

          {showDropdown && this.getCountryDropdownList()}
        </div>
      </div>
    );
  }
}

export default PhoneInput;
