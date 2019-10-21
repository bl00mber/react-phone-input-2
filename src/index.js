import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import memoize from 'lodash.memoize';
import reduce from 'lodash.reduce';
import startsWith from 'lodash.startswith';
import classNames from 'classnames';

import countryData from './country_data.js';
import './style.less';

class PhoneInput extends React.Component {
  static propTypes = {
    excludeCountries: PropTypes.arrayOf(PropTypes.string),
    onlyCountries: PropTypes.arrayOf(PropTypes.string),
    preferredCountries: PropTypes.arrayOf(PropTypes.string),
    defaultCountry: PropTypes.string,

    value: PropTypes.string,
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
    disableAreaCodes: PropTypes.bool,
    disableCountryCode: PropTypes.bool,
    disableDropdown: PropTypes.bool,
    enableLongNumbers: PropTypes.bool,
    countryCodeEditable: PropTypes.bool,
    enableSearchField: PropTypes.bool,
    disableSearchIcon: PropTypes.bool,

    regions: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),

    inputExtraProps: PropTypes.object,
    localization: PropTypes.object,
    masks: PropTypes.object,
    areaCodes: PropTypes.object,

    preserveOrder: PropTypes.arrayOf(PropTypes.string),
    renderStringAsFlag: PropTypes.string,

    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onClick: PropTypes.func,
    onKeyDown: PropTypes.func,
    isValid: PropTypes.func,
  }

  static defaultProps = {
    excludeCountries: [],
    onlyCountries: [],
    preferredCountries: [],
    defaultCountry: '',

    value: '',
    placeholder: '+1 (702) 123-4567',
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
    disableAreaCodes: false,
    isValid: (inputNumber) => {
      return countryData.allCountries.some((country) => {
        return startsWith(inputNumber, country.dialCode) || startsWith(country.dialCode, inputNumber);
      });
    },
    disableCountryCode: false,
    disableDropdown: false,
    enableLongNumbers: false,
    countryCodeEditable: true,
    enableSearchField: false,
    disableSearchIcon: false,

    regions: '',

    inputExtraProps: {},
    localization: {},
    masks: {},
    areaCodes: {},

    preserveOrder: [],
    renderStringAsFlag: '',

    onEnterKeyPress: () => {},

    keys: {
      UP: 38, DOWN: 40, RIGHT: 39, LEFT: 37, ENTER: 13,
      ESC: 27, PLUS: 43, A: 65, Z: 90, SPACE: 32
    }
  }

  constructor(props) {
    super(props);
    let filteredCountries = countryData.allCountries;

    if (props.regions) filteredCountries = this.filterRegions(props.regions, filteredCountries);

    const onlyCountries = this.excludeCountries(
          this.getFilteredCountryList(props.onlyCountries, filteredCountries, props.preserveOrder.includes('onlyCountries')),
          props.excludeCountries);

    const preferredCountries = props.preferredCountries.length === 0 ?
      [] : this.getFilteredCountryList(props.preferredCountries, filteredCountries, props.preserveOrder.includes('preferredCountries'));

    const inputNumber = props.value.replace(/[^0-9\.]+/g, '') || '';

    let countryGuess;
    if (inputNumber.length > 1) {
      // Country detect by value field
      countryGuess = this.guessSelectedCountry(inputNumber.substring(0, 6), onlyCountries, props.defaultCountry) || 0;
    } else if (props.defaultCountry) {
      // Default country
      countryGuess = onlyCountries.find(o => o.iso2 == props.defaultCountry) || 0;
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

    const highlightCountryIndex = filteredCountries.findIndex(o => o == countryGuess);

    this.state = {
      formattedNumber,
      onlyCountries,
      preferredCountries,
      defaultCountry: props.defaultCountry,
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
    if (nextProps.defaultCountry && nextProps.defaultCountry !== this.state.defaultCountry) {
      this.updateDefaultCountry(nextProps.defaultCountry);
    }
    else if (nextProps.value !== this.state.formattedNumber) {
      this.updateFormattedNumber(nextProps.value);
    }
  }

  // Countries array methods
  deleteAreaCodes = (filteredCountries) => {
    return filteredCountries.filter((country) => {
      return country.isAreaCode !== true;
    });
  }

  filterRegions = (regions, filteredCountries) => {
    if (typeof regions === 'string') {
      const region = regions;
      return filteredCountries.filter((country) => {
        return country.regions.some((element) => {
          return element === region;
        });
      });
    }

    return filteredCountries.filter((country) => {
      const matches = regions.map((region) => {
        return country.regions.some((element) => {
          return element === region;
        });
      });
      return matches.some(el => el);
    });
  }

  getFilteredCountryList = (countryCodes, sourceCountryList, preserveOrder) => {
    if (countryCodes.length === 0) return this.extendCountries(sourceCountryList);

    let filteredCountries;
    if (preserveOrder) {
      // filter with user-defined order
      filteredCountries = countryCodes.map(countryCode => {
        const country = sourceCountryList.find(country => country.iso2 === countryCode);
        if (country) return country;
      }).filter(country => country); // remove any not found
    }
    else {
      // filter with alphabetical order
      filteredCountries = sourceCountryList.filter((country) => {
        return countryCodes.some((element) => {
          return element === country.iso2;
        });
      });
    }

    return this.extendCountries(filteredCountries);
  }

  extendCountries = (countries) => {
    const { localization, masks, areaCodes } = this.props

    for (let i = 0; i < countries.length; i++) {
      if (localization[countries[i].iso2] !== undefined) {
        countries[i].localName = localization[countries[i].iso2];
      }
      else if (localization[countries[i].name] !== undefined) {
        countries[i].localName = localization[countries[i].name];
      }

      if (masks[countries[i].iso2] !== undefined) {
        countries[i].format = masks[countries[i].iso2];
      }
      else if (masks[countries[i].name] !== undefined) {
        countries[i].format = masks[countries[i].name];
      }
    }

    if (Object.keys(areaCodes).length > 0) {
      let updCountries = [];
      let foundCountry = null;

      for (let i = 0; i < countries.length; i++) {
        updCountries.push(countries[i]);

        if (areaCodes[countries[i].iso2] !== undefined) {
          if (!foundCountry) foundCountry = countries[i];
          if (countries[i+1] && countries[i+1].iso2 === foundCountry.iso2) continue;
          this.getCustomAreas(foundCountry, areaCodes[countries[i].iso2]).forEach(o => {
            updCountries.push(o);
          });
          foundCountry = null;
        }
        else if (areaCodes[countries[i].name] !== undefined) {
          if (!foundCountry) foundCountry = countries[i];
          // skip until all native area codes pushed
          if (countries[i+1] && countries[i+1].iso2 === foundCountry.iso2) continue;
          this.getCustomAreas(foundCountry, areaCodes[countries[i].name]).forEach(o => {
            updCountries.push(o);
          });
          foundCountry = null;
        }
      }
      return updCountries;
    }
    return countries;
  }

  getCustomAreas = (country, areaCodes) => {
    let customAreas = [];
    for (let i = 0; i < areaCodes.length; i++) {
      let newCountry = JSON.parse(JSON.stringify(country));
      newCountry.dialCode += areaCodes[i];
      customAreas.push(newCountry);
    }
    return customAreas;
  }

  excludeCountries = (selectedCountries, excludedCountries) => {
    if (excludedCountries.length === 0) {
      return selectedCountries;
    } else {
      return selectedCountries.filter((selCountry) => {
        return !excludedCountries.includes(selCountry.iso2);
      });
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

  guessSelectedCountry = memoize((inputNumber, onlyCountries, defaultCountry) => {
    const secondBestGuess = onlyCountries.find(o => o.iso2 == defaultCountry) || {};
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
  updateDefaultCountry = (country) => {
    const newSelectedCountry = this.state.onlyCountries.find(o => o.iso2 == country);
    this.setState({
      defaultCountry: country,
      selectedCountry: newSelectedCountry,
      formattedNumber: this.props.disableCountryCode ? '' : '+' + newSelectedCountry.dialCode
    });
  }

  updateFormattedNumber(value) {
    const { onlyCountries, defaultCountry } = this.state;
    let newSelectedCountry;
    let inputNumber = value;
    let formattedNumber = value;

    // if inputNumber does not start with '+', then use default country's dialing prefix,
    // otherwise use logic for finding country based on country prefix.
    if (!startsWith(inputNumber, '+')) {
      newSelectedCountry = this.state.selectedCountry || onlyCountries.find(o => o.iso2 == defaultCountry);
      const dialCode = newSelectedCountry && !startsWith(inputNumber.replace(/\D/g, ''), newSelectedCountry.dialCode) ? newSelectedCountry.dialCode : '';
      formattedNumber = this.formatNumber(
        (this.props.disableCountryCode ? '' : dialCode) + inputNumber.replace(/\D/g, ''),
        newSelectedCountry ? newSelectedCountry.format : undefined
      );
    }
    else {
      inputNumber = inputNumber.replace(/\D/g, '');
      newSelectedCountry = this.guessSelectedCountry(inputNumber.substring(0, 6), onlyCountries, defaultCountry);
      formattedNumber = this.formatNumber(inputNumber, newSelectedCountry.format);
    }

    this.setState({ selectedCountry: newSelectedCountry, formattedNumber });
  }

  // View methods
  scrollTo = (country, middle) => {
    if (!country)
      return;

    const container = this.dropdownRef;

    if (!container || !document.body)
      return;

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

    if (this.props.enableSearchField ? elementTop < containerTop + 32 : elementTop < containerTop) {
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
      return disableCountryCode ? '' : '+';
    }

    // for all strings with length less than 3, just return it (1, 2 etc.)
    // also return the same text if the selected country has no fixed format
    if ((text && text.length < 2) || !pattern || !autoFormat) {
      return disableCountryCode ? text : `+${text}`;
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
      countryCode: this.state.selectedCountry.iso2 || ''
    }
  }

  handleFlagDropdownClick = () => {
    if (!this.state.showDropdown && this.props.disabled) return;

    if (this.state.preferredCountries.includes(this.state.selectedCountry)) {
      this.setState({
        showDropdown: !this.state.showDropdown,
        highlightCountryIndex: this.state.preferredCountries.findIndex(o => o == this.state.selectedCountry)
      }, () => {
        if (this.state.showDropdown) {
          this.scrollTo(this.getElement(this.state.highlightCountryIndex));
        }
      });
    }
    else {
      const onlyCountries = this.props.disableAreaCodes ? this.deleteAreaCodes(this.state.onlyCountries) : this.state.onlyCountries;

      this.setState({
        showDropdown: !this.state.showDropdown,
        highlightCountryIndex: this.props.disableAreaCodes ? onlyCountries.findIndex(o => o.iso2 == this.state.selectedCountry.iso2) :
          onlyCountries.findIndex(o => o == this.state.selectedCountry)
      }, () => {
        if (this.state.showDropdown) {
          this.scrollTo(this.getElement(this.state.highlightCountryIndex + this.state.preferredCountries.length));
        }
      });
    }
  }

  handleInput = (e) => {
    let formattedNumber = this.props.disableCountryCode ? '' : '+';
    let newSelectedCountry = this.state.selectedCountry;
    let freezeSelection = this.state.freezeSelection;

    if(!this.props.countryCodeEditable) {
        const mainCode = newSelectedCountry.hasAreaCodes ?
          this.state.onlyCountries.find(o => o.iso2 === newSelectedCountry.iso2 && o.mainCode).dialCode :
          newSelectedCountry.dialCode;

        const updatedInput = '+' + mainCode;
        if (e.target.value.length < updatedInput.length) {
            return;
        }
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
        newSelectedCountry = this.guessSelectedCountry(inputNumber.substring(0, 6), this.state.onlyCountries, this.state.defaultCountry);
        freezeSelection = false;
      }
      formattedNumber = this.formatNumber(inputNumber, newSelectedCountry.format); // remove all non numerals from the input
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

      if (this.props.onChange) this.props.onChange(this.state.formattedNumber, this.getCountryData());
    });
  }

  handleInputClick = (e) => {
    this.setState({ showDropdown: false });
    if (this.props.onClick) this.props.onClick(e, this.getCountryData());
  }

  handleFlagItemClick = (country) => {
    const currentSelectedCountry = this.state.selectedCountry;
    const nextSelectedCountry = this.state.onlyCountries.find(o => o == country);
    if (!nextSelectedCountry) return;

    const unformattedNumber = this.state.formattedNumber.replace(' ', '').replace('(', '').replace(')', '').replace('-', '');
    const newNumber = unformattedNumber.length > 1 ? unformattedNumber.replace(currentSelectedCountry.dialCode, nextSelectedCountry.dialCode) : nextSelectedCountry.dialCode;
    const formattedNumber = this.formatNumber(newNumber.replace(/\D/g, ''), nextSelectedCountry.format);

    this.setState({
      showDropdown: false,
      selectedCountry: nextSelectedCountry,
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
      if (this.numberInputRef.value === '+' && this.state.selectedCountry && !this.props.disableCountryCode) {
        this.setState({
          formattedNumber: '+' + this.state.selectedCountry.dialCode
        }, () => setTimeout(this.cursorToEnd, 10));
      }
    }

    this.setState({ placeholder: '' });

    this.props.onFocus && this.props.onFocus(e, this.getCountryData());
    setTimeout(this.cursorToEnd, 10);
  }

  handleInputBlur = (e) => {
    if (!e.target.value) this.setState({ placeholder: this.props.placeholder });
    this.props.onBlur && this.props.onBlur(e, this.getCountryData());
  }

  getHighlightCountryIndex = (direction) => {
    // had to write own function because underscore does not have findIndex. lodash has it
    const highlightCountryIndex = this.state.highlightCountryIndex + direction;

    if (highlightCountryIndex < 0 || highlightCountryIndex >= (this.state.onlyCountries.length + this.state.preferredCountries.length)) {
      return highlightCountryIndex - direction;
    }

    if (this.props.enableSearchField && highlightCountryIndex > this.getSearchFilteredCountries().length) return 0; // select first country
    return highlightCountryIndex;
  }

  searchCountry = () => {
    const preferredSelected = this.state.preferredCountries.includes(this.state.selectedCountry);
    const onlyCountries = this.props.disableAreaCodes ? this.deleteAreaCodes(this.state.onlyCountries) : this.state.onlyCountries;

    const probableCandidate = this.getProbableCandidate(this.state.queryString) || this.state.onlyCountries[0];
    const probableCandidateIndex = onlyCountries.findIndex(o => o == probableCandidate) + (preferredSelected ? this.state.preferredCountries.length : 0);
    this.scrollTo(this.getElement(probableCandidateIndex + (preferredSelected ? 0 : this.state.preferredCountries.length)), true);
    this.scrollTo(this.getElement(probableCandidateIndex), true);

    this.setState({queryString: '', highlightCountryIndex: probableCandidateIndex});
  }

  handleKeydown = (e) => {
    const { keys } = this.props;
    const { target: { id } } = e;

    if (id === 'flag-dropdown' && e.which === keys.ENTER && !this.state.showDropdown)
      return this.handleFlagDropdownClick();

    if (id === 'phone-form-control' && (e.which === keys.ENTER || e.which === keys.ESC))
      return e.target.blur();

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
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
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

    switch (e.which) {
      case keys.DOWN:
        moveHighlight(1);
        break;
      case keys.UP:
        moveHighlight(-1);
        break;
      case keys.ENTER:
        if (this.props.enableSearchField) {
          this.handleFlagItemClick(this.getSearchFilteredCountries()[this.state.highlightCountryIndex], e);
        } else {
          this.handleFlagItemClick(this.state.onlyCountries[this.state.highlightCountryIndex], e);
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
    this.setState({ searchValue });
  }

  getDropdownCountryName = (country) => {
    return country.localName || country.name;
  }

  getSearchFilteredCountries = () => {
    const { preferredCountries, onlyCountries, searchValue } = this.state
    const { enableSearchField } = this.props
    const allCountries = preferredCountries.concat(onlyCountries);
    const sanitizedSearchValue = searchValue.trim().toLowerCase();
    let searchedCountries = (enableSearchField && sanitizedSearchValue)
      // using [...new Set()] here to get rid of duplicates
      ? [...new Set(allCountries.filter(({ name, localName, iso2, dialCode }) =>
        [`${name}`, `${localName}`, `${iso2}`, `+${dialCode}`].some(field => field.toLowerCase().includes(sanitizedSearchValue))))]
      : allCountries;
    if (this.props.disableAreaCodes) searchedCountries = this.deleteAreaCodes(searchedCountries);
    return searchedCountries
  }

  getCountryDropdownList = () => {
    const { preferredCountries, highlightCountryIndex, showDropdown, searchValue } = this.state;
    const { enableSearchField, disableSearchIcon, searchClass, searchStyle, searchPlaceholder } = this.props;

    const countryIsPreferred = this.state.preferredCountries.includes(this.state.selectedCountry);
    const searchedCountries = this.getSearchFilteredCountries()

    let countryDropdownList = searchedCountries.map((country, index) => {
      const itemClasses = classNames({
        country: true,
        preferred: country.iso2 === 'us' || country.iso2 === 'gb',
        active: country.iso2 === 'us',
        highlight: countryIsPreferred ? highlightCountryIndex === index : highlightCountryIndex === index - preferredCountries.length
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
          <span className='dial-code'>{'+' + country.dialCode}</span>
        </li>
      );
    });

    const dashedLi = (<li key={'dashes'} className='divider'/>);
    // let's insert a dashed line in between preffered countries and the rest
    (preferredCountries.length > 0) &&
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
        {enableSearchField && (
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
    const { selectedCountry, showDropdown, formattedNumber } = this.state;
    const { disableDropdown, renderStringAsFlag } = this.props;

    const arrowClasses = classNames({'arrow': true, 'up': showDropdown});
    const inputClasses = classNames({
      [this.props.inputClass]: true,
      'form-control': true,
      'invalid-number': !this.props.isValid(formattedNumber.replace(/\D/g, ''))
    });

    const flagViewClasses = classNames({
      [this.props.buttonClass]: true,
      'flag-dropdown': true,
      'open-dropdown': showDropdown
    });
    const inputFlagClasses = `flag ${selectedCountry && selectedCountry.iso2}`;

    return (
      <div
        className={this.props.containerClass}
        style={this.props.containerStyle}
        onKeyDown={this.handleKeydown}>
        <input
          className={inputClasses}
          id='phone-form-control'
          style={this.props.inputStyle}
          onChange={this.handleInput}
          onClick={this.handleInputClick}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
          value={formattedNumber}
          ref={el => this.numberInputRef = el}
          onKeyDown={this.handleInputKeyDown}
          placeholder={this.props.placeholder}
          disabled={this.props.disabled}
          type='tel'
          {...this.props.inputExtraProps}
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
          <div className='selected-flag'>{renderStringAsFlag}</div>
          :
          <div
            onClick={disableDropdown ? undefined : this.handleFlagDropdownClick}
            className='selected-flag'
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
