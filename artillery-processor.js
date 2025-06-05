module.exports = {
  $randomString: function () {
    const strings = [
      'Mensaje de prueba de carga',
      'Test de sobrecarga del sistema',
      'Probando capacidad del servidor',
      'Artillery stress test message',
      'Sistema bajo prueba de carga',
    ];
    return strings[Math.floor(Math.random() * strings.length)];
  },
};
