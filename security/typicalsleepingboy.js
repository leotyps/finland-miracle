// Menampilkan pesan "Made with ❤️ by : sleepingboi"
console.log(
  '%c Made with ❤️ by : sleepingboi',
  'color: red; font-size: 16px;'
);

// Menampilkan pesan "hanya menyukai elemen yang terlihat indah..."
console.log(
  '%c hanya menyukai elemen yang terlihat indah, kalau yang biasa aja gak ada yang lain 😔',
  'color: transparent; ' +
  'background: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet); ' +
  '-webkit-background-clip: text; ' +
  'font-size: 32px; ' +
  'font-weight: bold; ' +
  'text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);'
);

// Menampilkan pesan "Typical"
console.log(
  '%c Typical',
  'color: white; font-size: 14px;'
);

// Mencegah penggunaan Developer Tools
function preventDevTools() {
  const check = () => {
    const start = Date.now();
    debugger;
    const end = Date.now();

    // Jika debugger membuat delay lebih dari 100ms, tampilkan alert dan reload halaman
    if (end - start > 100) {
      alert('😔');
      window.location.reload();
    }
  };

  // Jalankan pemeriksaan setiap 1 detik
  setInterval(check, 1000);
}

preventDevTools();
