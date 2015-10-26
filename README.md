# react-phone-input
A simple react component to format a phone number as the user types.

![alt tag](http://i.giphy.com/l41m24L5YTSOifyW4.gif)

##Installation:
  ```npm install react-phone-input --save```
  
##Usage:
```jsx
React.render(
  <ReactPhoneInput defaultCountry={'us'} />,
  document.getElementById('content'));
```

##Options:
| Name | Description          |
| :------------- | :----------- |
| defaultCountry | country code to initialize the component|
| excludeCountries | array of country codes to be excluded e.g. ['cu','cw','kz']|
| onlyCountries | array of country codes to be included e.g. ['cu','cw','kz']|
| preferredCountries | array of country codes to be preferred (highlighted at the top) e.g. ['cu','cw','kz']|

##License
MIT
