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
