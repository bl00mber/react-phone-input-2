import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import memoize from 'lodash.memoize';
import reduce from 'lodash.reduce';
import startsWith from 'lodash.startswith';
import classNames from 'classnames';

import CountryData from './CountryData.js';

class PhoneInput extends React.Component {
  static propTypes = {
    country: PropTypes.string,
    value: PropTypes.string,

    onlyCountries: PropTypes.arrayOf(PropTypes.string),
    preferredCountries: PropTypes.arrayOf(PropTypes.string),
    excludeCountries: PropTypes.arrayOf(PropTypes.string),

    placeholder: PropTypes.string,
    searchPlaceholder: PropTypes.string,
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

    autoFormat: PropTypes.bool,

    enableAreaCodes: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.arrayOf(PropTypes.string)
    ]),

    disableCountryCode: PropTypes.bool,
    disableDropdown: PropTypes.bool,
    enableLongNumbers: PropTypes.bool,
    countryCodeEditable: PropTypes.bool,
    enableSearch: PropTypes.bool,
    disableSearchIcon: PropTypes.bool,

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
    prefix: PropTypes.string,
    copyNumbersOnly: PropTypes.bool,
    renderStringAsFlag: PropTypes.string,
    autocompleteSearch: PropTypes.bool,
    jumpCursorToEnd: PropTypes.bool,

    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onClick: PropTypes.func,
    onKeyDown: PropTypes.func,
    isValid: PropTypes.func,
  }

  static defaultProps = {
    country: '',
    value: '',

    onlyCountries: [],
    preferredCountries: [],
    excludeCountries: [],

    placeholder: '1 (702) 123-4567',
    searchPlaceholder: 'search',
    flagsImagePath: './flags.png',
    disabled: false,

    containerStyle: {},
    inputStyle: {},
    buttonStyle: {},
    dropdownStyle: {},
    searchStyle: {},

    containerClass: 'react-tel-input',
    inputClass: '',
    buttonClass: '',
    dropdownClass: '',
    searchClass: '',

    autoFormat: true,
    enableAreaCodes: false,
    isValid: (inputNumber, onlyCountries) => true,
    disableCountryCode: false,
    disableDropdown: false,
    enableLongNumbers: false,
    countryCodeEditable: true,
    enableSearch: false,
    disableSearchIcon: false,

    regions: '',

    inputProps: {},
    localization: {},
    masks: {},
    areaCodes: {},

    preserveOrder: [],

    defaultMask: '... ... ... ... ..', // prefix+dialCode+' '+defaultMask
    prefix: '+',
    copyNumbersOnly: true,
    renderStringAsFlag: '',
    autocompleteSearch: false,
    jumpCursorToEnd: true,

    onEnterKeyPress: () => {},

    keys: {
      UP: 38, DOWN: 40, RIGHT: 39, LEFT: 37, ENTER: 13,
      ESC: 27, PLUS: 43, A: 65, Z: 90, SPACE: 32
    }
  }

  constructor(props) {
    super(props);
    let { onlyCountries, preferredCountries } = new CountryData(
      props.enableAreaCodes, props.regions,
      props.onlyCountries, props.preferredCountries, props.excludeCountries, props.preserveOrder,
      props.localization, props.masks, props.areaCodes,
      props.prefix,
    );

    const inputNumber = props.value.replace(/[^0-9\.]+/g, '') || '';

    let countryGuess;
    if (inputNumber.length > 1) {
      // Country detect by value field
      countryGuess = this.guessSelectedCountry(inputNumber.substring(0, 6), onlyCountries, props.country) || 0;
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
      !startsWith(inputNumber.replace(/\D/g, ''), countryGuess.dialCode)
    ) ? countryGuess.dialCode : '';

    let formattedNumber;
    formattedNumber = (inputNumber === '' && countryGuess === 0) ? '' :
    this.formatNumber(
      (props.disableCountryCode ? '' : dialCode) + inputNumber.replace(/\D/g, ''),
      countryGuess.name ? countryGuess.format : undefined
    );

    const highlightCountryIndex = onlyCountries.findIndex(o => o == countryGuess);

    this.state = {
      formattedNumber,
      onlyCountries,
      preferredCountries,
      country: props.country,
      selectedCountry: countryGuess,
      highlightCountryIndex,
      queryString: '',
      showDropdown: false,
      freezeSelection: false,
      debouncedQueryStingSearcher: debounce(this.searchCountry, 250),
      searchValue: '',
    };
  }

  componentDidMount() {
    if (document.addEventListener) {
      document.addEventListener('mousedown', this.handleClickOutside);
    }
  }

  componentWillUnmount() {
    if (document.removeEventListener) {
      document.removeEventListener('mousedown', this.handleClickOutside);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.country && nextProps.country !== this.state.country) {
      this.updateCountry(nextProps.country);
    }
    else if (nextProps.value !== this.state.formattedNumber) {
      this.updateFormattedNumber(nextProps.value);
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

  guessSelectedCountry = memoize((inputNumber, onlyCountries, country) => {
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
    let newSelectedCountry;
    if (country.indexOf(0) >= '0' && country.indexOf(0) <= '9') {
      newSelectedCountry = this.state.onlyCountries.find(o => o.dialCode == +country);
    } else {
      newSelectedCountry = this.state.onlyCountries.find(o => o.iso2 == country);
    }
    if (newSelectedCountry && newSelectedCountry.dialCode) {
      this.setState({
        country: country,
        selectedCountry: newSelectedCountry,
        formattedNumber: this.props.disableCountryCode ? '' : this.props.prefix+newSelectedCountry.dialCode
      });
    }
  }

  updateFormattedNumber(value) {
    const { onlyCountries, country } = this.state;
    let newSelectedCountry;
    let inputNumber = value;
    let formattedNumber = value;

    // if inputNumber does not start with this.props.prefix, then use default country's dialing prefix,
    // otherwise use logic for finding country based on country prefix.
    if (!startsWith(inputNumber, this.props.prefix)) {
      newSelectedCountry = this.state.selectedCountry || onlyCountries.find(o => o.iso2 == country);
      const dialCode = newSelectedCountry && !startsWith(inputNumber.replace(/\D/g, ''), newSelectedCountry.dialCode) ? newSelectedCountry.dialCode : '';
      formattedNumber = this.formatNumber(
        (this.props.disableCountryCode ? '' : dialCode) + inputNumber.replace(/\D/g, ''),
        newSelectedCountry ? (newSelectedCountry.format || this.getDefaultMask(newSelectedCountry)) : undefined
      );
    }
    else {
      inputNumber = inputNumber.replace(/\D/g, '');
      newSelectedCountry = this.guessSelectedCountry(inputNumber.substring(0, 6), onlyCountries, country) || this.state.selectedCountry;
      formattedNumber = newSelectedCountry ?
        this.formatNumber(inputNumber, newSelectedCountry.format || this.getDefaultMask(newSelectedCountry)) : inputNumber;
    }

    this.setState({ selectedCountry: newSelectedCountry, formattedNumber });
  }

  getDefaultMask = country => this.props.prefix+''.padEnd(country.dialCode.length,'.')+' '+this.props.defaultMask;

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

  formatNumber = (text, patternArg) => {
    const { disableCountryCode, enableLongNumbers, autoFormat } = this.props;

    let pattern;
    if (disableCountryCode && patternArg) {
      pattern = patternArg.split(' ');
      pattern.shift();
      pattern = pattern.join(' ');
    } else {
      pattern = patternArg;
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
    input.focus();
    const len = input.value.length;
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

  handleFlagDropdownClick = () => {
    if (!this.state.showDropdown && this.props.disabled) return;
    const { preferredCountries, selectedCountry } = this.state
    const allCountries = preferredCountries.concat(this.state.onlyCountries)

    let highlightCountryIndex;
    if (preferredCountries.includes(selectedCountry)) {
      highlightCountryIndex = preferredCountries.findIndex(o => o == selectedCountry)
    } else {
      highlightCountryIndex = this.props.enableAreaCodes ? allCountries.findIndex(o => o == selectedCountry)
        : allCountries.findIndex(o => o.iso2 == selectedCountry.iso2)
    }

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
    let formattedNumber = this.props.disableCountryCode ? '' : this.props.prefix;
    let newSelectedCountry = this.state.selectedCountry;
    let freezeSelection = this.state.freezeSelection;

    if (!this.props.countryCodeEditable) {
      const mainCode = newSelectedCountry.hasAreaCodes ?
        this.state.onlyCountries.find(o => o.iso2 === newSelectedCountry.iso2).dialCode :
        newSelectedCountry.dialCode;

      const updatedInput = this.props.prefix+mainCode;
      if (e.target.value.slice(0, updatedInput.length) !== updatedInput) return;
    }

    // Does not exceed 15 digit phone number limit
    if (e.target.value.replace(/\D/g, '').length > 15) return;

    // if the input is the same as before, must be some special key like enter etc.
    if (e.target.value === this.state.formattedNumber) return;

    // ie hack
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }

    if (e.target.value.length > 0) {
      // before entering the number in new format, lets check if the dial code now matches some other country
      const inputNumber = e.target.value.replace(/\D/g, '');

      // we don't need to send the whole number to guess the country... only the first 6 characters are enough
      // the guess country function can then use memoization much more effectively since the set of input it
      // gets has drastically reduced
      if (!this.state.freezeSelection || this.state.selectedCountry.dialCode.length > inputNumber.length) {
        newSelectedCountry = this.guessSelectedCountry(inputNumber.substring(0, 6), this.state.onlyCountries, this.state.country) || this.state.selectedCountry;
        freezeSelection = false;
      }
      formattedNumber = newSelectedCountry ?
        this.formatNumber(inputNumber, newSelectedCountry.format || this.getDefaultMask(newSelectedCountry)) : inputNumber;
      newSelectedCountry = newSelectedCountry.dialCode ? newSelectedCountry : this.state.selectedCountry;
    }

    let caretPosition = e.target.selectionStart;
    const oldFormattedText = this.state.formattedNumber;
    const diff = formattedNumber.length - oldFormattedText.length;

    this.setState({
      formattedNumber: formattedNumber,
      freezeSelection: freezeSelection,
      selectedCountry: newSelectedCountry,
    }, () => {
      if (diff > 0) {
        caretPosition = caretPosition - diff;
      }

      const lastChar = formattedNumber.charAt(formattedNumber.length - 1);

      if (lastChar == ')') {
        this.numberInputRef.setSelectionRange(formattedNumber.length - 1, formattedNumber.length - 1);
      }
      else if (caretPosition > 0 && oldFormattedText.length >= formattedNumber.length) {
        this.numberInputRef.setSelectionRange(caretPosition, caretPosition);
      }

      if (this.props.onChange) this.props.onChange(this.state.formattedNumber, this.getCountryData(), e);
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

  handleFlagItemClick = (country) => {
    const currentSelectedCountry = this.state.selectedCountry;
    const newSelectedCountry = this.state.onlyCountries.find(o => o == country);
    if (!newSelectedCountry) return;

    const unformattedNumber = this.state.formattedNumber.replace(' ', '').replace('(', '').replace(')', '').replace('-', '');
    const newNumber = unformattedNumber.length > 1 ? unformattedNumber.replace(currentSelectedCountry.dialCode, newSelectedCountry.dialCode) : newSelectedCountry.dialCode;
    const formattedNumber = this.formatNumber(newNumber.replace(/\D/g, ''), newSelectedCountry.format || this.getDefaultMask(newSelectedCountry));

    this.setState({
      showDropdown: false,
      selectedCountry: newSelectedCountry,
      freezeSelection: true,
      formattedNumber
    }, () => {
      this.cursorToEnd();
      if (this.props.onChange) this.props.onChange(formattedNumber.replace(/[^0-9]+/g,''), this.getCountryData());
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
    const { target: { id } } = e;

    if (id === 'flag-dropdown' && e.which === keys.ENTER && !this.state.showDropdown) return this.handleFlagDropdownClick();
    if (id === 'phone-form-control' && (e.which === keys.ENTER || e.which === keys.ESC)) return e.target.blur();

    if (!this.state.showDropdown || this.props.disabled) return;
    if (id === 'search-box') {
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
    const { keys } = this.props;
    if (e.which === keys.ENTER) {
      this.props.onEnterKeyPress(e);
    }

    if (this.props.onKeyDown) this.props.onKeyDown(e);
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
      highlightCountryIndex = preferredCountries.concat(onlyCountries).findIndex(o => o == selectedCountry);
      // wait asynchronous search results re-render, then scroll
      setTimeout(() => this.scrollTo(this.getElement(highlightCountryIndex)), 100)
    }
    this.setState({ searchValue, highlightCountryIndex });
  }

  getDropdownCountryName = (country) => {
    return country.localName || country.name;
  }

  getSearchFilteredCountries = () => {
    const { preferredCountries, onlyCountries, searchValue } = this.state
    const { enableSearch } = this.props
    const allCountries = preferredCountries.concat(onlyCountries);
    const sanitizedSearchValue = searchValue.trim().toLowerCase();
    if (enableSearch && sanitizedSearchValue) {
      // [...new Set()] to get rid of duplicates
      // firstly search by iso2 code
      const iso2countries = allCountries.filter(({ name, localName, iso2, dialCode }) =>
        [`${iso2}`].some(field => field.toLowerCase().includes(sanitizedSearchValue)))
      const searchedCountries = allCountries.filter(({ name, localName, iso2, dialCode }) =>
        [`${name}`, `${localName}`, this.props.prefix+dialCode].some(field => field.toLowerCase().includes(sanitizedSearchValue)))
      this.scrollToTop()
      return [...new Set([].concat(iso2countries, searchedCountries))]
    } else {
      return allCountries
    }
  }

  getCountryDropdownList = () => {
    const { preferredCountries, highlightCountryIndex, showDropdown, searchValue } = this.state;
    const { enableSearch, disableSearchIcon, searchClass, searchStyle, searchPlaceholder, autocompleteSearch } = this.props;

    const searchedCountries = this.getSearchFilteredCountries()

    let countryDropdownList = searchedCountries.map((country, index) => {
      const itemClasses = classNames({
        country: true,
        preferred: country.iso2 === 'us' || country.iso2 === 'gb',
        active: country.iso2 === 'us',
        highlight: highlightCountryIndex === index
      });

      const inputFlagClasses = `flag ${country.iso2}`;

      return (
        <li
          ref={el => this[`flag_no_${index}`] = el}
          key={`flag_no_${index}`}
          data-flag-key={`flag_no_${index}`}
          className={itemClasses}
          data-dial-code='1'
          tabIndex='0'
          data-country-code={country.iso2}
          onClick={() => this.handleFlagItemClick(country)}
        >
          <div className={inputFlagClasses}/>
          <span className='country-name'>{this.getDropdownCountryName(country)}</span>
          <span className='dial-code'>{country.format ? this.formatNumber(country.dialCode, country.format) : (this.props.prefix+country.dialCode)}</span>
        </li>
      );
    });

    const dashedLi = (<li key={'dashes'} className='divider'/>);
    // let's insert a dashed line in between preffered countries and the rest
    (preferredCountries.length > 0) && (!enableSearch || enableSearch && !searchValue.trim()) &&
    countryDropdownList.splice(preferredCountries.length, 0, dashedLi);

    const dropDownClasses = classNames({
      [this.props.dropdownClass]: true,
      'country-list': true,
      'hide': !showDropdown
    });

    return (
      <ul
        ref={el => this.dropdownRef = el}
        className={dropDownClasses}
        style={this.props.dropdownStyle}
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
              id='search-box'
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
              <span>No entries to show.</span>
            </li>
          )}
      </ul>
    );
  }

  render() {
    const { onlyCountries, selectedCountry, showDropdown, formattedNumber } = this.state;
    const { disableDropdown, renderStringAsFlag } = this.props;

    const arrowClasses = classNames({'arrow': true, 'up': showDropdown});
    const inputClasses = classNames({
      [this.props.inputClass]: true,
      'form-control': true,
      'invalid-number': !this.props.isValid(formattedNumber.replace(/\D/g, ''), onlyCountries),
      'open': showDropdown,
    });
    const selectedFlagClasses = classNames({
      'selected-flag': true,
      'open': showDropdown,
    });
    const flagViewClasses = classNames({
      [this.props.buttonClass]: true,
      'flag-dropdown': true,
      'open': showDropdown,
    });
    const inputFlagClasses = `flag ${selectedCountry && selectedCountry.iso2}`;

    return (
      <div
        className={this.props.containerClass}
        style={this.props.style || this.props.containerStyle}
        onKeyDown={this.handleKeydown}>
        <input
          className={inputClasses}
          id='phone-form-control'
          style={this.props.inputStyle}
          onChange={this.handleInput}
          onClick={this.handleInputClick}
          onDoubleClick={this.handleDoubleClick}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
          onCopy={this.handleInputCopy}
          value={formattedNumber}
          ref={el => this.numberInputRef = el}
          onKeyDown={this.handleInputKeyDown}
          placeholder={this.props.placeholder}
          disabled={this.props.disabled}
          type='tel'
          {...this.props.inputProps}
        />

        <div
          className={flagViewClasses}
          id='flag-dropdown'
          style={this.props.buttonStyle}
          ref={el => this.dropdownContainerRef = el}
          tabIndex='0'
          role='button'
        >
          {renderStringAsFlag ?
          <div className={selectedFlagClasses}>{renderStringAsFlag}</div>
          :
          <div
            onClick={disableDropdown ? undefined : this.handleFlagDropdownClick}
            className={selectedFlagClasses}
            title={selectedCountry ? `${selectedCountry.name}: + ${selectedCountry.dialCode}` : ''}
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
