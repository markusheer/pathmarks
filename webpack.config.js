const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const GenerateJsonFile = require('generate-json-file-webpack-plugin');
const BuildAssets = require('./build.assets');
const manifest = require('./src/manifest.json');

const config = {
	output: {
		path: __dirname + "/build/",
		filename: "[name].js"
	},
	performance: {
		maxAssetSize: 500000
	},
	plugins: [
		new CopyWebpackPlugin([{
			from: path.resolve(__dirname, './src'), to: path.resolve(__dirname, './build'), ignore: "index.js"
		}]),
		new CopyWebpackPlugin(
			BuildAssets.css.map(asset => {
				return {
					from: path.resolve(__dirname, `./node_modules/${asset}`),
					to: path.resolve(__dirname, './build/lib')
				};
			})
		),
		new CopyWebpackPlugin(
			BuildAssets.js.map(asset => {
				return {
					from: path.resolve(__dirname, `./node_modules/${asset}`),
					to: path.resolve(__dirname, './build/lib')
				};
			})
		),
		new CopyWebpackPlugin(
			BuildAssets.fonts.map(asset => {
				return {
					from: path.resolve(__dirname, `./node_modules/${asset}`),
					to: path.resolve(__dirname, './build/lib/fonts')
				};
			})
		)
	]
};

module.exports = (env, argv) => {

	if (argv.mode === 'development') {
		config.plugins.push(new GenerateJsonFile({
			jsonFile: './src/manifest.json',
			filename: 'manifest.json',
			value: (manifest) => {
				manifest.short_name = "PathDev";
			}
		}));
	}

	if (argv.mode === 'production') {
		config.plugins.push(new ZipPlugin({
			path: path.resolve(__dirname, './dist'),
			exclude: 'index.js',
			filename: `${manifest.name}-${manifest.version}`.toLowerCase()
		}));
	}

	return config;
};
