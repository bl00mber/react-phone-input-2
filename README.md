# react-phone-input-2
Highly customizable phone input component with auto formatting.

<!-- ![alt tag](http://i.giphy.com/l41m24L5YTSOifyW4.gif) -->

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
    <td colspan="2"> initial phone value </td>
  </tr>
  <tr>
    <td> placeholder </td>
    <td> string </td>
    <td colspan="2"> custom placeholder </td>
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
    <td colspan="2"> styles for countries container </td>
  </tr>

  <tr>
    <td> autoFormat </td>
    <td> bool </td>
    <td colspan="2"> on/off auto formatting (on by default) </td>
  </tr>
  <tr>
    <td> disabled </td>
    <td> bool </td>
    <td colspan="2"> disable input and dropdown </td>
  </tr>
  <tr>
    <td> disableAreaCodes </td>
    <td> bool </td>
    <td colspan="2"> disable local codes for all countries </td>
  </tr>
</table>

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

## License

Based on [react-phone-input](https://github.com/razagill/react-phone-input) using
[MIT](https://opensource.org/licenses/MIT)
