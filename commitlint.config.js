module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // fitur baru
        "fix", // perbaikan bug
        "docs", // dokumentasi
        "style", // formatting, spasi, tanda baca, dll (tanpa mengubah kode)
        "refactor", // refactor kode tanpa fitur/bugfix
        "perf", // perbaikan performa
        "test", // menambahkan/merubah test
        "build", // build system, dependencies, tools
        "ci", // continuous integration
        "chore", // hal kecil lain (misal update config)
        "revert", // rollback commit sebelumnya
      ],
    ],
  },
};
