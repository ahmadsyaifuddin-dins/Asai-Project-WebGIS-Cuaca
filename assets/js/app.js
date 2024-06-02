let mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

// Data Prakiraan Cuaca API XML dari BMKG
let apiUrls = {
    'kalimantan-selatan': 'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-KalimantanSelatan.xml',
    'bali': 'https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Bali.xml'
};

let markersLayers = new L.LayerGroup();

// Titik Koordinat
let coords = {
    'kalimantan-selatan': [-2.7727865, 115.4927252],
    'bali': [-8.4176227, 115.1482732]
};

// Layer Map SateliteV9
let satelliteLayerV9 = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmF1eml5dXNhcmFobWFuIiwiYSI6ImNsZmpiOXBqYTJnbzUzcnBnNnJzMjB0ZHMifQ.AldZlBJVQaCALzRw-vhWiQ', {
    maxZoom: 18,
    id: 'mapbox/satellite-v9',
    tileSize: 512,
    zoomOffset: -1,
    attribution: mbAttr
});

// Layer Map Hybrid
let hybridLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 25,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
});


// Layer Map Satelit Biasa
let satellitelayerbiasa = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 25
});

// Layer Map OpenStreetMapV9
let streetv9Layer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmF1eml5dXNhcmFobWFuIiwiYSI6ImNsZmpiOXBqYTJnbzUzcnBnNnJzMjB0ZHMifQ.AldZlBJVQaCALzRw-vhWiQ', {
    maxZoom: 19,
    id: 'mapbox/dark-v9',
    tileSize: 512,
    zoomOffset: -1,
    attribution: mbAttr
});

// Layer Map Street
let streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: mbAttr
});

// Layer Lalu Lintas
let trafficLayer = L.tileLayer('https://tile-b.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: mbAttr
});

// Menampilkan Gambaran Maps ketika di Render pertama kali
let map = L.map('map', {layers: [satelliteLayerV9, markersLayers]}).setView([-5.4489459, 115.3996154], 6);

// Meletakan Marker
var marker = L.marker([-8.669952220767247, 115.2184037705552],
    {alt: 'Tujuan'}).addTo(map)
    .bindPopup('Denpasar, Tempat yg ingin dituju!');
    var marker = L.marker([-8.814000188758225, 115.16662254701092],
    {alt: 'Patung Garuda Wisnu Kencana'}).addTo(map)
    .bindPopup('Patung Garuda Wisnu Kencana, Tempat yg ingin dituju!');

let baseLayers = {
    "SatelliteV9": satelliteLayerV9,
    "Hybrid": hybridLayer,
    "Satelite biasa": satellitelayerbiasa,
    "Dark StreetV9": streetv9Layer,
    "OpenStreetMap": streetLayer
};

L.control.layers(baseLayers).addTo(map);


// Add the easyPrint button
L.easyPrint({
    title: 'Print Map',
    position: 'topleft',
    sizeModes: ['A4Portrait', 'A4Landscape'],
    elementsToHide: 'p, h2'
}).addTo(map);

let utc = 8;
let date = moment();
let tanggal = document.querySelector('.tanggal');
let selectTanggal = document.querySelector('[name=select-tanggal]');
let selectWilayah = document.querySelector('[name=select-wilayah]');
let nextDate;
let createSelect = false;
let selectOption = [];
let kodeCuaca = {
    '0': ['Cerah', 'clearskies.png'],
    '1': ['Cerah Berawan', 'partlycloudy.png'],
    '2': ['Cerah Berawan', 'partlycloudy.png'],
    '3': ['Berawan', 'mostlycloudy.png'],
    '4': ['Berawan Tebal', 'overcast.png'],
    '5': ['Udara Kabur', 'haze.png'],
    '10': ['Asap', 'smoke.png'],
    '45': ['Kabut', 'fog.png'],
    '60': ['Hujan Ringan', 'lightrain.png'],
    '61': ['Hujan Sedang', 'rain.png'],
    '63': ['Hujan Lebat', 'heavyrain.png'],
    '80': ['Hujan Lokal', 'isolatedshower.png'],
    '95': ['Hujan Petir', 'severethunderstorm.png'],
    '97': ['Hujan Petir', 'severethunderstorm.png'],
};

selectWilayah.addEventListener('change', () => {
    selectOption = [];
    selectTanggal.innerHTML = '';
    createSelect = false;
    map.setView(coords[selectWilayah.value], 8);
    getData(date, selectWilayah.value);
    addGeoJsonLayers(selectWilayah.value);
});

selectTanggal.addEventListener('change', () => {
    getData(selectTanggal.value, selectWilayah.value);
});

getData(date, selectWilayah.value);
addGeoJsonLayers(selectWilayah.value);

