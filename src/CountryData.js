import rawCountries from './rawCountries'
import rawTerritories from './rawTerritories'

// let allCountryCodes = {}
//
// function addCountryCode(iso2, dialCode, priority) {
//   if (!(dialCode in allCountryCodes)) {
//     allCountryCodes[dialCode] = [];
//   }
//   const index = priority || 0;
//   allCountryCodes[dialCode][index] = iso2;
// }

function getMask(prefix, dialCode, predefinedMask, defaultMask, alwaysDefaultMask) {
  if (!predefinedMask || alwaysDefaultMask) {
    return prefix+''.padEnd(dialCode.length,'.')+' '+defaultMask;
  } else {
    return prefix+''.padEnd(dialCode.length,'.')+' '+predefinedMask;
  }
}

// enableAreaCodes: boolean || array of iso2 codes
function initCountriesAndAreaCodes(countries, enableAreaCodes, prefix, defaultMask, alwaysDefaultMask) {
  let enableAllCodes;
  if (typeof enableAreaCodes === 'boolean') { enableAllCodes = true }
  else { enableAllCodes = false }

  return [].concat(...countries.map((country) => {
    const countryItem = {
      name: country[0],
      regions: country[1],
      iso2: country[2],
      dialCode: country[3],
      format: getMask(prefix, country[3], country[4], defaultMask, alwaysDefaultMask),
      priority: country[5] || 0,
      hasAreaCodes: country[6] ? true : false,
    };

    const areaItems = [];

    country[6] && (enableAllCodes || enableAreaCodes.includes(country[2])) && country[6].map((areaCode) => {
      const areaItem = {...countryItem};
      areaItem.regions = country[1];
      areaItem.dialCode = country[3] + areaCode;
      areaItem.isAreaCode = true;

      areaItems.push(areaItem);

      // addCountryCode(country[2], areaItem.dialCode);
    });

    // addCountryCode(
    //   countryItem.iso2,
    //   countryItem.dialCode,
    //   countryItem.hasAreaCodes
    // );

    if (areaItems.length > 0) {
      countryItem.mainCode = true;
      return [countryItem, ...areaItems];
    } else {
      return [countryItem];
    }
  }))
}

function initCountries(countries, prefix, defaultMask, alwaysDefaultMask) {
  return countries.map((country) => ({
    name: country[0],
    regions: country[1],
    iso2: country[2],
    dialCode: country[3],
    format: getMask(prefix, country[3], country[4], defaultMask, alwaysDefaultMask),
    priority: country[5] || 0,
  }))
}


export default class CountryData {
  constructor (
    enableAreaCodes, enableTerritories, regions,
    onlyCountries, preferredCountries, excludeCountries, preserveOrder,
    localization, masks, areaCodes,
    prefix, defaultMask, alwaysDefaultMask,
    priority,
  ) {
    let filteredCountries = enableAreaCodes ?
      initCountriesAndAreaCodes(rawCountries, enableAreaCodes, prefix, defaultMask, alwaysDefaultMask) :
      initCountries(rawCountries, prefix, defaultMask, alwaysDefaultMask);
    if (enableTerritories) {
      let filteredTerritories = enableAreaCodes ?
        initCountriesAndAreaCodes(rawTerritories, enableAreaCodes, prefix, defaultMask, alwaysDefaultMask) :
        initCountries(rawTerritories, prefix, defaultMask, alwaysDefaultMask);
      filteredCountries = this.initTerritories(filteredTerritories, filteredCountries);
    }
    if (regions) filteredCountries = this.filterRegions(regions, filteredCountries);

    this.onlyCountries = this.excludeCountries(
      this.extendCountries(
        this.getFilteredCountryList(onlyCountries, filteredCountries, preserveOrder.includes('onlyCountries')),
        localization, masks, areaCodes, priority
      ),
      excludeCountries
    );

    this.preferredCountries = preferredCountries.length === 0 ? [] :
      this.extendCountries(
        this.getFilteredCountryList(preferredCountries, filteredCountries, preserveOrder.includes('preferredCountries')),
        localization, masks, areaCodes, priority
      );
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

  initTerritories = (filteredTerritories, filteredCountries) => {
    const fullCountryList = [...filteredTerritories, ...filteredCountries];
    fullCountryList.sort(function(a, b){
      if(a.name < b.name) { return -1; }
      if(a.name > b.name) { return 1; }
      return 0;
    });
    return fullCountryList;
  }

  getFilteredCountryList = (countryCodes, sourceCountryList, preserveOrder) => {
    if (countryCodes.length === 0) return sourceCountryList;

    let filteredCountries;
    if (preserveOrder) {
      // filter using user-defined order
      filteredCountries = countryCodes.map(countryCode => {
        const country = sourceCountryList.find(country => country.iso2 === countryCode);
        if (country) return country;
      }).filter(country => country); // remove any not found
    }
    else {
      // filter using alphabetical order
      filteredCountries = sourceCountryList.filter((country) => {
        return countryCodes.some((element) => {
          return element === country.iso2;
        });
      });
    }

    return filteredCountries;
  }

  extendCountries = (countries, localization, masks, areaCodes, priority) => {
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
      return this.modifyPriority(updCountries, priority);
    }
    return this.modifyPriority(countries, priority);
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

  modifyPriority = (countries, priority) => {
    if (priority) {
      const priorityKeys = Object.keys(priority)
      countries.forEach(o => {
        if (priorityKeys.includes(o.iso2)) {
          Object.keys(priority).forEach(key => {
            if (key === o.iso2) o.priority = priority[key]
          })
        }
      })
    }
    return countries;
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
}
