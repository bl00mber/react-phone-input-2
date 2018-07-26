# react-phone-input-2
Highly customizable phone input component with auto formatting.

![alt tag](https://media.giphy.com/media/l378A8qFNzgiuPUre/giphy.gif)

## Installation

```shell-script
npm install react-phone-input-2 --save
```

## Usage

```jsx
React.render(
  <ReactPhoneInput defaultCountry={'us'} onChange={handleOnChange}/>,
  document.getElementById('root')
);
```

Your handler for the ``onChange`` event should expect a string as
parameter, where the value is that of the entered phone number. For example:

```jsx
function handleOnChange(value) {
   this.setState({
      phone: value
   });
}
```

## Options

<table>
  <tr>
    <th> Name </th>
    <th> Type </th>
    <th> Description </th>
    <th> Example </th>
  </tr>
  <tr>
    <td> excludeCountries </td>
    <td> array </td>
    <td> array of country codes to be excluded </td>
    <td> ['cu','cw','kz'] </td>
  </tr>
  <tr>
    <td> onlyCountries </td>
    <td> array </td>
    <td> country codes to be included </td>
    <td> ['cu','cw','kz'] </td>
  </tr>
  <tr>
    <td> preferredCountries </td>
    <td> array </td>
    <td> country codes to be at the top </td>
    <td> ['cu','cw','kz'] </td>
  </tr>
  <tr>
    <td> defaultCountry </td>
    <td> string </td>
    <td> initial country </td>
    <td> 'us' </td>
  </tr>

  <tr>
    <td> value </td>
    <td> string </td>
    <td colspan="2"> input state value </td>
  </tr>
  <tr>
    <td> placeholder </td>
    <td> string </td>
    <td colspan="2"> custom placeholder </td>
  </tr>
  <tr>
    <td> name </td>
    <td> string </td>
    <td colspan="2"> input name </td>
  </tr>
  <tr>
    <td> required </td>
    <td> bool </td>
    <td colspan="2"> false by default </td>
  </tr>
  <tr>
    <td> disabled </td>
    <td> bool </td>
    <td colspan="2"> disable input and dropdown </td>
  </tr>
  <tr>
    <td> autoFocus </td>
    <td> bool </td>
    <td colspan="2"> autoFocus input </td>
  </tr>
  <tr>
    <td> containerStyle </td>
    <td> object </td>
    <td colspan="2"> styles for container </td>
  </tr>
  <tr>
    <td> inputStyle </td>
    <td> object </td>
    <td colspan="2"> styles for input </td>
  </tr>
  <tr>
    <td> buttonStyle </td>
    <td> object </td>
    <td colspan="2"> styles for dropdown button </td>
  </tr>
  <tr>
    <td> dropdownStyle </td>
    <td> object </td>
    <td colspan="2"> styles for dropdown container </td>
  </tr>

  <tr>
    <td> containerClass </td>
    <td> string </td>
    <td colspan="2"> class for container </td>
  </tr>
  <tr>
    <td> inputClass </td>
    <td> string </td>
    <td colspan="2"> class for input </td>
  </tr>
  <tr>
    <td> buttonClass </td>
    <td> string </td>
    <td colspan="2"> class for dropdown button </td>
  </tr>
  <tr>
    <td> dropdownClass </td>
    <td> string </td>
    <td colspan="2"> class for dropdown container </td>
  </tr>

  <tr>
    <td> autoFormat </td>
    <td> bool </td>
    <td colspan="2"> on/off auto formatting, true by default </td>
  </tr>
  <tr>
    <td> disableAreaCodes </td>
    <td> bool </td>
    <td colspan="2"> disable local codes for all countries </td>
  </tr>
  <tr>
    <td> disableCountryCode </td>
    <td> bool </td>
    <td colspan="2"> false by default </td>
  </tr>
  <tr>
    <td> disableDropdown </td>
    <td> bool </td>
    <td colspan="2"> false by default </td>
  </tr>
  <tr>
    <td> enableLongNumbers </td>
    <td> bool </td>
    <td colspan="2"> false by default </td>
  </tr>
  <tr>
    <td> countryCodeEditable </td>
    <td> bool </td>
    <td colspan="2"> true by default </td>
  </tr>
</table>

### Regions

<table>
  <tr>
    <th> Name </th>
    <th> Type </th>
    <th> Description </th>
  </tr>
  <tr>
    <td> regions </td>
    <td> array/string </td>
    <td> to only show codes from selected regions </td>
  </tr>
</table>

<table>
  <tr>
    <th> Regions </th>
  </tr>
  <tr>
    <td> ['america', 'europe', 'asia', 'oceania', 'africa'] </td>
  </tr>
  <tr>
    <th> Subregions </th>
  </tr>
  <tr>
    <td> ['north-america', 'south-america', 'central-america', 'carribean', 'european-union', 'ex-ussr', 'middle-east', 'north-africa'] </td>
  </tr>
</table>

Regions selected: {'europe'}
```jsx
<ReactPhoneInput
  defaultCountry='it'
  regions={'europe'}
/>
```

Regions selected: {['north-america', 'carribean']}
```jsx
<ReactPhoneInput
  defaultCountry='ca'
  regions={['north-america', 'carribean']}
/>
```

### Localization

<table>
  <tr>
    <th> Name </th>
    <th> Type </th>
  </tr>
  <tr>
    <td> localization </td>
    <td> object </td>
  </tr>
</table>

```jsx
<ReactPhoneInput
  onlyCountries=['de', 'es']
  localization={{'Germany': 'Deutschland', 'Spain': 'España'}}
/>
```

### Supported events

<table>
  <tr>
    <td> onChange </td>
    <td> onFocus </td>
    <td> onBlur </td>
    <td> onClick </td>
    <td> onKeyDown </td>
  </tr>
</table>

Country data object not returns from onKeyDown event

<table>
  <tr>
    <th> Data </th>
    <th> Type </th>
    <th> Description </th>
  </tr>
  <tr>
    <td> value/event </td>
    <td> string/object </td>
    <td> the event or the phone number </td>
  </tr>
  <tr>
    <td> country data </td>
    <td> object </td>
    <td> the country object { name, dialCode, country code (iso2 format) } </td>
  </tr>
</table>

## License

Based on [react-phone-input](https://github.com/razagill/react-phone-input) using [MIT](https://opensource.org/licenses/MIT)
