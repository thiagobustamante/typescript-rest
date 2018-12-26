module.exports = function (config) {
  config.set({
    testRunner: "mocha",
    mochaOptions: {
      files: ["test/**/*.ts"],
      opts: "./test/mocha.opts",
      ui: 'bdd',
      timeout: 35000,
      require: ["ts-node/register", "source-map-support/register"],
      asyncOnly: false
    },
    mutator: "typescript",
    transpilers: [],
    reporters: ["html", "progress", "dashboard"],
    packageManager: "npm",
    testFramework: "mocha",
    coverageAnalysis: "off",
    tsconfigFile: "tsconfig.json",
    mutate: ["src/**/*.ts"]
  });
};