async function getData(dateTime, wilayah) {
    markersLayers.clearLayers();
    dateTime = moment(dateTime).subtract(utc, 'h');
    let response = await fetch(apiUrls[wilayah]);
    let xmlString = await response.text();
    let parse = new DOMParser();
    let xmlData = parse.parseFromString(xmlString, 'text/xml');
    let areas = xmlData.querySelectorAll('area');
    areas.forEach((area) => {
        let lat = area.getAttribute('latitude');
        let lng = area.getAttribute('longitude');
        let prov = area.getAttribute('description');
        let weathers = area.querySelectorAll('parameter[id="weather"] timerange');
        let getTime = false;
        let posPrakiraan;
        let popUp = '<table width="190px">';
        weathers.forEach((weather, i) => {
            let getDateTime = weather.getAttribute('datetime');
            let prakiraan = weathers[i].querySelector('value').textContent;

            if (!selectOption.includes(getDateTime.substring(0, 8))) {
                selectOption.push(getDateTime.substring(0, 8));
            }

            if (getDateTime.substring(0, 8) == dateTime.format('YYYYMMDD')) {
                popUp += '<tr>' +
                         '<td>' + convertTime(getDateTime.substring(8)) +
                         '<td>:</td>' +
                         '<td><img style="width:40px;float:left" src="assets/images/icons/' + kodeCuaca[prakiraan][1] + '"> ' +
                         '<span style="position:relative;top:10px">' + kodeCuaca[prakiraan][0] + '</span></td>' +
                         '</tr>';
            }

            if (getDateTime.substring(0, 10) >= dateTime.format('YYYYMMDDHH') && getTime == false) {
                posPrakiraan = i;
                nextDate = getDateTime;
                getTime = true;
            }
        });

        popUp += '</table>';

        let prakiraan = weathers[posPrakiraan].querySelector('value').textContent;
        let iconUrl = 'assets/images/icons/' + kodeCuaca[prakiraan][1];
        let deskripsi = kodeCuaca[prakiraan][0];

        let marker = L.marker([lat, lng], {
            icon: L.icon({
                iconUrl: iconUrl,
                iconSize: [50, 50],
                iconAnchor: [25, 50]
            })
        }).bindPopup('<strong>Kota ' + prov + '</strong><br>' + parseDate(nextDate) + '<br>Keterangan : ' + deskripsi + popUp);
        marker.addTo(markersLayers);
        tanggal.textContent = parseDate(nextDate);
    });

    if (createSelect == false) {
        selectOption.forEach((getDate) => {
            let option = moment(getDate).format('D MMMM YYYY');
            let value = moment(getDate).format('YYYYMMDD');
            if (value == moment(date).format('YYYYMMDD')) {
                value = moment(date).value = moment(date).format('YYYY-MM-DD HH');
            } else {
                value = moment(getDate).format('YYYY-MM-DD') + ' 0' + utc;
            }
            let newOption = new Option(option, value);
            selectTanggal.add(newOption);
        });
        selectTanggal.value = moment(date).format('YYYY-MM-DD HH');
        createSelect = true;
    }
    markersLayers.addTo(map); // Tambahkan markersLayers ke peta
}

function convertTime(time) {
    if (time == '0000') {
        return 'Pagi';
    } else if (time == '0600') {
        return 'Siang';
    } else if (time == '1200') {
        return 'Sore';
    } else if (time == '1800') {
        return 'Dini Hari';
    } else {
        return 'Error';
    }
}

function parseDate(date) {
    let tahun = date.substr(0, 4);
    let bulan = date.substr(4, 2);
    let tanggal = date.substr(6, 2);
    let jam = date.substr(8, 2);
    let menit = date.substr(10, 2);
    let setTanggal = tahun + '-' + bulan + '-' + tanggal + ' ' + jam + ':' + menit + ':00';
    return moment(setTanggal).add(utc, 'h').format('DD MMMM YYYY HH:mm') + ' WITA';
}


function popUp(f, l) {
    var out = [];
    if (f.properties) {
        for (var key in f.properties) {
            out.push(key + ": " + f.properties[key]);
        }
        l.bindPopup(out.join("<br />"));
    }
}

function addGeoJsonLayers(wilayah) {
    let geojsonFiles;
    if (wilayah === 'bali') {
        // Files GeoJSON Pulau Bali
        geojsonFiles = [
            { file: "Denpasar.geojson", style: { color: 'red' } },
            { file: "BADUNG.geojson" },
            { file: "BANGLI.geojson" },
            { file: "BULELENG.geojson", style: { color: 'purple' } },
            { file: "GIANYAR.geojson", style: { color: 'green' }},
            { file: "JEMBRANA.geojson" },
            { file: "KARANGASEM.geojson" },
            { file: "KLUNGKUNG.geojson" },
            { file: "TABANAN.geojson", style: { color: 'yellow' } },
        ];
    } else if (wilayah === 'kalimantan-selatan') {
        // Files GeoJSON Kalimantan Selatan
        geojsonFiles = [
            { file: "63.01 Kabupaten Tanah Laut - Pelaihari.geojson"},
            { file: "63.02 Kabupaten Kotabaru - Kotabaru.geojson" },
            { file: "63.03 Kabupaten Banjar - Martapura.geojson" },
            { file: "63.04 Kabupaten Barito Kuala - Marabahan.geojson", style: { color: 'blue' } },
            { file: "63.05 Kabupaten Tapin - Rantau.geojson" },
            { file: "63.06 Kabupaten Hulu Sungai Selatan - Kandangan.geojson" },
            { file: "63.07 Kabupaten Hulu Sungai Tengah - Barabai.geojson" },
            { file: "63.08 Kabupaten Hulu Sungai Utara - Amuntai.geojson" },
            { file: "63.09 Kabupaten Tabalong - Tanjung.geojson" },
            { file: "63.10 Kabupaten Tanah Bumbu - Batulicin.geojson" },
            { file: "63.11 Kabupaten Balangan - Paringin.geojson", style: { color: 'purple' } },
            { file: "63.71 Kota Banjarmasin.geojson", style: { color: 'red' } },
            { file: "63.72 Kota Banjarbaru.geojson", style: { color: 'orange' } },
        ];
    }

    geojsonFiles.forEach(function(geojson) {
        new L.GeoJSON.AJAX(["assets/geojson/" + geojson.file], {
            onEachFeature: popUp,
            style: geojson.style
        }).addTo(map);
    });
}