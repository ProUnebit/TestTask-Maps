const controlPanelLoadingText = document.querySelector('.control-panel-box__loading-text')
const controlPanelSwitcherButton = document.querySelector('.control-panel-box__switcher-button')
const controlPanelSelect = document.querySelector('.control-panel-box__form-select')
const controlPanelLogo = document.querySelector('.control-panel-box__logo')
const mapBoxYandex = document.getElementById('map-1')
const mapBox2gis = document.getElementById('map-2')

let dataM24
let displaySwitcher = false

controlPanelSwitcherButton.addEventListener('click', () => {
    if (!displaySwitcher) {
        mapBox2gis.style.visibility = 'visible'
        controlPanelSelect.setAttribute('disabled', true)
        controlPanelSelect.style.cursor = 'not-allowed'
        mapBoxYandex.style.display = 'none'
        mapBox2gis.style.display = 'block'
        controlPanelLogo.src = 'http://api.2gis.ru/assets/frontend/api/css/img/logo.svg'
        displaySwitcher = true
        return;
    } else if (displaySwitcher) {
        mapBox2gis.style.visibility = 'hidden'
        controlPanelSelect.removeAttribute('disabled')
        controlPanelSelect.style.cursor = ''
        mapBoxYandex.style.display = 'block'
        mapBox2gis.style.display = 'none'
        controlPanelLogo.src = 'https://upload.wikimedia.org/wikipedia/commons/9/91/Yandex_logo_en.svg'
        displaySwitcher = false
    }
})

ymaps.ready(init)

function init() {

    let myMap = new ymaps.Map("map-1", {
        center: [55.76, 37.64],
        zoom: 12
    })


    fetch('https://raw.githubusercontent.com/ProUnebit/Reminder_ToMe_Reminder/master/src/data.json')
        .then(res => {
            controlPanelLoadingText.textContent = 'Обработка данных... ⏳'
            return res.json()
        })
        .then(data => {
            dataM24 = data;
            showMapPointsYandex(data, 'orange')
            return data
        })
        .then(data => {
            controlPanelLoadingText.textContent = 'Yandex карта загружена ✔️'
            showMapPoints2gis(data)
        })
        .catch(err => console.error(err));


    const showMapPointsYandex = (dataM24, color) => {

        let myGeoObjects = new ymaps.GeoObjectCollection({}, {
            preset: `islands#${color}CircleIcon`,
            strokeWidth: 4,
            geodesic: true
        });

        dataM24.map(district => district.points.map(point => {
            myGeoObjects.add(new ymaps.Placemark([point.address.lon, point.address.lat], {
                hintContent: `<div class="hintContent">
                <span>${district.header}</span>
                </div>`,
                balloonContent: `<div class="balloonContent">
                <p>${district.header}</p>
                <p>${point.address.address}</p>
                </div>`
            }))
        }))

        myMap.geoObjects.add(myGeoObjects)
    }

    const showMapPoints2gis = dataM24 => {

        DG.then(function() {

            let map,
                markers = DG.featureGroup(),
                coordinates = [],
                myIcon = DG.icon({
                    iconUrl: 'https://mbtskoudsalg.com/images/map-marker-icons-png-3.png',
                    iconSize: [26, 30]
                })

            map = DG.map('map-2', {
                center: [55.76, 37.64],
                zoom: 12
            })


            dataM24.map(district => {
                for (let i = 0; i < district.points.length; i++) {
                    coordinates[0] = district.points[i].address.lon
                    coordinates[1] = district.points[i].address.lat
                    DG.marker(coordinates, {
                            icon: myIcon,
                            label: `
                     <div class="hintContent">
                        <span style="font-size: 17px">${district.header}</span>
                     </div>`
                        })
                        .addTo(markers)
                        .bindPopup(`
                        <di class="balloonContent">
                        <p style="margin-bottom: 5px;">${district.header}</p>
                        <p>${district.points[i].address.address}</p>
                        </di>`)
                }
            })

            markers.addTo(map)

            setTimeout(() => controlPanelLoadingText.textContent = '2GIS карта загружена ✔️', 1200)
            setTimeout(() => controlPanelLoadingText.textContent = 'Карты готовы 👌', 1800)
        });
    }

    controlPanelSelect.addEventListener('change', e => {
        if (e.target.value === 'Все') {
            myMap.geoObjects.removeAll()
            showMapPointsYandex(dataM24, 'orange')
        } else {
            let separatedTargetDistrict = dataM24.filter(district => district.header === e.target.value)
            myMap.geoObjects.removeAll()
            showMapPointsYandex(separatedTargetDistrict, 'violet')
        }
    })
}