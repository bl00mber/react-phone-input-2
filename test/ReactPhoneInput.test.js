import { render, fireEvent, cleanup } from 'react-testing-library'
import React from 'react'
import ReactPhoneInput from '../src/index'


afterEach(cleanup)

describe('<ReactPhoneInput /> countries props', () => {
  test('has not "us" country in the dropdown', () => {
    const { container: phoneInput } = render(
      <ReactPhoneInput
        excludeCountries={['us']}
      />)

    fireEvent.click(phoneInput.querySelector('.selected-flag'))
    expect(phoneInput.querySelectorAll('li[data-country-code="us"]').length).toBe(0)
    expect(phoneInput.querySelectorAll('li[data-country-code="gb"]').length).toBe(1)
  })

  test('has only "us" country in the dropdown', () => {
    const { container: phoneInput } = render(
      <ReactPhoneInput
        onlyCountries={['us']}
      />)

    fireEvent.click(phoneInput.querySelector('.selected-flag'))
    expect(phoneInput.querySelectorAll('li[data-country-code="us"]').length).toBeGreaterThan(0)
    expect(phoneInput.querySelectorAll('li[data-country-code="gb"]').length).toBe(0)
  })

  test('has "us" in the preferred countries section', () => {
    const { container: phoneInput } = render(
      <ReactPhoneInput
        preferredCountries={['us']}
      />)

    fireEvent.click(phoneInput.querySelector('.selected-flag'))
    expect(phoneInput.querySelector('.country-list').children[0].dataset.countryCode).toBe('us')
  })
})


describe('<ReactPhoneInput /> main props', () => {
  test('has "us" as the default/highlighted country', () => {
    const { container: phoneInput } = render(
      <ReactPhoneInput
        defaultCountry='us'
      />)

    fireEvent.click(phoneInput.querySelector('.selected-flag'))
    expect(phoneInput.querySelector('.selected-flag').children[0].classList).toContain('us')
    expect(phoneInput.querySelector('li[data-country-code="us"]').classList).toContain('highlight')
  })

  test('receive correct value', () => {
    const { container: phoneInput } = render(
      <ReactPhoneInput
        value='+3802343252'
      />)

    expect(phoneInput.querySelector('.form-control').value).toBe('+380 (23) 432 52')
  })
})


describe('<ReactPhoneInput /> event handlers', () => {
  test('onChange is being called with formatted value and country object as callback arguments', () => {
    const mockFn = jest.fn();
    const { container: phoneInput } = render(
      <ReactPhoneInput
        defaultCountry={'us'}
        onChange={mockFn}
      />)

    fireEvent.change(phoneInput.querySelector('.form-control'), {target: {value: '12345'}})
    expect(mockFn).toHaveBeenCalledWith('+1 (234) 5', {name: 'United States', dialCode: '1', countryCode: 'us'})
  })
})


describe('<ReactPhoneInput /> other props', () => {
  test('pass inputExtraProps into the input', () => {
    const { container: phoneInput } = render(
      <ReactPhoneInput
        inputExtraProps={{name: 'phone'}}
      />)

    expect(phoneInput.querySelector('.form-control').name).toBe('phone')
  })

  test('filter european countries with the regions={\'europe\'} prop', () => {
    const { container: phoneInput } = render(
      <ReactPhoneInput
        regions={'europe'}
      />)

    fireEvent.click(phoneInput.querySelector('.selected-flag'))
    expect(phoneInput.querySelectorAll('li[data-country-code="us"]').length).toBe(0)
    expect(phoneInput.querySelectorAll('li[data-country-code="ca"]').length).toBe(0)
    expect(phoneInput.querySelectorAll('li[data-country-code="ua"]').length).toBe(1)
    expect(phoneInput.querySelectorAll('li[data-country-code="fr"]').length).toBe(1)
  })

  test('localize countries labels using "localization" prop', () => {
    const { container: phoneInput } = render(
      <ReactPhoneInput
        onlyCountries={['de', 'es']}
        localization={{'Germany': 'Deutschland', 'Spain': 'España'}}
      />)

    fireEvent.click(phoneInput.querySelector('.selected-flag'))
    expect(phoneInput.querySelector('li[data-country-code="de"]').querySelector('.country-name').textContent).toBe('Deutschland')
    expect(phoneInput.querySelector('li[data-country-code="es"]').querySelector('.country-name').textContent).toBe('España')
  })

  test('render custom mask with the "masks" prop', () => {
    const { container: phoneInput } = render(
      <ReactPhoneInput
        defaultCountry='fr'
        onlyCountries={['fr']}
        masks={{'fr': '+.. (...) ..-..-..'}}
        value='33543773322'
      />)

    fireEvent.click(phoneInput.querySelector('.selected-flag'))
    expect(phoneInput.querySelector('.form-control').value).toBe('+33 (543) 77-33-22')
  })

  test('not renders area codes with disableAreaCodes', () => {
    const { container: phoneInput } = render(
      <ReactPhoneInput
        disableAreaCodes
      />)

    fireEvent.click(phoneInput.querySelector('.selected-flag'))
    expect(phoneInput.querySelectorAll('li[data-country-code="us"]').length).toBe(1)
    expect(phoneInput.querySelectorAll('li[data-country-code="ca"]').length).toBe(1)
  })

  test('search correct country via search field', () => {
    const { container: phoneInput } = render(
      <ReactPhoneInput
        enableSearchField
      />)

    fireEvent.click(phoneInput.querySelector('.selected-flag'))
    fireEvent.change(phoneInput.querySelector('.search-box'), {target: {value: 'gb'}})
    expect(phoneInput.querySelector('.country-list').children.length).toBe(2) // search field & 1 search result
    expect(phoneInput.querySelector('.country-list').children[1].querySelector('.country-name').textContent).toBe('United Kingdom')
  })

  test('should rerender without crashing', () => {
    const { container: phoneInput, rerender } = render(
      <ReactPhoneInput
        value={undefined}
      />)

    // re-render the same component with new props
    rerender(
      <ReactPhoneInput
        value="012312332"
      />)

    expect(phoneInput.querySelector('.selected-flag').children.length).toBe(1)
    expect(phoneInput.querySelector('.selected-flag').children[0].className).toBe('flag undefined')
  })
})
