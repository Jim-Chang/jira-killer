const {
    join
} = require('path');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        content: join(__dirname, 'src/content.ts'),
        background: join(__dirname, 'src/background.ts')
    },
    output: {
        path: join(__dirname, '../../dist'),
        filename: '[name].js'
    },
    module: {
        rules: [{
            exclude: /node_modules/,
            test: /\.ts?$/,
            use: 'ts-loader'
        }],
    },
    plugins: [],
    resolve: {
        extensions: ['.ts', '.js']
    }
};
