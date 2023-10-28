const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');

const env = dotenv.config().parsed;
console.log('env.redirection_path:', env.redirection_path);

// webpack.config.js

// Configuration for the first bundle
const config1 = {
    mode: 'development',
    entry: {
        client: './public/client.js',
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: '[name]_bundle.js'
    },
    plugins: [
        new webpack.DefinePlugin({
            'env.redirection_path': JSON.stringify(env.redirection_path)
        })
    ]
};

// Export an array of configurations
module.exports = [config1];
