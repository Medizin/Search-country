function App() {
    const countryLoader = document.getElementById('country-loader-container'),
        cityTextContainer = document.querySelector('.city-text-container'),
        countryTextContainer = document.querySelector('.country-text-container'),
        cityLoader = document.getElementById('city-loader-container');

    class Input {
        clear() {   
            this.el.value = '';
        }
    }

    class CountryInput extends Input {
        constructor() {
            super();
            this.el = document.getElementById('country-input');
        }

        debounce(func, wait, immediate) {
            let timeout;
            return function() {
                let context = this, args = arguments;
                let later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                let callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        } 
    }

    class CityInput extends Input {
        constructor() {
            super();
            this.el = document.getElementById('city-input');
        }  
        
        activateDisabled() {
            this.el.setAttribute('disabled', true);
        }

        removeDisabled() {
            this.el.removeAttribute('disabled');
        }

        setPlaceholderOnActiveInput() {
            this.el.setAttribute('placeholder', 'Start typing to search city');
        }

        setPlaceholderOnDisabledInput() {
            this.el.setAttribute('placeholder', 'City');
        }
    }

    class List {
        render(arr) {
            arr.forEach((elem) => {
                let li = document.createElement('li'),
                text = document.createTextNode(elem);
        
                li.appendChild(text);
                this.el.appendChild(li);
            })
        }

        clear() {
            this.el.innerHTML = '';
        }

        setSelected(selected) {
            this.el.appendChild(selected);
        }

        getList(pattern) {
            return fetch(this.place + '/search/' + pattern)
            .then((response) => {
                return response.json()
            })
        }
    }

    class CityList extends List {
        constructor() {
            super();
            this.el = document.getElementById('city-list');
            this.place = 'city';
        }

        filterCities(pattern) {
            let cond = new RegExp(pattern, 'i');

            filteredList = [];  

            citiesArray.forEach((elem) => {
                let reg = elem.match(cond);
            
                if (reg && reg.index === 0) {
                    filteredList.push(elem);
                }
            });
        }
    }

    class CountryList extends List {
        constructor() {
            super();
            this.el = document.getElementById('country-list');
            this.place = 'country';
        }
    }

    function show(elem) {
        elem.classList.remove('none');
    }

    function hide(elem) {
        elem.classList.add('none');
    }

    function setCitiesArr(data) {
        citiesArray = data;
    }

    function setCurrentCountry(countryName) {
        currentCountry = countryName;
    }

    function updateList() { 
        if (countryInput.el.value.trim()) {
            countryList.getList(countryInput.el.value)
            .then((some) => {
                hide(countryLoader);
        
                countryList.render(some);
            })
            .catch((error) => {
                hide(countryLoader);
                show(countryTextContainer);
                alert('WARNING' + error);
            })
        } else {
            show(countryTextContainer);
        } 
    }

    let countryInput = new CountryInput(),
        cityInput = new CityInput(),
        cityList = new CityList(),
        countryList = new CountryList();     

    let debounceInput = countryInput.debounce(updateList, 300),  
        filteredList = [],   
        currentCountry,                           
        citiesArray;         
    
    countryInput.el.addEventListener('input', debounceInput);
    
    countryInput.el.addEventListener('input', () => {
        countryList.clear();
        
        if (countryInput.el.value.trim()) {
            cityInput.clear();

            hide(countryTextContainer);
            cityList.clear();

            show(cityTextContainer);
            show(countryLoader);

            cityInput.activateDisabled();

            cityInput.setPlaceholderOnDisabledInput();
        } else {
            hide(countryLoader);
            show(countryTextContainer);
        }
    });
    
    countryList.el.addEventListener('click', (e) => {
        let target = e.target;
        if (target.tagName !== 'LI') return;
        
        hide(cityTextContainer);

        setCurrentCountry(target.firstChild.data)

        countryInput.clear();
        countryList.clear();
        cityInput.clear();
        cityList.clear();

        countryList.setSelected(target);

        show(cityLoader);
        
        cityList.getList(currentCountry)
            .then((some) => {
                hide(cityLoader);

                setCitiesArr(some);
        
                cityList.render(some);
            })
            .catch((error) => {
                hide(cityLoader);
                show(cityTextContainer);
                alert('WARNING ' + error);
            })

        cityInput.removeDisabled();
        cityInput.setPlaceholderOnActiveInput();
    });
    
    cityList.el.addEventListener('click', (e) => {
        let target = e.target;
        if (target.tagName !== 'LI') return;

        cityInput.clear();
        cityList.clear();

        cityList.setSelected(target);
    });
    
    cityInput.el.addEventListener('input', () => {
        cityList.clear();
    
        if (cityInput.el.value.trim()) {
            cityList.filterCities(cityInput.el.value);

            if (filteredList.length) {
                hide(cityTextContainer);
                cityList.render(filteredList);
            };
        }
    
        if (cityInput.el.value.trim() && !cityList.el.children.length) {
            show(cityTextContainer);
        } 
        
        if (!cityInput.el.value.trim()) {
            hide(cityTextContainer);

            cityList.render(citiesArray); 
        }
    });
} 

App();
