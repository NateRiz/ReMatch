const path = require('path')

module.exports = {
    entry: {
      main: [
        './src/scripts/util/ArrayExtensions.ts',
        './src/scripts/Homepage/Main.ts',
      ],
      classic: [
        './src/scripts/util/ArrayExtensions.ts',
        './src/scripts/Classic/MainClassicGame.ts',
      ],
      multi: [
        './src/scripts/util/ArrayExtensions.ts',
        './src/scripts/Multiplayer/MainMultiplayer.ts',
      ]
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: "[name]-bundle.js",
      path: path.resolve(__dirname, 'dist'),
    },
    mode: 'development',
  };