var config = {
  baseUrl: "/src"
}

var deps = [
  "notes/app"
];

require(config, deps, function(Application) {
  Application.start();
});
