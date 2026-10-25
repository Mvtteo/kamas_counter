// Démo GitHub Pages : pas de serveur Flask, la route /process répond par une erreur explicite.
(function () {
  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === "string" ? input : input.url;
    if (url === "/process") {
      return Promise.resolve(new Response(JSON.stringify({
        success: false,
        error: "analyse OCR indisponible dans l'aperçu en ligne. Lancez python app.py en local."
      }), { headers: { "Content-Type": "application/json" } }));
    }
    return realFetch(input, init);
  };
})();
