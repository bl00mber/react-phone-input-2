## 2.13.8 (August 25, 2020)
* `specialLabel`, `disableCountryGuess`
* Add some missing flags to css
* Minor fixes


## 2.13.7 (June 27, 2020)
* Fix countryCodeEditable for single digit country [@kieshaherman](https://github.com/kieshaherman)
* Add Turkish translation [@smddzcy](https://github.com/smddzcy)
* Fix search of 'undefined' strings [@sackeyjason](https://github.com/sackeyjason)
* Fix handleFlagDropdownClick [@Manimall](https://github.com/Manimall)
* `disableInitialCountryGuess` [@xavieramoros](https://github.com/xavieramoros)
* Screenreader aria attributes [@sackeyjason](https://github.com/sackeyjason)


## 2.13.1 (April 15, 2020)
* `enableAreaCodeStretch` to handle area codes of different length on the same country
* null passed as value will clear country, empty string will clear prefix
* `enableClickOutside` to disable dropdown close handler
* `showDropdown` to allow initially opened dropdowns
* Always return unformatted value as 1st argument and formatted as 4th in onChange
* Search by dialCode
* `searchNotFound` to modify text showed when no entry is found
* Do not use prefix and dialCode in custom masks
* Add `hiddenAreaCodes` which is the array of disabled area codes used to compute correct country
* Enable event propagation for onEnterKeyPress
* Validation `defaultErrorMessage` on the top of the input
* Derive errorMessage from isValid handler
* Mexican area codes [@fleetofthemalden](https://github.com/fleetofthemalden)
* Australia area codes
* Typescript support


## 2.12.1 (March 11, 2020)
* `priority`, `alwaysDefaultMask`
* Custom `tabIndex`
* Replace id usage to classes to avoid warnings [@J-theGit](https://github.com/J-theGit)
* Dynamic mask creation
* Move dependent territories to external file, add `enableTerritories` [@gillerg8](https://github.com/gillerg8)


## 2.11.0 (December 4, 2019)
* Add languages: jp, cn, pt, it, ir, ar, id
* Replace `disableAreaCodes` to `enableAreaCodes`
* `defaultCountry` → `country`
* `enableSearchField` → `enableSearch`
* Search update, search countries firstly using iso2 codes
* Set countries using dialCode
* Add Kosovo, subregions: ex-yugos, baltic
* Add `defaultMask`, `prefix`
* Copy number from input without formatting
* Select whole number when double click
* Pass event object to onChange handler
* Style update: style.css high-res.css material.css bootstrap.css semantic-ui.css plain.css


## 2.10.0 (September 18, 2019)
* Add languages: es, de, ru, fr
* Custom `areaCodes`
* Search localized country name #123
* `renderStringAsFlag` to show string instead of flag
* Fix input freezing on area codes #119
* Add `preserveOrder` #109
* Better keyboard support
* Make lib work inside shadow DOM #105 [@newying61](https://github.com/newying61)
* IE Polyfyll startswith #102


## 2.9.3 (April 8, 2019)
* SSR support (removed references to browser objects)
* Change importing method
* `defaultCountry` update fix #70
* Add `disableSearchIcon`, `searchStyle` props
* Tests


## 2.8.0 (February 20, 2019)
* Custom phone `masks`
* Localization using iso2 codes
* Upgrade dependencies & webpack #65 [@jnsdls](https://github.com/jnsdls)
* Remove lodash #44
* Keep detection of area codes with `disableAreaCodes` #49
* Drop setSelectionRange() check #50
* Customizable placeholder for search field
* Update phone masks
* Fix first number cutting #72


## 2.7.1 (November 29, 2018)
* Styles update, fix SearchField `autoFocus`
* SearchField [@awthwathje](https://github.com/awthwathje)


## 2.6.1 (September 26, 2018)
* Pass props into the input via `inputExtraProps`
* Remove `autoFocus`, `name`, `required` props


## 2.5.1 (July 26, 2018)
* Add `autoFocus` prop to input [@mikesholiu](https://github.com/mikesholiu)
* Focus and highlight preferred country
* Abstracts global document and document related properties [@Alex-ray](https://github.com/Alex-ray)


## 2.4.1 (July 1, 2018)
* Fix backspace
* Always show right bracket
* Add containerStyle prop
* Fix areaCodes doesn't change when same country selected
* Make country code not editable by passing prop countryCodeEditable [@HasanShehryarJaffri](https://github.com/HasanShehryarJaffri)


## 2.3.0 (May 27, 2018)
* Add localization feature
* Add classname to the main container
* Add custom class configurations [@Alex-ray](https://github.com/Alex-ray)


## 2.2.1 (March 15, 2018)
* Add masks for disableCountryCode attribute
* Add attribute to enable non-mask phone lengths
* Make phone formatter to reject non-mask phone lengths


## 2.1.1 (January 23, 2018)
* Add country object to be return to props functions [@shaypeleg1](https://github.com/shaypeleg1)
* SearchCountry error fix
* Add `disableDropdown` and `disableCountryCode`


## 2.0.0 (September 4, 2017)
* Add feature to select from regions
* Add regions and encapsulation
* Styles changed, styles customization
* Hide dropdown by click outside
* String refs replaced by callback refs
* Hide flag by default, custom placeholder
* Add property to disable area codes
* Fix preferred countires dropdown bug
* Auto-update flag if value field used, caret right-auto-align
