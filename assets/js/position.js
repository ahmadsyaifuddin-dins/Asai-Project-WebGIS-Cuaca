document.getElementById('getPositionButton').addEventListener('click', () => {
    getLocation();
});


// Fungsi Mengambil Posisi User secara Real-time
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    console.log("Latitude: " + latitude + " Longitude: " + longitude);

    // Di sini Anda dapat melakukan apapun dengan posisi yang diperoleh,
    // seperti menambahkan marker ke peta atau mengirimkan ke server.
    // Berikut ini contoh menambahkan marker ke peta:
    L.marker([latitude, longitude]).addTo(map)
        .bindPopup('Your Location').openPopup();

    // Anda juga bisa memperbarui tampilan peta agar menampilkan posisi pengguna:
    map.setView([latitude, longitude], 13);
}

// Panggil fungsi getLocation() saat halaman dimuat.
// getLocation();