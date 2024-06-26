const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');

const env = dotenv.config().parsed;
console.log('env.redirection_path:', env.redirection_path);
console.log('env.redirection_path_put:', env.redirection_path_put);
console.log('env.redirection_path_download:', env.redirection_path_download);
console.log('env.redirection_path_ai:', env.redirection_path_ai);
console.log('env.redirection_path_order_detection:', env.redirection_path_order_detection);

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
            'env.redirection_path': JSON.stringify(env.redirection_path),
            'env.redirection_path_put': JSON.stringify(env.redirection_path_put),
            'env.redirection_path_download': JSON.stringify(env.redirection_path_download),
            'env.redirection_path_ai': JSON.stringify(env.redirection_path_ai),
            'env.redirection_path_order_detection': JSON.stringify(env.redirection_path_order_detection)

        })
    ]
};

// Export an array of configurations
module.exports = [config1];
